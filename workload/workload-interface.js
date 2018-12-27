
'use strict';

class WorkloadInterface {
   /**
    * Constructor
    * @param {String} configPath path of the blockchain configuration file
    */
   constructor(configPath) {
      this.configPath = configPath;
   }

   async preloadData() { 
      throw new Error('preloadData is not implemented');
   }

   async createClients() {
      throw new Error('createClients is not implemented');
   }

   async generateReport() {
      throw new Error('generateReport is not implemented');
   }

}

module.exports = WorkloadInterface;