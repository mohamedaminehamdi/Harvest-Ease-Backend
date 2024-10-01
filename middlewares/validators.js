// Request validation middleware
const isString = (value) => typeof value === 'string';
export const validateRegister = (req, res, next) => {
  const { name, email, password, picturePath } = req.body;

  const errors = [];

  if (!isString(name) || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!isString(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }
  if (!isString(password) || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const email = req.body.values?.email || req.body.email;
  const password = req.body.values?.password || req.body.password;

  const errors = [];

  if (!isString(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }
  if (!isString(password) || !password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

export const validateUpdateProfile = (req, res, next) => {
  const { name, phone, farmName, bio, website } = req.body;

  const errors = [];

  for (const [field, value] of Object.entries({ name, phone, farmName, bio, website })) {
    if (value !== undefined && !isString(value)) errors.push(`${field} must be a string`);
  }
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  if (name && name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (phone && phone.length < 7) {
    errors.push('Phone number must be at least 7 characters');
  }
  if (bio && bio.length > 500) {
    errors.push('Bio must be less than 500 characters');
  }
  if (website && !/^https?:\/\//.test(website)) {
    errors.push('Website must start with http:// or https://');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};
