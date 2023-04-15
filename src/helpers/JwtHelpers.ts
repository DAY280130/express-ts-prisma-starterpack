import {
  JWTPayload,
  JWT_SECRET,
  accessTokenConfig,
  refreshTokenConfig,
  verifyConfig,
} from '@src/configs/JwtConfigs.js';
import jwt from 'jsonwebtoken';

type signParams =
  | {
      tokenType: 'ACCESS_TOKEN';
      initialPayload: JWTPayload;
      csrfToken: string;
    }
  | {
      tokenType: 'REFRESH_TOKEN';
      initialPayload: JWTPayload;
    };

const sign = async <T extends signParams['tokenType']>(
  ...args: Extract<signParams, { tokenType: T }> extends { csrfToken: string }
    ? [tokenType: T, initialPayload: JWTPayload, csrfToken: string]
    : [tokenType: T, initialPayload: JWTPayload]
) => {
  const [tokenType, initialPayload, csrfToken] = args;
  if (tokenType === 'ACCESS_TOKEN') {
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
  } else if (tokenType === 'REFRESH_TOKEN') {
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
  } else {
    return new Promise<string>((_resolve, reject) => {
      reject('token type not supplied');
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

// importing jsonwebtokenerror directly from 'jsonwebtoken' throws error, so import from this instead
export const JsonWebTokenError = jwt.JsonWebTokenError;

export const jwtPromisified = { sign, verify, decode: jwt.decode };
