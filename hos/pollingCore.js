const { curry, equals } = require("ramda");
const { timer, throwError , of} = require("rxjs");
const { expand, distinctUntilChanged, take, takeWhile, retryWhen, mergeMap, flatMap, catchError } = require("rxjs/operators");

// createRecursivePollStream$ :: (a -> boolean) -> (_ -> Stream x) -> (_ -> Stream x) -> Stream x
const createRecursivePollWithRetryStream = curry((retryLimit, retryDelay, pred, iStream, hStream) =>
    iStream()
    .pipe(
        take(1),
        expand(({processId: pid}) => hStream(pid)),
        distinctUntilChanged((a,b) => equals(a, b)),
        retryWhen(err$ =>
            err$.pipe(
                mergeMap((err, i) =>
                    i > retryLimit ||
                    err.status === 500 ?
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