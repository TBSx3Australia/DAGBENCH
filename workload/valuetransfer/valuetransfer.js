'use strict';

const path = require('path');
const childProcess = require('child_process');

const WorkloadInterface = require('../workload-interface.js');
const Util = require('../../util/util.js');
const ClientArg = require('./clientArg.js');
class ValueTransfer extends WorkloadInterface {

   constructor(configPath, dag) {
      super(configPath, dag);
      this.configPath = configPath;
      this.dag = dag;
      this.workType = 'valuetransfer';
   }

   async prepareClients() {
      this.config = require(this.configPath);

      const nodes = await this.dag.generateNodes();
      const senders = await this.dag.generateSenders();
      const senders_one = await this.dag.generateOne();
      const receiver = await this.dag.generateReceiver();
      const query = await this.dag.generateQuery();

      const clientArg = new ClientArg(this.config, nodes, senders, senders_one, receiver, query);

      this.clientArgs = clientArg.getClientArg();

      return;
   }

   async preloadData() {
      return;
   }

   async createClients() {
      return new Promise((resolve, reject) => {
         const client_num = this.clientArgs.sender_num + 2;
         const clientDir = path.join(__dirname, '.');
         const clientPath = path.join(clientDir, `/client.js`);

         let balance = [];
         let transactions = [];
         let latency = [];
         let times = 0;

         let num = 0;
         for (let i = 0; i < client_num; i++) {
            const client = childProcess.fork(clientPath);

            if (i === client_num - 1) client.send({ id: 'QUERY', arg: this.clientArgs, dagPath: this.configPath });
            else if (i === client_num - 2) client.send({ id: 'ONE', arg: this.clientArgs, dagPath: this.configPath });
            else client.send({ order: i, id: 'GROUP', arg: this.clientArgs, dagPath: this.configPath });

            client.on('message', (m) => {
               console.log('parent got message:', m, num++);
               balance = m.balance || balance;
               transactions = m.transactions || transactions;
               latency = m.latency || latency;
               times += m.send_times || 0;
               if (num === Number(client_num)) {
                  Util.log(`### ${this.workType} success! ###`);
                  // resolve({ balance, transactions, latency, times});
                  this.data = { balance, transactions, latency, times };
                  resolve();
               }
            });

         }
         
      })
   }

   async calculate() {
      const stats = {
         transactions: await this.dag.calTransactions(this.data.transactions),
         balance: await this.dag.calBalance(this.data.balance),
         latency: await this.dag.calLatency(this.data.latency),
         times: await this.dag.calTimes(this.data.times),
      };
      this.stats = stats;
      return;
   }

   async generateReport(net) {

      await this.generateThroughput(net,this.stats.transactions, this.stats.balance, this.stats.times, this.clientArgs.nodes.length, this.clientArgs.sender_num, this.clientArgs.duration);

      await this.generateLatency(net, this.stats.latency, this.stats.times, this.clientArgs.nodes.length, this.clientArgs.sender_num, this.clientArgs.duration);
   }

   async generateThroughput(net, transactions, balance, times, nodes, senders, duration) {

      const rate = times / duration;
      const confirmed = balance[balance.length - 1] - balance[0];
      const valid_trans = transactions[transactions.length - 1] - transactions[0];
      const valid_duration = 0.9 * duration;
      const tps = (valid_trans / valid_duration).toFixed(4);
      const ctps = (confirmed / valid_duration).toFixed(4);
      
      const timestamp = new Date().toString().substring(4, 24)
      const path = `./workload/valuetransfer/report/${net}-throughput-${timestamp}.csv`
      const header = [
         { id: 'nodes', title: 'NODE' },
         { id: 'client', title: 'CLIENT' },
         { id: 'rate', title: 'RATE' },
         { id: 'duration', title: 'DURATION' },
         { id: 'tps', title: 'TPS' },
         { id: 'ctps', title: 'CTPS' }
      ]
      const records = [{
         nodes,
         client: senders,
         rate,
         duration: valid_duration,
         tps,
         ctps
      }]

      await Util.csvWriter(header, records, path);
   }

   async generateLatency(net, latency, times, nodes, senders, duration) { 
      const min = (Math.min(...latency)).toFixed(4);
      const max = (Math.max(...latency)).toFixed(4);
      const average = (latency.reduce((a, b) => a + b, 0) / latency.length).toFixed(4);
      const rate = times / duration;

      const timestamp = new Date().toString().substring(4, 24);
      const path = `./workload/valuetransfer/report/${net}-latency-${timestamp}.csv`;
      const header = [
         { id: 'nodes', title: 'NODE' },
         { id: 'client', title: 'CLIENT' },
         { id: 'rate', title: 'RATE' },
         { id: 'duration', title: 'DURATION' },
         { id: 'min', title: 'MIN' },
         { id: 'max', title: 'MAX' },
         { id: 'average', title: 'AVERAGE' },
      ];
      const records = [{
         nodes,
         client: senders,
         rate,
         duration: 0.9 * duration,
         min,
         max,
         average
      }];

      await Util.csvWriter(header, records, path);
   }

}

module.exports = ValueTransfer;