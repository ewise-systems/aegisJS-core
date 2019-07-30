const { curry, equals, nth } = require("ramda");
const { timer, throwError , of} = require("rxjs");
const { expand, bufferCount, take, takeWhile, retryWhen, mergeMap, filter, map, flatMap, catchError, delay } = require("rxjs/operators");

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

// kickstart$ :: (a -> boolean) -> (_ -> Stream x) -> (_ -> Stream x) -> Stream x
const kickstartwithdelay$ = curry((retryLimit, retryDelay, pred, iStream, hStream, pollingInterval) =>
    iStream()
    .pipe(
        take(1),
        expand(({processId: pid}) => hStream(pid).pipe(delay(pollingInterval))),
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
        takeWhile(pred, true),
    )
);

//retryLimit -1 to always retry
const kickstartpoll$ = curry((pollingInterval, retryLimit, retryDelay, pred, iStream) =>
    timer(0, pollingInterval)
    .pipe(
        flatMap(() => iStream()),
        takeWhile(pred),
        retryWhen(err$ => 
            err$.pipe(
                mergeMap((err, i) =>
                    retryLimit != -1 && i > retryLimit ? throwError(err) : timer(retryDelay)
                )
            )
        ),
    )
);

const kickstartpollstoponerror$ = curry((pollingInterval, pred, iStream) =>
    timer(0, pollingInterval)
    .pipe(
        flatMap(() => iStream()),
        takeWhile(pred, true),
        catchError(of),
    )
);

module.exports = {
    kickstart$,
    kickstartwithdelay$,
    kickstartpoll$,
    kickstartpollstoponerror$
};