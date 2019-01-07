
'use strict';

class WorkloadInterface {
   /**
    * Constructor
    * @param {String} configPath path of the blockchain configuration file
    */
   constructor(configPath,dag) {
      this.configPath = configPath;
      this.dag = dag;
   }

   async prepareClients() {
      throw new Error('prepareClients is not implemented');
   }

   async preloadData() { 
      throw new Error('preloadData is not implemented');
   }

   async createTest() {
      throw new Error('createTest is not implemented');
   }

   async calculate() { 
      throw new Error('calculate is not implemented');
   }

   async generateReport() {
      throw new Error('generateReport is not implemented');
   }

}

module.exports = WorkloadInterface;