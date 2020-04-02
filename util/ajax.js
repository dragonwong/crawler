const request = require('request');
// eslint-disable-next-line import/no-extraneous-dependencies
const iconv = require('iconv-lite');

const Logger = require('./Logger');
const sleep = require('../util/sleep');

const logger = new Logger('ajax');

let gCommon = {};
let gCookie;

function init({
  common,
  cookie,
}) {
  gCommon = common;
  if (cookie !== undefined) {
    gCookie = cookie;
  }
}

function post({
  url,
  param = {},
}) {
  return new Promise((resolve) => {
    // step2: 获取指定分类列表
    request.post(url, {
      json: true,
      body: {
        common: gCommon,
        param,
      },
    }, (err, res, body) => {
      if (body.code === 0) {
        resolve(body.data);
      } else {
        console.log(body);
      }
    });
  });
}

function getRequest({
  url,
  headers,
  data,
  retryTimes,
  resolve,
  reject,
  waitTime,
  hasRetryTimes = 0,
  encoding,
}) {
  request.get(url, {
    json: encoding !== null,
    headers: {
      cookie: gCookie,
      ...headers,
    },
    qs: data,
    encoding,
  }, async (err, res, body) => {
    let needRetry = false;
    if (res) {
      if (encoding === null) {
        const charset = res.headers['content-type'].match(/(?:charset=)(\w+)/)[1] || 'utf8';
        try {
          const newBody = iconv.decode(Buffer.from(body), charset);
          resolve(JSON.parse(newBody));
        } catch (e) {
          needRetry = true;
        }
      } else if (typeof body === 'object') {
        resolve(body);
      } else {
        needRetry = true;
      }
    } else {
      needRetry = true;
    }

    if (needRetry) {
      if (retryTimes) {
        const sleepTime = waitTime * hasRetryTimes;
        logger.log(`请求失败，延迟【${sleepTime}ms】重试中...`);
        if (sleepTime) {
          await sleep(sleepTime);
        }
        getRequest({
          url,
          headers,
          data,
          resolve,
          retryTimes: retryTimes - 1,
          reject,
          waitTime,
          hasRetryTimes: hasRetryTimes + 1,
          encoding,
        });
      } else {
        logger.log('[AJAX GET ERROR]', body);
        reject(new Error('[AJAX GET ERROR]'));
      }
    }
  });
}

function get({
  url,
  headers,
  data = {},
  retryTimes = 0,
  waitTime = 0,
  encoding,
}) {
  return new Promise((resolve, reject) => {
    getRequest({
      url,
      headers,
      data,
      retryTimes,
      resolve,
      reject,
      waitTime,
      encoding,
    });
  });
}

function jsonp({
  url,
  data = {},
  encoding,
}) {
  return new Promise((resolve) => {
    request.get(url, {
      headers: {
        Cookie: gCookie,
      },
      qs: {
        callback: 'callback',
        ...data,
      },
      encoding,
    }, (err, res, body) => {
      let newBody = body;
      if (encoding === null) {
        const charset = res.headers['content-type'].match(/(?:charset=)(\w+)/)[1] || 'utf8';
        newBody = iconv.decode(Buffer.from(body), charset);
      }
      const jsonStr = newBody.slice(newBody.indexOf('(') + 1, -1);
      const json = JSON.parse(jsonStr);
      resolve(json);
    });
  });
}

function html({
  url,
  headers,
  data,
  encoding,
}) {
  return new Promise((resolve, reject) => {
    request.get(url, {
      headers: {
        cookie: gCookie,
        ...headers,
      },
      qs: data,
      encoding,
    }, (err, res, body) => {
      if (err) {
        logger.log('err', err);
        reject();
      } else {
        let newBody = body;
        if (encoding === null) {
          const charset = res.headers['content-type'].match(/(?:charset=)(\w+)/)[1] || 'utf8';
          newBody = iconv.decode(Buffer.from(body), charset);
        }
        resolve(newBody);
      }
    });
  });
}


const ajax = {
  init,
  get,
  post,
  jsonp,
  html,
};

module.exports = ajax;
