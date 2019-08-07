const { curry, identity, pipe } = require("ramda");
const { rejected } = require("folktale/concurrency/task");
const { Ok } = require('folktale/result');
const { getUrlFromJWT } = require("./dataManip");
const { safeIsWebUri, safeMakeWebUrl } = require("../fpcore/safeOps");
const { getOrElseNull } = require("../fpcore/pointfree");

// getUrl :: Path string -> (JWT string | URI string) -> URI string
const getUrl = curry((path, urlOrJwt) =>
    !urlOrJwt ?
    rejected("JWT was not provided.") :
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
        Error: _ => rejected("JWT is invalid. Check the schema or aegis url."),
        Ok: identity
    })
);

module.exports = {
    getUrl
};