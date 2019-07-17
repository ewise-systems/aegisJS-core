const { from } = require("rxjs");

// toObservable :: string -> string -> string -> string -> Stream x
const taskToObservable = task =>
    from(
        task
        .run()
        .promise()
    );

module.exports = {
    taskToObservable
};