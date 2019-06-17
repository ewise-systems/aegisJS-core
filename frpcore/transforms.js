const { from } = require("rxjs");

// toObservable :: string -> string -> string -> string -> Stream x
const toObservable = task =>
    from(
        task
        .run()
        .promise()
    );

module.exports = {
    toObservable
};