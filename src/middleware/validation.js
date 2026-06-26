const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isPositiveInteger = (val) => {
  if (typeof val === 'number') {
    return Number.isInteger(val) && val > 0;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') return false;
    const num = Number(trimmed);
    return Number.isInteger(num) && num > 0 && String(num) === trimmed;
  }
  return false;
};

const isNumeric = (val) => {
  if (typeof val === 'number') {
    return !isNaN(val);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') return false;
    return !isNaN(Number(trimmed));
  }
  return false;
};

const validateBody = (schema) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request body.'
      });
    }

    for (const [key, rules] of Object.entries(schema)) {
      const val = req.body[key];

      // Required check
      if (rules.required && (val === undefined || val === null || val === '')) {
        return res.status(400).json({
          status: 'error',
          message: rules.message || `Field '${key}' is required.`
        });
      }

      if (val !== undefined && val !== null && val !== '') {
        // Type checks
        if (rules.type === 'string') {
          if (typeof val !== 'string') {
            return res.status(400).json({
              status: 'error',
              message: rules.message || `Field '${key}' must be a string.`
            });
          }
          if (rules.notEmpty && val.trim() === '') {
            return res.status(400).json({
              status: 'error',
              message: rules.message || `Field '${key}' cannot be empty.`
            });
          }
          if (rules.email) {
            const trimmed = val.trim();
            if (!emailRegex.test(trimmed)) {
              return res.status(400).json({
                status: 'error',
                message: rules.message || `Field '${key}' must be a valid email address.`
              });
            }
            if (rules.orgEmail && !trimmed.toLowerCase().endsWith('@org.com')) {
              return res.status(400).json({
                status: 'error',
                message: rules.message || `Field '${key}' must be an @org.com email address.`
              });
            }
          }
        }

        if (rules.type === 'id') {
          if (!isPositiveInteger(val)) {
            return res.status(400).json({
              status: 'error',
              message: rules.message || `Field '${key}' must be a positive integer ID.`
            });
          }
        }

        if (rules.type === 'amount') {
          if (!isNumeric(val) || Number(val) <= 0) {
            return res.status(400).json({
              status: 'error',
              message: rules.message || `Field '${key}' must be a positive number.`
            });
          }
        }

        if (rules.enum) {
          if (!rules.enum.includes(val)) {
            return res.status(400).json({
              status: 'error',
              message: rules.message || `Field '${key}' must be one of: ${rules.enum.join(', ')}`
            });
          }
        }
      }
    }

    next();
  };
};

const validateAssignRM = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request body.'
    });
  }

  const employeeId = req.body.employeeId !== undefined ? req.body.employeeId : req.body.userId;
  const { rmId } = req.body;

  if (employeeId === undefined || employeeId === null || employeeId === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Employee ID (employeeId or userId) is required.'
    });
  }

  if (!isPositiveInteger(employeeId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Employee ID must be a positive integer.'
    });
  }

  if (rmId === undefined || rmId === null || rmId === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Reporting Manager ID (rmId) is required.'
    });
  }

  if (!isPositiveInteger(rmId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Reporting Manager ID must be a positive integer.'
    });
  }

  next();
};

const validateUpdateReimbursementStatus = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request body.'
    });
  }

  const { reimbursementId, userId, status } = req.body;

  if ((reimbursementId === undefined || reimbursementId === null || reimbursementId === '') &&
      (userId === undefined || userId === null || userId === '')) {
    return res.status(400).json({
      status: 'error',
      message: 'Either reimbursementId or userId must be provided.'
    });
  }

  if (reimbursementId !== undefined && reimbursementId !== null && reimbursementId !== '') {
    if (!isPositiveInteger(reimbursementId)) {
      return res.status(400).json({
        status: 'error',
        message: 'reimbursementId must be a positive integer.'
      });
    }
  }

  if (userId !== undefined && userId !== null && userId !== '') {
    if (!isPositiveInteger(userId)) {
      return res.status(400).json({
        status: 'error',
        message: 'userId must be a positive integer.'
      });
    }
  }

  if (status === undefined || status === null || status === '') {
    return res.status(400).json({
      status: 'error',
      message: 'Status is required.'
    });
  }

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({
      status: 'error',
      message: 'Status must be APPROVED or REJECTED.'
    });
  }

  next();
};

module.exports = {
  validateBody,
  validateAssignRM,
  validateUpdateReimbursementStatus
};
