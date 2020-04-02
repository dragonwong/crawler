/**
 * 获取商品详情
 * https://detail.m.tmall.com/item.htm?id=562150461289
 *
 * 参考 ../doc/detailFromJsonp.json
 */
const ajax = require('../util/ajax');
const formatUrl = require('../util/formatUrl');
const Logger = require('../../util/Logger');

const logger = new Logger('getDetailFromJsonp');

async function getDetailFromJsonp(id) {
  const DETAIL_URL = 'https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/';
  const data = await ajax.jsonp({
    uri: DETAIL_URL,
    qs: {
      // appKey: '12574478',
      // sign: '10f6cc49c9b3dfc2f9fabc8ced3aa6d0',
      // t: 1559562009405,
      type: 'jsonp',
      data: JSON.stringify({
        itemNumId: `${id}`,
        // itemNumId: '562150461289',
      }),
    },
  }).then(res => res.data).catch(() => undefined);

  if (!data) {
    return undefined;
  }

  if (data.item) {
    const {
      item,
      props2,
      apiStack,
    } = data;

    if (!item) {
      console.log(data);
      throw new Error('没有 item');
    }

    // 格式化 images：去除 //
    if (item.images) {
      item.images = item.images.map(formatUrl);
    }

    let apiStack0;

    try {
      apiStack0 = JSON.parse(apiStack[0].value);
    } catch (e) {
      logger.log('parse apiStack[0].value fail', apiStack[0].value);
      return getDetailFromJsonp(id);
    }

    const {
      sellCount,
    } = apiStack0.item;
    const {
      importantProps,
    } = props2;

    return {
      item,
      sellCount,
      importantProps,
    };
  }
  console.log('_____tmd_____');
  return getDetailFromJsonp(id);
}

module.exports = getDetailFromJsonp;
