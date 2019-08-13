const { curry, identity, pipe } = require("ramda");
const { rejected } = require("folktale/concurrency/task");
const { Ok } = require('folktale/result');
const { getUrlFromJWT } = require("./dataManip");
const { safeIsWebUri, safeMakeWebUrl } = require("../fpcore/safeOps");
const { getOrElseNull } = require("../fpcore/pointfree");

// getUrl :: Path string -> (JWT string | URI string) -> URI string
const getUrl = curry((path, urlOrJwt) =>
    !urlOrJwt ?
    rejected({ code: 401 }) :
    safeIsWebUri(urlOrJwt)
    .matchWith({
        Error: _ => getUrlFromJWT(urlOrJwt),
        Ok: x => getOrElseNull(x) ?
            Ok(urlOrJwt) :
            getUrlFromJWT(urlOrJwt)
    })
    .matchWith({
        Error: identity,
        Ok: pipe(
            getOrElseNull,
            safeMakeWebUrl(path)
        )
    })
    .matchWith({
        Error: _ => rejected({ code: 401 }),
        Ok: identity
    })
);

module.exports = {
    getUrl
};