const Shifter = require("./shifter");

class Substituter {
  static substitute(ast, index, replacement) {
    return new this().substitute(ast.deepClone(), index, replacement);
  }

  substitute(node, index, replacement) {
    if (node.type === "abstraction") {
      index += 1;
      replacement = Shifter.shift(replacement, 1);
    }

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      node.children[i] = this.substitute(child, index, replacement);
    }

    if (node.type === "variable" && node.index === index) {
      return replacement.deepClone();
    }

    return node;
  }
}

module.exports = Substituter;
