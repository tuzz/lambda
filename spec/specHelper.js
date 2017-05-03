"use strict";

const fs = require("fs");

global.lib = path => require(`../lib/${path}`);

global.fixture = path => {
  return fs.readFileSync(`spec/support/fixtures/${path}`, "utf8");
};
