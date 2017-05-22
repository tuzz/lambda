const Node = require("./node");
const Printer = require("./printer");

class TypeChecker {
  static check(ast) {
    return new this().check(ast, []);
  }

  check(node, typingContext) {
    switch (node.type) {
      case "variable": return this.tVar(node, typingContext);
      case "abstraction": return this.tAbs(node, typingContext);
      case "application": return this.tApp(node, typingContext);
    }
  }

  tVar(node, typingContext) {
    const type = typingContext[node.index];

    if (!type) {
      let message = "variable is not in the typing context";
      this.throwError(node.token, message);
    }

    if (type.type !== "function-type" && !type.value) {
      let message =  "variable is untyped (type inference is unsupported)";
      this.throwError(node.token, message);
    }

    return type;
  }

  tAbs(node, typingContext) {
    const paramType = node.children[0];
    const body = node.children[1];

    typingContext = [paramType].concat(typingContext);
    const bodyType = this.check(body, typingContext);

    const type = new Node({ type: "function-type" });

    type.addChild(paramType);
    type.addChild(bodyType);

    return type;
  }

  tApp(node, typingContext) {
    const left = node.children[0];
    const right = node.children[1];

    const leftType = this.check(left, typingContext);
    const rightType = this.check(right, typingContext);

    if (leftType.type !== "function-type") {
      let message = "expected a function type for application but it was '";
      message += Printer.print(leftType) + "'";

      this.throwError(left.token, message);
    }

    const paramType = leftType.children[0];
    const returnType = leftType.children[1];
    const argType = rightType;

    if (!this.equal(paramType, argType)) {
      let message = "expected an argument for application of type '";
      message += Printer.print(paramType) + "' but it was '";
      message += Printer.print(argType) + "'";

      this.throwError(right.token, message);
    }

    return returnType;
  }

  equal(a, b) {
    let equal = true;

    equal = equal && a && b;
    equal = equal && (a.type === b.type);
    equal = equal && (a.value === b.value);
    equal = equal && (a.children.length === b.children.length);

    for (let i = 0; i < a.children.length; i += 1) {
      const aChild = a.children[i];
      const bChild = a.children[i];

      equal = equal && this.equal(aChild, bChild);
    }

    return equal;
  }

  throwError(token, message) {
    let prefix = "";

    if (token) {
      prefix = `${token.line}:${token.column}: `;
    }

    throw { name: "TypeError", message: `${prefix}${message}` };
  }
}

module.exports = TypeChecker;
