const Util = require('../../util/util.js');

class Operation {
   constructor(dagObj, clientArgs) {
      this.dagObj = dagObj;
      this.clientArgs = clientArgs;
   }

   async transferGroup(order) {
      return new Promise((resolve, reject) => {
         let send_times = 0;
         const node = this.clientArgs.nodes[order];
         const senders = this.clientArgs.senders[order];

         const duration = this.clientArgs.duration;
         const sendTill = Util.getTime(duration * 1000);

         const timer = setInterval(() => {
            if (sendTill < new Date()) {
               clearInterval(timer)
               resolve({ order, send_times, message: 'GROUP' });
            }
            else {
               this.dagObj.send(node, senders, send_times, this.clientArgs.receiver);
               send_times++
            }
         }, 1 / this.clientArgs.tx_rate * 1000);
      })
   }

   async transferOne() {
      let send_times = 0;
      const latency = [];
      const nodes = this.clientArgs.nodes;
      const senders_one = this.clientArgs.senders_one;
      const duration = this.clientArgs.duration;
      const sendTill = Util.getTime(duration * 1000);

      // TODO: set timeout error
      while (sendTill > new Date()) {
         await Util.sleep(duration * 1000 * 0.1);

         const node = nodes[send_times % nodes.length];
         const lag = await this.dagObj.sendAndWait(node, senders_one, send_times, this.clientArgs.receiver);
         if (lag) latency.push(lag);
         send_times++;
      }
      return { latency, send_times, message: 'ONE' };

   }

   async query() {
      return new Promise((resolve, reject) => {
         let balance = [];
         let transactions = [];

         const receiver = this.clientArgs.receiver;
         const query_url = this.clientArgs.query.query_url;
         const query_times = this.clientArgs.query.query_times;

         const duration = this.clientArgs.duration;
         const query_lag = (duration / query_times) * 1000;
         const sendTill = Util.getTime(duration * 1000 * 1.2);

         Util.sleep(query_lag);

         const timer = setInterval(() => {
            if (sendTill < new Date()) {
               clearInterval(timer);
               resolve({ balance, transactions, message: 'QUERY' });
            }
            else {
               this.dagObj.getBalance(query_url, receiver)
                  .then((bal) => {
                     if (bal || bal === 0) balance.push(bal);
                  })

               this.dagObj.getTransaction(query_url, receiver)
                  .then((tx) => {
                     if (tx) transactions.push(tx);
                  })
            }
         }, query_lag);
      })
   }      
}
module.exports = Operation;