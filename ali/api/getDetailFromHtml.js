/**
 * 获取详情
 * 不需要cookie
 * https://detail.m.tmall.com/item.htm
 *
 * 接口返回参考 ../doc/detailFromHtml.json
 * 方法返回参考 ../doc/detailFromHtmlRes.json
 */
const ajax = require('../util/ajax');
const Logger = require('../../util/Logger');

const logger = new Logger('getDetailFromHtml');

function getDetailFromHtml(id) {
  return ajax.get({
    uri: 'https://detail.m.tmall.com/item.htm',
    qs: {
      id,
    },
    encoding: null,
  }).then((html) => {
    let jsInHtml;
    const detail = {
      baseInfo: {},
    };
    html.split('<script>').some((item) => {
      if (item.includes('_DATA_Detail')) {
        jsInHtml = item;
        return true;
      }
      return false;
    });

    if (jsInHtml) {
      const jsonStr = jsInHtml.slice(jsInHtml.indexOf('{'), -10);
      const json = JSON.parse(jsonStr);

      // baseInfo
      if (json.props.groupProps) {
        json.props.groupProps.some((propLv1) => {
          const baseInfo = propLv1['基本信息'];
          if (Array.isArray(baseInfo)) {
            detail.baseInfo = Object.assign({}, ...baseInfo);
            return true;
          }
          return false;
        });
      }
      // itemInfo
      const jsonItemInfo = json.item;
      if (jsonItemInfo) {
        detail.itemInfo = {
          itemId: jsonItemInfo.itemId,
          title: jsonItemInfo.title,
          subtitle: jsonItemInfo.subtitle,
          images: jsonItemInfo.images,
          categoryId: jsonItemInfo.categoryId,
          rootCategoryId: jsonItemInfo.rootCategoryId,
          tmallDescUrl: jsonItemInfo.tmallDescUrl,
        };
      } else {
        logger.log('no jsonItemInfo', id);
      }
      // rateInfo
      const rateInfo = json.rate;
      if (rateInfo) {
        detail.rateInfo = {
          totalCount: rateInfo.totalCount,
        };
      }
    } else {
      logger.log('no jsInHtml', html);
      throw new Error('no jsInHtml');
    }

    return detail;
  }).catch((e) => {
    logger.log('then error', e);
    return undefined;
  });
}

module.exports = getDetailFromHtml;
