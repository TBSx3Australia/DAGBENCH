'use strict';
const fs = require('fs');
const util = require('util');
const byteball = require('byteball');
const Mnemonic = require('bitcore-mnemonic');
const objectHash = require('byteballcore/object_hash');
const wifLib = require('wif');

const DAGInterface = require('../DAG-Interface.js');
const myUtil = require('../../util/util.js');
class Byteball extends DAGInterface {

   constructor(config_path) {
      super(config_path);
      const config = require(this.configPath);
      this.config = config;
      this.dagType = 'byteball';
   }

   async init() {
      myUtil.log('Byteball init')
   }

   async send(node, sender, send_times, receiver) {
      const client = new byteball.Client(node);
      const params = {
         outputs: [
            {
               address: receiver.address,
               amount: 1
            }
         ]
      };
      const wif = sender[send_times].wif
      client.post.payment(params, wif, (err, result) => {
         if (err) myUtil.error(`${this.dagType} send error: ${err}`);
      });
   }

   async sendAsync(node, sender, order, receiver) {
      try {
         const client = new byteball.Client(node);
         const params = {
            outputs: [
               {
                  address: receiver.address,
                  amount: 1
               }
            ]
         };
         const wif = sender[order].wif;
         const postPaymentAsync = util.promisify(client.post.payment);
         await postPaymentAsync(params, wif);
         return;
      } catch (error) {
         myUtil.error(`${this.dagType} sendAsync error: ${error}`);
         return;
      }
   }

   async sendAndWait(node, sender, send_times, receiver) {
      try {
         const client = new byteball.Client(node);
         const params = {
            time: new Date().getTime()
         };
         const postDataAsync = util.promisify(client.post.data);
         const unit = await postDataAsync(params, sender[send_times].wif);
         return unit;
      } catch (error) {
         myUtil.error(`${this.dagType} sendAndWait error: ${error}`);
         return null;
      }
   }

   async getBalance(query_url, receiver) {
      try {
         const client = new byteball.Client(query_url);
         const getBalancesAsync = util.promisify(client.api.getBalances);
         const result = await getBalancesAsync([receiver.address]);
         if (result && result !== {}) return result[receiver.address].base.stable;
      } catch (error) {
         myUtil.error(`${this.dagType} getBalance error: ${error}`);
         return null;
      }
   }

   async getTransaction(query_url, receiver) {
      try {
         const client = new byteball.Client(query_url);
         const getBalancesAsync = util.promisify(client.api.getBalances);
         const result = await getBalancesAsync([receiver.address]);
         if (result && result !== {}) return result[receiver.address].base.stable + result[receiver.address].base.pending;
      } catch (error) {
         myUtil.error(`${this.dagType} getTransaction error: ${error}`);
         return null;
      }
   }

   async getHistory(query_url, senders,receiver) {
      let send = 0;
      let receive = 0;
      try {
         const client = new byteball.Client(query_url);
         const getWitnessesAsync = util.promisify(client.api.getWitnesses);
         const witnesses = await getWitnessesAsync();
         const params = {
            witnesses,
            addresses: [receiver.address]
         };
         const getHistoryAsync = util.promisify(client.api.getHistory);
         const history = await getHistoryAsync(params);
         return;
      } catch (error) {
         myUtil.error(`${this.dagType} getHistory error: ${error}`);
         return;
      }
   }

   generateNodes() {
      const nodes = [];
      const node_url = this.config.node_url;
      for (let i = 0; i < node_url.length; i++) {
         nodes.push(`ws://${node_url[i]}`);
      }
      return nodes;
   }

   async generateSenders() {
      myUtil.log('### Byteball generate senders start ###');

      const wallets_str = fs.readFileSync('./network/byteball/data/wallets.txt', "utf-8");
      const one_wallets_string = wallets_str.split(",");
      const senders = JSON.parse(one_wallets_string);
      return senders;
   }

