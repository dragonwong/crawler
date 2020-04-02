function encrypt(e) {
  function t(e, t) {
    return e << t | e >>> 32 - t;
  }

  function n(e, t) {
    let n; let o; let i; let r; let
      s;
    return i = 2147483648 & e,
    r = 2147483648 & t,
    n = 1073741824 & e,
    o = 1073741824 & t,
    s = (1073741823 & e) + (1073741823 & t),
    n & o ? 2147483648 ^ s ^ i ^ r : n | o ? 1073741824 & s ? 3221225472 ^ s ^ i ^ r : 1073741824 ^ s ^ i ^ r : s ^ i ^ r;
  }

  function o(e, t, n) {
    return e & t | ~e & n;
  }

  function i(e, t, n) {
    return e & n | t & ~n;
  }

  function r(e, t, n) {
    return e ^ t ^ n;
  }

  function s(e, t, n) {
    return t ^ (e | ~n);
  }

  function a(e, i, r, s, a, p, u) {
    return e = n(e, n(n(o(i, r, s), a), u)),
    n(t(e, p), i);
  }

  function p(e, o, r, s, a, p, u) {
    return e = n(e, n(n(i(o, r, s), a), u)),
    n(t(e, p), o);
  }

  function u(e, o, i, s, a, p, u) {
    return e = n(e, n(n(r(o, i, s), a), u)),
    n(t(e, p), o);
  }

  function c(e, o, i, r, a, p, u) {
    return e = n(e, n(n(s(o, i, r), a), u)),
    n(t(e, p), o);
  }

  function d(e) {
    for (var t, n = e.length, o = n + 8, i = (o - o % 64) / 64, r = 16 * (i + 1), s = new Array(r - 1), a = 0, p = 0; n > p;) {
      t = (p - p % 4) / 4,
      a = p % 4 * 8,
      s[t] = s[t] | e.charCodeAt(p) << a,
      p++;
    }
    return t = (p - p % 4) / 4,
    a = p % 4 * 8,
    s[t] = s[t] | 128 << a,
    s[r - 2] = n << 3,
    s[r - 1] = n >>> 29,
    s;
  }

  function l(e) {
    let t; let n; let o = '';
    let i = '';
    for (n = 0; n <= 3; n++) {
      t = e >>> 8 * n & 255,
      i = `0${t.toString(16)}`,
      o += i.substr(i.length - 2, 2);
    }
    return o;
  }

  function f(e) {
    e = e.replace(/\r\n/g, '\n');
    for (var t = '', n = 0; n < e.length; n++) {
      const o = e.charCodeAt(n);
      o < 128 ? t += String.fromCharCode(o) : o > 127 && o < 2048 ? (t += String.fromCharCode(o >> 6 | 192),
      t += String.fromCharCode(63 & o | 128)) : (t += String.fromCharCode(o >> 12 | 224),
      t += String.fromCharCode(o >> 6 & 63 | 128),
      t += String.fromCharCode(63 & o | 128));
    }
    return t;
  }
  let m; let h; let g; let v; let _; let y; let R; let w; let E; let S = [];
  const O = 7;
  const b = 12;
  const T = 17;
  const q = 22;
  const A = 5;
  const x = 9;
  const C = 14;
  const N = 20;
  const J = 4;
  const k = 11;
  const L = 16;
  const D = 23;
  const I = 6;
  const P = 10;
  const F = 15;
  const j = 21;
  for (e = f(e),
  S = d(e),
  y = 1732584193,
  R = 4023233417,
  w = 2562383102,
  E = 271733878,
  m = 0; m < S.length; m += 16) {
    h = y,
    g = R,
    v = w,
    _ = E,
    y = a(y, R, w, E, S[m + 0], O, 3614090360),
    E = a(E, y, R, w, S[m + 1], b, 3905402710),
    w = a(w, E, y, R, S[m + 2], T, 606105819),
    R = a(R, w, E, y, S[m + 3], q, 3250441966),
    y = a(y, R, w, E, S[m + 4], O, 4118548399),
    E = a(E, y, R, w, S[m + 5], b, 1200080426),
    w = a(w, E, y, R, S[m + 6], T, 2821735955),
    R = a(R, w, E, y, S[m + 7], q, 4249261313),
    y = a(y, R, w, E, S[m + 8], O, 1770035416),
    E = a(E, y, R, w, S[m + 9], b, 2336552879),
    w = a(w, E, y, R, S[m + 10], T, 4294925233),
    R = a(R, w, E, y, S[m + 11], q, 2304563134),
    y = a(y, R, w, E, S[m + 12], O, 1804603682),
    E = a(E, y, R, w, S[m + 13], b, 4254626195),
    w = a(w, E, y, R, S[m + 14], T, 2792965006),
    R = a(R, w, E, y, S[m + 15], q, 1236535329),
    y = p(y, R, w, E, S[m + 1], A, 4129170786),
    E = p(E, y, R, w, S[m + 6], x, 3225465664),
    w = p(w, E, y, R, S[m + 11], C, 643717713),
    R = p(R, w, E, y, S[m + 0], N, 3921069994),
    y = p(y, R, w, E, S[m + 5], A, 3593408605),
    E = p(E, y, R, w, S[m + 10], x, 38016083),
    w = p(w, E, y, R, S[m + 15], C, 3634488961),
    R = p(R, w, E, y, S[m + 4], N, 3889429448),
    y = p(y, R, w, E, S[m + 9], A, 568446438),
    E = p(E, y, R, w, S[m + 14], x, 3275163606),
    w = p(w, E, y, R, S[m + 3], C, 4107603335),
    R = p(R, w, E, y, S[m + 8], N, 1163531501),
    y = p(y, R, w, E, S[m + 13], A, 2850285829),
    E = p(E, y, R, w, S[m + 2], x, 4243563512),
    w = p(w, E, y, R, S[m + 7], C, 1735328473),
    R = p(R, w, E, y, S[m + 12], N, 2368359562),
    y = u(y, R, w, E, S[m + 5], J, 4294588738),
    E = u(E, y, R, w, S[m + 8], k, 2272392833),
    w = u(w, E, y, R, S[m + 11], L, 1839030562),
    R = u(R, w, E, y, S[m + 14], D, 4259657740),
    y = u(y, R, w, E, S[m + 1], J, 2763975236),
    E = u(E, y, R, w, S[m + 4], k, 1272893353),
    w = u(w, E, y, R, S[m + 7], L, 4139469664),
    R = u(R, w, E, y, S[m + 10], D, 3200236656),
    y = u(y, R, w, E, S[m + 13], J, 681279174),
    E = u(E, y, R, w, S[m + 0], k, 3936430074),
    w = u(w, E, y, R, S[m + 3], L, 3572445317),
    R = u(R, w, E, y, S[m + 6], D, 76029189),
    y = u(y, R, w, E, S[m + 9], J, 3654602809),
    E = u(E, y, R, w, S[m + 12], k, 3873151461),
    w = u(w, E, y, R, S[m + 15], L, 530742520),
    R = u(R, w, E, y, S[m + 2], D, 3299628645),
    y = c(y, R, w, E, S[m + 0], I, 4096336452),
    E = c(E, y, R, w, S[m + 7], P, 1126891415),
    w = c(w, E, y, R, S[m + 14], F, 2878612391),
    R = c(R, w, E, y, S[m + 5], j, 4237533241),
    y = c(y, R, w, E, S[m + 12], I, 1700485571),
    E = c(E, y, R, w, S[m + 3], P, 2399980690),
    w = c(w, E, y, R, S[m + 10], F, 4293915773),
    R = c(R, w, E, y, S[m + 1], j, 2240044497),
    y = c(y, R, w, E, S[m + 8], I, 1873313359),
    E = c(E, y, R, w, S[m + 15], P, 4264355552),
    w = c(w, E, y, R, S[m + 6], F, 2734768916),
    R = c(R, w, E, y, S[m + 13], j, 1309151649),
    y = c(y, R, w, E, S[m + 4], I, 4149444226),
    E = c(E, y, R, w, S[m + 11], P, 3174756917),
    w = c(w, E, y, R, S[m + 2], F, 718787259),
    R = c(R, w, E, y, S[m + 9], j, 3951481745),
    y = n(y, h),
    R = n(R, g),
    w = n(w, v),
    E = n(E, _);
  }
  const H = l(y) + l(R) + l(w) + l(E);
  return H.toLowerCase();
}

module.exports = encrypt;
