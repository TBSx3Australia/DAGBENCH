class clientArg {

   constructor(config, nodes, senders, senders_one, receiver, query) { 
      this.clientArg = {
         sender_num: config.sender_num,
         duration: Number(config.duration),
         tx_rate: config.tx_rate,
         nodes,
         senders,
         senders_one,
         receiver,
         query
      };
   }

   getClientArg() {
      return this.clientArg;
   }
   
}

module.exports = clientArg;