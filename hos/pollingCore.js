const { curry, equals, nth } = require("ramda");
const { timer, throwError , of} = require("rxjs");
const { expand, bufferCount, take, takeWhile, retryWhen, mergeMap, filter, map, flatMap, catchError } = require("rxjs/operators");

// createRecursivePollStream$ :: (a -> boolean) -> (_ -> Stream x) -> (_ -> Stream x) -> Stream x
const createRecursivePollWithRetryStream = curry((retryLimit, retryDelay, pred, iStream, hStream) =>
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

const createIntervalPollWithRetryStream = curry((pollingInterval, retryLimit, retryDelay, pred, iStream) =>
    timer(0, pollingInterval)
    .pipe(
        flatMap(() => iStream()),
        takeWhile(pred),
        retryWhen(err$ => 
            err$.pipe(
                mergeMap((err, i) =>
                    i > retryLimit ?
                    throwError(err) :
                    timer(retryDelay)
                )
            )
        ),
    )
);

const createIntervalPollStream = curry((pollingInterval, pred, iStream) =>
    timer(0, pollingInterval)
    .pipe(
        flatMap(() => iStream()),
        takeWhile(pred, true),
        catchError(of),
    )
);

module.exports = {
    createRecursivePollWithRetryStream,
    createIntervalPollWithRetryStream,
    createIntervalPollStream
};