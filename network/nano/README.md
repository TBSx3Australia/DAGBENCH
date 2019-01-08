# Nano-Testnet-Environment

This document will describe the detailed steps on how to setup the test net of Nano in local env and AWS env.

If you are not familar with the concept and components of Nano, please see: https://developers.nano.org/guides/node-setup/

## Prerequsite
* Docker
* AWS

## Local ENV

When building local environment for Nano, we first pull the Nano git repository and build a test net docker image:

1. recursive pull git repository:
   ```
   git clone --recursive https://github.com/nanocurrency/raiblocks.git
   ```

2. docker build test image:
   ```
   ./docker/node/build.sh -n test
   ```

3. run multiple nodes with `start-network.sh`
   ```
   ./start-network.sh -n 2
   ```

4. edit config.json
If you don't provide 'config.json' under the root repository of your docker container, the image will generate a default 'config.json' file under this folder. But if you want to change some settings, such as port number or peers, you need to save a customised 'config.json' under this folder before you run the docker containers. In this way, the container will read this 'config.json' and run accordingly. The 'config.json' should look like this:
   ```
   {
   "version": "2",
   "rpc_enable": "true",
   "rpc": {
      "address": "::ffff:0.0.0.0",
      "port": "7076",
      "enable_control": "true",
      "frontier_request_limit": "16384",
      "chain_request_limit": "16384"
   },
   "node": {
      "peering_port": "7075",
      "bootstrap_fraction_numerator": "1",
      "receive_minimum": "1000000000000000000000000",
      "logging": {
         ...
      },
      "work_peers": "",
      "preconfigured_peers": [
         "13.211.141.65",
         "52.63.22.136",
         "13.239.115.24",
         "13.211.158.217",
         "13.236.183.202",
         "54.252.234.34",
      ],
      "preconfigured_representatives": [
         ...
      ],
      ...
   },
   "opencl_enable": "false",
   "opencl": {
      ...
   }
   }
   ```

* some fields are replaced with '...', you can check the full settings here: https://github.com/nanocurrency/raiblocks/wiki/config.json
* **preconfigured_peers** is where you put the IP of all your peers

5. initial bootstrap
The peers need to multual boostrap so that they can commnunicate, so you need to call bootstrap command before you use the network.
```
bootstrap with RPC protocol:
curl -d '{"action": "bootstrap","address": "::ffff:13.211.141.65","port": "7075" }' 52.63.22.136:7076
```
* you can check all the RPC commands here: https://github.com/nanocurrency/raiblocks/wiki/RPC-protocol#statistics

## AWS ENV
If you are not familiar with AWS, please see: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

On AWS ENV, each AWS instance will only host one node. This will better imitate the real environment of blockchain network.

Before starting the test net, you need to install docker and build docker image the way described above.

Since each node locates on an independent AWS instance, the ip address of all other neighbours should be passed as a parameter when creating the network. This leads to the difference of the start network script:

1. run `nano-aws-node.sh` under aws repository on each AWS instance
```
./nano-aws-node.sh -m ip1 -m ip2 -n 8 -s 0
```
* -m: list of instances ip, you can generate this option with 'aws_option.js'
* -n: number of neighbors
* -s: sequence of the instance among the whole nodes group
