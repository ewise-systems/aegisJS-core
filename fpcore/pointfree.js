const { curry } = require("ramda");

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

module.exports = {
    addProp,
    appendProp,
    either,
    toNull
};