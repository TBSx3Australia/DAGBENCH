
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

   async prepareClients() { 
      throw new Error('prepareClients is not implemented');
   }

   async send() { 
      throw new Error('send is not implemented');
   }


   async sendAndWait() {
      // not required
   }

   async getBalance() {
      throw new Error('getBalance is not implemented');
   }

   async getTransaction() { 
      throw new Error('getTransaction is not implemented');
   }

   async calculate() {
      throw new Error('calculate is not implemented');
   }

   async finalise() {
      throw new Error('finalise is not implemented');
   }
}

module.exports = DAGInterface;