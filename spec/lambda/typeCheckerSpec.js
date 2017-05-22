"use strict";

const Lexer = lib("lambda/lexer");
const Parser = lib("lambda/parser");
const DeBruijn = lib("lambda/deBruijn");
const NameAlloc = lib("lambda/nameAlloc");
const Printer = lib("lambda/printer");

const DescribedClass = lib("lambda/typeChecker");

describe("TypeChecker", () => {
  const ast = term => NameAlloc.allocate(
    DeBruijn.canonicalise(
      Parser.parse(
        Lexer.lex(term)
      )
    )
  );

  const check = term => Printer.print(
    DescribedClass.check(
      ast(term)
    )
  );

  it("type checks abstractions with single variables", () => {
    expect(check("λx:T1. x")).toEqual("T1→T1");
  });

  it("type checks nested abstractions", () => {
    expect(check("λx:T1. λy:T2. x")).toEqual("T1→T2→T1");
    expect(check("λx:T1. λy:T2. y")).toEqual("T1→T2→T2");
  });

  it("type checks applications", () => {
    expect(check("(λx:T1→T2. x) λy:T2. y")).toEqual("T1→T2");
    expect(check("λx:T1. (λy:T1. y) x")).toEqual("T1→T1");
    expect(check("λx:T1. (λy:T1→T2. y) (λz:T1. z) x")).toEqual("T1→T2");
  });

  it("throws an error on a type mismatch", () => {
    let expected = "1:12: expected an argument for application of type 'T1'";
    expected += " but it was 'T2→T2'";

    expect(() => {
      check("(λx:T1. x) λy:T2. y");
    }).toThrow({
      name: "TypeError",
      message: expected
    });
  });

  it("throws an error if a variable is untyped", () => {
    expect(() => {
      check("λx. x");
    }).toThrow({
      name: "TypeError",
      message: "1:5: variable is untyped (type inference is unsupported)"
    });
  });

  it("throws an error if a variable isn't in the typing context", () => {
    expect(() => {
      check("λx. y");
    }).toThrow({
      name: "TypeError",
      message: "1:5: variable is not in the typing context"
    });
  });

  it("throws an error if LHS of application isn't a function type", () => {
    expect(() => {
      check("λx:T1. x x");
    }).toThrow({
      name: "TypeError",
      message: "1:8: expected a function type for application but it was 'T1'"
    });
  });
});
