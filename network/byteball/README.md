# Byteball-Testnet-Environment

This document will describe the detailed steps on how to setup the test net of Byteball in local env and AWS env.

If you are not familar with the concept and components of Byteball, please see: https://medium.com/@Suirelav/introduction-to-byteball-part-1-why-ab3ff6a7a8f2 and https://byteballjs.com/

## Resource
The testnet we built is based on:
1. https://github.com/byteball/byteball-hub
2. https://github.com/byteball/byteball-witness
3. https://github.com/guantau/byteball-genesis
4. https://byteballjs.com/

## Prerequsite
Node v8.9.4
nvm
pm2
AWS

## Local ENV
1. Install NodeJS and Tools

Install NodeJS version control tool NVM:

```bash
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
```

Check if NVM is installed successfully:

```bash
$ nvm -v
```

Install NodeJS v8.9.4 LTS:

```bash
$ nvm install 8.9.4
```

Install NodeJS process management tool:

```bash
$ npm install pm2 -g
```

Install NodeJS code compile tool:

```bash
$ npm install node-gyp -g
```

2. Download source codes

Download `byteball-genesis` source code:

```bash
$ git checkout https://github.com/guantau/byteball-genesis
$ cd genesis
$ npm install
```

Change to the directory `src`, and download `byteball-witness`, `byteball-explorer` and `byteball-hub`:

```bash
$ cd src/
$ git checkout https://github.com/byteball/byteball-explorer
$ cd byteball-explorer; npm install
$ git checkout https://github.com/byteball/byteball-hub
$ cd byteball-hub; npm install
$ git checkout https://github.com/byteball/byteball-witness
$ cd byteball-witness; npm install
```

3. Generate and modify config files

```bash
$ npm run init
```

Generated config files are in directory `wallets`, this will generate the address of 12 witnesses and genesis account.

Modify the `explorer-conf.js` and `hub-conf.js` in the directory `config`, and fill the addresses in `exports.initial_witnesses`.

You can change the host ip address of both hub and witness in corresponding configuration file under the directory `config`. 

When setting up multiple hubs environment, you can add initial peers of the hub in the hub-conf.js` in the directory `config`.

4. Create the genesis unit

```bash
$ npm run create_bytes
```

It will output `Genesis unit: ` and the hash of the genesis unit. Modify the `constants.js` in the directory `config`, and fill the hash in `exports.GENESIS_UNIT`.

5. Deploy nodes

```bash
$ npm run deploy
```

6. Start nodes

```bash
$ npm run start
```

After the nodes are starts, check the `Hub` node's log, and see other nodes are connected, such as `13 incoming connections, 0 outgoing connections, 0 outgoing connections being opened`.

```bash
$ pm2 logs hub
```

7. Send the genesis unit

```bash
$ npm run create_bytes
```

After that, you can send transactions to the network.

## AWS ENV
If you are not familiar with AWS, please see: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

On AWS ENV, each AWS instance will only host one node. This will better imitate the real environment of blockchain network.

Since we don't use docker when setting up Byteball environment, we just pull the above repository on AWS.

We run one hub on each instance, and modify the initial peers with other instance's ip address so the hubs can connect with each other.


## installation issues:
1. sqlite3 cannot install solution: change node version to v 8.9.4, from https://github.com/guantau/byteball-genesis

