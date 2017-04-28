"use strict";

const DescribedClass = lib("lambda/lexer");

describe("Lexer", () => {
  let tokens;

  const expectToken = (index, type, value, line, column) => {
    const token = tokens[index];

    expect(token.type).toEqual(type);
    expect(token.value).toEqual(value);
    expect(token.line).toEqual(line);
    expect(token.column).toEqual(column);
  };

  it("lexes variables", () => {
    tokens = DescribedClass.lex("01abXY_'");
    expect(tokens.length).toEqual(1);
    expectToken(0, "identifier", "01abXY_'", 1, 1);
  });

  it("lexes keywords", () => {
    tokens = DescribedClass.lex("λ.():->");
    expect(tokens.length).toEqual(6);
    expectToken(0, "keyword", "λ", 1, 1);
    expectToken(1, "keyword", ".", 1, 2);
    expectToken(2, "keyword", "(", 1, 3);
    expectToken(3, "keyword", ")", 1, 4);
    expectToken(4, "keyword", ":", 1, 5);
    expectToken(5, "keyword", "->", 1, 6);
  });

  it("ignores whitespace", () => {
    tokens = DescribedClass.lex(" \n x \t ");
    expect(tokens.length).toEqual(1);
    expectToken(0, "identifier", "x", 2, 2);
  });

  it("ignores comments", () => {
    tokens = DescribedClass.lex("# comment\n λx. # x \n y");
    expect(tokens.length).toEqual(4);
    expectToken(0, "keyword", "λ", 2, 2);
    expectToken(1, "identifier", "x", 2, 3);
    expectToken(2, "keyword", ".", 2, 4);
    expectToken(3, "identifier", "y", 3, 2);
  });

  it("counts tabs as two space characters", () => {
    tokens = DescribedClass.lex("\t\t\tx");
    expect(tokens.length).toEqual(1);
    expectToken(0, "identifier", "x", 1, 7);
  });

  it("resets column after a newline", () => {
    tokens = DescribedClass.lex("   \n x");
    expect(tokens.length).toEqual(1);
    expectToken(0, "identifier", "x", 2, 2);
  });

  it("throws an error on an unexpected character", () => {
    expect(() => {
      DescribedClass.lex("λx.\n(x x)Γ x");
    }).toThrow({
      name: "SyntaxError",
      message: "2:6: unexpected 'Γ'"
    });
  });
});
