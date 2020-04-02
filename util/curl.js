/**
 * 通过 curl 的方式获取数据
 *
 * 为什么需要 curl ?
 * 1. node 请求会被返回假数据, shell 请求不会
 * 2. node 请求会返回未登录，shell 不会
 */
const process = require('child_process');
const Logger = require('./Logger');

const logger = new Logger('curl');

function curl({
  cmd,
}) {
  const CMD = `${cmd} | iconv -f gbk`;
  return new Promise((resolve) => {
    // TODO: exec 优化为 spawn 方法，参考：http://yijiebuyi.com/blog/3ec57c3c46170789eed1aa73792d99e5.html
    process.exec(CMD, {
      // 防止错误 ERR_CHILD_PROCESS_STDIO_MAXBUFFER
      maxBuffer: 1024 * 1024 * 2,
    }, (error, stdout, stderr) => {
      if (error === null) {
        resolve(stdout);
      } else {
        logger.log('error:', error);
      }
    });
  });
}

module.exports = curl;
