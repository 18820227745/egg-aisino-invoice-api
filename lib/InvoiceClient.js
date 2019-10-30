const _ = require('lodash');
const InvoiceCore = require('./InvoiceCore');
const soapRequest = require('easy-soap-request');

class InvoiceClient {
  static KJFP = 'ECXML.FPKJ.BC.E_INV';
  static DOWNLOAD = 'ECXML.FPXZ.CX.E_INV';
  static EMAIL = 'ECXML.EMAILPHONEFPTS.TS.E.INV';
  static HOST = 'http://fw1test.shdzfp.com:7500/axis2/services/SajtIssueInvoiceService?wsdl';

  constructor(config) {
    this.config = config;
    this.invoiceCore = new InvoiceCore(config);
  }

  static instance(...args) {
    return new InvoiceClient(...args);
  }

  async create(params) {
    const { invoiceCore } = this;
    let data = Array();

    if (params.invoice_type == 2) {
      data.ghfmc = params.invoice_title;
      data.ghfqylx = '01';
    } else {
      data.ghfmc = '个人';
      data.ghfqylx = '03';
    }

    let items = Array();
    for (let key in params.items) {
      let item = params.items[key];
      let show_name = item.name;
      items[key].XMMC = show_name;
      items[key].XMSL = _.floor(item.quantity, 8);
      items[key].XMDJ = _.floor(item.price, 2);
      items[key].SPBM = item.spbm;
      items[key].ZXBM = item.zxbm;
      items[key].XMJE = _.floor(item.price * item.quantity, 2);

      if (params.discount && params.discount != 0 && key == 0) {
        items[key].FPHXZ = 2;
        items[key].discount = {
          XMMC: show_name,
          XMSL: '-' + _.floor(1, 8),
          FPHXZ: '1',
          XMDJ: _.floor(params.discount, 8),
          SPBM: item.spbm,
          ZXBM: item.id,
          XMJE: '-' + _.floor(params.discount, 2),
        };
      } else {
        items[key].FPHXZ = 0;
      }

      if (key == 0) {
        data.kpxm = show_name;
      }
    }

    data.items = items;
    data.mobile = undefined !== params.mobile ? params.mobile : '';
    data.kplx = '1';
    data.czdm = '10';
    data.kphjje = _.floor(params.sum, 2);
    data.hjbhsje = _.floor(params.sum, 2);
    data.hjse = '';
    data.ddh = params.trade_no;
    let content = invoiceCore.getContent(data);
    let xml = invoiceCore.getXml(InvoiceClient.KJFP, content);

    return await this.wsRequest(xml);
  }

  

  download(params) {
    const {
      invoiceCore,
    } = this;
    data.lsh = _.padStart(params.trade_no, 20, '0');
    data.pdf_xzfs = 1;
    data.ddh = params.trade_no;
    let content = invoiceCore.getDownload(data);
    let xml = invoiceCore.getXml(InvoiceClient.DOWNLOAD, content);

    const result = await this.wsRequest(xml);
    if (result.returnStateInfo.returnCode[0] == '0000') { // PDF_XZFS 1 是pdf内容 必然要解压
      if (result.Data.dataDescription.zipCode[0] == 1) {
        const record = util.unzip(util.base64Decode(
          result.Data.content[0]));
        let pdf = util.parseXML(record, {
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
    data.lsh = _.padStart(params.trade_no, 20, '0');
    data.eamil = params.email;
    data.fp_dm = params.fp_dm;
    data.fp_hm = params.fp_hm;
    let content = invoiceCore.getEmail(data);
    let xml = invoiceCore.getXml(InvoiceClient.EMAIL, content);
    const result = await this.wsRequest(xml);

    if (result.returnStateInfo.returnCode[0] == '0000') { //修改状态
      return result;
    } else {
      throw new Error(`\n INVOICE INFO ERROR EMAIL \t ${ result.returnStateInfo.returnCode[0] } \t`);
    }
  }

  async wsRequest(xml) {
    const headers = {
      'Content-Type': 'text/xml;charset=UTF-8',
      'soapAction': `${HOST}#eiInterface`,
    };
    const { response: { body } } = await soapRequest({ url: InvoiceClient.HOST, headers, xml, timeout: 1000 });
    return util.parseXML(body, {
      ignoreAttrs: true,
      explicitArray: false,
    });
  }

};

module.exports = InvoiceClient;