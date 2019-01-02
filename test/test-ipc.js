// Require Node.js Dependencies
const { fork } = require("child_process");
const { join } = require("path");

// Require Third-party Dependencies
const avaTest = require("ava");
const is = require("@slimio/is");
const SafeEmitter = require("@slimio/safe-emitter");

// Require Internal Dependencies
const IPC = require("../index");
const Stream = require("../src/stream.class");
const MaybeStream = require("../src/maybe.class");

avaTest("Check static IPC properties", (assert) => {
    assert.true(is.classObject(IPC));
    assert.true(Reflect.has(IPC, "Stream"));
    assert.true(IPC.Stream === Stream);

    assert.true(Reflect.has(IPC, "MaybeStream"));
    assert.true(IPC.MaybeStream === MaybeStream);

    assert.true(Reflect.has(IPC, "Types"));
    assert.true(Object.isFrozen(IPC.Types));
    assert.deepEqual(Object.keys(IPC.Types), ["Master", "Slave"]);
    assert.is(IPC.Types.Master, 0);
    assert.is(IPC.Types.Slave, 1);
});

avaTest("IPC Master - Properties and method tests", async(assert) => {
    const cp = fork(join(__dirname, "child.js"));
    const master = new IPC(cp);

    assert.true(master instanceof SafeEmitter);
    assert.true(master.isMaster);
    assert.true(is.map(master.mem));

    await assert.throwsAsync(master.send(10), {
        instanceOf: TypeError,
        message: "subject must be a string"
    });

    cp.disconnect();
});

avaTest("Create communication channel with child.js", async(assert) => {
    const cp = fork(join(__dirname, "child.js"), void 0, { stdio: "inherit" });
    const master = new IPC(cp);

    const ret = await master.send("prime", 5);
    assert.is(ret, 20);

    // const wS = await master.send("sayHello", "fraxken");
    // const value = await (new MaybeStream(wS)).getValue();
    // assert.is(value, "hello fraxken!");

    cp.disconnect();
});