# DAGBENCH

DAG performance evaluation tool

Currently supported DAG blockchains:

* IOTA
* Nano
* Byteball

Currently supported workloads:

* Valuetransfer
* Query

We conducted an evaluation of the three DAG solutions with the DAGBENCH, we identified some observations in a report: https://www.overleaf.com/3277718854tfscgkrpfjtv

## How to start a performance test
```
node engine.js --net iota --work valuetransfer --env local
```
* `net`: type of blockchain network
* `work`: type of workload
* `env`: type of environment, default is `local`. To implement other env platform, please rewrite `dag.init()` in different network's adaptors.

The `engine` will read the configuration file of [net]-[work].json under `network` folder and run the test accordingly.

## How to add a new DAG network
1. Create a folder under `adaptor`, create a class [newNet] extends `DAGInterface`. 
2. Create a folder under `network`, create a configuration json file for each use case: [newNet-valuetransfer.json].

## How to add a new workload

1. Create a folder under `workload`, create a class [newWork] extends `workloadInterface`, implements the workload with instance functions
2. Create configuration json files for every DAG network under `network`.

## Architecture
![DAGBENCH Achitecture](./img/Architecture.png)
Figure above illustrates the current DAGBENCH's implementation. To make all the workloads and DAG networks extensible, DAGBENCH was designed with a DAGBENCH engine, a DAG layer, an adaptation layer and a workload layer.

* DAGBENCH Engine: DAGBENCH engine will read a configuration file and load the corresponding workloads and adaptors.
* Workload Layer: A `workload-interface` is defined in workload layer, any workload class can implement this interface by calling the functions in `DAG-interface`.
* Adaptation Layer: A `DAG-interface` is defined in adaptation layer, any DAG adaptor can implement this interface with its corresponding SDK or RESTful API.
* DAG Layer: DAG network is established in DAG layer. The configuration files for different workload should be defined in this layer.

### DAGBENCH engine
![DAGBENCH Engine](./img/Engine.png)
The DAGBENCH engine is an entrance for the evaluation tool. The engine will accept three arguments: `net`, `work` and `env`. These arguments will indicate the network, workload and environment for this test. Then a `DAG` instance will be initialised and a `workload` instance will create the test.

### Workload layer
A `workload-interface` is defined in workload layer. Each workload class needs to implement the defined functions by calling adaptors.

Currently, two workloads are suppoted:

1. Value transfer: 

   This workload is a simple application that transfer coins or message from one user to another. To better collect the test result, we imitate that all sender accounts transfer coins to one receiver account so that we can easily get the test result such as account balance.

2. Data query: 

   This workload condsiders the performance of a DAG network in answering queries abou the historical data. We implement two queries:

   * Q1: Compute the number of input transactions and the bumber of output transactions for a given account.

   * Q2: Compute the number of balance for a given account.

   This workload needs to preload the historical data and then calculate the latency for the above query.

### Adaptation layer
A `DAG-interface` is defined in adaptation layer. Each DAG class needs to implement the defined functions with its corresponding SDK or RESTful API.

IOTA, Nano and Byteball are supppoted now.

### DAG layer

In this layer, each DAG network is setup and configuration files are defined. The detailed instruction on environment setup for IOTA, Nano and Byteball are listed below:

* IOTA setup:
* Byteball setup:
* Nano setup: