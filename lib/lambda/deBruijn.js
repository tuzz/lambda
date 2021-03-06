const Node = require("./node");

class DeBruijn {
  static canonicalise(ast) {
    return new this(ast).canonicalise();
  }

  constructor(ast) {
    this.ast = ast.deepClone();
    this.namingContext = [];
  }

  canonicalise() {
    this.setIndex(this.ast, []);
    this.ast.namingContext = this.namingContext;

    return this.ast;
  }

  setIndex(node, binders) {
    if (node.type === "abstraction") {
      binders = this.prepend(node, binders);
    }

    if (node.type === "variable") {
      let binder = this.lookup(node, binders);
      binder = binder || this.freeVariable(node);

      node.index = this.index(binder, binders);
    }

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      this.setIndex(child, binders);
    }
  }

  prepend(element, array) {
    return [element].concat(array);
  }

  lookup(node, binders, deBruijn = true) {
    for (let i = 0; i < binders.length; i += 1) {
      const binder = binders[i];

      if (node.value === binder.value) {
        return binder;
      }
    }

    if (deBruijn) {
      const index = this.integer(node.value);
      return binders[index];
    }
  }

  freeVariable(node) {
    let freeVariable = this.lookup(node, this.namingContext, false);

    if (!freeVariable) {
      freeVariable = new Node({
        type: "free-variable",
        value: node.value,
        token: node.token
      });

      this.namingContext.push(freeVariable);
    }

    return freeVariable;
  }

  index(binder, binders) {
    binders = binders.concat(this.namingContext);
    return binders.indexOf(binder);
  }

  integer(string) {
    if (string.match(/^[0-9]+$/)) {
      return parseInt(string, 10);
    }
  }
}

module.exports = DeBruijn;
