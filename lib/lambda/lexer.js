const Token = require("./token");

const RULES = {
  identifier: /^[a-z0-9_']+/i,
  keyword: /^[λ.():]|->/,
  whitespace: /^\s+|#.*/
};

class Lexer {
  static lex(input) {
    return new this(input).lex();
  }

  constructor(input) {
    this.input = input;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  lex() {
    while (this.input.length > 0) {
      this.read("identifier") ||
      this.read("keyword") ||
      this.read("whitespace") ||
      this.throwError();
    }

    return this.tokens;
  }

  read(type) {
    const regex = RULES[type];
    const match = this.input.match(regex);

    if (match) {
      const value = match[0];

      this.emit(type, value);
      this.advance(value);

      return true;
    }
  }

  emit(type, value) {
    if (type === "whitespace") {
      return;
    }

    this.tokens.push(new Token({
      type: type,
      value: value,
      line: this.line,
      column: this.column
    }));
  }

  advance(value) {
    const tail = value.match(/[^\n]*$/)[0];

    const newlines = (value.match(/\n/g) || []).length;
    const characters =  tail.replace(/\t/g, "  ").length;

    if (newlines > 0) {
      this.column = 1;
    }

    this.line += newlines;
    this.column += characters;

    this.input = this.input.slice(value.length);
  }

  throwError() {
    throw {
      name: "SyntaxError",
      message: `${this.line}:${this.column}: unexpected '${this.input[0]}'`
    };
  }
}

Lexer.LAMBDA = "λ";
Lexer.DOT    = ".";
Lexer.LPAREN = "(";
Lexer.RPAREN = ")";
Lexer.COLON  = ":";
Lexer.ARROW  = "->";

module.exports = Lexer;
