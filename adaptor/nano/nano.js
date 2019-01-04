'use strict';
const { client } = require('raiblocks-client');

const readline = require('readline');
const fs = require('fs');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const exec = util.promisify(require('child_process').exec);

const DAGInterface = require('../DAG-Interface.js');
const myUtil = require('../../util/util.js');
class Nano extends DAGInterface {
   /**
     * Create a new instance of the {Iota} class.
     * @param {string} config_path The path of the Iota network configuration file.
     */
   constructor(config_path) {
      super(config_path);
      const config = require(this.configPath);
      this.config = config;
      this.dagType = 'nano';
   }

   async init(env) {
      if (env === 'local') {
         const filePath = './network/nano/start-network.sh';
         const num = Number(this.config.node_url.length);

         await execFile(filePath, [`-n ${num}`]);

         myUtil.log('### Nano network start success ###');
         // wait 2000ms for the docker fully start
         await myUtil.sleep(2000);
      } else { }
   }

   async send(node, sender, send_times, receiver) {
      const senderClient = client({ rai_node_host: node.rpc });
      senderClient.send({ wallet: sender.wallet, source: sender.account, destination: receiver.account, amount: 1 })
         .catch(err => {
            console.log('Nano send err', err)
         });
   }

   async sendAsync(node, sender, order, receiver) {
      const send = sender[order % sender.length];
      try {
         const senderClient = client({ rai_node_host: node.rpc });
         await senderClient.send({ wallet: send.wallet, source: send.account, destination: receiver.account, amount: 1 })
      } catch (error) {
         myUtil.error(`Nano sendAsync error: ${error}`);
      }
   }

   async sendAndWait(node, sender, send_times, receiver) {
      const send = sender[send_times % sender.length];
      try {
         const senderClient = client({ rai_node_host: node.rpc });
         const sendTimeStamp = new Date();

         const blockObj = await senderClient.send({ wallet: send.wallet, source: send.account, destination: receiver.account, amount: 1 })

         const lag = {
            block: blockObj.block,
            time: sendTimeStamp
         }

         return lag;
      } catch (error) {
         myUtil.error(`Nano sendAndWait error: ${error}`);
         return null;
      }
   }

   async getBalance(query_url, account) {
      // bootstrap
      const nodes = this.generateNodes();
      nodes.map(async (node) => {
         await this.bootstrap({ rpc: nodes[0].rpc, peer: nodes[0].peer }, { rpc: node.rpc, peer: node.peer });
      });

      try {
         const queryClient = client({ rai_node_host: query_url.rpc });
         const result = await queryClient.account_balance({ account: account.account });
         return Number(result.balance);
      } catch (error) {
         myUtil.error(`Nano getBalance error: ${error}`);
         return null;
      }
   }

   async getHistory(query_url, senders, account) {
      let input = 0;
      let output = 0;

      // bootstrap
      const nodes = this.generateNodes();
      nodes.map(async (node) => {
         await this.bootstrap({ rpc: nodes[0].rpc, peer: nodes[0].peer }, { rpc: node.rpc, peer: node.peer });
      });
      try {
         const queryClient = client({ rai_node_host: query_url.rpc });
         const result = await queryClient.account_history({ account: senders[0].account, count: 1 });

         result.history.map((block) => {
            if (block.type === 'send') input++
            else output++
         });
         return;
      } catch (error) {
         myUtil.error(`Nano getHistory error: ${error}`);
         return;
      }
   }

   async getTransaction(query_url, account) {
      // bootstrap
      const nodes = this.generateNodes();
      nodes.map(async (node) => {
         await this.bootstrap({ rpc: nodes[0].rpc, peer: nodes[0].peer }, { rpc: node.rpc, peer: node.peer });
      });

      try {
         const queryClient = client({ rai_node_host: query_url.rpc });
         const result = await queryClient.account_balance({ account: account.account });
         return Number(result.pending);
      } catch (error) {
         myUtil.error(`Nano getTransaction error: ${error}`);
         return null;
      }
   }

   generateNodes() {
      const nodes = [];
      const node_url = this.config.node_url;
      for (let i = 0; i < node_url.length; i++) {
         nodes.push({
            rpc: `http://${node_url[i].rpc}`,
            peer: `::ffff:${node_url[i].peer}`
         });
      }
      this.nodes = nodes;
      return nodes;
   }

