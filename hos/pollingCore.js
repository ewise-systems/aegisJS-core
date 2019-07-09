const { curry, equals, nth } = require("ramda");
const { of } = require("rxjs");
const { expand, bufferCount, catchError, take, takeWhile, filter, map } = require("rxjs/operators");

// kickstart$ :: (a -> boolean) -> (_ -> Stream x) -> (_ -> Stream x) -> Stream x
const kickstart$ = curry((pred, iStream, hStream) =>
    iStream()
    .pipe(
        take(1),
        expand(({processId: pid}) => hStream(pid)),
        bufferCount(2, 1),
        filter(([a, b]) => !equals(a, b)),
        map(nth(1)),
        takeWhile(pred, true),
        catchError(x => of(x))
    )
);

module.exports = {
    kickstart$
};