'use strict'

const path = require('path');
const Util = require('./util/util.js');

const DAG = require('./adaptor/DAG.js');
const Workload = require('./workload/workload.js');

const argv = require('minimist')(process.argv.slice(2));
const net = argv.net || 'iota';
const work = argv.work || 'valuetransfer';

const dagBenchDir = path.join(__dirname, '.');
const configPath = path.join(dagBenchDir, `/network/${net}/${net}-${work}.json`);
const dag = new DAG(configPath);

async function run() {

   Util.log('### DAGBENCH Test ###');
   Util.log(`### Running ${work} For ${net} ###`);

   // TODO: ENV: local or AWS

   try {
      await dag.init();

      const clientArgs = await dag.prepareClients();

      const workload = new Workload(configPath, clientArgs);
      await workload.preloadData();
      const data = await workload.createClients();

      const stats = await dag.calculate(data);
      await workload.generateReport(net, stats, clientArgs);
   } catch (error) {
      Util.error(`${net} fail in ${work}: ${error}`);
   } finally {
      await dag.finalise();
   }

}

run();