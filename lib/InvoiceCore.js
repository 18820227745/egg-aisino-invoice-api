const _ = require('lodash');
const util = require('./util');
const moment = require('moment');

class InvoiceCore {

    constructor(config) {
        this.config = config;
        this.instance = null;
    }

    static instance(...args) {
        return new InvoiceCore(...args);
    }

    getXml(interfaceCode, content) {
        const {
            config
        } = this;
        const {
            TERMINALCODE: terminalcode,
            APPID: appid,
            DSPTBM: dsptbm,
            TAXPAYWERID: taxpayerid,
            AUTHORIZATIONCODE: authorizationcode,
            RESPONSECODE: response,
        } = config;
        const rand = util.randomIntStr(10);
        const pwd = `${rand}${util.base64(`${util.md5(`${rand}${config.REGISTERCODE}`)}`)}`;
        const password = pwd;
        const date = moment().format('YYYY-MM-DD HH:mm:ss');
        const dataexchangeid = `${response}${moment().format('YYYYMMDD')}${util.randomIntStr(9)}`;

        const str =
            `<?xml version="1.0" encoding="utf-8"?>
<interface xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.chinatax.gov.cn/tirip/dataspec/interfaces.xsd" version="DZFP1.0">  
  <globalInfo> 
    <terminalCode>${terminalcode}</terminalCode>  
    <appId>${appid}</appId>  
    <version>2.0</version>  
    <interfaceCode>${interfaceCode}</interfaceCode>  
    <requestCode>${dsptbm}</requestCode>  
    <requestTime>${date}</requestTime>  
    <responseCode>${response}</responseCode>  
    <dataExchangeId>${dataexchangeid}</dataExchangeId>  
    <userName>${dsptbm}</userName>  
    <passWord>${password}</passWord>  
    <taxpayerId>${taxpayerid}</taxpayerId>  
    <authorizationCode>${authorizationcode}</authorizationCode> 
  </globalInfo>  
  <returnStateInfo> 
    <returnCode/>  
    <returnMessage/> 
  </returnStateInfo>  
  <Data> 
    <dataDescription> 
      <zipCode>0</zipCode>  
      <encryptCode>0</encryptCode>  
      <codeType>0</codeType> 
    </dataDescription>  
    <content>${content}</content> 
  </Data> 
</interface>`;

        return str;
    }

