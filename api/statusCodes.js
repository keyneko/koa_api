// statusCodes.js

// Function to get the translated error message based on the user's language or use a specified default message
function getErrorMessage(errorCode, language, messageKey = 'default') {
  const errorCategory = statusMessages[errorCode]
  const translations = errorCategory.translations?.[language]
  return translations?.[messageKey] || errorCategory.messages[messageKey]
}

const statusCodes = {
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  InternalServerError: 500,
  InvalidCaptcha: 501,
  UserExists: 502,
  PasswordError: 503,
  InvalidParameters: 504,
}

const statusMessages = {
  [statusCodes.Unauthorized]: {
    messages: {
      default: '未授权',
      missingToken: '未授权：缺少令牌',
      invalidToken: '未授权：无效令牌',
    },
    translations: {
      en: {
        default: 'Unauthorized',
        missingToken: 'Unauthorized: Missing token',
        invalidToken: 'Unauthorized: Invalid token',
      },
      ja: {
        default: '権限がありません',
        missingToken: '権限がありません: トークンがありません',
        invalidToken: '権限がありません: 無効なトークン',
      },
    },
  },

  [statusCodes.Forbidden]: {
    messages: {
      default: '禁止操作',
      missingToken: '禁止操作：仅限管理员',
      invalidToken: '禁止操作：无法删除管理员帐户',
    },
    translations: {
      en: {
        default: 'Permission denied',
        adminOnly: 'Forbidden Operation (Admin Only)',
        cannotDeleteAdmin: 'Forbidden: Cannot delete admin accounts',
      },
      ja: {
        default: '禁止操作',
        missingToken: '禁止操作：管理者限定',
        invalidToken: '禁止操作: 管理者アカウントは削除できません',
      },
    },
  },

  [statusCodes.NotFound]: {
    messages: {
      default: '未找到',
      userNotFound: '未找到用户',
      barcodeNotFound: '未找到条形码',
      positionNotFound: '未找到库位码',
      dictionariesNotFound: '未找到字典',
    },
    translations: {
      en: {
        default: 'Not Found',
        userNotFound: 'User Not Found',
        barcodeNotFound: 'Barcode Not Found',
        positionNotFound: 'Position Not Found',
        dictionariesNotFound: 'Dictionaries Not Found',
      },
      ja: {
        default: '見つからない',
        userNotFound: 'ユーザーが見つからない',
        barcodeNotFound: 'バーコードが見つからない',
        positionNotFound: 'ポジションが見つからない',
        dictionariesNotFound: '辞書が見つからない',
      },
    },
  },

  [statusCodes.InternalServerError]: {
    messages: {
      default: '服务器内部错误',
    },
    translations: {
      en: {
        default: 'Internal Server Error',
      },
      ja: {
        default: 'サーバー内部エラー',
      },
    },
  },

  [statusCodes.InvalidCaptcha]: {
    messages: {
      default: '无效的验证码',
    },
    translations: {
      en: {
        default: 'Invalid Captcha',
      },
      ja: {
        default: '無効なキャプチャ',
      },
    },
  },

  [statusCodes.UserExists]: {
    messages: {
      default: '用户已存在',
    },
    translations: {
      en: {
        default: 'User Already Exists',
      },
      ja: {
        default: 'ユーザーはすでに存在します',
      },
    },
  },

  [statusCodes.PasswordError]: {
    messages: {
      default: '密码错误',
      invalidOriginalPassword: '原始密码无效',
    },
    translations: {
      en: {
        default: 'Incorrect Password',
        invalidOriginalPassword: 'Invalid Original Password',
      },
      ja: {
        default: 'パスワードが間違っています',
        invalidOriginalPassword: '元のパスワードが無効です',
      },
    },
  },

  [statusCodes.InvalidParameters]: {
    messages: {
      default: '参数错误',
      noFileProvided: '没有提供上传文件',
    },
    translations: {
      en: {
        default: 'Parameters error',
        noFileProvided: 'No file provided for upload',
      },
      ja: {
        default: 'パラメータエラー',
        noFileProvided: 'アップロード ファイルが提供されていません',
      },
    },
  },
}

module.exports = { getErrorMessage, statusCodes, statusMessages }
