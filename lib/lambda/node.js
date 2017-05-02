const clone = require("clone");

class Node {
  constructor({ type, value, token }) {
    this.type = type;
    this.value = value;
    this.token = token;
    this.children = [];
  }

  addChild(node) {
    this.children.push(node);
  }

  deepClone() {
    return clone(this);
  }
}

module.exports = Node;
