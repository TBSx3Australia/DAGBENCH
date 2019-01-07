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

   /**
    * Initialise DAG network
    * @param {string} env 
    */
   async init(env) {
      Util.log(`### ${this.dagType} init ###`);
      await this.dagObj.init(env);
   }

   /**
    * send and instantly return
    * @param {*} node node object
    * @param {array} sender the array of all senders
    * @param {Number} order the position of the selected sender
    * @param {*} receiver receiver object
    */
   async send(node, sender, order, receiver) {
      await this.dagObj.send(node, sender, order, receiver);
   }

   /**
    * send and not return until response
    * @param {*} node  node object
    * @param {array} senders the array of all senders
    * @param {number} order the position of the selected sender
    * @param {*} receiver receiver object
    */
   async sendAsync(node, senders, order, receiver) {
      await this.dagObj.sendAsync(node, senders, order, receiver);
   }

   /**
    * send and not return until response
    * @param {*} node  node object
    * @param {array} senders the array of all senders
    * @param {number} order the position of the selected sender
    * @param {*} receiver receiver object
    */
   async sendAndWait(node, senders, order, receiver) {
      return await this.dagObj.sendAndWait(node, senders, order, receiver);
   }

   /**
    * get balance
    * @param {*} query_url url of the DAG network
    * @param {*} account account to get balence
    */
   async getBalance(query_url, account) {
      return await this.dagObj.getBalance(query_url, account);
   }

   /**
    * get transaction
    * @param {*} query_url url of the DAG network
    * @param {*} account account to get transaction
    */
   async getTransaction(query_url, account) {
      return await this.dagObj.getTransaction(query_url, account);
   }

   /**
    * get history
    * @param {*} query_url url of the DAG network
    * @param {*} account account to get history
    */
   async getHistory(query_url, senders, account) {
      return await this.dagObj.getHistory(query_url, senders, account);
   }

   /**
    * generate DAG network nodes url
    */
   async generateNodes() {
      return await this.dagObj.generateNodes();
   }

   /**
    * generate all senders
    */
   async generateSenders() {
      return await this.dagObj.generateSenders();
   }

   /**
    * divide all senders in groups
    */
   async generateSenderGroup(senders) {
      return await this.dagObj.generateSenderGroup(senders);
   }

   /**
    * generate senders who send transactions one by one
    */
   async generateOne() {
      return await this.dagObj.generateOne();
   }

   /**
    * generate the receiver object
    */
   async generateReceiver() {
      return await this.dagObj.generateReceiver();
   }

   /**
    * generate the url for query
    */
   async generateQuery() {
      return await this.dagObj.generateQuery();
   }

   /**
    * calculate balance
    * @param {array} data 
    * @param {*} receiver 
    */
   async calBalance(data, receiver) {
      return await this.dagObj.calBalance(data, receiver);
   }

   /**
    * calculate latency
    * @param {array} data 
    */
   async calLatency(data) {
      return await this.dagObj.calLatency(data);
   }

   /**
    * generate the csv file header for throughput
    */
   async throughtputHeader() {
      return await this.dagObj.throughtputHeader();
   }

   /**
    * generate the csv file records for throughput
    * @param {array} transactions query result of get transactions
    * @param {array} balance query result of get balance
    * @param {Number} times transaction sending times
    * @param {Number} nodes the number of nodes
    * @param {array} senders the number of senders
    * @param {Number} duration the duration of the test
    */
   async throughtputRecords(transactions, balance, times, nodes, senders, duration) {
      return await this.dagObj.throughtputRecords(transactions, balance, times, nodes, senders, duration);
   }

   /**
    * finalise the DAG network
    */
   async finalise() {
      Util.log(`### ${this.dagType} finalise ###`);
      await this.dagObj.finalise();
   }
}

module.exports = DAG;