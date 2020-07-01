'use strict';
const assert = require('assert');
const InvoiceCore = require('../lib/InvoiceCore');

describe.only('test/InvoiceCore.test.js', () => {
  let invoiceCore;
  const config = {
    'DSPTBM': '111MFWIK', // 电商平台编码
    'NSRSBH': '310101000000090', // 纳税人识别码
    'NSRMC' : '亿众骏达网络科技（深圳）有限公司', // 纳税人名称
    'XHFMC' : '厦门京东东和贸易有限公司', // 销货方名称
    'XHF_DZ': '厦门市同安区集安路555-563好', // 销货方地址
    'XHF_DH': '66215500', // 销货方电话
    'XHF_YHZH': '402390001040044071', // 销货方银行账号
    'KPY': '付文晶', // 开票员
    'SKY': '王梅', // 收款员
    'FHR': '小星星', // 复核人
    'HSBZ': '1', // 含税标志
    'TERMINALCODE': '0', // 终端类型标识代码
    'APPID': 'ZZS_PT_DZFP',
    'TAXPAYWERID': '310101000000090', // ？税号
    'AUTHORIZATIONCODE': '3100000090', // ？ 认证码
    'ENCRYPTCODE':'1', // 加密码 	0:不加密（base64编码） 1: 3DES加密 2:CA
    'INTERFACE_FPKJ': 'ECXML.FPKJ.BC.E_INV',
    'INTERFACE_FPXZ': 'ECXML.FPXZ.CX.E_INV',
    'INTERFACE_FPYX': 'ECXML.EMAILPHONEFPTS.TS.E.INV',
    'REQUESTCODE': '1234567890', // ？请求码
    'RESPONSECODE': '121', // 响应码
    'PASSWORD': '', // 密码由平台提供，报文中passWord传空 密码
    'DATAEXCHANGEID': '', // 交互码
    'REGISTERCODE': '注册码', // ？ 注册码
    'HOST': 'http://fw1test.shdzfp.com:9000/sajt-shdzfp-sl-http/SvrServlet?wsdl',
    'KEY3DES': '9oyKs7cVo1yYzkuisP9bhA==',
    'TAXRATE': 0.13, // TODO 
  };
  before(() => {
    invoiceCore = new InvoiceCore(config);
  });

  it('des3Encrypt needGzip=false', async () => {
    const result = await invoiceCore.des3Encrypt('1');
    console.log(result);
    assert(result === '1Hxvfz5krGo=');
  });

  it('des3Encrypt needGzip=true', async () => {
    const result = await invoiceCore.des3Encrypt('1', undefined, true);
    console.log(result);
    assert(result === 'H4sIAAAAAAAAE7tSk19vl7ImCwCMQGK+CAAAAA=='); // 不一定与网站测试工具一致
  });

  it('des3Decrypt needUnGzip=false', async () => {
    const result = await invoiceCore.des3Decrypt('1Hxvfz5krGo=');
    console.log(result);
    assert(result === '1');
  });

  it('des3Decrypt needUnGzip=true', async () => {
    const result = await invoiceCore.des3Decrypt('H4sIAAAAAAAAALtSk19vl7ImCwCMQGK+CAAAAA==', undefined, true);
    console.log(result);
    assert(result === '1');
  });

  it('des3Encrypt specify key needGzip=true', async () => {
    const key = '123456789012345678901234';
    const encrypted = await invoiceCore.des3Encrypt('100', key, true);
    const result = await invoiceCore.des3Decrypt(encrypted, key, true);
    console.log(result);
    assert(result === '100');
  });

});
