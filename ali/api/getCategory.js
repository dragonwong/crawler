/**
 * 获取分类
 * 不需要cookie
 * https://www.tmall.com/
 */

const ajax = require('../../util/ajax');

function getCategory(id) {
  const URL = 'https://aldh5.tmall.com/recommend2.htm';

  return ajax.jsonp({
    url: URL,
    encoding: null,
    data: {
      notNeedBackup: true,
      appId: id,
    },
  }).then(res => res[id].data.map(item => ({
    title: item.title,
    id: item.id,
  })));
}

module.exports = getCategory;
