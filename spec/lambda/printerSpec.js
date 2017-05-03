"use strict";

const Lexer = lib("lambda/lexer");
const Parser = lib("lambda/parser");
const DeBruijn = lib("lambda/deBruijn");
const FreeVars = lib("lambda/freeVars");
const NameAlloc = lib("lambda/nameAlloc");

const DescribedClass = lib("lambda/printer");

describe("Printer", () => {
  let result;

  const ast = term => NameAlloc.allocate(
    FreeVars.annotate(
      DeBruijn.canonicalise(
        Parser.parse(
          Lexer.lex(term)
        )
      )
    )
  );

  it("prints abstractions", () => {
    result = DescribedClass.print(ast("λx. x"));
    expect(result).toEqual("λx. x");
  });

  it("prints typed abstraction", () => {
    result = DescribedClass.print(ast("λx:T. x"));
    expect(result).toEqual("λx:T. x");
  });

  it("prints nested abstractions", () => {
    result = DescribedClass.print(ast("λx. λy:T. y"));
    expect(result).toEqual("λx. λy:T. y");
  });

  it("prints parentheses around terms that extend to the right", () => {
    result = DescribedClass.print(ast("(λx. x) x"));
    expect(result).toEqual("(λx. x) x");

    result = DescribedClass.print(ast("((λx. x) λy. y) z"));
    expect(result).toEqual("((λx. x) λy. y) z");

    result = DescribedClass.print(ast("(((λx. x) λy. y) λz. z) w"));
    expect(result).toEqual("(((λx. x) λy. y) λz. z) w");

    result = DescribedClass.print(ast("λx. x λy. y λz. z w"));
    expect(result).toEqual("λx. x λy. y λz. z w");
  });

  it("omits parentheses around the root node", () => {
    result = DescribedClass.print(ast("x x λx. x"));
    expect(result).toEqual("x x λx. x");
  });

  it("prints applications", () => {
    result = DescribedClass.print(ast("x y"));
    expect(result).toEqual("x y");
  });

  it("prints nested applications", () => {
    result = DescribedClass.print(ast("x y z w"));
    expect(result).toEqual("x y z w");
  });

  it("prints parentheses around right-associated applications", () => {
    result = DescribedClass.print(ast("x (y z)"));
    expect(result).toEqual("x (y z)");

    result = DescribedClass.print(ast("x (y (z w))"));
    expect(result).toEqual("x (y (z w))");

    result = DescribedClass.print(ast("x ((y z) w)"));
    expect(result).toEqual("x (y z w)");
  });

  it("prints variables", () => {
    result = DescribedClass.print(ast("x"));
    expect(result).toEqual("x");
  });

  it("can handle nameless terms", () => {
    result = DescribedClass.print(ast("(λx. x) x"), { names: false });
    expect(result).toEqual("(λ. 0) 0");

    result = DescribedClass.print(ast("(λx. x) λy. w y z"), { names: false });
    expect(result).toEqual("(λ. 0) λ. 1 0 2");

    result = DescribedClass.print(ast("(λ. 0) λ. 1 0 2"), { names: false });
    expect(result).toEqual("(λ. 0) λ. 1 0 2");

    result = DescribedClass.print(ast("(λ. 0) λ:T. 1 0 2"));
    expect(result).toEqual("(λx. x) λx:T. 1 x 2");
  });
});
