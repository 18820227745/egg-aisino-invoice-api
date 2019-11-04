'use strict';

const InvoiceClient = require('../lib/InvoiceClient');

describe.only('test/InvoiceClient.test.js', () => {
  let invoiceClient;
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
    'KJFP': 'ECXML.FPKJ.BC.E_INV',
    'DOWNLOAD': 'ECXML.FPXZ.CX.E_INV',
    'EMAIL': 'ECXML.EMAILPHONEFPTS.TS.E.INV',
    'REGISTERCODE': '注册码', // ？ 注册码
  };
  before(() => {
    invoiceClient = new InvoiceClient(config);
  });

  it('create', async () => {
    const params = {
      invoice_title: '亿众骏达网络科技（深圳）有限公司',
      discount: 10, // 折扣
      mobile: '0755-830512',
      sum: 1000,
      trade_no: 'aaaaaaa',
      kpxm: '台', // 单位
      kplx: '1',  // 发票类型 1：正票，2：红票
      czdm: '10',
      created_at: '2019-10-21 21:55:22',
      items: [
        {
          id: 1,
          name: '洗衣机',
          quantity: 1,
          price: 1000,
          spbm: '1010101030000000000', // 商品编码 ? 商品税收分类编码，由企业提供，技术人员需向企业财务核实，不足19位后面补‘0’，需与企业实际销售商品相匹配，也可关注“上海爱信诺”微信公众号的升级通知
          zxbm: '00001', // 自行编码

        },
      ],
    };
    const result = await invoiceClient.create(params);
    console.log(result);
  });

  it('download', async () => {
    const params = {
      trade_no: 'aaaaaaa',
    };
    const result = await invoiceClient.download(params);
    console.log(result);
  });

  it.only('email', async () => {
    const params = {
      email: 'xulong@yeezon.com',
      fp_dm: '031001600211',
      fp_hm: '21427227',
      trade_no: 'aaaaaaa',
    };
    const result = await invoiceClient.email(params);
    console.log(result);
  });
});
