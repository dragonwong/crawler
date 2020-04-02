const e = require('./cryptojs.js').Crypto;

const r = {
  keySize: 128,
  encoding: 'utf8',
  algorithm: 'aes-128-ecb',
  iv: '',
  cipherEncoding: 'base64',
};
function t(e) {
  for (var r, t, n = [], a = 0; a < e.length; a++) {
    r = e.charCodeAt(a), t = [];
    do {
      t.push(255 & r), r >>= 8;
    } while (r);
    n = n.concat(t.reverse());
  }
  return n;
}
const n = function (e) {
  for (var n = t(e), a = new Array(), o = r.keySize / 8, s = 0; s < o; s++) n.length > s ? a.push(n[s]) : a.push(0);
  return a;
};
const a = function (e, r) {
  return (255 & e[r]) << 24 | (255 & e[r + 1]) << 16 | (255 & e[r + 2]) << 8 | 255 & e[r + 3];
};
const o = {
  en(r, t, a) {
    const o = new e.mode.ECB(e.pad.pkcs7);
    const s = e.charenc.UTF8.stringToBytes(r);
    let c = (e.charenc.UTF8.stringToBytes(t),
    e.AES.encrypt(s, n(t), {
      iv: '',
      mode: o,
      asBpytes: !0,
    }));
    return a && (c = c.replace(/\+/g, '-').replace(/\//g, '_')), c;
  },
  de(r, t, a) {
    a && (r = r.replace(/-/g, '+').replace(/_/g, '/'));
    const o = new e.mode.ECB(e.pad.pkcs7);
    const s = e.util.base64ToBytes(r);
    e.charenc.UTF8.stringToBytes(t);
    return e.AES.decrypt(s, n(t), {
      asBpytes: !0,
      mode: o,
      iv: '',
    });
  },
};

module.exports = {
  aes: o,
  md5(r) {
    const t = e.MD5(r, {
      asBytes: !0,
    });
    if (t.length !== 16) throw new Error('MD5加密结果字节数组错误');
    const n = Math.abs(a(t, 0));
    const o = Math.abs(a(t, 4));
    const s = Math.abs(a(t, 8));
    const c = Math.abs(a(t, 12));
    return n.toString() + o.toString() + s.toString() + c.toString();
  },
};
