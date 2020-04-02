const request = require('request');
// eslint-disable-next-line import/no-extraneous-dependencies
const iconv = require('iconv-lite');

const Logger = require('../../util/Logger');

const logger = new Logger('AJAX');

const REJECT_REASON = {
  TIMEOUT: 'TIMEOUT',
  REQUEST_ERR: 'REQUEST_ERR',
};

const TIMEOUT = 10000;
const RETRY_TIMES = 5;

function doRequest(opts, resolve, reject) {
  let shouldIContinue = true;

  let {
    timeout,
    retryTimes,
  } = opts;

  if (timeout === undefined) {
    timeout = TIMEOUT;
  }
  if (retryTimes === undefined) {
    retryTimes = RETRY_TIMES;
  }

  const setTimeoutId = setTimeout(() => {
    shouldIContinue = false;
    if (retryTimes > 0) {
      retryTimes -= 1;
      logger.log(`【${opts.uri}】超时重试，剩余次数：${retryTimes}`);
      doRequest({
        ...opts,
        headers: {
          ...opts.headers,
          cookie: 'cookie2=1f8c050b3b0905cbad9aec96d2c0d635; t=25f1a2e92c5426996f8944ced66fe0a3; _tb_token_=e345758feee69; _m_h5_tk=1906e26d43d27f3d9aaa212e15a54bb8_1561101827500; _m_h5_tk_enc=420bb4a8aa62b34fe65a5c9676937f20; cna=41eTFZgAnHECASeb237Ni05g; isg=BMDAvdaXiY91h3WLg6MG99ezkUiYSIz2EDTw5jpRhFtutWDf4ltqoy4HyV3QBVzr',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        },
        retryTimes,
      }, resolve, reject);
    } else {
      logger.log(REJECT_REASON.TIMEOUT, opts.uri);
      reject({
        type: REJECT_REASON.TIMEOUT,
      });
    }
  }, timeout);

  request({
    ...opts,
  // eslint-disable-next-line consistent-return
  }, (err, res, body) => {
    clearTimeout(setTimeoutId);

    if (shouldIContinue) {
      if (err) {
        if (retryTimes > 0) {
          retryTimes -= 1;
          logger.log(`${REJECT_REASON.REQUEST_ERR} 重试，剩余次数：${retryTimes}`);
          return doRequest({
            ...opts,
            retryTimes,
          }, resolve, reject);
        }
        logger.log(REJECT_REASON.REQUEST_ERR, opts.uri, err);
        return reject({
          type: REJECT_REASON.REQUEST_ERR,
          data: err,
        });
      }
      let newBody = body;
      if (opts.encoding === null) {
        const charset = res.headers['content-type'].match(/(?:charset=)(\w+)/)[1] || 'utf8';
        newBody = iconv.decode(Buffer.from(body), charset);
      }

      return resolve(newBody);
    }
  });
}

function core(opts) {
  return new Promise((resolve, reject) => {
    doRequest(opts, resolve, reject);
  });
}

function get(opts) {
  return core({
    ...opts,
    method: 'GET',
  });
}

function post(opts) {
  return core({
    json: true,
    ...opts,
    method: 'POST',
  });
}

function jsonp(opts) {
  return core({
    ...opts,
    qs: {
      callback: 'callback',
      ...opts.qs,
    },
    method: 'GET',
  }).then((newBody) => {
    const jsonStr = newBody.slice(newBody.indexOf('(') + 1, -1);
    const json = JSON.parse(jsonStr);
    return json;
  });
}

const ajax = {
  get,
  post,
  jsonp,
};

module.exports = ajax;
