import { memcached, memcachedDefault } from '@src/db/MemcachedClientInstance.js';

try {
  const setResult = await memcached.set('test', 'test value', 5);
  console.log('🚀 > setResult:', setResult.message);
} catch (err) {
  console.log('🚀 > err:', err);
}

setTimeout(async () => {
  const getResult = await memcached.get('test');
  if (getResult.status === 'success') {
    console.log('🚀 > setTimeout > getResult[1000 ms]:', getResult.result);
  } else {
    console.log('🚀 > setTimeout > getResult[1000 ms]:', getResult.error);
  }
}, 1000);

setTimeout(async () => {
  const getResult = await memcached.get('test');
  if (getResult.status === 'success') {
    console.log('🚀 > setTimeout > getResult[3000 ms]:', getResult.result);
  } else {
    console.log('🚀 > setTimeout > getResult[3000 ms]:', getResult.error);
  }
}, 3000);

// setTimeout(async () => {
//   const touchResult = await memcached.touch('test', 5);
//   if (touchResult.status === 'success') {
//     console.log('🚀 > setTimeout > touchResult[3500 ms]:', touchResult.message);
//   } else {
//     console.log('🚀 > setTimeout > touchResult[3500 ms]:', touchResult.error);
//   }
// }, 3500);

setTimeout(async () => {
  const getResult = await memcached.get('test');
  if (getResult.status === 'success') {
    console.log('🚀 > setTimeout > getResult[5000 ms]:', getResult.result);
  } else {
    console.log('🚀 > setTimeout > getResult[5000 ms]:', getResult.error);
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
