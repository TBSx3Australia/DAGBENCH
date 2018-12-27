'use strict';

const Util = require('../util/util.js');

class Workload {
   /**
    * Constructor
    * @param {String} configPath path of the blockchain configuration file
    */
   constructor(configPath, clientArgs) {
      const config = require(configPath);

      if (config.work) {
         if (config.work === 'valuetransfer') {
            const Valuetransfer = require('./valuetransfer/valuetransfer.js');
            this.workType = 'valuetransfer';
            this.workObj = new Valuetransfer(configPath, clientArgs);
         }
         else if (config.work === 'query') {
            const Query = require('./query/query.js');
            this.workType = 'query';
            this.workObj = new Query(configPath, clientArgs);
         }
         else {
            this.workType = 'unknown';
            throw new Error('Unknown work type: ' + config.work);
         }
      }
      else {
         this.workType = 'unknown';
         throw new Error('Unknown work config file ' + configPath);
      }
   }

   async preloadData() {
      Util.log(`### ${this.workType} preload data ###`);
      this.workObj.preloadData();
   }

   async createClients() {
      Util.log(`### ${this.workType} createClients ###`);
      return this.workObj.createClients();
   }

   async generateReport(net, stats, clientArgs) {
      Util.log(`### ${this.workType} generateReport ###`);
      return this.workObj.generateReport(net, stats, clientArgs);
   }

}

module.exports = Workload;