'use strict';

const Util = require('../util/util.js');

class Workload {
   /**
    * Constructor
    * @param {String} configPath path of the blockchain configuration file
    */
   constructor(configPath, dag) {
      const config = require(configPath);

      if (config.work) {
         if (config.work === 'valuetransfer') {
            const Valuetransfer = require('./valuetransfer/valuetransfer.js');
            this.workType = 'valuetransfer';
            this.workObj = new Valuetransfer(configPath, dag);
         }
         else if (config.work === 'query') {
            const Query = require('./query/query.js');
            this.workType = 'query';
            this.workObj = new Query(configPath, dag);
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

   async prepareClients() {
      Util.log(`### ${this.workType} prepareClients ###`);
      await this.workObj.prepareClients();
   }

   async preloadData() {
      Util.log(`### ${this.workType} preload data ###`);
      await this.workObj.preloadData();
   }

   async createClients() {
      Util.log(`### ${this.workType} createClients ###`);
      return this.workObj.createClients();
   }

   async calculate() {
      Util.log(`### ${this.workType} calculate ###`);
      return this.workObj.calculate();
   }

   async generateReport(net) {
      Util.log(`### ${this.workType} generateReport ###`);
      return this.workObj.generateReport(net);
   }

}

module.exports = Workload;