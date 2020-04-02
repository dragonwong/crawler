/**
 * 天猫超市
 */

/* eslint-disable no-await-in-loop */
const ajax = require('../util/ajax');

const COOKIE = '___rl__test__cookies=1559565332050; lid=anguswhile; cna=sxb9Ee9tCwoCAWq6H/6Rh9RN; OUTFOX_SEARCH_USER_ID_NCOO=833023715.5058905; dnk=anguswhile; uc1=cookie16=URm48syIJ1yk0MX2J7mAAEhTuw%3D%3D&cookie21=VT5L2FSpczFp&cookie15=VFC%2FuZ9ayeYq2g%3D%3D&existShop=false&pas=0&cookie14=UoTZ50l5mLcNDg%3D%3D&tag=8&lng=zh_CN; t=ac3651b7a18cfca9be1bc79ed6b236e3; tracknick=anguswhile; csg=8b137bc0; lgc=anguswhile; _tb_token_=eeb3b5d687e1e; sm4=110100; csa=0_0_0.0; l=bBQFxekeviomBRgKBOCNSZaECl7tAIRAguWbL5-Di_5pw6T_7-_OlUTZXF96Vj5ROxTe4c0qjjy9-etj9; _m_h5_tk=f56ad5d9655a2377339e35b541a3c181_1559638246646; _m_h5_tk_enc=630524a0712a2a7eb5a6e0bd289e67b3; ___rl__test__cookies=1559628906715; isg=BO_vskcc75DBaeyH0xOeZInrfgXzlVo1ahdxogF8it5lUA5SCWQvBfYS1AZLMxsu';
const T = 1559628913421;
const SIGN = '3c1a5f170c6ebe76658bbe2f8702757b';

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * 获取分类
 * 需要cookie
 * https://www.tmall.com/wow/car/act/navtab
 */
function getCategory() {
  const CATEGORY_1_URL = 'https://h5api.m.tmall.com/h5/com.taobao.tmallsearch.service.tmallnavservice/1.0/';
  return ajax.jsonp({
    url: CATEGORY_1_URL,
    data: {
      appKey: '12574478',
      t: T,
      sign: SIGN,
      type: 'jsonp',
      data: JSON.stringify({
        ver: 1,
        rootName: 'cs_hb',
      }),
    },
  }).then((res) => {
    const ret = res.ret[0];
    if (ret === 'SUCCESS::调用成功') {
      return res.data;
    }
    throw new Error(`获取分类失败！${ret}`);
  });
}

/**
 * 获取商品列表
 * http://list.tmall.com/search_product.htm
 */
function getList(categoryName) {
  const CATEGORY_2_URL = 'https://list.tmall.com/chaoshi_data.htm';
  return ajax.get({
    url: CATEGORY_2_URL,
    data: {
      // 页面
      p: 1,
      user_id: 725677994,
      q: categoryName,
      cat: 50514008,
      unify: 'yes',
      from: 'chaoshi',
    },
    retryTimes: 10,
  });
}

/**
 * 获取商品详情
 * https://detail.m.tmall.com/item.htm?id=562150461289
 */
async function getDetail(goodId) {
  const DETAIL_URL = 'https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0/';
  const data = await ajax.jsonp({
    url: DETAIL_URL,
    data: {
      // appKey: '12574478',
      // sign: '10f6cc49c9b3dfc2f9fabc8ced3aa6d0',
      // t: 1559562009405,
      type: 'jsonp',
      data: JSON.stringify({
        itemNumId: `${goodId}`,
        // itemNumId: '562150461289',
      }),
    },
  }).then(res => res.data);

  if (data.item) {
    return data;
  }
  console.log('_____tmd_____');
  await sleep(5000);
  return getDetail(goodId);
}

ajax.init({
  cookie: COOKIE,
});

async function main() {
  console.log('正在获取分类...');
  const category = await getCategory();
  console.log('获取分类成功!');
  const categoryList = category.sideBlock.list;
  const currentCategory2List = category.mainBlock.models;
  console.log(`一级分类共 ${categoryList.length} 个，他们是：`);
  console.log(categoryList.map(item => item.name).join(', '));
  console.log(`当前一级分类是：${categoryList[0].name}`);
  console.log(`当前一级分类有二级分类 ${currentCategory2List.length} 个，他们是`);
  console.log(currentCategory2List.map(item => item.name).join(', '));
  const currentCategory2Item = currentCategory2List[0];
  console.log(`当前二级分类是：${currentCategory2Item.name}`);
  const currentCategory3List = currentCategory2Item.list;
  console.log(`当前二级分类有三级分类 ${currentCategory3List.length} 个，他们是`);
  console.log(currentCategory3List.map(item => item.name).join(', '));
  const currentCategory3Item = currentCategory3List[0];
  const currentCategory3ItemName = currentCategory3Item.name;
  console.log(`当前三级分类是：${currentCategory3ItemName}`);

  console.log('正在获取商品列表...');
  const {
    srp: list,
    page: listPage,
  } = await getList(currentCategory3ItemName);
  console.log(`获取商品列表成功！共有商品 ${listPage.totalNum} 件，共 ${listPage.totalPage} 页，当前第 ${listPage.curPage} 页，有商品 ${list.length} 件`);


  // console.log(list[0]);
  for (let i = 0, len = list.length; i < len; i += 1) {
    const goodId = list[i].nid;
    console.log('- - - - - - - -');
    console.log(`正在获取商品 ${goodId} 的详情...`);
    const detail = await getDetail(goodId);
    console.log(`获取商品 ${goodId} 的详情成功！`);
    console.log('- - - - - - - -');

    const {
      item,
      props2,
      apiStack,
    } = detail;

    if (!item) {
      console.log(detail);
    }

    console.log('商品编号', item.itemId);
    console.log('商品名称', item.shortTitle);
    console.log('商品全称', item.title);
    console.log('商品描述', item.subtitle);
    const apiStack0 = JSON.parse(apiStack[0].value);
    const price = apiStack0.price.price.priceText;
    const {
      sellCount,
    } = apiStack0.item;
    console.log('商品价格', price);
    console.log('商品月销量', sellCount);
    const {
      importantProps,
    } = props2;
    if (importantProps) {
      importantProps.forEach(({
        name,
        value,
      }) => console.log(`${name} ${value}`));
    }
  }
}

main();
