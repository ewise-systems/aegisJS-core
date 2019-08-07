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
        Error: x => f(x),
        Ok: x => g(x)
    })
);

// toNull :: _ -> null
const toNull = _ => null;

// getOrElseNull :: Folktale/Result a -> ?(a)
const getOrElseNull = a => a.getOrElse(null);

// getLastEl :: [a] -> a
const getLastEl = nth(-1);

// getFirstToSecondLastEls :: [a] -> [a]
const getFirstToSecondLastEls = slice(0, -1);

// popLastEl :: [a] -> [[a], a]
const popLastEl = x => [getFirstToSecondLastEls(x), getLastEl(x)];

// isNotNil :: a -> Boolean
const isNotNil = compose(not, isNil);

// indexIn :: [a] -> a -> Number
const indexIn = flip(indexOf);

module.exports = {
    addProp,
    appendProp,
    either,
    toNull,
    getOrElseNull,
    getLastEl,
    getFirstToSecondLastEls,
    popLastEl,
    isNotNil,
    indexIn
};