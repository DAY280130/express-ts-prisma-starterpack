import 'dotenv-safe/config.js';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { todoRouters } from '@src/routers/TodoRouters.js';
import { cookieConfig } from '@src/config/CookieConfig.js';
import { authRouters } from '@src/routers/AuthRouters.js';

// create express instance
const app = express();

// middlewares
app.use(cors()); // enables cors
app.use(helmet()); // use protection :)
app.use(cookieParser(process.env.COOKIE_SECRET ?? 'super secret cookie'));
app.use(express.urlencoded({ extended: true })); // parses urlencoded request body
app.use(express.json()); // parses json request body
app.use(compression()); // compresses request and response

// routers
app.use(todoRouters);
app.use(authRouters);
app.get('/', (req, res) => {
  const detectedCookie = req.signedCookies['test-cookie'];
  res.cookie('test-cookie', 'secret cookie value', cookieConfig);
  res.json({ message: 'ok', detectedCookie });
});

// run express
const port = parseInt(process.env.PORT || '0');
if (port === 0) {
  throw new Error('PORT not defined. Please define port in environment variables');
}

app.listen(port, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Server started at http://localhost:${port}`);
  }
});

// testing prisma
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   const post = await prisma.post.update({
//     where: { id: 1 },
//     data: {
//       published: true,
//     },
//   });

//   console.log(post);
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async e => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
