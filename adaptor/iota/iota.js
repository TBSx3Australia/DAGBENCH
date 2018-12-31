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
// const ClientArg = require('../../workload/valuetransfer/clientArg.js');

class Iota extends DAGInterface { 
   /**
     * Create a new instance of the {Iota} class.
     * @param {string} config_path The path of the Iota network configuration file.
     */
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
         // wait 1000ms for the docker fully start
         await myUtil.sleep(2000);

         await exec(`java -jar ${cooPath} Coordinator ${this.config.query_ip} ${this.config.query_port}`);
         myUtil.log('### Iota run Coordinator success ###');
         // wait 10000ms for fully generate the first milestone
         await myUtil.sleep(10000);

         if (this.config.coo_interval) {
            myUtil.log(`### Iota running Coordinator periodically every ${this.config.coo_interval}s ###`);
            // TODO: auto terminate this exec
            exec(`java -jar ${cooPath} PeriodicCoordinator -host ${this.config.query_ip} -port ${this.config.query_port} -interval ${this.config.coo_interval}`);
         }
         
         return;
      } else { 
         // implement other env
         return;
      }
      
   }

   // async prepareClients(work) {

   //    // may differ
   //    const nodes = await this.generateNodes();
   //    const senders = await this.generateSenders();
   //    const senders_one = await this.generateOne();
   //    const receiver = this.config.receiver;
   //    const query = await this.generateQuery();

   //    const clientArg = new ClientArg(this.config, nodes, senders, senders_one, receiver, query);

   //    return clientArg.getClientArg();
   // }

   async send(node, sender, receiver) {
      const iota = core.composeAPI({ provider: node });
      iota.sendTrytes(sender, 3, 9)
         .catch(error => {
            myUtil.error(`Iota send error: ${error}`);
         });
   }

   async sendAsync(node, sender, receiver) { 
      try {
         const iota = core.composeAPI({ provider: node });
         await iota.sendTrytes(sender, 3, 9);
      } catch (error) {
         myUtil.error(`Iota sendAsync error: ${error}`);
      }
   }

   async sendAndWait(node, sender, account) {
      try {
         const iota = core.composeAPI({ provider: node });
         const sendTime = { "sendTimestamp": new Date().getTime() }
         const transfers = [{
            address: account,
            value: 1,
            message: conventer.asciiToTrytes(JSON.stringify(sendTime))
         }]

         const trytes = await iota.prepareTransfers(sender, transfers);
         const bundle = await iota.sendTrytes(trytes, 3, 9);
         const msg = JSON.parse(extract.extractJson(bundle));
         const lag = bundle[0].attachmentTimestamp - msg.sendTimestamp;

         return lag / 1000;
      } catch (error) {
         myUtil.error(`Iota sendAndWait error: ${error}`);
         return null;
      }
   }

   async getBalance(query_url, account) {
      try {
         const iota = core.composeAPI({ provider: query_url });
         const bal = await iota.getBalances([account], 100);
         return bal.balances[0];
      } catch (error) {
         myUtil.error(`Iota getBalance error: ${error}`);
         return null;
      }
   }

   async getHistory(query_url, account) {
      let send = 0;
      let receive = 0;
      try {
         const iota = core.composeAPI({ provider: query_url });
         const data = await iota.getAccountData(account);
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
         const tx = await iota.findTransactions({ addresses: [receiver] });
         return tx;
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

      // TODO: generate seeds before
      const seedsText = fs.readFileSync(`./network/iota/data/seed.txt`, "utf-8");
      const seedsArr = seedsText.split("\n");

      const wstream = fs.createWriteStream(`./network/iota/data/tryte.txt`);
      const trytes = [];
      for (let i = 0; i < seedsArr.length; i++) {
         const tryte = await iota.prepareTransfers(seedsArr[i], transfers);
         trytes.push(tryte);
         wstream.write(tryte + "\n");
      }
      wstream.end();
      myUtil.log('### iota write trytes finish ###');

      // generate senders array
      const shardNum = parseInt(trytes.length / this.config.sender_num);
      for (let i = 0; i < this.config.sender_num; i++) {
         if (i === this.config.sender_num - 1) senders.push(trytes);
         else senders.push(trytes.splice(0, shardNum));
      }

      myUtil.log('### iota generate senders finish ###');

      return senders;
   }

   generateOne() {
      // TODO: generate seeds
      const seed_one_st = fs.readFileSync(`./network/iota/data/seed_one.txt`, "utf-8");
      const senders_one = seed_one_st.split("\n");
      return senders_one;
   }

   generateReceiver() {
      return this.config.receiver;
   }

   generateQuery() {
      const query_url = `http://${this.config.query_ip}:${this.config.query_port}`;
      const query_times = Number(this.config.query_times);
      return { query_url, query_times};
   }

   async calTransactions(data) {
      return data;
   }

   async calBalance(data) {
      return data;
   }

   async calLatency(data) {
      return data;
   }

   async calTimes(data) {
      return data;
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