   async generateSenderGroup(senders) {
      const sender_group = [];
      const shardNum = parseInt(senders.length / this.config.sender_num);
      for (let i = 0; i < this.config.sender_num; i++) {
         if (i === this.config.sender_num - 1) sender_group.push(senders);
         else sender_group.push(senders.splice(0, shardNum));
      }
      return sender_group;
   }

   generateOne() {
      const wallets_str = fs.readFileSync('./network/byteball/data/wallets_one.txt', "utf-8");
      const one_wallets_string = wallets_str.split(",");
      const senders_one = JSON.parse(one_wallets_string);
      return senders_one;
   }

   generateReceiver() {
      const receiver_str = fs.readFileSync('./network/byteball/data/receiver.txt', "utf-8");
      const one_receiver_string = receiver_str.split(",");
      const receiver = JSON.parse(one_receiver_string);
      return receiver[0];
   }

   generateQuery() {
      const query_url = `ws://${this.config.query_ip}:${this.config.query_port}`;
      const query_times = Number(this.config.query_times);
      return { query_url, query_times };
   }

   async calBalance(data, receiver) {
      return data;
   }

   async calLatency(data) {
      const latency = [];
      const nodes = this.generateNodes();

      const client = new byteball.Client(nodes[0]);
      const getJointAsync = util.promisify(client.api.getJoint);
      for (let i = 0; i < data.length; i++) {
         try {
            const result = await getJointAsync(data[i]);
            const attached = result.joint.unit.timestamp;
            const send = result.joint.unit.messages[1].payload.time / 1000;
            const time = attached - parseInt(send);
            latency.push(time ? time : 1);
         } catch (error) {
            myUtil.error('Byteball calLatency error', error);
            continue;
         }
      }
      return latency;
   }

   async throughtputHeader() {
      const header = [
         { id: 'nodes', title: 'NODE' },
         { id: 'client', title: 'CLIENT' },
         { id: 'rate', title: 'RATE' },
         { id: 'duration', title: 'DURATION' },
         { id: 'tps', title: 'TPS' },
         { id: 'ctps', title: 'CTPS' }
      ]
      return header;
   }

   async throughtputRecords(transactions, balance, times, nodes, senders, duration) {
      const rate = times / duration;
      const confirmed = balance[balance.length - 1] - balance[0];
      const valid_trans = transactions[transactions.length - 1] - transactions[0];
      const valid_duration = 0.9 * duration;
      const tps = (valid_trans / valid_duration).toFixed(4);
      const ctps = (confirmed / valid_duration).toFixed(4);

      const records = [{
         nodes,
         client: senders,
         rate,
         duration: valid_duration,
         tps,
         ctps
      }]
      return records;
   }

   async finalise() {
      console.log('Byteball finalise');
   }

   // Byteball generate wallets
   generateRandomWallet() {
      const mnemonic = new Mnemonic();
      while (!Mnemonic.isValid(mnemonic.toString())) {
         mnemonic = new Mnemonic();
      }
      const seed = mnemonic.phrase;
      const env = 'livenet'
      const path = env === 'testnet' ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
      const xPrivKey = mnemonic.toHDPrivateKey();
      const { privateKey } = xPrivKey.derive(path);
      const privKeyBuf = privateKey.bn.toBuffer({ size: 32 });
      const version = env === 'testnet' ? 239 : 128;
      const wif = wifLib.encode(version, privKeyBuf, false);
      const pubkey = privateKey.publicKey.toBuffer().toString('base64');
      const definition = ['sig', { pubkey: pubkey }];
      const address = objectHash.getChash160(definition);
      return { wif, address }
   }


   generateWalletsToFile() {
      const wallet_num = 20000
      const wallets = []
      for (let i = 0; i < wallet_num; i++) {
         wallets.push(generateRandomWallet())
      }
      fs.writeFileSync('./network/byteball/data/wallets.txt', JSON.stringify(wallets))
   }

}

module.exports = Byteball;