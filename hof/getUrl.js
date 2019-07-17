const { curry, pipe } = require("ramda");
const { rejected } = require("folktale/concurrency/task");
const { Ok } = require('folktale/result');
const { getUrlFromJWT } = require("./dataManip");
const { safeIsWebUri, safeMakeWebUrl } = require("../fpcore/safeOps");
const { id, getOrElseNull } = require("../fpcore/pointfree");

// getUrl :: Path string -> (JWT string | URI string) -> URI string
const getUrl = curry((path, urlOrJwt) =>
    safeIsWebUri(urlOrJwt)
    .matchWith({
        Error: _ => getUrlFromJWT(urlOrJwt),
        Ok: x => getOrElseNull(x) ?
            Ok(urlOrJwt) :
            getUrlFromJWT(urlOrJwt)
    })
    .matchWith({
        Error: id,
        Ok: pipe(
            getOrElseNull,
            safeMakeWebUrl(path)
        )
    })
    .matchWith({
        Error: rejected,
        Ok: id
    })
);

module.exports = {
    getUrl
};