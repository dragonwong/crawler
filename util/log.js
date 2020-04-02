function log(...arg) {
  console.log(...arg);
}
log.split = () => {
  log('---');
};

module.exports = log;
