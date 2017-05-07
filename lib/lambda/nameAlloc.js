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
    this.allocateName(this.ast, this.ast.namingContext);
    return this.ast;
  }

  setFreeVariableNames() {
    const namingContext = this.ast.namingContext;

    for (let i = 0; i < namingContext.length; i += 1) {
      const binder = namingContext[i];
      binder.name = binder.value;
    }
  }

  allocateName(node, scope) {
    if (node.type === "abstraction") {
      const reserved = [];
      const freeVarBinders = this.freeVariableBinders(node, scope);

      for (let i = 0; i < freeVarBinders.length; i += 1) {
        const binder = freeVarBinders[i];
        reserved.push(binder.name);
      }

      node.name = NamePicker.pick(node.value, reserved);
      scope = [node].concat(scope);
    }

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      this.allocateName(child, scope);
    }
  }

  freeVariableBinders(node, scope, level = -1) {
    if (node.type === "abstraction") {
      scope = [node].concat(scope);
      level += 1;
    }

    let binders = [];

    if (node.type === "variable" && node.index > level) {
      binders.push(scope[node.index]);
    }

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      const childBinders = this.freeVariableBinders(child, scope, level);

      binders = binders.concat(childBinders);
    }

    return binders;
  }
}

module.exports = NameAlloc;
