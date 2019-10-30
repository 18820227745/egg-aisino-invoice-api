const _ = require('lodash');
const { Api, Auth, WebHook  } = require('yhsd-api');

class AisinoInvoice {
  constructor(option) {
    this.option = option;
    this._api = null;
    this._token = null;
    this._webhook_token = null;
    this._auth = new Auth(option);
  }

  async api() {
    if (!this._api) {
      if (!this._token) {
        if (this.option.getTokenCache) {
          this._token = await this.option.getTokenCache();
          this._api = new Api(this._token);
          return this._api;
        } else {
          return this._auth.getToken().then(token => {
            this._token = token;
            this.option.saveTokenCache && this.option.saveTokenCache(token);
            this._api = new Api(token);
            return this._api;
          });
        }
        
      }
      this._api = new Api(this._token);

    }

    return this._api;
  }

  async webhook() {
    if (!this._webhook_token) {
      return this._api.get('/shop').then(data => this._webhook_token = data.shop.webhook_token);
    }
    this._webhook = new WebHook(this._webhook_token);
    return this._webhook_token;
  }

  async register(option = this.option) {
    if (!option || !option.topics) {
      throw new Error('must has `yhsd.topics` arguments.');
    }

    let hooks = [];
    let page = 1;
    const limit = 50;

    // 加载 webhooks
    while (true) {
      const { webhooks } = await this._api.get('/webhooks', { limit, page });
      hooks = hooks.concat(webhooks);
      if (webhooks.length < limit) break;
      page += 1;
    }

    // 创建 webhook
    const create = async (topic, address, force = false) => {
      const existed = _.find(hooks, { topic, address });
      console.log(`yhsd webhook[${topic}]`, address, 'existed', !!existed);
      if (force || !existed) {
        return this._api.post('/webhooks', {
          webhook: {
            topic,
            address,
            content_type: 'text/plain',
          },
        });
      }
    };

    // 比对,创建新的hook
    const topics = option.topics;
    for (const [ topic, address ] of Object.entries(topics)) {
      // 兼容强制创建的情况
      if (_.isObject(address)) {
        const val = address;
        await create(topic, val.address, val.force);
      }

      await create(topic, address, false);
    }
  }
}

module.exports = AisinoInvoice;