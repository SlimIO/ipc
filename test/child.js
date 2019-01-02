const IPC = require("../");

const slave = new IPC();

slave.on("prime", (data, next) => {
    next(data * 4);
});

slave.on("sayHello", (name, next) => {
    const wS = new IPC.Stream();

    setTimeout(() => {
        wS.write("hello ");
    }, 50);
    setTimeout(() => {
        wS.write(`${name} !`);
        wS.end();
    }, 100);

    next(wS);
});
