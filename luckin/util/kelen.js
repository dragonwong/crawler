const CONFIG = require('../config');
const crypto = require('../../util/crypto');

const kelen = {
  // 准备
  prepare(data) {
    const l = `${CONFIG.api.code}${CONFIG.api.version}`;
    const { key } = CONFIG.api;
    const q = this.encrypt(data);
    const g = [`cid=${l}`, `q=${q}`];
    const f = CONFIG.uid;
    g.push(`uid=${f}`);

    return {
      cid: l,
      q,
      sign: crypto.md5(g.sort().join(';') + key),
      uid: f,
    };
  },
  // 加密
  encrypt(data) {
    return crypto.aes.en(JSON.stringify(data), CONFIG.api.key, CONFIG.api.replaceSpecial);
  },
  // 解密
  decrypt(data) {
    return crypto.aes.de(data, CONFIG.api.key, CONFIG.api.replaceSpecial);
  },
};

module.exports = kelen;
