const Shifter = require("./shifter");
const Substituter = require("./substituter");
const NameAlloc = require("./nameAlloc");

class Evaluator {
  static evaluate(ast) {
    return new this().evaluate(ast);
  }

  evaluate(node) {
    this.untilNoRuleApplies(() => {
      node = this.evalStep(node);
    });

    return NameAlloc.allocate(node);
  }

  evalStep(node) {
    if (node.type !== "application") {
      this.noRuleApplies();
    }

    const left = node.children[0];
    const right = node.children[1];

    if (this.isValue(left) && this.isValue(right)) {
      return this.eAppAbs(node);
    } else if (this.isValue(left)) {
      return this.eApp2(node);
    } else {
      return this.eApp1(node);
    }
  }

  eApp1(node) {
    node = node.deepClone();
    node.children[0] = this.evalStep(node.children[0]);

    return node;
  }

  eApp2(node) {
    node = node.deepClone();
    node.children[1] = this.evalStep(node.children[1]);

    return node;
  }

  eAppAbs(node) {
    const left = node.children[0];
    const right = node.children[1];
    const body = left.children[1];

    const rightShifted = Shifter.shift(right, 1);
    const substituted = Substituter.substitute(body, 0, rightShifted);
    const replacement = Shifter.shift(substituted, -1);

    replacement.namingContext = node.namingContext;

    return replacement;
  }

  isValue(node) {
    return node.type === "abstraction";
  }

  untilNoRuleApplies(fn) {
    while (true) {
      try {
        fn();
      } catch (error) {
        if (error instanceof NoRuleError) {
          return;
        } else {
          throw error;
        }
      }
    }
  }

  noRuleApplies() {
    throw new NoRuleError("no rule applies");
  }
}

class NoRuleError extends Error {}

module.exports = Evaluator;
