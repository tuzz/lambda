class FreeVars {
  static annotate(ast) {
    return new this(ast).annotate();
  }

  constructor(ast) {
    this.ast = ast.deepClone();
  }

  annotate() {
    this.annotateFreeVars(this.ast, []);
    return this.ast;
  }

  annotateFreeVars(node, scope) {
    if (node.type === "abstraction") {
      scope = [node].concat(scope);
    }

    let freeVars = [];

    if (this.isFree(node, scope)) {
      freeVars.push(node);
    }

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      freeVars = freeVars.concat(this.annotateFreeVars(child, scope));
    }

    if (node.type === "abstraction") {
      node.freeVars = freeVars;
    }

    return freeVars;
  }

  isFree(node, scope) {
    if (node.type !== "variable") {
      return false;
    }

    let isFree = true;

    for (let i = 0; i < scope.length; i += 1) {
      const binder = scope[i];
      isFree = isFree && node.binder !== binder;
    }

    return isFree;
  }
}

module.exports = FreeVars;
