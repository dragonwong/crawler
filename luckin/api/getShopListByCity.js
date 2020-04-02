/* eslint-disable no-await-in-loop */
const ajax = require('../util/ajax');

const PAGE_SIZE = 10;

const DATA = {
  longitude: 116.49386596679688,
  latitude: 39.977333068847656,
  channel: 'GCJ-02',
  cityId: 1,
  offSet: 10,
  pageSize: PAGE_SIZE,
  searchValue: '',
  miniversion: '2070',
};

const url = 'https://capi.luckincoffee.com/resource/m/shop/shopList';

async function getShopListByPage(pageNum = 0) {
  DATA.offSet = pageNum * PAGE_SIZE;

  const res = await ajax({
    url,
    data: DATA,
  });

  return res.content.otherShopList;
}

async function getShopListByCity({
  cityId = 1,
  latitude,
  longitude,
}) {
  return new Promise(async (resolve) => {
    DATA.cityId = cityId;
    DATA.latitude = latitude;
    DATA.longitude = longitude;

    let shopList = [];
    let pageNum = 0;
    let hasFinished = false;
    do {
      const shopListByPage = await getShopListByPage(pageNum);
      shopList = shopList.concat(shopListByPage);

      try {
        if (shopListByPage.length < PAGE_SIZE) {
          hasFinished = true;
        } else {
          pageNum += 1;
        }
      } catch (e) {
        console.log(e);
        console.log(shopListByPage);
        throw new Error('getShopListByCity');
      }
    }
    while (hasFinished === false);

    resolve(shopList);
  });
}

module.exports = getShopListByCity;
