class FreeVars {
  static annotate(ast) {
    return new this(ast).annotate();
  }

  constructor(ast) {
    this.ast = ast.deepClone();
  }

  annotate() {
    this.annotateFreeVars(this.ast);
    return this.ast;
  }

  annotateFreeVars(node) {
    let freeVars = [];

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      freeVars = freeVars.concat(this.annotateFreeVars(child));
    }

    if (node.type === "abstraction") {
      freeVars = this.reject(freeVars, v => v.binder === node);
      node.freeVars = freeVars;
    }

    if (node.type === "variable") {
      freeVars = [node];
    }

    return freeVars;
  }

  reject(array, fn) {
    const ret = [];

    for (let i = 0; i < array.length; i += 1) {
      const element = array[i];

      if (!fn(element)) {
        ret.push(element);
      }
    }

    return ret;
  }
}

module.exports = FreeVars;
