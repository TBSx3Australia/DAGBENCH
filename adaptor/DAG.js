'use strict';

const Util = require('../util/util.js');

class DAG {
   /**
    * Constructor
    * @param {String} configPath path of the blockchain configuration file
    */
   constructor(configPath) {
      let config = require(configPath);

      if (config.type) {
         if (config.type === 'iota') {
            let iota = require('./iota/iota.js');
            this.dagType = 'iota';
            this.dagObj = new iota(configPath);
         }
         else if (config.type === 'nano') {
            let nano = require('./nano/nano.js');
            this.dagType = 'nano';
            this.dagObj = new nano(configPath);
         }
         else if (config.type === 'byteball') {
            let byteball = require('./byteball/byteball.js');
            this.dagType = 'byteball';
            this.dagObj = new byteball(configPath);
         }
         else {
            this.dagType = 'unknown';
            throw new Error('Unknown dag type: ' + config.type);
         }
      }
      else {
         this.dagType = 'unknown';
         throw new Error('Unknown dag config file ' + configPath);
      }
   }

   async init() {
      Util.log(`### ${this.dagType} init ###`);
      await this.dagObj.init();
   }

   async prepareClients() {
      Util.log(`### ${this.dagType} prepareClients ###`);
      return await this.dagObj.prepareClients();
   }

   async send(nodes_address, sender_account, receiver_account) {
      await this.dagObj.send(nodes_address, sender_account, receiver_account);
   }

   async sendAndWait(nodes_address, sender_account, receiver_account) {
      return await this.dagObj.sendAndWait(nodes_address, sender_account, receiver_account);
   }

   async getBalance(query_url, receiver) {
      return await this.dagObj.getBalance(query_url, receiver);
   }

   async getTransaction(query_url, receiver) {
      return await this.dagObj.getTransaction(query_url, receiver);
   }

   async calculate(data) {
      return await this.dagObj.calculate(data);
   }

   async finalise() {
      Util.log(`### ${this.dagType} finalise ###`);
      await this.dagObj.finalise();
   }
}

module.exports = DAG;