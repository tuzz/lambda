/*
  The grammar in the book is:
    t ::= x | λx.t | t t | (t)

  But this is left-recursive. So change it to:
    t  ::= t' t | t'
    t' ::= x | λx.t | (t)
*/

const Lexer = require("./lexer");
const Node = require("./node");

class Parser {
  static parse(tokens) {
    return new this(tokens).parse();
  }

  constructor(tokens) {
    this.tokens = tokens.slice(0);
  }

  parse() {
    const root = this.parseT();

    if (this.moreTokens()) {
      this.throwUnexpected(this.peek());
    }

    return root;
  }

  parseT() {
    let parent = this.parseTPrime();

    while (this.moreTokens() && !this.rightParenthesis()) {
      const left = parent;
      const right = this.parseTPrime();

      parent = new Node({ type: "application" });

      parent.addChild(left);
      parent.addChild(right);
    }

    return parent;
  }

  parseTPrime() {
    const token = this.peek();

    if (token.type === "identifier") {
      return this.parseVariable();
    } else if (token.value === Lexer.LAMBDA) {
      return this.parseAbstraction();
    } else if (token.value === Lexer.LPAREN) {
      return this.parseParentheses(this.parseT);
    } else {
      this.throwUnexpected(token);
    }
  }

  parseVariable() {
    const token = this.read();
    return new Node({ type: "variable", value: token.value, token: token });
  }

  parseAbstraction() {
    const lambda = this.read();

    const param = this.parseParam();
    const type = this.parseType();

    const dot = this.read();
    this.validate(dot, "keyword", Lexer.DOT);

    const node = new Node({
      type: "abstraction",
      value: param.value,
      token: lambda
    });

    node.addChild(type);
    node.addChild(this.parseT());

    return node;
  }

  parseParentheses(innerRule) {
    const leftParen = this.read();
    this.validate(leftParen, "keyword", Lexer.LPAREN);

    const node = innerRule.call(this);

    const rightParen = this.read();
    this.validate(rightParen, "keyword", Lexer.RPAREN);

    return node;
  }

  parseParam() {
    const token = this.peek();

    if (token.type === "identifier") {
      return this.read();
    } else {
      return {};
    }
  }

  parseType() {
    const token = this.peek();

    if (token.type === "keyword" && token.value === Lexer.COLON) {
      this.read();
      return this.parseOptionalType();
    } else {
      return new Node({ type: "type" });
    }
  }

  parseOptionalType() {
    let node = new Node({ type: "type" });
    let token = this.peek();

    if (token.type === "keyword" && token.value === Lexer.DOT) {
      return node;
    }

    if (token.type === "identifier") {
      token = this.read();

      node.value = token.value;
      node.token = token;

      token = this.peek();
    }

    if (token.type === "keyword" && token.value === Lexer.LPAREN) {
      node = this.parseParentheses(this.parseOptionalType);
      token = this.peek();
    }

    if (token.type === "keyword" && token.value === Lexer.ARROW) {
      node = this.parseFunctionType(node);
    }

    return node;
  }

  parseFunctionType(left) {
    const arrow = this.read();
    const right = this.parseOptionalType();

    const node = new Node({ type: "function-type", token: arrow });

    node.addChild(left);
    node.addChild(right);

    return node;
  }

  moreTokens() {
    return this.tokens.length > 0;
  }

  rightParenthesis() {
    const token = this.peek();
    return token.type === "keyword" && token.value === Lexer.RPAREN;
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

  throwUnexpected(token) {
    this.throwError(token, `unexpected '${token.value}'`);
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
