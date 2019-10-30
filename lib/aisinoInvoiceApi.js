'use strict';
const AisinoInvoice = require('./aisinoInvoice');
const assert = require('assert');

module.exports = app => {
  app.addSingleton('aisinoInvoiceApi', createClient);
};

let aisinoInvoice
async function createClient(config, app) {
  assert(config.appKey && config.appSecret);
  // 创建实例
  aisinoInvoice = aisinoInvoice || new AisinoInvoice(config);
  // 初始化 yhsd sdk
  // await yhsd.api();
  // await yhsd.webhook();
  // await yhsd.register();
  
  return AisinoInvoice;
}
