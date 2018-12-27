'use strict';
// const byteball = require('byteball');

const DAGInterface = require('../DAG-Interface.js');

class Byteball extends DAGInterface {
   /**
     * Create a new instance of the {Iota} class.
     * @param {string} config_path The path of the Iota network configuration file.
     */
   constructor(config_path) {
      super(config_path);
   }

   async init() {
      console.log('Byteball init');
   }

   async prepareClients() {
      const config = require(this.configPath);
      const clients = this.getClients(config);
      return clients;
   }

   async send(nodes_address, sender_account, receiver_account) {
      // const client = new byteball.Client(nodes_address);
      // const params = {
      //    outputs: [
      //       {
      //          address: receiver_account.address,
      //          amount: 1
      //       }
      //    ]
      // };
      // const wif = sender_account.wif
      // client.post.payment(params, wif, (err, result) => {
      //    if (err) console.log('send err', err);
      //    else console.log('res unit', result);
      // });
      console.log('Byteball send', nodes_address, sender_account, receiver_account);
   }

   async getBalance() {
      console.log('Byteball getBalance');
   }

   async getTransaction() {
      console.log('Byteball getTransaction');
   }

   async finalise() {
      console.log('Byteball finalise config file', this.configPath);
   }

   async getClients(config) {
      const clients = {
         client_num: config.client_num,
         duration: config.duration,
         tx_rate: config.tx_rate,
         nodes_address: ['78.445.321.6:3000', '32.54.123.43:3000'],
         senders_account: [['123', '434'], ['123', '434']],
         receiver_account: '213',
         // latency_account: ['332', '446'], // is not required
         query_account: ['543.63.234:3000']
      };
      return clients;
   }

}

module.exports = Byteball;