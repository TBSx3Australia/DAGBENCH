# DAGBENCH

DAG performance evaluation tool

## how to add a new DAG network
1. Create a folder under `adaptor`, create a class [newNet] extends `DAGInterface`. 
2. Create a folder under `network`, create a configuration json file for each use case: [newNet-valuetransfer.json].

## how to add a new workload

1. Create a folder under `workload`, create a class [newWork] extends `workloadInterface`, implement the workload with adaptor's function.
2. Create configuration json files for every DAG network under `network`.