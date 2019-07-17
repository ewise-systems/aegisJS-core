/*jshint expr: true*/

require("mocha");
require("chai/register-should");
const Result = require("folktale/result");
const fc = require('fast-check');
const { expect } = require("chai");
const {
    safeSplit,
    safeNth,
    safeASCIIToBase64,
    safeBase64ToBuffer,
    safeJsonParse,
    safeIsWebUri,
    safeMakeWebUrl,
    safeGetAegisUrl
} = require("../fpcore/safeOps");
const { compose } = require("ramda");

/*
    PROPERTY TESTING
*/

const runSafeOpsTestSuite = args => {
    const {
        cut,
        name,
        argsCount = 1,
        types: {
            inp : inputType = String,
            out: outputType
        } = {}
    } = args;

    const checkType = (sub, type) => typeof sub === type.name.toLowerCase() || sub instanceof type;
    const assertPropertyArgs = new Array(argsCount).fill(fc.anything());
    const fcAssertProperty = (args, fn) => compose(fc.assert, fc.property)(...args, fn);
    fc.it = (desc, fn) => it(desc, () => fcAssertProperty(assertPropertyArgs, fn));

    describe(`[PROPERTY TEST] when ${name || cut.name} is called`, () => {
        it("should be a function", () => {
            cut.should.be.a("function");
        });
        
        fc.it("should create Result for any input", (...input) => {
            Result.hasInstance(cut(...input)).should.be.true;
        });

        outputType &&
        fc.it(`should create Result that holds ${outputType.name} for any ${inputType.name}`, (...input) => {
            if(input.reduce((acc, i) => checkType(i, inputType) && acc, true))
                cut(...input).getOrElse(null).should.be.an.instanceof(outputType);
        });

        fc.it(`should create Result that holds null for any non-${inputType.name}`, (...input) => {
            if(!input.reduce((acc, i) => checkType(i, inputType) && acc, true))
                expect(cut(...input).getOrElse(null)).to.be.null;
        });

        it("should not throw when not fed an argument", () => {
            cut.should.not.throw();
        });

        fc.it("should not throw for any argument", (...input) => {
            expect(() => cut(...input)).to.not.throw();
        });
    });
};

runSafeOpsTestSuite({ cut: safeSplit, types: { out: Array } });
runSafeOpsTestSuite({ cut: safeNth, types: { inp: Array } });
runSafeOpsTestSuite({ cut: safeASCIIToBase64 });
runSafeOpsTestSuite({ cut: safeBase64ToBuffer, types: { out: Buffer } });
runSafeOpsTestSuite({ cut: safeJsonParse });
runSafeOpsTestSuite({ cut: safeIsWebUri });
runSafeOpsTestSuite({ cut: safeMakeWebUrl, name: 'safeMakeWebUrl', argsCount: 2 });
runSafeOpsTestSuite({ cut: safeGetAegisUrl });

/*
    MANUAL TESTING
*/

describe("[MANUAL TEST] when safeASCIIToBase64 is called", () => {
    it("should convert string to base64", () => {
        safeASCIIToBase64("test").getOrElse(null).should.deep.equal("dGVzdA==");
    });
});

describe("[MANUAL TEST] when safeJsonParse is called", () => {
    it("should parse the string '{}' to an empty object", () => {
        safeJsonParse("{}").getOrElse(null).should.deep.equal({});
    });

    it("should parse the string '[]' to an empty array", () => {
        safeJsonParse("[]").getOrElse(null).should.deep.equal([]);
    });
});

describe("[MANUAL TEST] when safeIsWebUri is called", () => {
    it("should return true on a valid URL", () => {
        safeIsWebUri("https://ota.ewise.com").getOrElse(null).should.deep.equal(true);
    });
});

describe("[MANUAL TEST] when safeGetAegisUrl is called", () => {
    it("should return the aegis url when fed a valid object", () => {
        const inp = {
            "iss": "https://www1.ewise.com",
            "aegis": "https://www2.ewise.com",
            "tenant": "test-tenant",
            "origins": "https://www3.ewise.com",
            "email": "testemail@testemail.com",
            "sub": "test-sub",
            "iat": 1560404776905,
            "exp": 2560409776905,
            "services": [
                "SVC01"
            ],
            "institutions": [
                1111
            ],
            "hashes": [
                "hashes01"
            ],
            "swan": "https://www.ewise.com"
        };
        safeGetAegisUrl(inp).getOrElse(null).should.deep.equal("https://www2.ewise.com");
    });
});