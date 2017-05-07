class Shifter {
  static shift(ast, places, cutoff = 0) {
    return new this().shift(ast.deepClone(), places, cutoff);
  }

  shift(node, places, cutoff) {
    if (node.type === "variable" && node.index >= cutoff) {
      node.index += places;
    }

    if (node.type === "abstraction") {
      cutoff += 1;
    }

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      this.shift(child, places, cutoff);
    }

    return node;
  }
}

module.exports = Shifter;
