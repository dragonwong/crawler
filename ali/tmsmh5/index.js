/* eslint-disable no-loop-func */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/**
 * 天猫超市 h5
 * https://chaoshi.m.tmall.com/
 */
const fs = require('fs');
const path = require('path');
const pParallel = require('p-parallel');
const CONFIG = require('./config');
const formatUrl = require('../util/formatUrl');
const ajax = require('../../util/ajax');
const Logger = require('../../util/Logger');
const CSVKit = require('../../util/CSVKit');
// const getDetailFromJsonp = require('../api/getDetailFromJsonp');
const getDetailFromHtml = require('../api/getDetailFromHtml');

const FILE_CATEGORY_PATH = path.resolve(__dirname, CONFIG.CATEGORY_FILE_NAME);

const MAX_PAGE_NUM = 4;

const FILE_NAME = '天猫超市_20200121';
const FILE_CSV_NAME = `${FILE_NAME}.csv`;
const FILE_CSV_PATH = path.resolve(__dirname, FILE_CSV_NAME);
const FILE_CACHE_NAME = `${FILE_NAME}.cache`;
const FILE_CACHE_PATH = path.resolve(__dirname, FILE_CACHE_NAME);

const logger = new Logger('TMSM');
let cache = [];

// 准备 cache 文件
if (fs.existsSync(FILE_CACHE_PATH)) {
  cache = fs.readFileSync(FILE_CACHE_PATH, {
    encoding: 'utf8',
  }).split('\n');
}

const FILE_CSV_TITLE = [
  '大分类',
  '中分类',
  '小分类',
  '商品名称', // title
  '价格', // reservePrice
  '促销价格', // price
  '月销量', // sold
  '缩略图', // img
  '链接', // url
  'type',
  'postFee',
  'promRate',
  '商品编码',
  'spuId',
  'catId',
  '品牌',
  '系列',
  '产地',
  '省份',
  '商品条形码',
  '净含量',
  '生产许可证编号',
  '产品标准号',
  '厂名',
  '厂址',
  '厂家联系方式',
  '配料表',
  '储藏方法',
  '保质期',
  'title',
  'subtitle',
  'images',
  'categoryId',
  'rootCategoryId',
  'tmallDescUrl',
  '评论数',
];

if (!fs.existsSync(FILE_CSV_PATH)) {
  CSVKit.save({
    title: FILE_CSV_TITLE,
    filePath: FILE_CSV_PATH,
  });
}

/**
 * 获取商品列表
 * http://list.tmall.com/search_product.htm
 */
function getList(categoryName, pageNum = 1) {
  const CATEGORY_2_URL = 'https://list.tmall.com/chaoshi_data.htm';
  return ajax.get({
    url: CATEGORY_2_URL,
    data: {
      // 页面
      p: pageNum,
      user_id: 725677994,
      q: categoryName,
      cat: 50514008,
      unify: 'yes',
      from: 'chaoshi',
      // 排序：热销
      sort: 'd',
    },
    retryTimes: 10,
    waitTime: 1000,
    encoding: null,
  });
}

// ajax.init({
//   cookie: COOKIE,
// });

