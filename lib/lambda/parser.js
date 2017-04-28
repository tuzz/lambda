const Node = require("./node");

/*
  The grammar in the book is:
    t ::= x | λx.t | t t | (t)

  But this is left-recursive. So change it to:
    t  ::= t' t | t'
    t' ::= x | λx.t | (t)
*/

class Parser {
  static parse(tokens) {
    return new this(tokens).parse();
  }

  constructor(tokens) {
    this.tokens = tokens;
  }

  parse() {
    let parent = this.parsePrime();

    while (this.tokens.length > 0) {
      const left = parent;
      const right = this.parsePrime();

      parent = new Node({ type: "application" });

      parent.addChild(left);
      parent.addChild(right);
    }

    return parent;
  }

  parsePrime() {
    const token = this.peek();

    if (token.type === "identifier") {
      return this.parseVariable();
    } else if (token.value === "λ") {
      return this.parseAbstraction();
    } else {
      this.throwError(token, `unexpected '${token.value}'`);
    }
  }

  parseVariable() {
    const token = this.read();
    return new Node({ type: "variable", value: token.value, token: token });
  }

  parseAbstraction() {
    const lambda = this.read();

    const param = this.read();
    this.validate(param, "identifier");

    const dot = this.read();
    this.validate(dot, "keyword", ".");

    const node = new Node({
      type: "abstraction",
      value: param.value,
      token: lambda
    });

    node.addChild(this.parse());
    return node;
  }

  peek() {
    const token = this.tokens[0];

    if (!token) {
      this.throwError(token, "unexpected end of input");
    }

    return token;
  }

  read() {
    const token = this.peek();
    this.tokens.shift();
    return token;
  }

  validate(token, type, value) {
    const typeMatches = token.type === type;
    const valueMatches = !value || token.value === value;

    if (typeMatches && valueMatches) {
      return;
    }

    const expected = value || type;
    const actual = token.value;

    this.throwError(token, `expected ${expected} but got '${actual}'`);
  }

  throwError(token, message) {
    let prefix = "";

    if (token) {
      prefix = `${token.line}:${token.column}: `;
    }

    throw { name: "ParseError", message: `${prefix}${message}` };
  }
}

module.exports = Parser;
