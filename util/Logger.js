/* eslint-disable prefer-spread */
const formatDate = require('./formatDate');

class Logger {
  constructor(name) {
    this.name = name;
    this.log = this.log.bind(this);
  }

  static s3() {
    console.log('- - - - - - - - - - - - - - - - - - -');
  }

  log(...params) {
    console.log.apply(console, [`${formatDate()} [${this.name}]`].concat(params));
  }
}

module.exports = Logger;
