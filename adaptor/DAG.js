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

   async init(env) {
      Util.log(`### ${this.dagType} init ###`);
      await this.dagObj.init(env);
   }

   async send(nodes_address, sender_account, send_times, receiver_account) {
      await this.dagObj.send(nodes_address, sender_account, send_times, receiver_account);
   }

   /**
    * Write a csv file
    * @param {string} node 
    * @param {array} senders each element is a sender object
    * @param {number} order position of sender
    * @param {object} receiver object
    */
   async sendAsync(node, senders, order, receiver) {
      await this.dagObj.sendAsync(node, senders, order, receiver);
   }

   async sendAndWait(nodes_address, sender_account, send_times, receiver_account) {
      return await this.dagObj.sendAndWait(nodes_address, sender_account, send_times, receiver_account);
   }

   async getBalance(query_url, account) {
      return await this.dagObj.getBalance(query_url, account);
   }

   async getTransaction(query_url, account) {
      return await this.dagObj.getTransaction(query_url, account);
   }

   async getHistory(query_url, senders, account) {
      return await this.dagObj.getHistory(query_url, senders, account);
   }

   async generateNodes() {
      return await this.dagObj.generateNodes();
   }

   async generateSenders() {
      return await this.dagObj.generateSenders();
   }

   async generateSenderGroup(senders) {
      return await this.dagObj.generateSenderGroup(senders);
   }

   async generateOne() {
      return await this.dagObj.generateOne();
   }

   async generateReceiver() {
      return await this.dagObj.generateReceiver();
   }

   async generateQuery() {
      return await this.dagObj.generateQuery();
   }

   async calBalance(data, receiver) {
      return await this.dagObj.calBalance(data, receiver);
   }

   async calLatency(data) {
      return await this.dagObj.calLatency(data);
   }

   async throughtputHeader() {
      return await this.dagObj.throughtputHeader();
   }

   async throughtputRecords(transactions, balance, times, nodes, senders, duration) {
      return await this.dagObj.throughtputRecords(transactions, balance, times, nodes, senders, duration);
   }


   async finalise() {
      Util.log(`### ${this.dagType} finalise ###`);
      await this.dagObj.finalise();
   }
}

module.exports = DAG;