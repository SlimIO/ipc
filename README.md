# ipc
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![V1.0](https://img.shields.io/badge/version-0.1.0-blue.svg)
![stability-unstable](https://img.shields.io/badge/stability-unstable-yellow.svg)

Node.js Inter Process Communication

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/ipc
# or
$ yarn add @slimio/ipc
```

## Usage example

Create a `master.js` file with the following code:
```js
const IPC = require("@slimio/ipc");
const { fork } = require("child_process");
const { join } = require("join");
const { strictEqual } = require("assert");

const cp = fork(join(__dirname, "worker.js"));
async function main() {
    const master = new IPC(cp);

    const ret = master.send("sayHello", "bob");
    strictEqual(ret, "hello bob");
}
main().catch(console.error);

cp.disconnect();
```

And now create a `worker.js` file at the same location with the following code:
```js
const IPC = require("@slimio/ipc");

const slave = new IPC();

slave.on("sayHello", (nickName, next) => {
    next(`hello ${nickName}`);
});
```

## API

## Licence
MIT
