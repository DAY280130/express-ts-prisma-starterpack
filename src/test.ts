import { MemcachedMethodError, memcached, memcachedDefault } from '@src/db/MemcachedClientInstance.js';

try {
  const setResult = await memcached.set('test', 'test value', 5);
  console.log('🚀 > setResult:', setResult.message);
} catch (err) {
  if (err instanceof MemcachedMethodError) {
    console.log('🚀 > setResult err:', err);
  } else {
    console.log('🚀 > err:', err);
  }
}

setTimeout(async () => {
  try {
    const getResult = await memcached.get('test');
    console.log('🚀 > setTimeout > getResult[1000 ms]:', getResult.result);
  } catch (err) {
    if (err instanceof MemcachedMethodError) {
      console.log('🚀 > setTimeout > getResult err[1000 ms]:', err);
    } else {
      console.log('🚀 > setTimeout > err[1000 ms]:', err);
    }
  }
}, 1000);

setTimeout(async () => {
  try {
    const getResult = await memcached.get('test');
    console.log('🚀 > setTimeout > getResult[3000 ms]:', getResult.result);
  } catch (err) {
    if (err instanceof MemcachedMethodError) {
      console.log('🚀 > setTimeout > getResult err[3000 ms]:', err);
    } else {
      console.log('🚀 > setTimeout > err[3000 ms]:', err);
    }
  }
}, 3000);

setTimeout(async () => {
  try {
    const touchResult = await memcached.touch('test', 5);
    console.log('🚀 > setTimeout > touchResult[3500 ms]:', touchResult.message);
  } catch (err) {
    if (err instanceof MemcachedMethodError) {
      console.log('🚀 > setTimeout > touchResult err[3500 ms]:', err);
    } else {
      console.log('🚀 > setTimeout > err[3500 ms]:', err);
    }
  }
}, 3500);

setTimeout(async () => {
  try {
    const getResult = await memcached.get('test');
    console.log('🚀 > setTimeout > getResult[5000 ms]:', getResult.result);
  } catch (err) {
    if (err instanceof MemcachedMethodError) {
      console.log('🚀 > setTimeout > getResult err[5000 ms]:', err);
    } else {
      console.log('🚀 > setTimeout > err[5000 ms]:', err);
    }
  }
}, 5000);

setTimeout(() => {
  memcachedDefault.flush((err, result) => {
    if (err) {
      console.log('🚀 > memcached.flush > err[6000 ms]:', err);
    } else {
      console.log('🚀 > memcached.flush > result[6000 ms]:', result);
    }
  });
}, 6000);

// import { createHash, createHmac, randomBytes } from 'crypto';

// const csrfKey = randomBytes(16).toString('hex');
// console.log('🚀 > file: test.ts:4 > csrfKey:', csrfKey);

// const csrfToken = randomBytes(32).toString('hex');
// console.log('🚀 > file: test.ts:7 > csrfToken:', csrfToken);

// const csrfKey = '402dcff8fe2b1a8080d3a75c38f07cb6';

// const csrfToken = 'ad110610f384f696dfe12d318fb4212f2254893333838d282fff2ab19a7b1117';

// const hashedCsrfToken = createHash('sha256').update(`${csrfKey}${csrfToken}`).digest('hex');
// 621d080b24101f5282a52c264906d33aae8abfbed7e59af23d7a20b9321ef512

// const hashedCsrfToken = createHmac('sha256', csrfKey).update(csrfToken).digest('hex');
// 61230d68fa3c84ad20a9916deda8c9e8a6cacc5d7f649da155f3069417140294
// console.log('🚀 > file: test.ts:11 > hashedCsrfToken:', hashedCsrfToken);

// const start = new Date().getTime();
// console.log('🚀 > file: test.ts:21 > start:', start);

// for (let i = 0; i < 1000000; i++) {
//   const csrfKey = randomBytes(16).toString('hex');

//   const csrfToken = randomBytes(32).toString('hex');

//   const hashedCsrfToken = createHash('sha256').update(`${csrfKey}${csrfToken}`).digest('hex'); //9900 - 10000
//   const hashedCsrfToken = createHmac('sha256', csrfKey).update(csrfToken).digest('hex'); //8900 - 9000
// }
// const end = new Date().getTime();
// console.log('🚀 > file: test.ts:32 > end:', end);

// const time = end - start;
// console.log('🚀 > file: test.ts:34 > time:', time);
