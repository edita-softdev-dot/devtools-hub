export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE ?? 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
  },
  admin: {
    email: process.env.ADMIN_EMAIL ?? 'admin@devtools.local',
    password: process.env.ADMIN_PASSWORD ?? 'admin123',
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  },
});
