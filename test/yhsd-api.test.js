'use strict';

const mock = require('egg-mock');

describe('test/yhsd-api.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/yhsd-api-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, aisinoInvoiceApi')
      .expect(200);
  });
});
