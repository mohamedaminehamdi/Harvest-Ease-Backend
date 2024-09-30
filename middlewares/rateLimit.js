// Fixed-window request limit per client IP.
// ponytail: counters live in this process's memory, so each instance limits separately;
// move them to a shared store (e.g. Redis) when running more than one instance.
export const rateLimit = ({ windowMs, max }) => {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) if (entry.reset <= now) hits.delete(ip);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    let entry = hits.get(req.ip);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(req.ip, entry);
    }
    if (++entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.reset - now) / 1000)));
      return res.status(429).json({ success: false, message: "Too many attempts, please try again later" });
    }
    next();
  };
};
