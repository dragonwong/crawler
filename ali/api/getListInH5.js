/**
 * 获取列表
 * 不需要cookie
 * https://list.tmall.com/search_product.htm
 *
 * node 请求会被返回假数据
 * shell 请求不会
 *
 * page_size 有效值最大为 60
 *
 * h5 用，超过两页不返回
 * 等于没法用
 */
const process = require('child_process');

function getList(name) {
  return new Promise((res) => {
    process.exec(`curl 'https://list.tmall.com/m/search_items.htm?page_size=1&page_no=3&q=${encodeURIComponent(name)}&type=p&sort=d' -H 'referer: https://list.tmall.com/m/search_items.htm' --compressed`, (error, stdout, stderr) => {
      if (error === null) {
        try {
          res(JSON.parse(stdout));
        } catch (err) {
          console.log('[getList][parse] stdout:', stdout);
        }
      } else {
        console.log('[getList][curl] error:', error);
      }
    });
  });
}

module.exports = getList;
