import {
  JWTPayload,
  JWT_SECRET,
  accessTokenConfig,
  refreshTokenConfig,
  verifyConfig,
} from '@src/configs/JwtConfigs.js';
import jwt, { SignOptions } from 'jsonwebtoken';

const sign = async (tokenType: 'access token' | 'refresh token', initialPayload: JWTPayload) => {
  let config: SignOptions;
  if (tokenType === 'access token') {
    config = accessTokenConfig;
  } else if (tokenType === 'refresh token') {
    config = refreshTokenConfig;
  } else {
    config = {};
  }
  return new Promise<string>((resolve, reject) => {
    jwt.sign(initialPayload, JWT_SECRET, config, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token ?? 'error');
      }
    });
  });
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
