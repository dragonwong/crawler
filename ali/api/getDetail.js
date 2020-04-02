/**
 * 获取详情
 * @param {String} id 商品id
 */
const getDetailFromHtml = require('./getDetailFromHtml');
const getDetailFromJsonp = require('./getDetailFromJsonp');

async function getDetail(id) {
  return Promise.all([getDetailFromHtml(id), getDetailFromJsonp(id)]).then(res => ({
    dataFromHtml: res[0],
    dataFromJsonp: res[1],
  }));
}

module.exports = getDetail;
