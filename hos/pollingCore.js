const { curry, equals, nth } = require("ramda");
const { timer, throwError, interval , of} = require("rxjs");
const { expand, bufferCount, take, takeWhile, retryWhen, mergeMap, filter, map, flatMap, catchError } = require("rxjs/operators");

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

//retryLimit -1 to always retry
const kickstartpoll$ = curry((pollingInterval, retryLimit, retryDelay, pred, iStream) =>
    interval(pollingInterval)
    .pipe(
        flatMap(() => iStream()),
        takeWhile(pred, true),
        retryWhen(err$ => 
            err$.pipe(
                mergeMap((err, i) =>
                    retryLimit != -1 && i > retryLimit ? throwError() : timer(retryDelay)
                )
            )
        ),
    )
);

const kickstartpollstoponerror$ = curry((pollingInterval, pred, iStream) =>
    interval(pollingInterval)
    .pipe(
        flatMap(() => iStream()),
        takeWhile(pred, true),
        catchError(of),
    )
);

module.exports = {
    kickstart$,
    kickstartpoll$,
    kickstartpollstoponerror$
};