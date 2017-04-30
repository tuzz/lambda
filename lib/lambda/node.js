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
    const clone = new this.constructor({
      type: this.type,
      value: this.value,
      token: this.token
    });

    for (let i = 0; i < this.children.length; i += 1) {
      const child = this.children[i];
      clone.addChild(child.deepClone());
    }

    return clone;
  }
}

module.exports = Node;
