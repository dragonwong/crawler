/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const request = require('request');

const curl = require('../util/curl');
const sleep = require('../util/sleep');
const Logger = require('../util/Logger');

const FILE_PATH = path.resolve(__dirname, 'CMD_CURL');
const FILE_PATH_2 = path.resolve(__dirname, 'CMD_CURL');
const CMD_CURL = fs.readFileSync(FILE_PATH, 'utf8');
const CMD_CURL_2 = fs.readFileSync(FILE_PATH_2, 'utf8');

const logger = new Logger('LIANLIAN');

const ALERT_URL = 'http://miaotixing.com/trigger?id=tSKmnD8';

// 检查是否有空座
async function checkEmpty({
  cmd,
  date,
}) {
  const res = await curl({
    cmd,
    gbk: false,
  });
  let data;
  try {
    data = JSON.parse(res);
  } catch (e) {
    return logger.log('结果解析错误', e, res);
  }
  if (data && data.data && data.data.list) {
    const target = data.data.list.find(item => item.bookingItemText === '18:00-19:30');
    const {
      bookingAmount,
      stockAmount,
    } = target;
    logger.log(`${date}预定情况：`);
    logger.log(`18:00-19:30：${bookingAmount}/${stockAmount}`);
    const restAmount = stockAmount - bookingAmount;
    return restAmount;
  }
}
// async function checkEmpty2() {
//   const res = await curl({
//     cmd: CMD_CURL_2,
//     gbk: false,
//   });
//   let data;
//   try {
//     data = JSON.parse(res);
//   } catch (e) {
//     return logger.log('结果解析错误', e, res);
//   }
//   if (data && data.data && data.data.list) {
//     let restAmount = 0;
//     logger.log('6月5日预定情况：');
//     data.data.list.forEach(({
//       bookingItemText,
//       bookingAmount,
//       stockAmount,
//     }) => {
//       logger.log(`${bookingItemText}：${bookingAmount}/${stockAmount}`);
//       restAmount += stockAmount - bookingAmount;
//     });
//     return restAmount;
//   }
// }


async function main() {
  let i = 0;
  while (true) {
    i += 1;
    logger.log(`第${i}次查询`);
    const restAmount = await checkEmpty({
      cmd: CMD_CURL,
      date: '6月4日',
    });
    const restAmount2 = await checkEmpty({
      cmd: CMD_CURL_2,
      date: '6月5日',
    });
    if (restAmount + restAmount2 > 0) {
      request.get(ALERT_URL);
    }
    await sleep(10000);
    Logger.s3();
  }
}

main();
