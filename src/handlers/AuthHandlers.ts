import { Prisma } from '@prisma/client';
import { cookieConfig, csrfCookieName } from '@src/configs/CookieConfigs.js';
import { MemcachedMethodError, memcached } from '@src/helpers/MemcachedHelpers.js';
import { prisma, isPeculiarPrismaError } from '@src/helpers/PrismaHelpers.js';
import { ErrorResponse, SuccessResponse, logError } from '@src/helpers/HandlerHelpers.js';
import { BinaryLike, createHash, randomBytes, scrypt } from 'crypto';
import { RequestHandler } from 'express';
import * as z from 'zod';

const promisifiedScrypt = async (password: BinaryLike, salt: BinaryLike, keylen: number) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keylen, (error, derivedKey) => {
      if (error) {
        reject(error);
      } else {
        resolve(derivedKey);
      }
    });
  });

const PASSWORD_SECRET = process.env.PASSWORD_SECRET || 'super secret password';

const userSchema = z.object({
  id: z.string().uuid(),
  email: z
    .string({
      required_error: 'email required',
    })
    .email({
      message: 'email not valid',
    })
    .max(100, {
      message: 'email too long, max 100 characters',
    }),
  name: z
    .string({
      required_error: 'name required',
    })
    .max(100, {
      message: 'name too long, max 100 characters',
    }),
  password: z
    .string({
      required_error: 'password required',
    })
    .max(256, {
      message: 'password too long, max 256 characters',
    }),
});

const generateCsrfToken: RequestHandler = async (_req, res) => {
  const csrfKey = randomBytes(16).toString('hex');
  const csrfToken = randomBytes(32).toString('hex');
  const hashedCsrfToken = createHash('sha256').update(`${csrfKey}${csrfToken}`).digest('hex');
  try {
    await memcached.set(csrfToken, csrfKey, 300);
  } catch (error) {
    if (error instanceof MemcachedMethodError) {
      logError('generateCsrfToken > memcached.set', error, true);
      return res.status(500).json({
        status: 'error',
        message: `failed caching token : ${error.message}`,
      } satisfies ErrorResponse);
    }
    logError('generateCsrfToken > memcached.set', error, false);
    return res.status(500).json({
      status: 'error',
      message: 'unknown error',
    } satisfies ErrorResponse);
  }

  res.cookie(csrfCookieName, hashedCsrfToken, cookieConfig);

  return res.status(200).json({ csrfToken });
};

const register: RequestHandler = async (req, res) => {
  // parse request body
  const bodySchema = userSchema.omit({ id: true });
  const parsedInput = bodySchema.safeParse(req.body);
  if (!parsedInput.success) {
    return res.status(400).json({
      status: 'error',
      message: 'request body not valid',
      errors: parsedInput.error.issues,
    } satisfies ErrorResponse);
  }
  const { email, name, password } = parsedInput.data;

  // encrypt password
  let encryptedPassword: string;
  try {
    encryptedPassword = (await promisifiedScrypt(password, PASSWORD_SECRET, 32)).toString('hex');
  } catch (error) {
    logError('register > encrypt password', error);
    return res.status(500).json({
      status: 'error',
      message: 'encryption error',
    } satisfies ErrorResponse);
  }

  // insert to database
  let insertResult;
  try {
    insertResult = await prisma.user.create({
      data: {
        email,
        name,
        password: encryptedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logError('register > prisma insert', error, true);
      return res.status(500).json({
        status: 'error',
        message: 'known prisma insert error',
        errors: [error],
      } satisfies ErrorResponse);
    } else if (isPeculiarPrismaError(error)) {
      logError('register > prisma insert', error, true);
      return res.status(500).json({
        status: 'error',
        message: 'peculiar prisma insert error',
        errors: [error],
      } satisfies ErrorResponse);
    }
    logError('register > prisma insert', error, false);
    return res.status(500).json({
      status: 'error',
      message: 'unknown prisma insert error',
      errors: [error],
    } satisfies ErrorResponse);
  }
  if (!insertResult) {
    logError('register > prisma insert', new Error('no insert result'), false);
    return res.status(500).json({
      status: 'error',
      message: 'unknown uncatched prisma insert error',
    } satisfies ErrorResponse);
  }

  // insert created user to cache
  try {
    await memcached.set(
      `user:${insertResult.id}`,
      JSON.stringify({ email: insertResult.email, name: insertResult.name }),
      60
    );
  } catch (error) {
    if (error instanceof MemcachedMethodError) {
      logError('register > memcached set', error, true);
    } else {
      logError('register > memcached set', error, false);
    }
  }

  return res.status(201).json({
    status: 'success',
    message: 'user created',
    datas: [
      {
        email: insertResult.email,
        name: insertResult.name,
        createdAt: insertResult.createdAt,
      },
    ],
  } as SuccessResponse);
};

const login: RequestHandler = (req, res) => {
  return res.status(200).json({} as SuccessResponse);
};

// const checkCsrfToken: RequestHandler = async (req, res) => {
//   const hashedCsrfToken = req.signedCookies[csrfCookieName];
//   if (!hashedCsrfToken) {
//     return res.status(403).json({ message: 'csrf cookie not found' });
//   }

//   const csrfToken = req.headers['x-csrf-token'] as string;
//   if (!csrfToken) {
//     return res.status(403).json({ message: 'csrf header not found' });
//   }

//   let csrfKey: string;
//   try {
//     csrfKey = (await memcached.get(csrfToken)).result as string;
//   } catch (error) {
//     if (error instanceof MemcachedMethodError) {
//       if (error.message === 'cache miss') {
//         return res.status(403).json({ message: 'csrf token not valid' });
//       } else {
//         return res.status(500).json({ message: 'memcached error', error });
//       }
//     }
//     return res.status(500).json({ message: 'unknown error', error });
//   }

//   const expectedHashedCsrfToken = createHash('sha256').update(`${csrfKey}${csrfToken}`).digest('hex');

//   if (expectedHashedCsrfToken !== hashedCsrfToken) {
//     return res.status(403).json({ message: 'csrf token not valid' });
//   }

//   return res.status(200).json({
//     message: 'CSRF token verified',
//     csrfKey,
//     csrfToken,
//     hashedCsrfToken,
//   });
// };

export const authHandlers = {
  generateCsrfToken,
  // checkCsrfToken,
  login,
  register,
};
