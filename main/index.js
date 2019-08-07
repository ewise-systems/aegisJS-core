const { BehaviorSubject } = require("rxjs");
const { task } = require("folktale/concurrency/task");
const { compose, curry, equals, identity, prop, pipe } = require("ramda");
const { popLastEl, indexIn } = require("../fpcore/pointfree");
const { taskToObservable, streamToTask } = require("../frpcore/transforms");
const {
    createRecursivePollWithRetryStream,
    createIntervalPollWithRetryStream,
    createIntervalPollStream
} = require("../hos/pollingCore");

const createRecursivePollStream = stopStreamCondition => (args = {}) => {
    const {
        retryLimit, retryDelay,
        start, afterStart = identity,
        check, afterCheck = identity,
        resume, stop
    } = args;

    const subject$ = new BehaviorSubject({ processId: null });
    const initialStreamFactory = compose(afterStart, taskToObservable, start);
    const pollingStreamFactory = compose(afterCheck, taskToObservable, check);

    const unsafeStartExec = () => createRecursivePollWithRetryStream(
        retryLimit,
        retryDelay,
        stopStreamCondition,
        initialStreamFactory,
        pollingStreamFactory
    ).subscribe(
        data => subject$.next(data),
        err => subject$.error(err),
        () => subject$.complete()
    ) && subject$;
    const unsafeResumeExec = resume && curry(resume)(() => subject$.getValue().processId);
    const unsafeStopExec = () => stop(subject$.getValue().processId);

    return {
        run: unsafeStartExec,
        resume: unsafeResumeExec,
        stop: unsafeStopExec
    };
};

const createRecursivePDVPollStream = createRecursivePollStream(
    pipe(
        prop("status"),
        indexIn(["error", "partial", "stopped", "done"]),
        equals(-1)
    )
);

const createRecursiveDownloadPollStream = createRecursivePollStream(
    pipe(
        prop("status"),
        indexIn(["FAILED", "READY"]),
        equals(-1)
    )
);

const createTaskFromStream = fn => (...fnArgs) => {
    const [args, startTask] = popLastEl(fnArgs);
    const taskFactory = compose(streamToTask, fn);
    const streamFactory = compose(taskToObservable, startTask);
    return task(({reject, resolve}) =>
        taskFactory(...args, streamFactory)().run()
        .listen({
            onResolved: resolve,
            onRejected: reject
        })
    );
};

const createTaskFromIntervalRetryPollStream = createTaskFromStream(createIntervalPollWithRetryStream);

const createTaskFromIntervalPollStream = createTaskFromStream(createIntervalPollStream);

module.exports = {
    createRecursivePollStream,
    createRecursivePDVPollStream,
    createRecursiveDownloadPollStream,
    createTaskFromStream,
    createTaskFromIntervalRetryPollStream,
    createTaskFromIntervalPollStream
};