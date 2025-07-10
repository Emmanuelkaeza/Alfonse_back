export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    type: 'sqlite',
    database: process.env.DATABASE_PATH || 'database.sqlite',
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || process.env.NODE_ENV !== 'production',
    logging: process.env.DB_LOGGING === 'true' && process.env.NODE_ENV !== 'production',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cinetpay: {
    apiKey: process.env.CINETPAY_API_KEY || '',
    siteId: process.env.CINETPAY_SITE_ID || '',
    baseUrl: process.env.CINETPAY_BASE_URL || 'https://api-checkout.cinetpay.com',
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:4200'],
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '10', 10),
  },
});
