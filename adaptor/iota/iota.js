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
const ClientArg = require('../clientArg.js');

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

   async init() {
      const filePath = './network/iota/start-network.sh';
      const cooPath = './network/iota/iota-coo.jar';
      const num = Number(this.config.sender_num);

      await execFile(filePath, [`-n ${num}`]);

      myUtil.log('### Iota network start success ###');
      // wait 1000ms for the docker fully start
      await myUtil.sleep(1000);

      await exec(`java -jar ${cooPath} Coordinator ${this.config.query_ip} ${this.config.query_port}`);
      myUtil.log('### Iota run Coordinator success ###');
      // wait 10000ms for fully generate the first milestone
      await myUtil.sleep(10000);

      myUtil.log(`### Iota running Coordinator periodically every ${this.config.coo_interval}s ###`);
      // TODO: auto terminate this exec
      exec(`java -jar ${cooPath} PeriodicCoordinator -host ${this.config.query_ip} -port ${this.config.query_port} -interval ${this.config.coo_interval}`);

      return;
   }

   async prepareClients() {

      // may differ
      const nodes = await this.generateNodes();
      const senders = await this.generateSenders();
      const senders_one = await this.generateOne();
      const receiver = this.config.receiver;
      const query = await this.generateQuery();

      const clientArg = new ClientArg(this.config, nodes, senders, senders_one, receiver, query);
      
      return clientArg.getClientArg();
   }

   async send(node, sender, receiver) {
      const iota = core.composeAPI({ provider: node });
      iota.sendTrytes(sender, 3, 9)
         .catch(err => {
            myUtil.error(`Iota send err: ${err}`);
         });
   }

   async sendAndWait(node, sender, receiver) {
      const iota = core.composeAPI({ provider: node });
      const sendTime = { "sendTimestamp": new Date().getTime() }
      const transfers = [{
         address: receiver,
         value: 1,
         message: conventer.asciiToTrytes(JSON.stringify(sendTime))
      }]
      
      try {
         const trytes = await iota.prepareTransfers(sender, transfers);
         const bundle = await iota.sendTrytes(trytes, 3, 9);
         const msg = JSON.parse(extract.extractJson(bundle));
         const lag = bundle[0].attachmentTimestamp - msg.sendTimestamp;

         return lag / 1000;
      } catch (err) {
         myUtil.error(`Iota sendAndWait err: ${err}`);
         return null;
      }
   }

   async getBalance(query_url, receiver) {
      try {
         const iota = core.composeAPI({ provider: query_url });
         const bal = await iota.getBalances([receiver], 100);
         return bal.balances[0];
      } catch (error) {
         myUtil.error(`Iota getBalance err: ${err}`);
         return null;
      }
   }

   async getTransaction(query_url, receiver) {
      try {
         const iota = core.composeAPI({ provider: query_url });
         const tx = await iota.findTransactions({ addresses: [receiver] });
         return tx;
      } catch (error) {
         myUtil.error(`Iota getTransaction err: ${err}`);
         return null;
      }
   }

   async calculate(data) {
      // TODO: what if add workload? how to add stats
      let stats = {
         transactions: data.transactions,
         balance: data.balance,
         latency: data.latency,
         times: data.times,
         query: data.query
      };
      // switch (message) {
      //    case 'Latency':
      //       result = await this.calculateLatency(data);
      //    case 'Query':
      //       result = await this.calculateQuery(data);
      //    default:
      //       console.log('Calculate message is not found!');
      //       result = data
      // }
      return stats;
   }

   async finalise() {
      await exec('docker stop $(docker ps -a -q)');
      await exec('docker rm $(docker ps -a -q)');
      // await exec(`rm -rf ../network/${this.dagType}/config_*`);

      myUtil.log('### Iota finalise success ###');
      return;
   }

   async calculateLatency() { }

   async calculateQuery() { }

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

   generateQuery() {
      const query_url = `http://${this.config.query_ip}:${this.config.query_port}`;
      const query_times = Number(this.config.query_times);
      return { query_url, query_times};
   }
}

module.exports = Iota;