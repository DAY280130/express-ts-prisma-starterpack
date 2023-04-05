import {
  JWTPayload,
  JWT_SECRET,
  accessTokenConfig,
  refreshTokenConfig,
  verifyConfig,
} from '@src/configs/JwtConfigs.js';
import jwt from 'jsonwebtoken';

const sign = async <T extends 'access token' | 'refresh token'>(
  tokenType: T,
  initialPayload: JWTPayload,
  csrfToken: T extends 'access token' ? string : undefined
) => {
  if (tokenType === 'access token') {
    const config = accessTokenConfig;
    return new Promise<string>((resolve, reject) => {
      jwt.sign(initialPayload, `${JWT_SECRET}${csrfToken}`, config, (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token ?? 'error');
        }
      });
    });
  } else if (tokenType === 'refresh token') {
    const config = refreshTokenConfig;
    return new Promise<string>((resolve, reject) => {
      jwt.sign(initialPayload, `${JWT_SECRET}`, config, (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token ?? 'error');
        }
      });
    });
  }
};

const verify = async (token: string) =>
  new Promise<JWTPayload>((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, verifyConfig, (error, payload) => {
      if (error) {
        reject(error);
      } else {
        resolve(payload as JWTPayload);
      }
    });
  });

export const jwtPromisified = { sign, verify };
