/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/**
 * 日期格式化函数
 * @param {Date | Timestamp} date 日期
 * @param {String} template 模版
 * @return {String} 结果
 */
function formatDate(date = new Date(), template = 'yyyy-MM-dd hh:mm:ss.S') {
  if (typeof date === 'number') {
    date = new Date(date);
  }

  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  };
  if (/(y+)/.test(template)) {
    template = template.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(template)) {
      template = template.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
    }
  }
  return template;
}

module.exports = formatDate;
