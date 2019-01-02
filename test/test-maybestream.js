// Require Third-party Dependencies
const avaTest = require("ava");
const is = require("@slimio/is");

// Require Internal Dependencies
const Stream = require("../src/stream.class");
const MaybeStream = require("../src/maybe.class");

avaTest("MaybeStream is a class Object", (assert) => {
    assert.true(is.classObject(MaybeStream));
});

avaTest("MaybeStream of Primitive should return Primitive", async(assert) => {
    const prim = await (new MaybeStream(true)).getValue();
    assert.true(prim);
});

avaTest("MaybeStream of Encoded primitive", async(assert) => {
    const msg = Buffer.from("hello world!");
    const prim = await (new MaybeStream(msg)).getValue({ decode: true });
    assert.is(prim, msg.toString());
});

avaTest("MaybeStream of Stream (decode true)", async(assert) => {
    const wS = new Stream();
    setTimeout(() => wS.write("hello "), 200);
    setTimeout(() => {
        wS.write("world!");
        wS.end();
    }, 250);

    const value = await (new MaybeStream(wS)).getValue();
    assert.is(value, "hello world!");
});

avaTest("MaybeStream of Stream (decode false)", async(assert) => {
    const wS = new Stream();
    setTimeout(() => wS.write("hello "), 200);
    setTimeout(() => {
        wS.write("world!");
        wS.end();
    }, 250);

    const value = await (new MaybeStream(wS)).getValue({ decode: false });
    assert.deepEqual(value, Buffer.from("hello world!"));
});