async function main() {
  const categoriesStr = fs.readFileSync(FILE_CATEGORY_PATH, {
    encoding: 'utf8',
  });

  const categories = JSON.parse(categoriesStr);

  let index = 0;
  for (let i = 0, categoriesLen = categories.length; i < categoriesLen; i += 1) {
    const category1 = categories[i];
    const category1List = category1.list;
    for (let j = 0, category1Len = category1List.length; j < category1Len; j += 1) {
      const category2 = category1List[j];
      const category2List = category2.list;

      if (category2.name === '品牌墙') {
        index += category2List.length;
        continue;
      }

      for (let k = 0, category2len = category2List.length; k < category2len; k += 1) {
        const keyword = category2List[k].name;
        index += 1;

        if (cache.includes(keyword)) {
          logger.log(`获取关键字【${keyword}】已抓取，跳过`);
          continue;
        }

        logger.log(`(${index}/${660})正在获取关键字【${keyword}】列表...`);
        logger.log(`获取关键字【${keyword}】列表第【1】页`);
        const {
          srp: list,
          page: listPage,
        } = await getList(keyword);

        let totalList = list;

        logger.log(`获取关键字【${keyword}】列表第【1】页成功！共有商品 ${listPage.totalNum} 件，共 ${listPage.totalPage} 页，当前第 ${listPage.curPage} 页，有商品 ${list.length} 件`);
        for (let pageIndex = 2; pageIndex <= Math.min(listPage.totalPage, MAX_PAGE_NUM);
          pageIndex += 1) {
          logger.log(`获取关键字【${keyword}】列表第【${pageIndex}】页`);
          const {
            srp: list2,
            page: listPage2,
          } = await getList(keyword, pageIndex);
          logger.log(`获取关键字【${keyword}】列表第【${pageIndex}】页成功！共有商品 ${listPage2.totalNum} 件，共 ${listPage2.totalPage} 页，当前第 ${listPage2.curPage} 页，有商品 ${list2.length} 件`);
          totalList = totalList.concat(list2);
        }

        logger.log(`获取关键字【${keyword}】列表成功！共有商品 ${totalList.length} 件`);

        // 并行
        const taskArr = new Array(totalList.length).fill(1).map((item, goodIndex) => async () => {
          const good = totalList[goodIndex];
          try {
            // const detail = await getDetailFromJsonp(good.nid);
            // logger.log(`获取商品【${detail.item.title}】详情成功！`);
            const detail = await getDetailFromHtml(good.nid);
            // logger.log(`获取商品【${detail.itemInfo.title}】详情成功！`);
            return {
              ret: true,
              data: detail,
            };
          } catch (error) {
            logger.log(`获取商品【${good.nid}】详情失败！`, error);
            return {
              ret: false,
              error,
            };
          }
        });

        const details = await pParallel(taskArr, 30);
        logger.log(`获取关键字【${keyword}】详情成功！共有商品 ${details.length} 件`);

        CSVKit.add({
          filePath: FILE_CSV_PATH,
          data: totalList.map((item, itemIndex) => {
            const {
              ret,
              data,
            } = details[itemIndex];
            const res = [
              category1.name,
              category2.name,
              keyword,
              item.title,
              item.reservePrice,
              item.price,
              item.sold,
              formatUrl(item.img),
              formatUrl(item.url),
              item.type,
              item.postFee,
              item.promRate,
              item.nid,
              item.spuId,
              item.catId,
            ];
            if (ret) {
              const {
                baseInfo,
                itemInfo,
                rateInfo,
              } = data;
              const images = itemInfo.images.map(formatUrl).join(' ');
              const commentCount = rateInfo ? rateInfo.totalCount : '';
              return res.concat([
                baseInfo['品牌'],
                baseInfo['系列'],
                baseInfo['产地'],
                baseInfo['省份'],
                baseInfo['商品条形码'],
                baseInfo['净含量'],
                baseInfo['生产许可证编号'],
                baseInfo['产品标准号'],
                baseInfo['厂名'],
                baseInfo['厂址'],
                baseInfo['厂家联系方式'],
                baseInfo['配料表'],
                baseInfo['储藏方法'],
                baseInfo['保质期'],
                itemInfo.title,
                itemInfo.subtitle,
                images,
                itemInfo.categoryId,
                itemInfo.rootCategoryId,
                itemInfo.tmallDescUrl,
                commentCount,
              ]);
            }
            return res;
          }),
        });

        cache.push(keyword);
        fs.appendFileSync(FILE_CACHE_PATH, `\n${keyword}`, 'utf8');
      }
    }
  }
}

main();

// async function testList(keyword, pageIndex) {
//   logger.log(`获取关键字【${keyword}】列表第【${pageIndex}】页`);
//   const {
//     srp: list2,
//     page: listPage2,
//   } = await getList(keyword, pageIndex);
//   logger.log(`获取关键字【${keyword}】列表第【${pageIndex}】页成功！
//     共有商品 ${listPage2.totalNum} 件，共 ${listPage2.totalPage} 页，
//     当前第 ${listPage2.curPage} 页，有商品 ${list2.length} 件`);
//   // cache.push(keyword);
//   console.log(list2[0]);
//   // fs.appendFileSync(FILE_CACHE_PATH, `\n${list2[0].title}`, 'utf8');
// }
// test('稻花香米', 3);

// async function testDetail(id) {
//   // const detail = await getDetailFromJsonp(id);
//   const detail = await getDetailFromHtml(id);
//   console.log(detail);
// }

// testDetail(610277311143);
