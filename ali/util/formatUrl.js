/**
 * 格式化 url
 * @param {String} url 链接
 * @returns {String}
 * @example '//baidu.com' => 'baidu.com'
 */
function formatUrl(url) {
  if (url.startsWith('//')) {
    return url.slice(2);
  }
  return url;
}

module.exports = formatUrl;
