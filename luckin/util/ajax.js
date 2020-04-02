/* eslint-disable no-await-in-loop */
const request = require('request');

const kelen = require('./kelen');
const CONFIG = require('../config');
const Logger = require('../../util/Logger');
const sleep = require('../../util/sleep');

const logger = new Logger('AJAX');
const DELAY_TIME = 5000;

function atomAjax(url, opts) {
  return new Promise((resolve) => {
    request.post(url, opts, (err, res, body) => {
      const str = kelen.decrypt(body);
      try {
        const json = JSON.parse(str);
        resolve(json);
      } catch (e) {
        logger.log(str);
        throw new Error('JSON_PARSE_ERROR');
      }
    });
  });
}

function ajax({
  url,
  data,
}) {
  return new Promise(async (resolve) => {
    const param = kelen.prepare(data);
    const opts = {
      body: `cid=230101&q=${param.q}&sign=${param.sign}&uid=${CONFIG.uid}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    let shouldContinue = true;
    let retryTimes = 0;

    do {
      const res = await atomAjax(url, opts);
      if (res.code === 1) {
        shouldContinue = false;
        resolve(res);
      } else if (res.code === 3) {
        retryTimes += 1;
        logger.log(`【${url}】请求失败：${res.msg}`);

        const delayTime = DELAY_TIME * retryTimes;

        logger.log(`第【${retryTimes}】次重试将于【${delayTime}ms】后开始...`);
        await sleep(DELAY_TIME);
      } else {
        shouldContinue = false;
        logger.log(`【${url}】请求失败：${res.msg}`);
        throw new Error('CODE_ERROR');
      }
    } while (shouldContinue);
  });
}

module.exports = ajax;
