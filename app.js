
'use strict';

const aisinoInvoiceApi = require('./lib/aisinoInvoiceApi');

module.exports = app => {
  if (app.config.aisinoInvoiceApi.app) aisinoInvoiceApi(app);
};

