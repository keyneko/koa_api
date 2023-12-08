// statusCodes.js
const statusCodes = {
  // 400
  Unauthorized: {
    code: 401,
    messages: {
      default: 'Unauthorized',
      missingToken: 'Unauthorized: Missing token',
      invalidToken: 'Unauthorized: Invalid token',
    },
  },
  Forbidden: {
    code: 403,
    messages: {
      default: 'Permission denied',
      adminOnly: 'Forbidden Operation (Admin Only)',
      cannotDeleteAdmin: 'Forbidden: Cannot delete admin accounts',
    },
  },
  NotFound: {
    code: 404,
    messages: {
      default: 'Not Found',
      userNotFound: 'User Not Found',
      barcodeNotFound: 'Barcode Not Found',
      positionNotFound: 'Position Not Found',
      dictionariesNotFound: 'Dictionaries Not Found',
    },
  },

  // 500
  InternalServerError: {
    code: 500,
    messages: {
      default: 'Internal Server Error',
    },
  },
  InvalidCaptcha: {
    code: 501,
    messages: {
      default: 'Invalid Captcha',
    },
  },
  UserExists: {
    code: 502,
    messages: {
      default: 'User Already Exists',
    },
  },
  PasswordError: {
    code: 503,
    messages: {
      default: 'Incorrect Password',
      invalidOriginalPassword: 'Invalid Original Password',
    },
  },
  InvalidParameters: {
    code: 504,
    messages: {
      default: 'Invalid Parameters',
      noFileProvided: 'No file provided for upload',
    },
  },
}

module.exports = { statusCodes }
