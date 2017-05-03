const NamePicker = require("./namePicker");

class NameAlloc {
  static allocate(ast) {
    return new this(ast).allocate();
  }

  constructor(ast) {
    this.ast = ast.deepClone();
  }

  allocate() {
    this.setFreeVariableNames();
    this.allocateName(this.ast);
    return this.ast;
  }

  setFreeVariableNames() {
    const namingContext = this.ast.namingContext;

    for (let i = 0; i < namingContext.length; i += 1) {
      const binder = namingContext[i];
      binder.name = binder.value;
    }
  }

  allocateName(node) {
    if (node.type === "abstraction") {
      const reserved = [];

      for (let i = 0; i < node.freeVars.length; i += 1) {
        const freeVar = node.freeVars[i];
        const binder = freeVar.binder;

        reserved.push(binder.name);
      }

      node.name = NamePicker.pick(node.value, reserved);
    }

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      this.allocateName(child);
    }
  }
}

module.exports = NameAlloc;
