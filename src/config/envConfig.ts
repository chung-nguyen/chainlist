import dotenv from 'dotenv';
import { cleanEnv, host, num, port, str, testOnly } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ default: 'development', devDefault: testOnly('test'), choices: ['development', 'production', 'test'] }),
  HOST: host({ devDefault: testOnly('localhost'), default: 'localhost' }),
  PORT: port({ devDefault: testOnly(3000), default: 8080 }),
  CORS_ORIGIN: str({ default: '*' }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000), default: 100 }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000), default: 1000 }),
  REDIS_HOST: str({ default: 'localhost' }),
  REDIS_PORT: num({ default: 6379 }),
  INSTANCE_ID: str({ default: '0' }),
  JSON_BLOB_ID: str({ default: '1341948228106641408' }),
  JSON_BLOB_BASE_URL: str({ default: 'https://jsonblob.com/api/jsonBlob' }),
  LIMITED_EVM_CHAINS: str({ default: '' }),
  MAX_ALLOWED_PING: num({ default: 2000 })
});
