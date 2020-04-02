const fs = require('fs');

function replaceComma(str) {
  if (typeof str === 'string') {
    return str.replace(/,/g, '，');
  }
  return str;
}

const CSVKit = {
  save({
    title,
    filePath,
    data = [],
  }) {
    let content = [];

    // title
    content.push(title.join(', '));

    content = content.concat(data.map(rowData => rowData.map(replaceComma).join(', ')));

    fs.writeFileSync(filePath, `${content.join('\n')}\n`);
  },
  add({
    filePath,
    data = [],
  }) {
    let originData = data;
    if (!Array.isArray(data[0])) {
      // 一维数组，是单行！
      originData = [data];
    }
    const content = `${originData.map(singleLine => singleLine.map(replaceComma).join(', ')).join('\n')}\n`;

    fs.appendFileSync(filePath, content, 'utf8');
  },
};

module.exports = CSVKit;
