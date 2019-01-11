'use strict';

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

class Util {

   /**
    * Perform a sleep
    * @param {*} ms the time to sleep, in ms
    * @returns {Promise} a completed promise
    */
   static sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
   }

   /**
    * Simple log method to output to the console
    * @param {any} msg messages to log
    */
   static log(...msg) {
      // eslint-disable-next-line no-console
      console.log(...msg);
   }

   /**
    * Output error to the console
    * @param {any} msg error messages to log
    */
   static error(...msg) {
      // eslint-disable-next-line no-console
      console.log(...msg);
   }

   /**
    * Get the moment after a time lag
    * @param {*} lag the expected time lag, in ms
    * @returns {Date} a date object
    */
   static getTime(lag) {
      return new Date(new Date().getTime() + lag);
   }

   /**
    * Write a csv file
    * @param {array} header header array consist with 'id' and 'title'
    * @param {array} records records array align with 'header'
    * @param {string} path path that output the csv file
    */
   static async csvWriter(header, records, path) {
      const csvWriter = createCsvWriter({
         path,
         header
      });

      await csvWriter.writeRecords(records);
      this.log(`${path} write success`);
   }

   /**
    * make a directory if it doesn't exist
    * @param {string} path the path of the directory
    */
   static async mkDir(path) {
      await exec(`[ -d ${path} ] || mkdir ${path}`);
      return;
   }
}

module.exports = Util;