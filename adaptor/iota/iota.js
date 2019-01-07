'use strict';

const core = require('@iota/core');
const conventer = require('@iota/converter');
const extract = require('@iota/extract-json');
const fs = require("fs");
const util = require('util');

const execFile = util.promisify(require('child_process').execFile);
const exec = util.promisify(require('child_process').exec);

const DAGInterface = require('../DAG-Interface.js');
const myUtil = require('../../util/util.js');

class Iota extends DAGInterface { 

   constructor(config_path) {
      super(config_path);
      const config = require(this.configPath);
      this.config = config;
      this.dagType = 'iota';
   }

   async init(env) {
      if (env === 'local') {
         const filePath = './network/iota/start-network.sh';
         const cooPath = './network/iota/iota-coo.jar';
         const num = Number(this.config.node_url.length);

         await execFile(filePath, [`-n ${num}`]);

         myUtil.log('### Iota network start success ###');
         // wait 4000ms for the docker fully start
         await myUtil.sleep(4000);

         await exec(`java -jar ${cooPath} Coordinator ${this.config.query_ip} ${this.config.query_port}`);
         myUtil.log('### Iota run Coordinator success ###');
         // wait 10000ms for fully generate the first milestone
         await myUtil.sleep(10000);

         if (this.config.coo_interval) {
            myUtil.log(`### Iota running Coordinator periodically every ${this.config.coo_interval}s ###`);

            exec(`java -jar ${cooPath} PeriodicCoordinator -host ${this.config.query_ip} -port ${this.config.query_port} -interval ${this.config.coo_interval}`);
         }
         
         return;
      } else { 
         // implement other env
         return;
      }
      
   }

   async send(node, sender, send_times, receiver) {
      let send = sender;
      if (send_times === 0 || send_times) {
         send = sender[send_times];
      }
      const iota = core.composeAPI({ provider: node });
      iota.sendTrytes(send, 3, 9)
         .catch(error => {
            myUtil.error(`Iota send error: ${error}`);
         });
   }

   async sendAsync(node, sender, order, receiver) {
      try {
         const iota = core.composeAPI({ provider: node });
         await iota.sendTrytes(sender[order], 3, 9);
      } catch (error) {
         myUtil.error(`Iota sendAsync error: ${error}`);
      }
   }

   async sendAndWait(node, sender, send_times, receiver) {
      let send = sender;
      if (send_times === 0 || send_times) {
         send = sender[send_times];
      }
      try {
         const iota = core.composeAPI({ provider: node });
         const sendTime = { "sendTimestamp": new Date().getTime() }
         const transfers = [{
            address: receiver.address,
            value: 1,
            message: conventer.asciiToTrytes(JSON.stringify(sendTime))
         }]

         const trytes = await iota.prepareTransfers(send, transfers);
         const bundle = await iota.sendTrytes(trytes, 3, 9);
         const msg = JSON.parse(extract.extractJson(bundle));
         const lag = bundle[0].attachmentTimestamp - msg.sendTimestamp;

         return lag / 1000;
      } catch (error) {
         myUtil.error(`Iota sendAndWait error: ${error}`);
         return null;
      }
   }

   async getBalance(query_url, receiver) {
      try {
         const iota = core.composeAPI({ provider: query_url });
         const bal = await iota.getBalances([receiver.address], 100);
         return bal.balances[0];
      } catch (error) {
         myUtil.error(`Iota getBalance error: ${error}`);
         return null;
      }
   }

   async getHistory(query_url, senders,receiver) {
      let send = 0;
      let receive = 0;
      try {
         const iota = core.composeAPI({ provider: query_url });
         const data = await iota.getAccountData(receiver.seed);
         data.transfers.map((tran) => {
            if (tran.length === 3) receive++;
            else send++;
         });
         return;
      } catch (error) {
         myUtil.error(`Iota getHistory error: ${error}`);
         return;
      }
   }

   async getTransaction(query_url, receiver) {
      try {
         const iota = core.composeAPI({ provider: query_url });
         const tx = await iota.findTransactions({ addresses: [receiver.address] });
         return tx.length;
      } catch (error) {
         myUtil.error(`Iota getTransaction error: ${error}`);
         return null;
      }
   }

   generateNodes() {
      const nodes = [];
      const node_url = this.config.node_url;
      for (let i = 0; i < node_url.length; i++) {
         nodes.push(`http://${node_url[i]}`);
      }
      return nodes;
   }

   async generateSenders() {
      myUtil.log('### iota generate senders start ###');
      const senders = [];
      const iota = core.composeAPI({
         provider: `http://${this.config.node_url[0]}`
      });
      const transfers = [{
         address: this.config.receiver,
         value: 1,
         message: conventer.asciiToTrytes(JSON.stringify(this.config.payload))
      }];

      const seedsText = fs.readFileSync(`./network/iota/data/seed.txt`, "utf-8");
      const seedsArr = seedsText.split("\n");

      const wstream = fs.createWriteStream(`./network/iota/data/tryte.txt`);
      // const trytes = [];
      for (let i = 0; i < seedsArr.length; i++) {
         const tryte = await iota.prepareTransfers(seedsArr[i], transfers);
         senders.push(tryte);
         wstream.write(tryte + "\n");
      }
      wstream.end();
      myUtil.log('### iota write trytes finish ###');

      myUtil.log('### iota generate senders finish ###');

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
      const seed_one_st = fs.readFileSync(`./network/iota/data/seed_one.txt`, "utf-8");
      const senders_one = seed_one_st.split("\n");
      return senders_one;
   }

   generateSeed() {
      // implement with iota-coo.jar
   }

   generateReceiver() {
      const receiver = {
         seed: this.config.seed,
         address: this.config.receiver
      }
      return receiver;
   }

   generateQuery() {
      const query_url = `http://${this.config.query_ip}:${this.config.query_port}`;
      const query_times = Number(this.config.query_times);
      return { query_url, query_times};
   }

   async calBalance(data, receiver) {
      return data;
   }

   async calLatency(data) {
      return data;
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
      await exec('docker stop $(docker ps -a -q)');
      await exec('docker rm $(docker ps -a -q)');
      // await exec(`rm -rf ../network/${this.dagType}/config_*`);

      myUtil.log('### Iota finalise success ###');
      return;
   }
}

module.exports = Iota;