'use strict';
const InvoiceClient = require('./InvoiceClient');
const assert = require('assert');

module.exports = app => {
  app.addSingleton('aisinoInvoiceApi', createClient);
};

let api
async function createClient(config, app) {
  // assert(config.appKey && config.appSecret);
  // 创建实例
  api = api || new InvoiceClient(config);
  
  return api;
}
