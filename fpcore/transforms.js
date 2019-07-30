const { fromPromised } = require('folktale/concurrency/task');

const promiseToTask = promise => fromPromised(() => promise);

module.exports = {
    promiseToTask
};