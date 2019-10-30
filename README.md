# egg-aisino-invoice-api

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-aisino-invoice-api.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-aisino-invoice-api
[travis-image]: https://img.shields.io/travis/eggjs/egg-aisino-invoice-api.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-aisino-invoice-api
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-aisino-invoice-api.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-aisino-invoice-api?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-aisino-invoice-api.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-aisino-invoice-api
[snyk-image]: https://snyk.io/test/npm/egg-aisino-invoice-api/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-aisino-invoice-api
[download-image]: https://img.shields.io/npm/dm/egg-aisino-invoice-api.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-aisino-invoice-api

<!--
Description here.
-->

## Install

```bash
$ npm i egg-aisino-invoice-api --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.aisinoInvoiceApi = {
  enable: true,
  package: 'egg-aisino-invoice-api',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.aisinoInvoiceApi = {
  client: {  // client必须要
      'DSPTBM': '电商平台编码',
      'NSRSBH': '纳税人识别码',
      'NSRMC' : '纳税人名称',
      'XHFMC' : '销货方名称',
      'XHF_DZ': '销货方地址',
      'XHF_DH': '销货方电话',
      'XHF_YHZH': '销货方银行账号',
      'KPY': '开票员',
      'SKY': '可选',
      'HSBZ': '1',
      'TERMINALCODE': '0',
      'APPID': 'ZZS_PT_DZFP',
      'TAXPAYWERID': '税号',
      'AUTHORIZATIONCODE': '认证码',
      'ENCRYPTCODE':'加密码',
      'INTERFACE_FPKJ': 'ECXML.FPKJ.BC.E_INV',
      'INTERFACE_FPXZ': 'ECXML.FPXZ.CX.E_INV',
      'INTERFACE_FPYX': 'ECXML.EMAILPHONEFPTS.TS.E.INV',
      'REQUESTCODE': '请求码',
      'RESPONSECODE': '响应码',
      'PASSWORD': '密码',
      'DATAEXCHANGEID': '交互码',
      'KJFP': 'ECXML.FPKJ.BC.E_INV',
      'DOWNLOAD': 'ECXML.FPXZ.CX.E_INV',
      'EMAIL': 'ECXML.EMAILPHONEFPTS.TS.E.INV',
      'REGISTERCODE': '注册码',
    },
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
