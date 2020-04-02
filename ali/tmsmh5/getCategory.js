/**
 * 生成分类文件：category.json
 * https://chaoshi.m.tmall.com/
 */

/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const CONFIG = require('./config');
const encrypt = require('../util/encrypt');
const ajax = require('../../util/ajax');

const APP_KEY = '12574478';
const TOKEN = 'acf830f8975bb099cbe60c29fe7f434d';
const COOKIE = 'cna=RX+kFlFEy0oCAXt9+l0eVMnB; t=2eeb3c75bbb7d1d76f5de4f33ff6d11c; _tb_token_=e38973f1b569f; cookie2=1a7455723c5c204a689e65bda2cee98a; sm4=330100; csa=0_0_0_0_0_0_0_0_0_0_0; l=cBORSehHQPYl2wtZBOCZourza779bIRAguPzaNbMi_5B__YscYbOov_hDEv6cjWd9M8e41HGD6e9-etXvKvTY-cHtBUV.; _m_h5_tk=acf830f8975bb099cbe60c29fe7f434d_1579010163273; _m_h5_tk_enc=edb0bf6e3dbe80a2914bf933fc833e2f; isg=BIGB-rLTu804zNf5wsNQocBakMubrvWgwi6ft-PWcAimyqycKf4pcdCLqHgpQo3Y';

const FILE_PATH = path.resolve(__dirname, CONFIG.CATEGORY_FILE_NAME);

/**
 * 获取分类
 * 需要cookie
 * https://www.tmall.com/wow/car/act/navtab
 */
function fetch(catId) {
  const data = JSON.stringify({
    ver: 1,
    rootName: 'chaoshi',
    catId,
  });

  const CATEGORY_1_URL = 'https://h5api.m.tmall.com/h5/com.taobao.tmallsearch.service.tmallnavservice/1.0/';
  const t = (new Date()).getTime();

  return ajax.jsonp({
    url: CATEGORY_1_URL,
    type: 'jsonp',
    data: {
      jsv: '2.4.8',
      appKey: 12574478,
      t,
      sign: encrypt(`${TOKEN}&${t}&${APP_KEY}&${data}`),
      api: 'com.taobao.tmallsearch.service.TmallNavService',
      v: '1.0',
      type: 'jsonp',
      dataType: 'jsonp',
      callback: 'mtopjsonp1',
      data,
    },
  }).then((res) => {
    const ret = res.ret[0];
    if (ret === 'SUCCESS::调用成功') {
      return res.data;
    }
    throw new Error(`获取分类失败！${ret}`);
  });
}

ajax.init({
  cookie: COOKIE,
});

async function main() {
  const category1s = [];

  console.log('正在获取一级分类...');
  const category1 = await fetch();
  console.log('获取一级分类成功!');

  const category1List = category1.sideBlock.list;
  console.log(`一级分类共 ${category1List.length} 个，他们是：`);
  console.log(category1List.map(item => item.name).join(', '));

  for (let i = 0, len = category1List.length; i < len; i += 1) {
    const currentCategory1 = category1List[i];

    console.log(`正在获取一级分类【${currentCategory1.name}】...`);
    const category2 = await fetch(currentCategory1.id);
    console.log(`获取一级分类【${currentCategory1.name}】成功!`);

    const currentCategory2List = category2.mainBlock.models;
    console.log(`当前一级分类有二级分类 ${currentCategory2List.length} 个，他们是`);
    console.log(currentCategory2List.map(item => item.name).join(', '));

    const currentCategory1New = {
      name: currentCategory1.name,
      id: currentCategory1.id,
      list: currentCategory2List,
    };

    category1s.push(currentCategory1New);

    fs.writeFileSync(FILE_PATH, JSON.stringify(category1s));
  }
}

main();
