'use strict';

const DAG = require('../../adaptor/DAG.js');
const Operation = require('./operation.js');


process.on('message', async (m) => {

   let result = {}
   const dag = new DAG(m.dagPath);
   const operation = new Operation(dag, m.arg);

   if (m.id === 'QUERY') result = await operation.query();
   else if (m.id === 'ONE') result = await operation.transferOne();
   else result = await operation.transferGroup(m.order);

   process.send(result);
   process.disconnect();
});

