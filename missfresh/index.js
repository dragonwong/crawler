/**
 * 每日优鲜
 */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');

const ajax = require('../util/ajax');
const log = require('../util/log');

const KEY_MAP = new Map([
  ['name', '商品名称'],
  ['price', '价格'],
  ['priceVip', '优惠价'],
  ['salesCount', '销量数'],
  ['category1', '一级分类'],
  ['category2', '二级分类'],
  ['country', '产地'],
  ['weight', '重量'],
  ['pack', '包装'],
  ['storageTime', '保质期'],
  ['storageMethod', '贮存方法'],
  ['sku', 'sku'],
]);

const ADDRESS = {
  name: '望京',
  code: 110105,
};

ajax.init({
  common: {
    platform: 'weixin_app',
    addressCode: ADDRESS.code,
    stationCode: 'MRYX|mryx_bj_ftbjs',
    version: '8.8.0.16',
  },
});

function saveAsCSV(data) {
  const filePath = path.resolve(__dirname, `每日优鲜_${ADDRESS.name}_${+new Date()}.csv`);

  const resCSVArr = [];

  const keys = Array.from(KEY_MAP.keys());

  // title
  resCSVArr.push(Array.from(KEY_MAP.values()).join(', '));

  data.forEach((item) => {
    resCSVArr.push(keys.map(key => item[key]).join(', '));
  });

  fs.writeFileSync(filePath, resCSVArr.join('\n'));
}

async function main() {
  let result = [];

  // step1: 获取分类
  log('获取分类列表...');
  const categoryListRes = await ajax.post({
    url: 'https://as-vip.missfresh.cn/as/home/categoryList',
  });
  log('获取分类列表成功!');
  log.split();

  const {
    categories,
  } = categoryListRes;

  for (let i = 0, len = categories.length; i < len; i += 1) {
    const category = categories[i];
    const categoryCode = category.internalId;
    const categoryName = category.name;

    log(`[${i + 1}] ${categoryName}`);
    log('获取商品列表...');

    let lastProductIndex = 0;
    let categoryVersion = '';
    const goods = [];
    let secondGroupMap;

    while (lastProductIndex !== -1) {
      const goodListRes = await ajax.post({
        url: 'https://as-vip.missfresh.cn/as/home/category/classifyProductInfo',
        param: {
          categoryCode,
          categoryVersion,
          lastProductIndex,
          secondGroupId: '',
        },
      });

      if (!secondGroupMap) {
        secondGroupMap = {};
        if (goodListRes.secondGroupInfo) {
          goodListRes.secondGroupInfo.forEach((item) => {
            secondGroupMap[item.secondGroupId] = item.name;
          });
        }
      }

      const { cellList } = goodListRes;

      for (let j = 0, jLen = cellList.length; j < jLen; j += 1) {
        const good = cellList[j];
        if (good.cellType === 7) {
          // 详情
          const { sku } = good.normalProducts;
          const detail = await ajax.post({
            url: 'https://as-vip.missfresh.cn/as/item/productDetail',
            param: {
              sku,
            },
          });

          goods.push({
            name: detail.name,
            price: detail.market_price / 100,
            priceVip: detail.vip_price / 100,
            salesCount: detail.sales_volume,
            category1: categoryName,
            category2: secondGroupMap[good.secondGroupId],
            country: detail.country,
            weight: detail.weight,
            pack: detail.pack,
            storageTime: detail.storage_time,
            storageMethod: detail.storage_method,
            sku,
          });
        }
      }

      lastProductIndex = goodListRes.lastProductIndex;
      categoryVersion = goodListRes.categoryVersion;
    }

    log(`获取商品列表成功! 获取商品 ${goods.length} 件`);

    result = result.concat(goods);
  }
  log.split();
  log(`获取全部商品, 共 ${result.length} 件`);

  saveAsCSV(result);
}


main();
