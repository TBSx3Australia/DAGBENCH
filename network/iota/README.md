# IOTA-Testnet-Environment

This document will describe the detailed steps on how to setup the test net of IOTA in local env and AWS env.

If you are not familar with the concept and components of IOTA, please see: https://domschiener.gitbooks.io/iota-guide/content/

## Prerequsite
* Docker
* Java 8
* Maven
* AWS

## Local ENV

When building local environment for IOTA, we use docker image to build the testnet.

1. pull official docker image from:

   ```
   docker pull iotaledger/iri:version
   ```

2. generate seeds and Snapshot file for your test net

   ```
   java -jar iota-coo.jar SnapshotBuilder
   ```

   iota-coo.jar is built based on [private iota testnet](https://github.com/schierlm/private-iota-testnet)

   Seeds are output to `seeds.txt`

   Snapshot file is `Snapshot.txt`

   The relation of seeds and their addresses are in `Snapshot.log`

   The snapshot.txt should look like this:
   ```
   HZXESLTUYCZHPQUSKOCDCDC9HLPNKDFYS9SBEF9XLFLSYZUZYYUHBLAMBWEXVWQWQHUNONVSCZZYJYMVA;1
   QJH9APQSQTM9JKQXDVAQXU9MXQVZDOUWILYOHARWRPHEUFUPJXKBRF9GDOXFYIFLNDHZFZFSTGCFURNUA;2779530283277760
   ```
   2,779,530,283,277,761 is the total avaliable IOTA. 

3. how to write an initiation file:

   The initiation file should write like this:

   ```
   [IRI]
   PORT = 14002
   UDP_RECEIVER_PORT = 15002
   TCP_RECEIVER_PORT = 16002
   NEIGHBORS = udp://172.17.0.12:15001 udp://172.17.0.14:15003
   TESTNET = TRUE
   DONT_VALIDATE_TESTNET_MILESTONE_SIG = TRUE
   SNAPSHOT_FILE = /iri/data/Snapshot.txt
   IRI_OPTIONS = "--remote"
   ```

   * You need to assign different PORT, UDP_RECEIVER_PORT and TCP_RECEIVER_PORT for different node to ensure no conflict. 
   * SNAPSHOT_FILE: is where you put the path of your snapshot.txt file in docker directory.
   * NEIGHBORS: In IOTA, the node that you want to directly connect with is called 'Neighbor'. This config field is where you put the Protocol, IP and port of all neighbors you want to connect with.

4. run a test net with [start-network.sh](./aws_env/start-network.sh)

   With [start-network.sh](./aws_env/start-network.sh), you can run a few docker containers with one script. It will generate the .ini files for the given number of nodes that you want to create  based on 'config-template.ini'and run docker containers to build the whole test net.
   
   Run it with:
   ```
   ./start-network.sh -n 5
   ```
   -n: number of nodes of the test net

5. how to build and use coordinator
   Making coordinator to issue zero-value transactions to validate the previous transactions is the only way to make transactions be confirmed in current IOTA implementation (in Nov/2018).

   You can call coordinator once by:
   ```
   java -jar benchmark/iota/local_env/iota-coo.jar Coordinator [ip] [port]
   ```
   You can also call it periodically by setting the interval:
   ```
   java -jar benchmark/iota/local_env/iota-coo.jar PeriodicCoordinator -host [ip] -port [port] -interval 60
   ```

6. install iota packages

   ```
   npm install @iota/core
   ```
   npm install @iota/converter
   ```


## AWS ENV

If you are not familiar with AWS, please see: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

On AWS ENV, each AWS instance will only host one node. This will better imitate the real environment of blockchain network.

Before starting the test net, you need to install docker and pull iota docker image for each instance. You can also build an AWS image for convinence.

Since each node locates on an independent AWS instance, the ip address of all other neighbours should be passed as a parameter when creating the network. This leads to the difference of the start network script:


1. run `iota-aws-node.sh` under aws repository on each AWS instance
```
./iota-aws-node.sh -m ip1 -m ip2 -n 8 -s 0
```
* -m: list of instances ip, you can generate this option with 'aws_option.js'
* -n: number of neighbors
* -s: sequence of the instance among the whole nodes group
