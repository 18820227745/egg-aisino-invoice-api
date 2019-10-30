const crypto = require('crypto');
const uuid = require('uuid');
const moment = require('moment');
const randomStr = require('string-random');
const xml2js = require('xml2js');
const zlib = require('zlib');

const EPS = 1e-6;

const Util = {
    md5(text) {
        return crypto.createHash('md5').update(text, 'utf8').digest('hex');
    },

    sha1(text) {
        return crypto.createHash('sha1').update(text, 'utf8').digest('hex');
    },

    uuid(line) {
        const id = uuid.v4();
        return line ? id.replace(/-/g, '') : id;
    },

    base64(value) {
      const buf = new Buffer(value);
      return buf.toString('base64');
    },

    randomIntStr(number = 6) {
        const chars = '0123456789';
        const str_len = chars.length;
        let int_str = '';

        for (let i = 0; i < len; i++) {
            const idx = Math.floor(Math.random() * str_len);
            int_str += chars[idx];
        }

        return int_str;
    },

    randomString(number = 10) {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const str_len = chars.length;
        let str = '';

        for (let i = 0; i < len; i++) {
            const idx = Math.floor(Math.random() * str_len);
            str += chars[idx];
        }

        return str;
    },

    dateFormat(date: Date = new Date(), fmt = 'YYYY-MM-DD HH:mm:ss', timeZone = 8) {
        return moment(date).utcOffset(timeZone).format(fmt);
    },
    rightInteger(number) {
        return Math.floor(number + EPS);
    },
    makeNoncestr(len = 16) {
        return randomStr(len);
    },
    parseXML(xml, option) {
        return new Promise((resolve, reject) => {
            const parseString = xml2js.parseString;
            parseString(xml, option, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
            });
        });
    },
    buildXML(json, option) {
        const builder = new xml2js.Builder(option);
        return builder.buildObject({ xml: json });
    },
    unzip(buffer) {
        return new Promise((resolve, reject) => {
            zlib.unzip(buffer, (err, buffer) => {
                if (!err) {
                    resolve(buffer.toString());
                } else {
                    reject(err);
                }
            });
        });
    },
    base64Decode(str) {
        const result = new Buffer(str, 'base64').toString();
        return result;
    }

};

export default Util;
