'use strict'

const path = require('path');
const Util = require('./util/util.js');

const DAG = require('./adaptor/DAG.js');
const Workload = require('./workload/workload.js');

const argv = require('minimist')(process.argv.slice(2));
const net = argv.net || 'byteball';
const work = argv.work || 'query';
const env = argv.env || 'local';

const dagBenchDir = path.join(__dirname, '.');
const configPath = path.join(dagBenchDir, `/network/${net}/${net}-${work}.json`);
const dag = new DAG(configPath);

async function run() {

   Util.log('### DAGBENCH Test ###');
   Util.log(`### Running ${work} For ${net} ###`);

   try {
      await dag.init(env);

      const workload = new Workload(configPath, dag);
      await workload.prepareClients();
      await workload.preloadData();
      await workload.createClients();
      await workload.calculate();
      await workload.generateReport(net);

      Util.log(`### ${work} For ${net} success ###`);
   } catch (error) {
      Util.error(`${net} fail in ${work}: ${error}`);
   } finally {
      await dag.finalise();
   }
}

run();