
'use strict';

const api = require('./lib/api');

module.exports = app => {
  if (app.config.aisinoInvoiceApi.app) api(app);
};

