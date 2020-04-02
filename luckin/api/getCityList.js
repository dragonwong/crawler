/* eslint-disable no-await-in-loop */
const request = require('request');

const CONFIG = require('../config');
const kelen = require('../util/kelen');

const DATA = {
  miniversion: '2100',
};

const url = 'https://capi.luckincoffee.com/resource/m/sys/app/openingcitys';

function getCityList() {
  return new Promise((resolve) => {
    const param = kelen.prepare(DATA);

    request.post(url, {
      body: `cid=230101&q=${param.q}&sign=${param.sign}&uid=${CONFIG.uid}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }, (err, res, body) => {
      const str = kelen.decrypt(body);
      const cityList = JSON.parse(str).content;
      resolve(cityList);
    });
  });
}

module.exports = getCityList;
