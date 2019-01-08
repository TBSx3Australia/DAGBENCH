'use strict';

const path = require('path');
const childProcess = require('child_process');

const WorkloadInterface = require('../workload-interface.js');
const Util = require('../../util/util.js');

class Query extends WorkloadInterface {
   constructor(configPath, dag) {
      super(configPath, dag);
      this.configPath = configPath;
      this.dag = dag;
      this.workType = 'query';
   }

   async prepareClients() {
      this.config = require(this.configPath);

      const clientArgs = {
         nodes: await this.dag.generateNodes(),
         senders: await this.dag.generateSenders(),
         receiver: await this.dag.generateReceiver(),
         block_length: this.config.block_length
      }

      this.clientArgs = clientArgs;
      return;
   }

   async preloadData() {
      // senders transfer money to receiver
      const transferIn = this.clientArgs.block_length;

      for (let i = 0; i < transferIn; i++) {
         await this.dag.sendAsync(this.clientArgs.nodes[0], this.clientArgs.senders, i, this.clientArgs.receiver);
      }

      return;
   }

   async createTest() {
      await Util.sleep(4000);
      
      const start_Q1 = new Date();
      await this.dag.getHistory(this.clientArgs.nodes[0], this.clientArgs.senders, this.clientArgs.receiver);
      const lag_Q1 = new Date().getTime() - start_Q1.getTime();

      const start_Q2 = new Date();
      await this.dag.getBalance(this.clientArgs.nodes[0], this.clientArgs.receiver);
      const lag_Q2 = new Date().getTime() - start_Q2.getTime();
      
      this.lags = {
         'q1': lag_Q1,
         "q2": lag_Q2
      }
      return;
   }

   async calculate() {
      return;
   }

   async generateReport(net) {
      const timestamp = new Date().toString().substring(4, 24);
      const path = `./workload/query/report/${net}-latency-${timestamp}.csv`;
      const header = [
         { id: 'length', title: 'BLOCK_LENGTH' },
         { id: 'q1', title: 'Q1' },
         { id: 'q2', title: 'Q2' }
      ];
      const records = [{
         length: this.clientArgs.block_length,
         q1: this.lags.q1 / 1000,
         q2: this.lags.q2 / 1000
      }];
      await Util.csvWriter(header, records, path);
   }
}

module.exports = Query;