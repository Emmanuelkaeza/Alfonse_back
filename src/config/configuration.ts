export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    type: 'sqlite',
    database: process.env.DATABASE_PATH || 'database.sqlite',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cinetpay: {
    apiKey: process.env.CINETPAY_API_KEY,
    siteId: process.env.CINETPAY_SITE_ID,
    baseUrl: process.env.CINETPAY_BASE_URL || 'https://api-checkout.cinetpay.com',
  },
});
