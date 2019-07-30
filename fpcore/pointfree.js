const { compose, curry, isNil, not, nth, slice, flip, indexOf, } = require("ramda");

// addProp :: {a: b} -> a -> c -> {a: b, a: c}
const addProp = curry((obj, key, value) =>
    ({ ...obj, [key]: value })
);

// appendProp :: a -> b -> {a: c} -> {a: b, a: c}
const appendProp = curry((key, value, obj) =>
    ({ ...obj, [key]: value })
);

// either :: (a -> c) -> (b -> c) -> Either a b -> c
const either = curry((f, g, e) =>
    e.matchWith({
        Error: x => console.log(101, x) || f(x),
        Ok: x => console.log(102, x) || g(x)
    })
);

// toNull :: _ -> null
const toNull = _ => null;

// id :: a -> a
const id = a => a;

// getOrElseNull :: Folktale/Result a -> ?(a)
const getOrElseNull = a => a.getOrElse(null);

const getLastEl = nth(-1);

const getFirstToSecondLastEls = slice(0, -1);

const popLastEl = x => [getFirstToSecondLastEls(x), getLastEl(x)];

const isNotNil = compose(not, isNil);

const indexIn = flip(indexOf);

module.exports = {
    addProp,
    appendProp,
    either,
    toNull,
    id,
    getOrElseNull,
    getLastEl,
    getFirstToSecondLastEls,
    popLastEl,
    isNotNil,
    indexIn
};