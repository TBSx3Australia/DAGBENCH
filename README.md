# DAGBENCH

DAG performance evaluation tool

Currently supported DAG blockchains:

* IOTA
* Nano
* Byteball

Currently supported workloads:

* Valuetransfer
* Query

## how to start a performance test
```
node engine.js --net iota --work valuetransfer --env local
```
* `net`: type of blockchain network
* `work`: type of workload
* `env`: type of environment, default is `local`. To implement other env platform, please rewrite `dag.init()` in different network's adaptors.

The `engine` will read the configuration file of [net]-[work].json under `network` folder and run the test accordingly.

## how to add a new DAG network
1. Create a folder under `adaptor`, create a class [newNet] extends `DAGInterface`. 
2. Create a folder under `network`, create a configuration json file for each use case: [newNet-valuetransfer.json].

## how to add a new workload

1. Create a folder under `workload`, create a class [newWork] extends `workloadInterface`, implements the workload with instance functions
2. Create configuration json files for every DAG network under `network`.