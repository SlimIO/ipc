const IPC = require("../");

const slave = new IPC();

setInterval(async() => {
    const ret = await slave.send("wahou", "hello world!");
    console.log(ret);
}, 1000);
