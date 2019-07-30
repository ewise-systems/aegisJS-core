const { curry } = require("ramda");
const { delay } = require("rxjs/operators");

const addDelay = curry((period, stream$) =>
    stream$.pipe(
        delay(period)
    )
);

module.exports = {
    addDelay
};