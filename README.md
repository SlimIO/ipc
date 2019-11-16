# ipc
![stability-unstable](https://img.shields.io/badge/stability-unstable-yellow.svg)
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/ipc/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/ipc/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/SlimIO/ipc)
![size](https://img.shields.io/bundlephobia/min/@slimio/ipc)
[![Known Vulnerabilities](https://snyk.io//test/github/SlimIO/ipc/badge.svg?targetFile=package.json)](https://snyk.io//test/github/SlimIO/ipc?targetFile=package.json)
[![Build Status](https://travis-ci.com/SlimIO/ipc.svg?branch=master)](https://travis-ci.com/SlimIO/ipc)
[![Greenkeeper badge](https://badges.greenkeeper.io/SlimIO/ipc.svg)](https://greenkeeper.io/)

Node.js end-to-end IPC (Inter Process Communication). The goal of this package is to reduce the code required to implement an interaction between two Node.js process.

## Features
- Send message with subjects (allow you to build comprehensive code).
- Support streaming communication in both-end

## Requirements
- [Node.js](https://nodejs.org/en/) v12 or higher

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
// Node.js Dependencies
const { fork } = require("child_process");
const { join } = require("join");
const { strictEqual } = require("assert");

// Third-party Dependencies
const IPC = require("@slimio/ipc");

async function main() {
    const cp = fork(join(__dirname, "worker.js"));
    const master = new IPC(cp);
    strictEqual(master.isMaster, true);

    const ret = await master.send("sayHello", "bob");
    strictEqual(ret, "hello bob");

    cp.disconnect();
}
main().catch(console.error);
```

And now create a `worker.js` file at the same location with the following code:
```js
const { strictEqual } = require("assert");
const IPC = require("@slimio/ipc");

const slave = new IPC();
strictEqual(slave.isMaster, false);

slave.on("sayHello", (nickName, next) => {
    // use next() to send a response!
    next(`hello ${nickName}`);
});
```

## API
You have to subscribe to the event-emitter to get incomming messages.

### constructor(cp?: ChildProcess)
Create a new IPC instance. Take a Node.js ChildProcess instance when the script is "**Master**". Creating an IPC as slave on a master script will throw an Error.

### send(subject: String, data: any): Promise< any >
Send a message to the master or slave (depending on the side).

### on(subject: string, subscriber: (payload: any, next) => void): void
Subscribe to a given subject.

```js
ipc.on("subject", (payload, next) => {
    console.log("received subject!");
    next();
});
```

## Stream communication
SlimIO IPC bring support for stream communication.

> TBC

## Roadmap
- Implement Node.js workers!

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/is](https://github.com/SlimIO/is#readme)|Minor|Low|Type Check|
|[@slimio/safe-emitter](https://github.com/SlimIO/safeEmitter#readme)|Minor|Medium|Safe Node.js Emitter (error isolation)|
|[uuid](https://github.com/kelektiv/node-uuid#readme)|Minor|Low|Unique ID|

## License
MIT
