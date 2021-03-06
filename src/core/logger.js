/*
 * JsBerry
 * Source: https://github.com/Dugnist/jsberry
 *
 * logger
 *
 * Author: Dugnist Alexey (@Dugnist)
 * Released under the MIT license
 */

const CONFIG = require('./config')();
const fs = require('fs');
const chalk = require('chalk');

module.exports = class Logger {
  /**
   * [constructor description]
   * @param  {String} context [description]
   */
  constructor(context = '') {
    this.context = context;
    this.init();
  }

  /**
   * Init name and path for logs file
   */
  init() {
    const logs = CONFIG.logs || 'logs';

    this.nowDate = new Date( Date.now() ).toLocaleString();

    fs.exists(logs, (exists) => {
      if (!exists) fs.mkdir(logs, () => {});
    });

    this.fPath = `${logs}/${ this.nowDate.replace(/[/ ,:]/g, '_') }.log`;
  }

  /**
   * [writeToFile description]
   * @param  {[type]} type    [description]
   * @param  {[type]} message [description]
   */
  writeToFile(type = '', message = '') {
    const record = this.toJSON({ type, message });

    // maybe if folder not exists create new one instead of error?
    fs.writeFile(this.fPath, record, (err) => this.logMessage(err, chalk.red));
  }

  /**
   * [clear description]
   */
  clear() {
    fs.exists(this.fPath, (exists) => {
      if (exists) {
        fs.unlink(this.fPath, (err) => {
          if (err) this.error('Can\'t delete log file', err);
        });
      }
    });
  }

  /**
   * [log description]
   * @param  {String} message - [description]
   */
  log(message = '') {
    this.logMessage(this.toJSON(message), chalk.green);
  }

  /**
   * [warn description]
   * @param  {String} message - [description]
   */
  warn(message = '') {
    this.logMessage(this.toJSON(message), chalk.yellow);
    this.fileLogger('warn', message);
  }

  /**
   * [error description]
   * @param  {String} message - [description]
   * @param  {String} trace - [description]
   */
  error(message = '', trace = '') {
    this.logMessage(this.toJSON(message), chalk.red);
    this.printStackTrace(trace);
    this.fileLogger('error', message, trace);
  }

  /**
   * [fileLogger description]
   * @param  {String} type  [description]
   * @param  {String} message  [description]
   * @param  {String} trace [description]
   */
  fileLogger(type = 'error', message = '', trace = '') {
    const mode = CONFIG.mode || 'prod';

    if (mode === 'prod') {
      this.writeToFile(type, `${message} ${this.toJSON(trace)
        .replace(/\\n|"/g, '')}`);
    }
  }

  /**
   * [logMessage description]
   * @param  {String} message [description]
   * @param  {String} color   [description]
   */
  logMessage(message = '', color = '') {
    const mode = CONFIG.name || 'Logger';

    process.stdout.write(`\n`);
    process.stdout.write(color(`${CONFIG.name} ${process.pid} - `));
    process.stdout.write(`${this.nowDate}  `);
    process.stdout.write(chalk.yellow(`[${this.context}] `));
    process.stdout.write(color(message));
    process.stdout.write(`\n`);
  }

  /**
   * [printStackTrace description]
   * @param  {String} trace [description]
   */
  printStackTrace(trace = '') {
    console.log(trace);
  }

  /**
   * [toJSON description]
   * @param  {Object} reference - any object
   * @return  {String} converted json string
   */
  toJSON(reference = {}) {
    return JSON.stringify(reference);
  }
};