   async generateSenders() {
      const senders = [];
      // create genesis wallet and account
      const raiClient = client({ rai_node_host: this.nodes[0].rpc });
      const genesisWallet = await raiClient.wallet_create();
      const genesisAccount = await raiClient.wallet_add({ wallet: genesisWallet.wallet, key: this.config.key });
      this.genesis = {
         ip: this.nodes[0],
         wallet: genesisWallet.wallet,
         account: genesisAccount.account
      }

      // bootstrap
      this.nodes.map(async (node) => {
         await this.bootstrap({ rpc: this.genesis.ip.rpc, peer: this.genesis.ip.peer }, { rpc: node.rpc, peer: node.peer });
      })

      // create senders and transfer money from genesis to senders
      for (let i = 0; i < this.nodes.length; i++) {
         const genesisClient = client({ rai_node_host: this.genesis.ip.rpc });
         const sendClient = client({ rai_node_host: this.nodes[i].rpc });
         const senderWallet = await sendClient.wallet_create();
         const senderAccount = await sendClient.account_create({ wallet: senderWallet.wallet });
         
         const blockObj = await genesisClient.send({ wallet: this.genesis.wallet, source: this.genesis.account, destination: senderAccount.account, amount: 100000 });

         await myUtil.sleep(4000);

         await sendClient.receive({ wallet: senderWallet.wallet, account: senderAccount.account, block: blockObj.block });

         senders.push({ ip: this.nodes[i], wallet: senderWallet.wallet, account: senderAccount.account });
      }

      this.senders = senders;
      return senders;
   }

   async generateSenderGroup(senders) {
      return senders;
   }

   generateOne() {
      return this.senders;
   }

   async generateReceiver() {
      //create receiver wallet and account
      const receiverClient = client({ rai_node_host: this.nodes[0].rpc });
      const receiverWallet = await receiverClient.wallet_create();
      const receiverAccount = await receiverClient.account_create({ wallet: receiverWallet.wallet });
      const receiver = { ip: this.nodes[0], wallet: receiverWallet.wallet, account: receiverAccount.account };
      return receiver;
   }

   generateQuery() {
      const query_url = { rpc: `http://${this.config.query_ip}:${this.config.query_port}`, peer: `` };
      const query_times = Number(this.config.query_times);
      return { query_url, query_times };
   }

   

   async bootstrap(peer1, peer2) {
      const client1 = client({ rai_node_host: peer1.rpc });
      const client2 = client({ rai_node_host: peer2.rpc });
      await client1.bootstrap({ address: peer2.peer, port: 7075 });
      await client2.bootstrap({ address: peer1.peer, port: 7075 });
   }

   async calBalance(data, receiver) {
      const receiverClient = client({ rai_node_host: receiver.ip.rpc });
      const pendingBlocks = await receiverClient.pending({ account: receiver.account, count: -1 });
      const start = new Date();
      if (pendingBlocks.blocks.length) {
         for (let i = 0; i < pendingBlocks.blocks.length; i++) {
            await receiverClient.receive({ wallet: receiver.wallet, account: receiver.account, block: pendingBlocks.blocks[i] });
         }
         const end = new Date();
         const lag = end.getTime() - start.getTime();

         return { receiveRate: lag / pendingBlocks.blocks.length / 1000 };
      }
      else return { receiveRate: 0 };
   }

   async calLatency(data) {
      const latency = data;
      const filePath = './network/nano/peer0/log';
      await exec(`mv ${filePath}/*.log ${filePath}/log.log`);
      return new Promise((resolve, reject) => {
         const result = [];
         const fReadName = `${filePath}/log.log`;
         const fRead = fs.createReadStream(fReadName);
         const objReadline = readline.createInterface({
            input: fRead
         });
         objReadline.on('line', (line) => {
            if (line.indexOf('Block ') > -1) {
               for (let i = 0; i < latency.length; i++) {
                  const block = latency[i].block;
                  if (line.indexOf(`Block ${block}`) > -1) {
                     const timeString = line.substring(1, 27);
                     const time_res = new Date([timeString.slice(0, 10), 'T', timeString.slice(11, 23), 'Z'].join(''));
                     const time_send = new Date(latency[i].time);
                     const la = time_res.getTime() - time_send.getTime();
                     result.push(la / 1000);
                     latency.splice(i, 1);
                     break;
                  }
               }
            }
         });
         objReadline.on('close', () => {
            resolve(result);
         });
      })
   }

   async throughtputHeader() {
      const header = [
         { id: 'nodes', title: 'NODE' },
         { id: 'client', title: 'CLIENT' },
         { id: 'rate', title: 'RATE' },
         { id: 'duration', title: 'DURATION' },
         { id: 'tps', title: 'TPS' },
         { id: 'receiveRate', title: 'RECEIVERATE' }
      ]
      return header;
   }

   async throughtputRecords(transactions, balance, times, nodes, senders, duration) {
      const rate = times / duration;
      const valid_trans = transactions[transactions.length - 1] - transactions[0];
      const valid_duration = 0.9 * duration;
      const tps = (valid_trans / valid_duration).toFixed(4);

      const records = [{
         nodes,
         client: senders,
         rate,
         duration: valid_duration,
         tps,
         receiveRate: balance.receiveRate
      }]
      return records;
   }

   async finalise() {
      await exec('docker stop $(docker ps -a -q)');
      await exec('docker rm $(docker ps -a -q)');

      myUtil.log('### Nano finalise success ###');
      return;
   }

}

module.exports = Nano;