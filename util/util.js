'use strict';

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class Util {

   /**
    * Perform a sleep
    * @param {*} ms the time to sleep, in ms
    * @returns {Promise} a completed promise
    */
   static sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
   }

   /**
    * Simple log method to output to the console
    * @param {any} msg messages to log
    */
   static log(...msg) {
      // eslint-disable-next-line no-console
      console.log(...msg);
   }

   /**
    * Simple log method to output to the console
    * @param {any} msg messages to log
    */
   static error(...msg) {
      // eslint-disable-next-line no-console
      console.log('!!!!!');
      console.log(...msg);
   }

   /**
    * Get the moment after a time lag
    * @param {*} lag the expected time lag, in ms
    */
   static getTime(lag) {
      return new Date(new Date().getTime() + lag);
   }

   static async csvWriter(header, records, path) { 
      const csvWriter = createCsvWriter({
         path,
         header
      });

      await csvWriter.writeRecords(records);
      this.log(`${path} write done`);
   }

   // /**
   //  * unified logging framework to output to the console and files
   //  * @param {String} name logger's name
   //  * @returns {logger} logger the winston's logger
   //  */
   // static getLogger(name) {

   //    if (global.caliperLog && global.caliperLog.logger) {
   //       return insertLoggerName(global.caliperLog.logger, name);
   //    }

   //    //see if the config has it set
   //    let config_log_setting = undefined;
   //    config_log_setting = cfUtil.getConfigSetting('core:log-file', undefined);

   //    let options = {};
   //    if (config_log_setting) {
   //       try {
   //          let config = null;
   //          if (typeof config_log_setting === 'string') {
   //             config = JSON.parse(config_log_setting);
   //          }
   //          else {
   //             config = config_log_setting;
   //          }
   //          if (typeof config !== 'object') {
   //             throw new Error('logging variable "log-file" must be an object conforming to the format documented.');
   //          } else {
   //             for (const level in config) {
   //                if (!config.hasOwnProperty(level)) {
   //                   continue;
   //                }

   //                if (LOGGING_LEVELS.indexOf(level) >= 0) {
   //                   if (!options.transports) {
   //                      options.transports = [];
   //                   }

   //                   if (config[level] === 'console') {
   //                      options.transports.push(new (winston.transports.Console)({
   //                         name: level + 'console',
   //                         level: level,
   //                         colorize: true
   //                      }));
   //                   } else {
   //                      let filePath = this.resolvePath(config[level]);
   //                      let dirName = path.dirname(filePath);
   //                      if (!fs.existsSync(dirName)) {
   //                         fs.mkdirSync(dirName);
   //                      }
   //                      options.transports.push(new (winston.transports.DailyRotateFile)({
   //                         name: level + 'file',
   //                         level: level,
   //                         filename: filePath,
   //                         datePattern: 'YYYY-MM-DD',
   //                         colorize: true,
   //                         timestamp: function () { return moment().format(); },
   //                         json: false,
   //                         maxSize: '5m',
   //                         handleExceptions: true,
   //                         formatter: logFormat
   //                      }));
   //                   }
   //                }
   //             }
   //          }

   //          let logger = new winston.Logger(options);
   //          logger.debug('Successfully constructed a winston logger with configurations', config);
   //          saveLogger(logger);
   //          return insertLoggerName(logger, name);
   //       } catch (err) {
   //          // the user's configuration from environment variable failed to parse.
   //          // construct the default logger, log a warning and return it
   //          let logger = newDefaultLogger();
   //          saveLogger(logger);
   //          logger.log('warn', 'Failed to parse logging variable "log-file". Returned a winston logger with default configurations. Error: %s', err.stack ? err.stack : err);
   //          return insertLoggerName(logger, name);
   //       }
   //    }

   //    let logger = newDefaultLogger();
   //    saveLogger(logger);
   //    logger.debug('Returning a new winston logger with default configurations:  ' + name);
   //    return insertLoggerName(logger, name);
   // }

   // /**
   //  * Creates an absolute path from the provided relative path if necessary.
   //  * @param {String} relOrAbsPath The relative or absolute path to convert to an absolute path.
   //  *                              Relative paths are considered relative to the Caliper root folder.
   //  * @return {String} The resolved absolute path.
   //  */
   // static resolvePath(relOrAbsPath) {
   //    if (!relOrAbsPath) {
   //       throw new Error('Util.resolvePath: Parameter is undefined');
   //    }

   //    if (path.isAbsolute(relOrAbsPath)) {
   //       return relOrAbsPath;
   //    }

   //    return path.join(__dirname, rootDir, relOrAbsPath);
   // }

   // /**
   //  * parse a yaml file.
   //  * @param {String} filenameOrFilepath the yaml file path
   //  * @return {object} the parsed data.
   //  */
   // static parseYaml(filenameOrFilepath) {
   //    if (!filenameOrFilepath) {
   //       throw new Error('Util.parseYaml: Parameter is undefined');
   //    }

   //    let config;
   //    try {
   //       config = yaml.safeLoad(fs.readFileSync(filenameOrFilepath), 'utf8');
   //    }
   //    catch (e) {
   //       //console.log(e);
   //       throw new Error('failed to parse the yaml file');
   //    }
   //    return config;
   // }
}

module.exports = Util;