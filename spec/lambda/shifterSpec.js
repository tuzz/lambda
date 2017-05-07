"use strict";

const Lexer = lib("lambda/lexer");
const Parser = lib("lambda/parser");
const DeBruijn = lib("lambda/deBruijn");

const DescribedClass = lib("lambda/shifter");

describe("Shifter", () => {
  let result;

  const ast = term => DeBruijn.canonicalise(
    Parser.parse(
      Lexer.lex(term)
    )
  );

  it("shifts by the number of places", () => {
    result = DescribedClass.shift(ast("0"), 3);
    expect(result.index).toEqual(3);
  });

  it("shifts nested variables", () => {
    result = DescribedClass.shift(ast("λ. 1 0"), 3);
    let apply = result.children[1];
    let one = apply.children[0];
    let zero = apply.children[1];

    expect(one.index).toEqual(4);
    expect(zero.index).toEqual(0);
  });

  it("does not shift if the cutoff is exceeded", () => {
    result = DescribedClass.shift(ast("λ. 0"), 3);
    let zero = result.children[1];
    expect(zero.index).toEqual(0);
  });

  it("does not mutate its input", () => {
    let input = ast("0");
    DescribedClass.shift(input, 3);

    expect(input.index).toEqual(0);
  });
});