    getContent(params) {
        const { config } = this;
        let fpkj = "";
        console.log(params);

        config.FPQQLSH = _.padEnd(config.DSPTBM + params.trade_no, 25, '0');;
        config.KPXM = params.kpxm;
        config.GHFMC = params.ghfmc;
        config.GHFQYLX = params.ghfqylx;
        config.KPLX = params.kplx;
        config.CZDM = params.czdm;
        config.KPHJJE = params.kphjje;
        config.HJBHSJE = params.hjbhsje;
        config.HJSE = params.hjse;
        config.GHF_SJ = params.ghf_sj;
        config.DDH = params.ddh;
        config.DDDATE = params.dddate;

        config.YFP_DM = params.yfp_dm;
        config.YFP_HM = params.yfp_hm;
        config.CHYY = params.chyy;
        
        let _tmp_0 = this.contentFpt(config);
        for (let key in _tmp_0) {
            let item = _tmp_0[key];
            fpkj += "<" + item.key.toUpperCase() + ">" + item.text + "</" + item.key + ">";
            // if (item.text !== "") {
            //     fpkj += "<" + item.key.toUpperCase() + ">" + item.text + "</" + item.key + ">";
            // } else {
            //     fpkj += "<" + item.key.toUpperCase() + ">" + params[item.key] + "</" + item.key + ">";
            // }
        }
        let xm_size = params.items.length;
        let fpkj_xm = "";
        let _tmp_3 = params.items;
        for (let num in _tmp_3) { //津贴被折扣行
            let value = _tmp_3[num];
            fpkj_xm += "<FPKJXX_XMXX>"; {
                let _tmp_1 = this.contentXm(value);

                for (let key in _tmp_1) {
                    let item = _tmp_1[key];

                    if (item.text !== "") {
                        fpkj_xm += "<" + item.key.toUpperCase() + ">" + item.text + "</" + item.key + ">";
                    } else {
                        fpkj_xm += "<" + item.key.toUpperCase() + ">" + value[item.key] + "</" + item.key + ">";
                    }
                }
            }
            fpkj_xm += "</FPKJXX_XMXX>";

            if (undefined !== value.discount) { //size对应
                xm_size++;
                fpkj_xm += "<FPKJXX_XMXX>"; 
                let _tmp_2 = this.contentXm(value.discount);
                for (let key in _tmp_2) {
                    let item = _tmp_2[key];

                    if (item.text !== "") {
                        fpkj_xm += "<" + item.key.toUpperCase() + ">" + item.text + "</" + item.key + ">";
                    } else {
                        fpkj_xm += "<" + item.key.toUpperCase() + ">" + value.discount[item.key] + "</" + item.key + ">";
                    }
                }
                fpkj_xm += "</FPKJXX_XMXX>";
            }
        }
        let fpkj_dd = "";
        let _tmp_4 = this.contentDd(this.config);

        for (let key in _tmp_4) {
            let item = _tmp_4[key];

            if (item.text !== "") {
                fpkj_dd += "<" + item.key.toUpperCase() + ">" + item.text + "</" + item.key + ">";
            } else {
                if (item.text === undefined) {
                    fpkj_dd += "<" + item.key.toUpperCase() + "/>";
                    continue;
                }

                fpkj_dd += "<" + item.key.toUpperCase() + ">" + params[item.key] + "</" + item.key + ">";
            }
        }
        let root = 
        `<REQUEST_FPKJXX class="REQUEST_FPKJXX">\n    <FPKJXX_FPTXX class="FPKJXX_FPTXX">\n       ${fpkj}\n    </FPKJXX_FPTXX>\n    <FPKJXX_XMXXS class="FPKJXX_XMXX;" size="${xm_size}">\n    ${fpkj_xm}\n    </FPKJXX_XMXXS>\n    <FPKJXX_DDXX class="FPKJXX_DDXX">\n    ${fpkj_dd}\n    </FPKJXX_DDXX>\n</REQUEST_FPKJXX>\n`;
        console.log(root);
        return util.base64(root);
    };

    getDownload(params) {
        const { config } = this;
        config.DDH = params.ddh;
        config.PDF_XZFS = params.pdf_xzfs;
        config.FPQQLSH = _.padEnd(config.DSPTBM + params.ddh, 25, '0');;
        let content = "";
        {
            let _tmp_0 = this.download(config);
    
            for (let key in _tmp_0) {
                let item = _tmp_0[key];
    
                if (item.text !== "") {
                    content += "<" + item.key.toUpperCase() + ">" + item.text + "</" + item.key + ">";
                } else {
                    if (item.text === undefined) {
                        content += "<" + item.key.toUpperCase() + "/>";
                        continue;
                    }
    
                    content += "<" + item.key.toUpperCase() + ">" + params[item.key] + "</" + item.key + ">";
                }
            }
        }
        let root = `<REQUEST_FPXXXZ_NEW class="REQUEST_FPXXXZ_NEW">\n    ${content}\n</REQUEST_FPXXXZ_NEW>\n`;
        console.log(root);
        return util.base64(root);
    };
    
    download(config) {
        return {
            DDH: {
                key: "DDH",
                text: config.DDH
            },
            FPQQLSH: {
                key: "FPQQLSH",
                text: config.FPQQLSH
            },
            DSPTBM: {
                key: "DSPTBM",
                text: config.DSPTBM
            },
            NSRSBH: {
                key: "NSRSBH",
                text: config.NSRSBH
            },
            PDF_XZFS: {
                key: "PDF_XZFS",
                text: config.PDF_XZFS
            }
        };
    };
    
