
'use strict';

class DAGInterface {
   /**
    * Constructor
    * @param {String} configPath path of the blockchain configuration file
    */
   constructor(configPath) {
      this.configPath = configPath;
   }

   async init() {
      throw new Error('init is not implemented');
   }

   async send() { 
      throw new Error('send is not implemented');
   }

   async sendAsync() {
      throw new Error('sendAsync is not implemented');
   }

   async sendAndWait() {
      throw new Error('sendAndWait is not implemented');
   }

   async getBalance() {
      throw new Error('getBalance is not implemented');
   }

   async getTransaction() { 
      throw new Error('getTransaction is not implemented');
   }

   async getHistory() {
      throw new Error('getHistory is not implemented');
   }

   async generateNodes() {
      throw new Error('generateNodes is not implemented');
   }

   async generateSenders() {
      throw new Error('generateSenders is not implemented');
   }

   async generateSenderGroup() { 
      throw new Error('generateSenderGroup is not implemented');
   }

   async generateOne() {
      throw new Error('generateOne is not implemented');
   }

   async generateReceiver() {
      throw new Error('generateReceiver is not implemented');
   }

   async generateQuery() {
      throw new Error('generateQuery is not implemented');
   }

   async calBalance() {
      throw new Error('calBalance is not implemented');
   }

   async calLatency() {
      throw new Error('calLatency is not implemented');
   }

   async throughtputHeader() {
      throw new Error('throughtputHeader is not implemented');
   }

   async throughtputRecords() {
      throw new Error('throughtputRecords is not implemented');
   }

   async finalise() {
      throw new Error('finalise is not implemented');
   }
}

module.exports = DAGInterface;