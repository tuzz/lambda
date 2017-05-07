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
    this.printNode(this.ast, this.ast.namingContext);
    return this.output;
  }

  printNode(node, binders) {
    this[node.type](node, binders);
  }

  abstraction(node, binders) {
    binders = [node].concat(binders);

    this.output += "λ";

    if (this.names) {
      this.output += node.name;
    }

    const type = node.children[0];
    const body = node.children[1];

    if (type.value) {
      this.output += ":" + type.value;
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
      this.output += binder.name;
    } else {
      this.output += node.index;
    }
  }

  leftAssociative(node) {
    return node.type === "application";
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
