/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const path = require('path');

const getCityList = require('./api/getCityList');
const getShopListByCity = require('./api/getShopListByCity');
const Logger = require('../util/Logger');
const CSVKit = require('../util/CSVKit');

const logger = new Logger('LUCKIN');

const DATE = '20190903';
const FILE_NAME = `瑞幸_${DATE}.csv`;
const FILE_PATH = path.resolve(__dirname, FILE_NAME);

const FILE_TITLE = [
  '编号',
  '城市',
  '名字',
  '地址',
  '经度',
  '纬度',
  '营业时间',
];

CSVKit.save({
  title: FILE_TITLE,
  filePath: FILE_PATH,
});

/**
 *
 * @param {Number} str 编号
 * @example '(No.1217)' => 1217
 */
function handleNumber(str) {
  const REG = /\d+/;
  return str.match(REG)[0];
}

async function main() {
  logger.log('获取城市列表...');
  const cityList = await getCityList();
  logger.log(`获取成功！共获取城市【${cityList.length}】个`);

  let totalCount = 0;

  for (let i = 0, len = cityList.length; i < len; i += 1) {
    const city = cityList[i];
    const cityName = city.name;
    logger.log(`获取【${cityName}】门店列表...`);
    const shopList = await getShopListByCity(city);
    logger.log(`获取成功！共获取门店【${shopList.length}】个`);

    totalCount += shopList.length;

    const data = [];

    shopList.forEach((item) => {
      const rowData = [];
      // 编号
      rowData.push(handleNumber(item.number));
      // 城市
      rowData.push(cityName);
      // 名字
      rowData.push(item.name);
      // 地址
      rowData.push(item.address);
      // 经度 longitude
      rowData.push(item.longitude);
      // 纬度 latitude
      rowData.push(item.latitude);
      // 营业时间
      rowData.push(item.workTime);

      data.push(rowData);
    });

    CSVKit.add({
      filePath: FILE_PATH,
      data,
    });
  }

  logger.log(`【${DATE}】全国门店共计【${totalCount}】家`);
}

main();
