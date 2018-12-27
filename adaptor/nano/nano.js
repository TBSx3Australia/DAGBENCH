'use strict';
// const { client } = require('raiblocks-client');

const DAGInterface = require('../DAG-Interface.js');

class Nano extends DAGInterface {
   /**
     * Create a new instance of the {Iota} class.
     * @param {string} config_path The path of the Iota network configuration file.
     */
   constructor(config_path) {
      super(config_path);
   }

   async init() {
      console.log('Nano init');
   }

   async prepareClients() {
      const config = require(this.configPath);
      const key = config.key;
      // const clients = config.client_num
      // make clients a class
      const clients = this.getClients(config);
      // console.log('Iota prepareClients', config.client_num);
      return clients;
   }

   async send(nodes_address, sender_account, receiver_account) {
      // const senderClient = client({ rai_node_host: nodes_address });
      // senderClient.send({ wallet: sender_account.wallet, source: sender_account.account, destination: receiver_account.account, amount: 1 })
      // .catch (err => {console.log('Nano send err', err)});
      console.log('Nano send', nodes_address, sender_account, receiver_account);
   }

   async getBalance() {
      console.log('Nano getBalance');
   }

   async getTransaction() {
      console.log('Nano getTransaction');
   }

   async finalise() {
      console.log('Nano finalise config file', this.configPath);
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

module.exports = Nano;