class Printer {
  static print(ast) {
    return new this(ast).print();
  }

  constructor(ast) {
    this.ast = ast;
    this.output = "";
  }

  print() {
    this.printNode(this.ast);
    return this.output;
  }

  printNode(node) {
    this[node.type](node);
  }

  abstraction(node) {
    this.output += "λ" + node.name;

    const type = node.children[0];
    const body = node.children[1];

    if (type.value) {
      this.output += ":" + type.value;
    }

    this.output += ". ";
    this.printNode(body);
  }

  application(node) {
    const left = node.children[0];
    const right = node.children[1];

    this.wrapIf(this.extendsToTheRight(left), () => this.printNode(left));
    this.output += " ";
    this.wrapIf(this.leftAssociative(right), () => this.printNode(right));
  }

  variable(node) {
    this.output += node.binder.name;
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
