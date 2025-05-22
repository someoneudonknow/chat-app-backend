"use strict";

const devConfig = {
  app: {
    port: process.env.DEV_APP_PORT || 8080,
  },
  services: {
    ai: {
      baseUrl: process.env.DEV_AI_SERVICE_BASE_URL || "http://localhost:8080",
    },
  },
  db: {
    port: process.env.DEV_DB_PORT || 27017,
    host: process.env.DEV_DB_HOST || "localhost",
    name: process.env.DEV_DB_NAME || "chat-app-dev",
  },
  origin: process.env.DEV_ORIGIN_URL || "http://localhost:5173",
  clientUrl: process.env.DEV_CLIENT_URL || "http://localhost:5173",
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  agora: {
    app_id: process.env.AGORA_APP_ID,
    app_cerf: process.env.AGORA_APP_CERF,
    customer_id: process.env.AGORA_CUSTOMER_ID,
    customer_secret: process.env.AGORA_CUSTOMER_SECRET,
  },
  mail: {
    service: process.env.DEV_MAIL_SERVICE || "mail",
    user: process.env.DEV_MAIL_USER || "",
    pass: process.env.DEV_MAIL_PASS || "",
  },
  redis: {
    port: process.env.DEV_REDIS_PORT || 6379,
    host: process.env.DEV_REDIS_HOST || "localhost",
    password: process.env.DEV_REDIS_PASSWORD || "root",
    username: process.env.DEV_REDIS_USER || "root",
  },
  aws: {
    s3: {
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET,
      region: process.env.S3_REGION,
      bucket: process.env.S3_BUCKET_NAME,
    },
  },
};

const prodConfig = {
  app: {
    port: process.env.PROD_APP_PORT || 8080,
  },
  db: {
    port: process.env.PROD_DB_PORT || 27017,
    host: process.env.PROD_DB_HOST || "localhost",
    name: process.env.PROD_DB_NAME || "chat-app-prod",
  },
  origin: process.env.PROD_ORIGIN_URL,
  clientUrl: process.env.PROD_CLIENT_URL || "http://localhost:5173",
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  mail: {
    service: process.env.PROD_MAIL_SERVICE || "mail",
    user: process.env.PROD_MAIL_USER || "",
    pass: process.env.PROD_MAIL_PASS || "",
  },
  agora: {
    app_id: process.env.AGORA_APP_ID,
    app_cerf: process.env.AGORA_APP_CERF,
    customer_id: process.env.AGORA_CUSTOMER_ID,
    customer_secret: process.env.AGORA_CUSTOMER_SECRET,
  },
  redis: {
    port: process.env.PROD_REDIS_PORT || 6379,
    host: process.env.PROD_REDIS_HOST || "localhost",
    password: process.env.PROD_REDIS_PASSWORD || "root",
    username: process.env.PROD_REDIS_USER || "root",
  },
  aws: {
    s3: {
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET,
      region: process.env.S3_REGION,
      bucket: process.env.S3_BUCKET_NAME,
    },
  },
};

const config = { dev: devConfig, prod: prodConfig };
const env = process.env.NODE_ENV || "dev";

module.exports = config[env];
