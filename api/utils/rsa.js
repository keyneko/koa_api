// rsa.js
const NodeRSA = require('node-rsa')

// Load the private key from file
const privateKey =
  '-----BEGIN RSA PRIVATE KEY-----\n' +
  'MIIEogIBAAKCAQEAhaSJQwalNy0oS4K627of6TTUB3SFqPZGGOA6oDn3Noz+bt4t\n' +
  'bQRjPJNZgLzzQvtQJFjo21aL5hTX9+gviO+i9meBnZ72CYCiy/u5H+DbXqeWDRRZ\n' +
  '7NYahoegTyeUzfSNSjTfBDAE3k7CXpL4LerEfoQqqZ1JNHAiqrY1+DsO2ZpRM5tv\n' +
  'VV72maQ0SVtbZrpWLIBOrc/B0+V45JEkTGNtKBYKBiX9lulQ9EFC30OZ3449JgCK\n' +
  '+4pehkHl3dF1O/g6vDPxjNwQPiJ7iiZS/+LJIKraz7t7RTs0CdJNAMNFWcpsGKpj\n' +
  'Ke2+AxIIWIsnuVleyV653ajJmIzWrbBWnzH6QQIDAQABAoIBABTlBTrwAovOaSLp\n' +
  'NRrejlexVUc3HiCtJIeGI1Riy7aBM9SUsyh8y6Ewbol0wVnjHgQYzItijCv0bVHK\n' +
  'wQfZY7K/uyGwNUqGDK301NxZlSLG8+xmlqqzTOFkuhk2GItc5WxJOOcYNOKnELel\n' +
  'pdzT/FXFh0AOod/relgTdfuyDB/USVa1XXzdDp9pp+HdXN8Dr/9uouShjdL5tjqi\n' +
  'f5QZmlZu9NUh32hKqb9LAX7juEhJiFklm4gikRg/V7UaLaMAe5V7qKsEEuZDZzqh\n' +
  'ymqgfCXpqr5FeUU70C8dwHIm9MD8eumuAkcXIL+BXKIqLlhmIHbH4ov183OIScnO\n' +
  '3xEOgbkCgYEArnAvHpw1HzZSxpZKusSMrT5z/XeLkfWqnAfDQiqdHy77SfsaqiDA\n' +
  'FAyTg4ltCvT/wA4sySG2MCWTFxbSdjuWHs0DSenfimcyV+Yp0vBu6Z+AXSwsRxja\n' +
  '5jtpr5f5pT2lWtIktxDq1Qf90ZFAVnTwnLZ9o/0lAPHOa+jXklbGVqUCgYEAxCE7\n' +
  'xCgkUfkw5Ex2IdReunpuPzd6un3qSKXe9GST411lXwPX+4z+rSwdznpybhY++SW4\n' +
  'LsnGKMkuOlxERWowJrQPHB7wbr7u5xczQHPqlA4UxpGz6r1hzhbQdbymOan2H/Md\n' +
  'U7nvw4a2a4gmQ/FDP3JMJZVZnN33HE3H5KBs3m0CgYAckrW1LuMotK5EZzPgefeN\n' +
  'HTDEsQNEqlgC7OaX/QD1ra1txdrtSSYNYq37GtSouc72t5uwanw8ULtSSeO5iDMj\n' +
  '4nMKdWuvcQ33BfWN3uJcFEtjd6vdDX41vj+mip9S6NEgGlH3RqcgtAlofYFraAZN\n' +
  'tTrJVNrt1633URGWn+4nHQKBgBQtLw7Q6lucfREfZI+6Xzxj1++c73078twiZDtU\n' +
  'FXqwYvtRU+jG6nQ6M57ILflxRG0xGi+GBmKvv5e1YjiZ4fY5U8yayjU6Yy1Wz6jz\n' +
  'w9ATWsPKvW2KqgMfibZy/86y02UaB4xTdnzw4NdTHEylBzwBsB+1q5BdrUw2HDhC\n' +
  '4LBJAoGAdLY/fjYadzXaJsR/lXR3pKkXfPCpEJ/xt1yUenHL7m5yrnoGhuPUEF4G\n' +
  'Pyh2jULri18m9ku7dQHyS/0duABx+45SwuR0SZQJ1RtqOoDt/wqSbaJwoYndeVKK\n' +
  '44LnfdNjY1Fen/caDNiFlI3QN9PWOnosRgldZuw/ECnvMqK+Oxc=\n' +
  '-----END RSA PRIVATE KEY-----'

// Create an RSA key instance
const key = new NodeRSA(privateKey)
key.setOptions({ encryptionScheme: 'pkcs1' })

// Export the key for use in other modules
module.exports = {
  decryptPassword: (encryptedPassword) =>
    key.decrypt(encryptedPassword, 'utf8'),
}
