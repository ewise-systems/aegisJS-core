const { curry } = require("ramda");

// liftA2 :: (a1 -> a2 -> b) -> f a1 -> f a2 -> f b
const liftA2 = curry((fn, a1, a2) => a1.map(fn).ap(a2));

// liftA3 :: (a1 -> a2 -> a3 -> a4 -> b) -> (a0 -> a1) -> (a0 -> a2) -> (a0 -> a3) -> (a0 -> a4) -> f a0 -> f b
const liftA4m = curry((f, a, b, c, d, x) => x.map(a).map(f).ap(x.map(b)).ap(x.map(c)).ap(x.map(d)));

module.exports = {
    liftA2,
    liftA4m
};