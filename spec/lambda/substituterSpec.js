"use strict";

const Lexer = lib("lambda/lexer");
const Parser = lib("lambda/parser");
const DeBruijn = lib("lambda/deBruijn");

const DescribedClass = lib("lambda/substituter");

describe("Substituter", () => {
  const ast = term => DeBruijn.canonicalise(
    Parser.parse(
      Lexer.lex(term)
    )
  );

  it("substitutes a variable for the replacement", () => {
    let apply = DescribedClass.substitute(ast("0 0"), 0, ast("x"));

    let x1 = apply.children[0];
    let x2 = apply.children[1];

    expect(x1.value).toEqual("x");
    expect(x2.value).toEqual("x");
  });

  it("increments the substitution index when entering abstractions", () => {
    let lambda = DescribedClass.substitute(ast("λ. 1 2"), 0, ast("x"));
    let apply = lambda.children[1];
    let x = apply.children[0];
    let two = apply.children[1];

    expect(x.value).toEqual("x");
    expect(two.value).toEqual("2");
  });

  it("can substitute the variable at a different index", () => {
    let lambda = DescribedClass.substitute(ast("λ. 1 2"), 1, ast("x"));
    let apply = lambda.children[1];
    let one = apply.children[0];
    let x = apply.children[1];

    expect(one.value).toEqual("1");
    expect(x.value).toEqual("x");
  });

  it("shifts the replacement index for each abstraction entered", () => {
    let x = DescribedClass.substitute(ast("0"), 0, ast("x"));
    expect(x.value).toEqual("x");
    expect(x.index).toEqual(0);

    let lambda = DescribedClass.substitute(ast("λ. 1"), 0, ast("x"));
    x = lambda.children[1];
    expect(x.value).toEqual("x");
    expect(x.index).toEqual(1);
  });

  it("does not shift bound variables in the replacement", () => {
    let outer = DescribedClass.substitute(ast("λ. 1"), 0, ast("λx. x y"));
    let inner = outer.children[1];
    let apply = inner.children[1];
    let x = apply.children[0];
    let y = apply.children[1];

    expect(x.value).toEqual("x");
    expect(y.value).toEqual("y");

    expect(x.index).toEqual(0);
    expect(y.index).toEqual(2);
  });

  it("clones the replacement for each substitution", () => {
    let apply = DescribedClass.substitute(ast("y y"), 0, ast("x"));
    let y1 = apply.children[0];
    let y2 = apply.children[1];

    y1.mutated = true;

    expect(y2.mutated).toBeUndefined();
    expect(y1).not.toEqual(y2);
  });

  it("does not mutate its input", () => {
    let input = ast("λ. 1");
    let replacement = ast("x");

    DescribedClass.substitute(input, 0, replacement);

    expect(input.children[1].value).toEqual("1");
    expect(replacement.index).toEqual(0);
  });
});
