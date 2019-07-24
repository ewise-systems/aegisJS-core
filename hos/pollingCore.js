const { curry, equals, nth } = require("ramda");
const { timer, throwError } = require("rxjs");
const { expand, bufferCount, take, takeWhile, retryWhen, mergeMap, filter, map } = require("rxjs/operators");

// kickstart$ :: (a -> boolean) -> (_ -> Stream x) -> (_ -> Stream x) -> Stream x
const kickstart$ = curry((retryLimit, retryDelay, pred, iStream, hStream) =>
    iStream()
    .pipe(
        take(1),
        expand(({processId: pid}) => hStream(pid)),
        bufferCount(2, 1),
        filter(([a, b]) => !equals(a, b)),
        map(nth(1)),
        retryWhen(err$ =>
            err$.pipe(
                mergeMap((err, i) =>
                    i > retryLimit ||
                    err === 500 ?
                    throwError(err) :
                    timer(retryDelay)
                )
            )
        ),
        takeWhile(pred, true)
    )
);

module.exports = {
    kickstart$
};