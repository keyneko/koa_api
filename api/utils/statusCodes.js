// statusCodes.js
// Function to get the translated error message based on the user's language or use a specified default message
function getErrorMessage(errorCode, language, messageKey = 'default') {
  const errorCategory = statusMessages[errorCode]
  const messages = errorCategory.translations?.[language]
  return (
    messages?.[messageKey] ||
    errorCategory.messages[messageKey] ||
    errorCategory.messages.default
  )
}

// Enum status codes
const statusCodes = {
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  TooManyRequests: 429,
  InternalServerError: 500,
  InvalidCaptcha: 501,
  UserExists: 502,
  PasswordError: 503,
  InvalidParameters: 504,
}

// Status code messages
const statusMessages = {
  [statusCodes.Unauthorized]: {
    messages: {
      default: '未授权',
      missingToken: '未授权：缺少令牌',
      invalidToken: '未授权：无效令牌',
      invalidApiKey: '未授权：apiKey无效',
      missingApiKey: '未授权：缺少apiKey',
    },
    translations: {
      en: {
        default: 'Unauthorized',
        missingToken: 'Unauthorized: Missing token',
        invalidToken: 'Unauthorized: Invalid token',
        invalidApiKey: 'Unauthorized: Invalid apiKey',
        missingApiKey: 'Unauthorized: Missing apiKey',
      },
      ja: {
        default: '権限がありません',
        missingToken: '権限がありません: トークンがありません',
        invalidToken: '権限がありません: 無効なトークン',
        invalidApiKey: '権限がありません: 無効なAPIKey',
        missingApiKey: '権限がありません: APIKeyがありません',
      },
    },
  },

  [statusCodes.Forbidden]: {
    messages: {
      default: '禁止操作',
      adminOnly: '禁止操作：仅限管理员',
      cannotDeleteAdmin: '禁止操作：无法删除管理员角色',
      protectedPermission: '禁止操作：无法删除受保护的权限词条',
      protectedDictionary: '禁止操作：无法删除受保护的字典词条',
      protectedRole: '禁止操作：无法删除受保护的角色',
      protectedUser: '禁止操作：无法删除受保护的用户',
      protectedSensor: '禁止操作：无法删除受保护的传感器',
      protectedBarcode: '禁止操作：无法删除受保护的条码',
      protectedPosition: '禁止操作：无法删除受保护的库位码',
    },
    translations: {
      en: {
        default: 'Permission denied',
        adminOnly: 'Forbidden Operation (Admin Only)',
        cannotDeleteAdmin: 'Forbidden operation: Cannot delete admin role',
        protectedPermission:
          'Prohibited operation: Protected permission entry cannot be deleted',
        protectedDictionary:
          'Prohibited operation: Protected dictionary entry cannot be deleted',
        protectedRole: 'Forbidden operation: Protected role cannot be deleted',
        protectedUser: 'Forbidden operation: Protected user cannot be deleted',
        protectedSensor:
          'Forbidden operation: Protected sensor cannot be deleted',
        protectedBarcode:
          'Forbidden operation: Protected barcode cannot be deleted',
        protectedPosition:
          'Forbidden operation: Protected position cannot be deleted',
      },
      ja: {
        default: '禁止操作',
        adminOnly: '禁止操作：管理者限定',
        cannotDeleteAdmin: '禁止操作: 管理者ロールを削除できません',
        protectedPermission:
          '禁止操作: 保護されているパーミッションエントリを削除できません',
        protectedDictionary:
          '禁止操作: 保護されている辞書エントリを削除できません',
        protectedRole: '禁止操作: 保護されたロールは削除できません',
        protectedUser: '禁止操作: 保護されたユーザーは削除できません',
        protectedSensor: '禁止操作: 保護されたセンサーは削除できません',
        protectedBarcode: '禁止操作: 保護されたバーコードは削除できません',
        protectedPosition: '禁止操作: 保護されたポジションは削除できません',
      },
    },
  },

  [statusCodes.NotFound]: {
    messages: {
      default: '未找到',
      userNotFound: '未找到用户',
      roleNotFound: '未找到角色',
      barcodeNotFound: '未找到条形码',
      positionNotFound: '未找到库位码',
      dictionaryNotFound: '未找到字典',
      sensorNotFound: '未找到传感器',
      permissionNotFound: '未找到权限词条',
    },
    translations: {
      en: {
        default: 'Not Found',
        userNotFound: 'User Not Found',
        roleNotFound: 'Role Not Found',
        barcodeNotFound: 'Barcode Not Found',
        positionNotFound: 'Position Not Found',
        dictionaryNotFound: 'Dictionaries Not Found',
        sensorNotFound: 'Sensor Not Found',
        permissionNotFound: 'Permission entry Not Found',
      },
      ja: {
        default: '見つからない',
        userNotFound: 'ユーザーが見つからない',
        roleNotFound: 'ロールが見つからない',
        barcodeNotFound: 'バーコードが見つからない',
        positionNotFound: 'ポジションが見つからない',
        dictionaryNotFound: '辞書が見つからない',
        sensorNotFound: 'センサーが見つからない',
        permissionNotFound: 'パーミッションエントリが見つからない',
      },
    },
  },

  [statusCodes.TooManyRequests]: {
    messages: {
      default: '短时间内请求过多',
    },
    translations: {
      en: {
        default: 'Too many requests within a short time',
      },
      ja: {
        default: '短期間にリクエストが多すぎます',
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
