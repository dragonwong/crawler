/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const fs = require('fs');
const path = require('path');
// util
const CSVKit = require('../util/CSVKit');
const Logger = require('../util/Logger');
const formatUrl = require('./util/formatUrl');
// const sleep = require('../util/sleep');
// api
const getCategory = require('./api/getCategory');
const getList = require('./api/getList');
const getDetail = require('./api/getDetail');

const logger = new Logger('ALI');

// 防止 node 报错：https://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected
// process.setMaxListeners(0);
// https://stackoverflow.com/questions/8313628/node-js-request-how-to-emitter-setmaxlisteners
require('events').EventEmitter.defaultMaxListeners = 15;

// 列表分页页数
const LIST_PAGE_NUM = 3;
// 列表分页单页数据条数
const LIST_PAGE_SIZE = 60;

const FILE_NAME = '天猫_20190620.csv';
const FILE_PATH = path.resolve(__dirname, FILE_NAME);

const FILE_TITLE = [
  '大分类',
  '中分类',
  '小分类',
  '商品名称',
  '品牌',
  '价格',
  '促销价格',
  '月成交量',
  '月销量',
  '累计评论数',
  '页码',
  '排名',
  '商品详',
  '图片链接',
  '商品url',
];

if (!fs.existsSync(FILE_PATH)) {
  CSVKit.save({
    title: FILE_TITLE,
    filePath: FILE_PATH,
  });
}

// 选定一二级分类
const CATEGORY_TREE = [{
  name: '零食/茶酒进口食品',
  children: [{
    name: '进口食品',
    id: '2016030720',
  }, {
    name: '休闲零食',
    id: '2016030721',
  }, {
    name: '酒类',
    id: '2016030722',
  }, {
    name: '乳品冲饮',
    id: '201603142',
  }, {
    name: '粮油速食',
    id: '201603143',
  }],
}];

// const SKIP_CATEGORY_LV2 = ['进口食品', '休闲零食', '酒类'];
// const SKIP_CATEGORY_LV3 = [
//   '进口零食', '进口巧克力', '进口饼干', '进口糖果', '进口坚果', '进口果干', '进口橄榄油', '进口牛奶', '进口咖啡', '进口饮料', '进口葡萄酒', '进口洋酒',
//   '零食', '坚果', '饼干', '蛋糕', '红枣', '巧克力', '猪肉脯', '膨化食品', '蜜饯', // 鸭脖糖果豆干曲奇海苔肉松饼牛肉干鱿鱼丝糕点
//   '白酒', '红酒', '洋酒',
//   '牛奶', '酸奶', '成人奶粉', '儿童奶', '速溶咖啡', '滤挂咖啡', '咖啡豆', '麦片', '奶茶', '柚子茶', // 果汁汽水功能饮料饮用水',
// ];

const SKIP_CATEGORY_LV2 = [];
const SKIP_CATEGORY_LV3 = [];

