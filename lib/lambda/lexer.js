class Lexer {
  static lex(input) {
    return new this(input).lex();
  }

  constructor(input) {
    this.input = input;
  }

  lex() {
    return "Hello";
  }
}

module.exports = Lexer;
