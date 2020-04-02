/* eslint-disable no-await-in-loop */
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const curl = require('../../util/curl');
const sleep = require('../../util/sleep');
const Logger = require('../../util/Logger');

const FILE_PATH = path.resolve(__dirname, 'CMD_CURL');
const CMD_CURL = fs.readFileSync(FILE_PATH, 'utf8');

const logger = new Logger('TMSM_WEB');

async function getList({
  index = 0,
}) {
  if (!CMD_CURL.includes('&s=')) {
    throw new Error('CMD_CURL not includes &s=');
  }

  const cmd = CMD_CURL.replace(/(?<=&s=)\d+/, index);

  const html = await curl({
    cmd,
  });
  const $ = cheerio.load(html);
  const list = $('#J_ProductList > .product').map((i, el) => {
    const $el = $(el);

    const $anchor = $el.find('.product-title > a');

    return $anchor.text().replace(/\n/g, '').trim();
  }).get();
  return list;
}

async function main() {
  for (let i = 0; i < 10; i += 1) {
    const list = await getList({
      index: i * 40,
    });
    logger.log(i + 1, list.length, list[0]);
    await sleep(10000);
  }
}

main();
