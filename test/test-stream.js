"use strict";

// Require Node.js Dependencies
const { Transform } = require("stream");

// Require Third-party Dependencies
const avaTest = require("ava");
const is = require("@slimio/is");

// Require Internal Dependencies
const Stream = require("../src/stream.class");

avaTest("Stream is a class Object", (assert) => {
    assert.true(is.classObject(Stream));
});

avaTest("Stream extends Node.Stream.Transform", (assert) => {
    const wS = new Stream();
    assert.true(wS instanceof Transform);
    assert.true(wS.timeOut === null);
});
