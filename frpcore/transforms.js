const { from } = require("rxjs");
const { compose } = require("ramda");
const { promiseToTask } = require("../fpcore/transforms");

// toObservable :: string -> string -> string -> string -> Stream x
const taskToObservable = task =>
    from(
        task
        .run()
        .promise()
    );

const streamToPromise = stream$ => stream$.toPromise();

const streamToTask = compose(promiseToTask, streamToPromise);

module.exports = {
    taskToObservable,
    streamToPromise,
    streamToTask
};