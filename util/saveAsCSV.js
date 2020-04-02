const fs = require('fs');
const path = require('path');

function saveAsCSV({
  title,
  data,
  filePath = __dirname,
  fileName = '',
}) {
  const pathOfFile = path.resolve(filePath, `${fileName}_${+new Date()}.csv`);

  let content = [];

  // title
  content.push(title.join(', '));

  content = content.concat(data.map(rowData => rowData.map((str) => {
    if (typeof str === 'string') {
      return str.replace(/,/g, '，');
    }
    return str;
  }).join(', ')));

  fs.writeFileSync(pathOfFile, content.join('\n'));
}

module.exports = saveAsCSV;
