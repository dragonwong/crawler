const getList = require('./ali/api/getList');

async function main() {
  const list = await getList({
    listName: '进口零食',
    index: 60,
  });
  console.log(list.length);
  console.log(list[0]);
}

main();