    email(config) {
        return {
            TSFS: "",
            EMAIL: "",
            FPQQLSH: "",
            NSRSBH: config.NSRSBH,
            FP_DM: "",
            FP_HM: ""
        };
    };

    getEmail(params) {
        const { config } = this;
        let nsrsbh = config.NSRSBH;
        config.FPQQLSH = _.padEnd(config.DSPTBM + params.trade_no, 25, '0');;
        let root = `<REQUEST_EMAILPHONEFPTS class="REQUEST_EMAILPHONEFPTS">\n    <TSFSXX class="TSFSXX">\n        <COMMON_NODES class="COMMON_NODE;" size="4">\n            <COMMON_NODE> \n                <NAME>TSFS</NAME> \n                <VALUE>0</VALUE>\n            </COMMON_NODE>\n            <COMMON_NODE>\n                <NAME>SJ</NAME>\n                <VALUE>${params.mobile ? params.mobile : ''}</VALUE> \n            </COMMON_NODE>\n            <COMMON_NODE>\n                <NAME>EMAIL</NAME>\n                <VALUE>${params.email}</VALUE> \n            </COMMON_NODE>\n            <COMMON_NODE>\n                <NAME>扩展字段名称</NAME>\n                <VALUE>扩展字段值</VALUE> \n            </COMMON_NODE>\n        </COMMON_NODES> \n    </TSFSXX>\n    <FPXXS class="FPXX;" size="1">\n        <FPXX>\n             <COMMON_NODES class="COMMON_NODE;" size="5"> \n                <COMMON_NODE>\n                    <NAME>FPQQLSH</NAME>\n                    <VALUE>${config.FPQQLSH}</VALUE> \n                </COMMON_NODE>\n                <COMMON_NODE>\n                    <NAME>NSRSBH</NAME>\n                    <VALUE>${nsrsbh}</VALUE> \n                </COMMON_NODE> \n                <COMMON_NODE>\n                    <NAME>FP_DM</NAME>\n                    <VALUE>${params.fp_dm}</VALUE> \n                </COMMON_NODE> \n                <COMMON_NODE>\n                    <NAME>FP_HM</NAME>\n                    <VALUE>${params.fp_hm}</VALUE> \n                </COMMON_NODE> \n                <COMMON_NODE>\n                    <NAME>扩展字段名称</NAME>\n                    <VALUE>扩展字段值</VALUE>\n                </COMMON_NODE>\n            </COMMON_NODES> \n        </FPXX>\n    </FPXXS>\n</REQUEST_EMAILPHONEFPTS>\n`;
        console.log(root);
        return util.base64(root);
    };
    
