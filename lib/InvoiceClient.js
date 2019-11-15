const _ = require('lodash');
const InvoiceCore = require('./InvoiceCore');
const soapRequest = require('easy-soap-request');
const util = require('./util');

const KJFP = 'ECXML.FPKJ.BC.E_INV';
const DOWNLOAD = 'ECXML.FPXZ.CX.E_INV';
const EMAIL = 'ECXML.EMAILPHONEFPTS.TS.E.INV';


class InvoiceClient {

  constructor(config) {
    this.config = config;
    this.invoiceCore = new InvoiceCore(config);
  }

  static instance(...args) {
    return new InvoiceClient(...args);
  }

  async create(params) {
    const { invoiceCore, config } = this;
    let data = Array();

    if (params.invoice_type == 2) {
      data.ghfmc = params.invoice_title;
      data.ghfqylx = '01';
    } else {
      data.ghfmc = '个人';
      data.ghfqylx = '03';
    }

    data.dddate = params.created_at;
    data.trade_no = params.trade_no;
    
    let items = Array();
    for (let key in params.items) {
      let item = params.items[key];
      let show_name = item.name;
      let itemTmp = {
        XMMC: show_name,
        XMSL: _.floor(item.quantity, 8),
        XMDJ: _.floor(item.price, 2),
        SPBM: item.spbm,
        ZXBM: item.zxbm,
        XMJE: _.floor(item.price * item.quantity, 2),
        HSBZ: config.HSBZ,
        SL: config.TAXRATE,
      };

      if (params.discount && params.discount != 0 && key == 0) {
        itemTmp.FPHXZ = 2; // 
        itemTmp.discount = { // ？
          XMMC: show_name,
          XMSL: '-' + _.floor(1, 8), // 折扣行负数
          FPHXZ: '1',
          XMDJ: _.floor(params.discount, 8),
          SPBM: item.spbm,
          ZXBM: item.id,
          XMJE: '-' + _.floor(params.discount, 2),
          HSBZ: config.HSBZ,
          SL: config.TAXRATE,
        };
      } else {
        itemTmp.FPHXZ = 0;
      }
      items[key] = itemTmp;

      if (key == 0) {
        data.kpxm = show_name;
      }
    }

    data.items = items;
    data.mobile = undefined !== params.mobile ? params.mobile : '';
    data.kplx = params.kplx; // 发票类型 1：正票，2：红票
    data.czdm = params.czdm; // 操作代码 10：正票正常开具，20：退货折让红票
    data.kphjje = _.floor(params.sum, 2); // 价税合计金额
    data.hjbhsje = _.floor(params.sum, 2); // 合计不含税金额。所有商品行不含税金额之和。
    data.hjse = _.floor(0 , 2);; // TODO 合计税额。所有商品行税额之和。平台处理价税分离，此值传0
    data.ddh = params.trade_no;
    data.ghf_sj = params.mobile;
    let content = invoiceCore.getContent(data);
    let xml = invoiceCore.getXml(KJFP, content);
    // return await this.wsRequest(xml);
  }

  async download(params) {
    const {
      invoiceCore,
    } = this;
    const data = {};
    data.lsh = _.padStart(params.trade_no, 20, '0');
    data.pdf_xzfs = 3;
    data.ddh = params.trade_no;
    let content = invoiceCore.getDownload(data);
    let xml = invoiceCore.getXml(DOWNLOAD, content);
    const { interface: result } = await this.wsRequest(xml);
    if (result.returnStateInfo.returnCode == '0000') { // PDF_XZFS 1 是pdf内容 必然要解压
      if (result.Data.dataDescription.zipCode == 1) {
        const str = Buffer.from(result.Data.content, 'base64'); // util.base64Decode(result.Data.content);
        const record = await util.unzip(str);
        
        let pdf = await util.parseXML(record, {
          ignoreAttrs: true,
          explicitArray: false,
        });
        return pdf;
      }
    } else { // 状态有误
      throw new Error(`\n INVOICE INFO ERROR DOWNLOAD  \t ${result.returnStateInfo.returnCode[0]} \t`)
    }
  }

  async email(params) {
    const { invoiceCore } = this;
    const data = {};
    data.lsh = _.padStart(params.trade_no, 20, '0');
    data.trade_no = params.trade_no;
    data.email = params.email;
    data.fp_dm = params.fp_dm;
    data.fp_hm = params.fp_hm;
    data.mobile = params.mobile;
    let content = invoiceCore.getEmail(data);
    let xml = invoiceCore.getXml(EMAIL, content);
    const { interface: result } = await this.wsRequest(xml);
    if (result.returnStateInfo.returnCode == '0000') { //修改状态
      return result;
    } else {
      throw new Error(`\n INVOICE INFO ERROR EMAIL \t ${result.returnStateInfo.returnCode} \t`);
    }
  }

  async wsRequest(xml) {
    const { config: { HOST } } = this;
    const headers = {
      'Content-Type': 'text/xml;charset=UTF-8',
      'soapAction': `${HOST}#eiInterface`,
    };
    const { response: { body } } = await soapRequest({ url: HOST, headers, xml, timeout: 1000 });
    return util.parseXML(body, {
      ignoreAttrs: true,
      explicitArray: false,
    });
  }

  async parseNotificationResult(xmlbody) {
    const { config } = this;

    const body = await util.parseXML(xmlbody, {
      ignoreAttrs: true,
      explicitArray: false,
    });

    const form = { 
      mode: 'TDES',
      key: config.KEY3DES,
      decompress: '1',
      cipher: body.interface.Data.content,
    };
    let result = await util.decryptRequest(form);
    result = JSON.parse(result)
    const resultJson = await util.parseXML(result.data, {
      ignoreAttrs: true,
      explicitArray: false,
    });
    return resultJson;
  }
};

module.exports = InvoiceClient;