async function main() {
  for (let i_categoryLv1 = 0, len_categoryLv1 = CATEGORY_TREE.length;
    i_categoryLv1 < len_categoryLv1; i_categoryLv1 += 1) {
    const currentCategoryLv1 = CATEGORY_TREE[i_categoryLv1];
    const currentCategoryLv1Name = currentCategoryLv1.name;
    const currentCategoryLv1Children = currentCategoryLv1.children;
    logger.log(`当前正在抓取一级分类【${currentCategoryLv1Name}】`);
    for (let i_categoryLv2 = 0, len_categoryLv2 = currentCategoryLv1Children.length;
      i_categoryLv2 < len_categoryLv2; i_categoryLv2 += 1) {
      const currentCategoryLv2 = currentCategoryLv1Children[i_categoryLv2];
      const currentCategoryLv2Name = currentCategoryLv2.name;
      logger.log(`当前正在抓取二级分类【${currentCategoryLv2Name}】`);

      if (SKIP_CATEGORY_LV2.includes(currentCategoryLv2Name)) {
        console.log(`【${currentCategoryLv2Name}】已有，跳过`);
        continue;
      }

      const categoryLv3 = await getCategory(currentCategoryLv2.id);

      // console.log(category);
      for (let i_categoryLv3 = 0, len_categoryLv3 = categoryLv3.length;
        i_categoryLv3 < len_categoryLv3; i_categoryLv3 += 1) {
        const currentCategoryLv3 = categoryLv3[i_categoryLv3];
        const currentCategoryLv3Name = currentCategoryLv3.title;
        logger.log(`当前正在抓取三级分类【${currentCategoryLv3Name}】`);

        if (SKIP_CATEGORY_LV3.includes(currentCategoryLv3Name)) {
          console.log(`【${currentCategoryLv3Name}】已有，跳过`);
          continue;
        }

        for (let i_page_num = 0; i_page_num < LIST_PAGE_NUM; i_page_num += 1) {
          const pageNum = i_page_num + 1;
          logger.log(`当前正在抓取三级分类【${currentCategoryLv3Name}】的第【${pageNum}】页：${i_page_num * LIST_PAGE_SIZE + 1} ～ ${(i_page_num + 1) * LIST_PAGE_SIZE}`);
          const list = await getList({
            listName: currentCategoryLv3Name,
            index: i_page_num * LIST_PAGE_SIZE,
          });

          console.log('当前页总数', list.length);
          // await sleep(5000);
          // continue;
          // console.log('page_size', listRes.page_size);
          // console.log('total_page', listRes.total_page);
          // console.log('total_results', listRes.total_results);
          // console.log('current_page', listRes.current_page);

          for (let i_list = 0, len_list = list.length; i_list < len_list; i_list += 1) {
            Logger.s3();
            const currentGood = list[i_list];
            const sortNum = i_page_num * LIST_PAGE_SIZE + i_list + 1;
            logger.log(`${sortNum} ${currentGood.id} ${currentGood.name}`);
            const currentGoodDetail = await getDetail(currentGood.id);
            // console.log(currentGoodDetail);

            const {
              dataFromHtml,
              dataFromJsonp,
            } = currentGoodDetail;

            const rowData = [];
            // console.log('大分类：', currentCategoryLv1Name);
            rowData.push(currentCategoryLv1Name);
            // console.log('中分类：', currentCategoryLv2Name);
            rowData.push(currentCategoryLv2Name);
            // console.log('小分类：', currentCategoryLv3Name);
            rowData.push(currentCategoryLv3Name);
            // console.log('商品名称：', currentGood.name);
            rowData.push(currentGood.name);

            const brand = dataFromHtml ? dataFromHtml['品牌'] : '无';
            // console.log('品牌：', brand);
            rowData.push(brand);

            // console.log('价格：', currentGood.price);
            rowData.push(currentGood.price);
            // console.log('促销价格：', currentGood.price);
            rowData.push(currentGood.price);

            const sellCount = dataFromJsonp ? dataFromJsonp.sellCount : '无';
            // console.log('月成交量：', sellCount);
            rowData.push(sellCount);

            // console.log('月销量：', currentGood.sellCountPerMonth);
            rowData.push(currentGood.sellCountPerMonth);

            const commentCount = dataFromJsonp ? dataFromJsonp.item.commentCount : '无';
            // console.log('累计评论数：', commentCount);
            rowData.push(commentCount);
            // console.log('页码：', 1);
            rowData.push(pageNum);
            // console.log('排名：', 1);
            rowData.push(sortNum);

            const detail = dataFromHtml ? JSON.stringify(dataFromHtml) : '无';
            // console.log('商品详情', detail);
            rowData.push(detail);

            const images = dataFromJsonp ? dataFromJsonp.item.images.join(' ') : '无';
            // console.log('图片链接：', images);
            rowData.push(images);
            // console.log('商品url：', formatUrl(currentGood.url));
            rowData.push(formatUrl(currentGood.url));

            logger.log('获取详情成功');

            CSVKit.add({
              filePath: FILE_PATH,
              data: rowData,
            });
          }
        }
      }
    }
  }

  // const detailRes = await getDetail('556280006448');
  // console.log(detailRes);
}

main();