    contentFpt(value) {
        return {
            FPQQLSH: {
                key: "FPQQLSH",
                text: value.FPQQLSH,
                comment: "请求流水号"
            },
            DSPTBM: {
                key: "DSPTBM",
                text: value.DSPTBM,
                comment: "平台编码"
            },
            NSRSBH: {
                key: "NSRSBH",
                text: value.NSRSBH,
                comment: "开票方识别号"
            },
            NSRMC: {
                key: "NSRMC",
                text: value.NSRMC,
                comment: "开票方名称"
            },
            DKBZ: {
                key: "DKBZ",
                text: "0"
            },
            KPXM: {
                key: "KPXM",
                text: value.KPXM,
                comment: "商品信息中第一条"
            },
            BMB_BBH: {
                key: "BMB_BBH",
                text: "1.0"
            },
            XHF_NSRSBH: {
                key: "XHF_NSRSBH",
                text: value.NSRSBH,
                comment: "销方识别码"
            },
            XHFMC: {
                key: "XHFMC",
                text: value.XHFMC,
                comment: "销方名称"
            },
            XHF_DZ: {
                key: "XHF_DZ",
                text: value.XHF_DZ,
                comment: "销方地址"
            },
            XHF_DH: {
                key: "XHF_DH",
                text: value.XHF_DH,
                comment: "销方电话"
            },
            XHF_YHZH: {
                key: "XHF_YHZH",
                text: value.XHF_YHZH,
                comment: "销方银行账号"
            },
            GHFMC: {
                key: "GHFMC",
                text: value.GHFMC,
                comment: "购货方名称"
            },
            GHF_SJ: {
                key: "GHF_SJ",
                text: value.GHF_SJ,
                comment: "购货方手机"
            },
            // 01-企业 02-机关事业单位 03-个人  04-其他
            GHFQYLX: {
                key: "GHFQYLX",
                text: value.GHFQYLX,
                comment: "购货方企业类型"
            },
            SKY: {
                key: "SKY",
                text: value.SKY
            },
            FHR: {
                key: "FHR",
                text: value.FHR
            },
            KPY: {
                key: "KPY",
                text: value.KPY
            },
            
            // 1 正票  2 红票
            KPLX: {
                key: "KPLX",
                text: value.KPLX,
                comment: "开票类型"
            },
            //10 正票正常开具 11 正票错票重开 20 退货折让红票 21 错票重开红票 22 换票冲红（全冲红电子发票,开具纸质发票）
            CZDM: {
                key: "CZDM",
                text: value.CZDM,
                comment: "操作代码"
            },
            YFP_DM: {
                key: "YFP_DM",
                text: value.YFP_DM,
                comment: "原发票代码"
            },
            YFP_HM: {
                key: "YFP_HM",
                text: value.YFP_HM,
                comment: "原发票号码"
            },
            CHYY: {
                key: "CHYY",
                text: value.CHYY,
                comment: "红冲原因"
            },
            QD_BZ: {
                key: "QD_BZ",
                text: "0"
            },
            //小数点后2位 以元为单位精确到分  double
            KPHJJE: {
                key: "KPHJJE",
                text: value.KPHJJE,
                comment: "价税合计金额"
            },
            HJBHSJE: {
                key: "HJBHSJE",
                text: value.HJBHSJE,
                comment: "合计不含税金额"
            },
            HJSE: {
                key: "HJSE",
                text: value.HJSE,
                comment: "合计税额"
            }
        };
    };
    
    contentXm(value) {
        return {
            XMMC: {
                key: "XMMC",
                text: value.XMMC,
                comment: "项目名称"
            },
            XMDW: {
                key: "XMDW",
                text: value.XMDW,
                comment: "项目单位"
            },
            GGXH: {
                key: "GGXH",
                text: value.GGXH,
                comment: "项目规格"
            },
            XMSL: {
                key: "XMSL",
                text: value.XMSL,
                comment: "项目数量"
            },
            HSBZ: {
                key: "HSBZ",
                text: value.HSBZ
            },
            FPHXZ: {
                key: "FPHXZ",
                text: value.FPHXZ
            },
            XMDJ: {
                key: "XMDJ",
                text: value.XMDJ
            },
            SPBM: {
                key: "SPBM",
                text: value.SPBM
            },
            ZXBM: {
                key: "ZXBM",
                text: value.ZXBM
            },
            YHZCBS: {
                key: "YHZCBS",
                text: "0",
                comment: "优惠政策标识"
            },
            XMJE: {
                key: "XMJE",
                text: value.XMJE,
                comment: "项目金额"
            },
            SL: {
                key: "SL",
                text: value.SL,
                comment: "税率"
            }
        };
    };
    
    contentDd(value) {
        return {
            DDH: {
                key: "DDH",
                text: value.DDH
            },
            DDDATE: {
                key: "DDDATE",
                text: value.DDDATE
            }
        };
    };

    updateConfig(params) {
        this.config = _.merge(this.config, params);
        return this.config;
    }
};

module.exports = InvoiceCore;