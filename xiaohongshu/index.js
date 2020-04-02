// 小红书
/* eslint-disable prefer-destructuring */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
const ajax = require('../util/ajax');
const log = require('../util/log');
const saveAsCSV = require('../util/saveAsCSV');

const AUTHORIZATION = 'e5359a35-d2e4-4e59-bb1d-3868e58e551f';
const SID = 'session.1553773974180576667339';

const SIZE = 100; // 必须是20的倍数，且不支持在url直接修改per_page，=.=坑
const PAGE = new Array(SIZE / 20).fill(1);
const startTime = +new Date('2019-07-15 00:00:00');
const endTime = +new Date('2019-07-21 00:00:00');
// const KEY = ['冰淇淋', '雪糕', '啤酒', '酸奶', '小龙虾', '汽水', '便利蜂', '罗森', '全家', '711', '便利店网红'];
const KEY = ['饮料', '汽水', '酸奶', '果汁', '薯片', '饼干', '巧克力', '711', '全家', '罗森', '网红零食', '碳酸', '糖果'];
const KEY_ENCODE = KEY.map(i => encodeURIComponent(i));
const title = ['商品标题', '点赞量', '链接', '详细描述'];

function timeInRange(time) {
  const date = time * 1000;
  return date >= startTime && date <= endTime;
}

async function getDetail(noteList) {
  const result = {};
  let i = 0; let
    noteDetail = {};
  while (i < noteList.length) {
    noteDetail = await ajax.get({
      url: `https://www.xiaohongshu.com/wx_mp_api/sns/v1/note/${noteList[i].id}/single_feed?sid=${SID}`,
      headers: {
        authorization: AUTHORIZATION,
      },
    });
    if (noteDetail.data && noteDetail.data.length > 0 && noteDetail.success) {
      const { note_list: noteListFirst } = noteDetail.data[0] || {};
      const note = noteListFirst[0] || {};
      if (timeInRange(note.time)) {
        result[note.id] = { time: note.time, desc: note.desc.replace(/\n/g, '  ') };
      }
    }
    i += 1;
  }
  return result;
}

async function main() {
  let PROMISE = [];
  for (let i = 0; i < KEY.length; i += 1) {
    let result = [];
    let allList = [];
    log(`正在获取${KEY[i]}...`);
    PROMISE = PAGE.map((item, index) => ajax.get({
      url: `https://www.xiaohongshu.com/wx_mp_api/sns/v1/search/notes?sid=${SID}&keyword=${KEY_ENCODE[i]}&sort=time_descending&page=${index + 1}&per_page=20`,
      headers: {
        authorization: AUTHORIZATION,
      },
    }));
    try {
      allList = await Promise.all(PROMISE);
    } catch (err) {
      log(`err: ${err}`);
    }
    log(`${KEY[i]}获取成功`);
    log.split();
    for (let j = 0; j < allList.length; j += 1) {
      const item = allList[j];
      if (item.data && item.success) {
        const { notes = [] } = item.data || {};
        const detail = await getDetail(notes);
        const inTimeResult = notes.filter(note => detail[note.id]);
        const resultItem = inTimeResult.map(note => [note.title, note.likes, `https://www.xiaohongshu.com/discovery/item/${note.id}`, detail[note.id].desc]);
        result = result.concat(resultItem);
      } else {
        log(`获取${KEY[j]}失败, --- msg: ${item.msg}`);
      }
    }
    result.sort((a, b) => b[1] - a[1]);
    saveAsCSV({
      title,
      data: result,
      fileName: KEY[i],
    });
  }
  log('获取所有列表成功!');
}

main();
