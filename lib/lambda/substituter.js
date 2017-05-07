class Substituter {
  static substitute(application) {
    return new this(application).substitute();
  }

  constructor(application) {
    this.left = application.children[0];
    this.right = application.children[1];
    this.namingContext = application.namingContext;
  }

  substitute() {
    const body = this.left.children[1];

    const substitute =  this.copyInto(body);
    substitute.namingContext = this.namingContext;

    return substitute;
  }

  copyInto(node) {
    if (node.binder === this.left) {
      return this.right;
    }

    let newChildren = [];

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      newChildren.push(this.copyInto(child));
    }

    node.children = newChildren;

    return node;
  }
}

module.exports = Substituter;
