class Printer {
  static print(ast, { names = true } = {}) {
    return new this(ast, names).print();
  }

  constructor(ast, names) {
    this.ast = ast;
    this.output = "";
    this.names = names;
  }

  print() {
    const binders = this.ast.namingContext || [];
    this.printNode(this.ast, binders);
    return this.output;
  }

  printNode(node, binders) {
    let method = node.type;
    if (method === "function-type") {
      method = "functionType";
    }

    this[method](node, binders);
  }

  abstraction(node, binders) {
    binders = [node].concat(binders);

    this.output += "λ";

    if (this.names) {
      this.output += node.name;
    }

    const type = node.children[0];
    const body = node.children[1];

    if (type.value || type.type === "function-type") {
      this.output += ":";
      this.printNode(type, binders);
    }

    this.output += ". ";
    this.printNode(body, binders);
  }

  application(node, binders) {
    const left = node.children[0];
    const right = node.children[1];

    this.wrapIf(this.extendsToTheRight(left), () =>
      this.printNode(left, binders));

    this.output += " ";
    this.wrapIf(this.leftAssociative(right), () =>
      this.printNode(right, binders));
  }

  variable(node, binders) {
    if (this.names) {
      const binder = binders[node.index];
      this.output += binder ? binder.name : "?";
    } else {
      this.output += node.index;
    }
  }

  type(node) {
    if (node.value) {
      this.output += node.value;
    }
  }

  functionType(node, binders) {
    const left = node.children[0];
    const right = node.children[1];

    this.wrapIf(this.rightAssociative(left), () =>
      this.printNode(left, binders));

    this.output += "→";
    this.printNode(right, binders);
  }

  leftAssociative(node) {
    return node.type === "application";
  }

  rightAssociative(node) {
    return node.type === "function-type";
  }

  extendsToTheRight(node) {
    if (node.type === "abstraction") {
      return true;
    }

    if (node.type === "application") {
      const right = node.children[1];
      return this.extendsToTheRight(right);
    }
  }

  isRoot(node) {
    return node === this.ast;
  }

  wrapIf(condition, callback) {
    if (condition) {
      this.output += "(";
      callback();
      this.output += ")";
    } else {
      callback();
    }
  }
}

module.exports = Printer;
