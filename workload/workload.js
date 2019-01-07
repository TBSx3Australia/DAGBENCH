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

   /**
    * prepare configuration data for clients
    */
   async prepareClients() {
      Util.log(`### ${this.workType} prepareClients ###`);
      await this.workObj.prepareClients();
   }

   /**
    * preload required data for running the workload
    */
   async preloadData() {
      Util.log(`### ${this.workType} preload data ###`);
      await this.workObj.preloadData();
   }

   /**
    * create the test
    */
   async createTest() {
      Util.log(`### ${this.workType} createTest ###`);
      return this.workObj.createTest();
   }

   /**
    * calculate the result
    */
   async calculate() {
      Util.log(`### ${this.workType} calculate ###`);
      return this.workObj.calculate();
   }

   /**
    * generate the report
    */
   async generateReport(net) {
      Util.log(`### ${this.workType} generateReport ###`);
      return this.workObj.generateReport(net);
   }

}

module.exports = Workload;