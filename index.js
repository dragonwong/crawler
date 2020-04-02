const getList = require('./ali/api/getList');

getList('进口零食').then(list => console.log(list.length));
