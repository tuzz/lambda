"use strict";

const Lexer = lib("lambda/lexer");
const Parser = lib("lambda/parser");
const DeBruijn = lib("lambda/deBruijn");
const NameAlloc = lib("lambda/nameAlloc");
const Printer = lib("lambda/printer");

const DescribedClass = lib("lambda/evaluator");

describe("Evaluator", () => {
  const ast = term => NameAlloc.allocate(
    DeBruijn.canonicalise(
      Parser.parse(
        Lexer.lex(term)
      )
    )
  );

  const evaluate = term => Printer.print(
    DescribedClass.evaluate(
      ast(term)
    )
  );

  it("returns the term if it's irreducible", () => {
    expect(evaluate("x")).toEqual("x");
    expect(evaluate("x y")).toEqual("x y");
    expect(evaluate("λx. x")).toEqual("λx. x");
    expect(evaluate("λx. x y")).toEqual("λx. x y");
    expect(evaluate("λx. λy. x y")).toEqual("λx. λy. x y");
    expect(evaluate("(λx. x) y")).toEqual("(λx. x) y");
    expect(evaluate("(x λx. x) x")).toEqual("(x λx. x) x");
  });

  it("reduces E-AppAbs", () => {
    expect(evaluate("(λx. x) λy. y")).toEqual("λy. y");
    expect(evaluate("(λx. x) λy. x y")).toEqual("λy. x y");
    expect(evaluate("(λx. x) λy. λz. x y z")).toEqual("λy. λz. x y z");
  });

  it("reduces E-App1", () => {
    expect(evaluate("((λx. x) λy. y) z")).toEqual("(λy. y) z");
    expect(evaluate("((λx. x) λy. y y) z")).toEqual("(λy. y y) z");
  });

  it("reduces E-App2", () => {
    expect(evaluate("(λx. x) ((λy. y) λz. z)")).toEqual("λz. z");
  });

  it("preserves the naming context", () => {
    expect(evaluate("(λx. y) λx. x")).toEqual("y");
    expect(evaluate("(λx. y x) λz. z")).toEqual("y λz. z");
  });

  it("uses capture-avoiding substitution", () => {
    expect(evaluate("(λx. λy. x) λx. y")).toEqual("λz. λx. y");
    expect(evaluate("(λx. λy. λz.x y) λx. y z")).toEqual("λa. λb. (λx. y z) a");
  });

  it("preserves type information", () => {
    expect(evaluate("λx:T1. x")).toEqual("λx:T1. x");
    expect(evaluate("(λx:T1. x) λy:T2. y")).toEqual("λy:T2. y");
    expect(evaluate("(λx:T1. λy:T2. λz. y) λz:T3. x")).toEqual("λy:T2. λz. y");
    expect(evaluate("(λx:T1. λy. x y) λz:T3. z")).toEqual("λy. (λz:T3. z) y");
  });
});
