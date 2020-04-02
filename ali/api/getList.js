/**
 * 获取列表
 * 不需要cookie
 * https://list.tmall.com/search_product.htm
 *
 * node 请求会被返回假数据
 * shell 请求不会
 *
 * page_size 有效值最大为 60
 */
const fs = require('fs');
const process = require('child_process');
const cheerio = require('cheerio');
const urlencode = require('urlencode');

const formatUrl = require('../util/formatUrl');

const CMD_CURL = fs.readFileSync('./toLoad/getListCmd', 'utf8');

function getList({
  listName,
  index = 0,
}) {
  const listNameEncoded = urlencode(listName, 'gbk');

  if (!CMD_CURL.includes('&s=')) {
    throw new Error('CMD_CURL not includes &s=');
  }

  const cmd = CMD_CURL.replace(/(?<=&s=)\d+/, index).replace(/(?<=q=)(%([A-Z]|\d){2})+/, listNameEncoded);

  const CMD = `${cmd} | iconv -f gbk`;
  return new Promise((resolve) => {
    // TODO: exec 优化为 spawn 方法，参考：http://yijiebuyi.com/blog/3ec57c3c46170789eed1aa73792d99e5.html
    process.exec(CMD, {
      // 防止错误 ERR_CHILD_PROCESS_STDIO_MAXBUFFER
      maxBuffer: 1024 * 1024 * 2,
    }, (error, stdout, stderr) => {
      if (error === null) {
        const $ = cheerio.load(stdout);
        const list = $('.product').map((i, el) => {
          const $el = $(el);
          const { id } = $el.data();
          const $anchor = $el.find('.productTitle > a');
          const name = $anchor.text().replace(/\n/g, '');
          const url = formatUrl($anchor.attr('href'));
          const price = $el.find('.productPrice').text().trim();
          const sellCountPerMonth = $el.find('.productStatus > span > em').text();
          const commentCount = $el.find('.productStatus > span > a').text();
          const $img = $el.find('.productImg > img');
          let imgUrl = $img.attr('src');
          if (!imgUrl) {
            imgUrl = $img.data('ks-lazyload');
          }
          imgUrl = formatUrl(imgUrl);

          // console.log('--------------------');
          // console.log(`页码：1，序号：${i + 1}`);
          // console.log(`编号：${id}`);
          // console.log(`名字：${name}`);
          // console.log(`价格：${price}`);
          // console.log(`月销量：${sellCountPerMonth}`);
          // console.log(`评论量：${commentCount}`);
          // console.log(`链接：${url}`);
          // console.log(`图片链接：${imgUrl}`);

          return {
            id,
            name,
            price,
            sellCountPerMonth,
            commentCount,
            url,
            imgUrl,
          };
        }).get();

        resolve(list);
      } else {
        console.log('[getList][curl] error:', error);
      }
    });
  });
}

module.exports = getList;
