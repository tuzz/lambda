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

  it("substitutes the param for the value on the right", () => {
    let y = DescribedClass.substitute(ast("(λx. x) y"));

    expect(y.type).toEqual("variable");
    expect(y.value).toEqual("y");
  });

  it("substitutes inside nested terms", () => {
    let apply1 = DescribedClass.substitute(ast("(λx. x x λz. x) y"));
    let apply2 = apply1.children[0];
    let lambdaZ = apply1.children[1];

    let y1 = apply2.children[0];
    let y2 = apply2.children[1];
    let y3 = lambdaZ.children[1];

    expect(y1.value).toEqual("y");
    expect(y2.value).toEqual("y");
    expect(y3.value).toEqual("y");
  });

  it("substitutes for nested terms", () => {
    let lambdaY = DescribedClass.substitute(ast("(λx. x) λy. y y"));
    let apply = lambdaY.children[1];

    let y1 = apply.children[0];
    let y2 = apply.children[1];

    expect(y1.value).toEqual("y");
    expect(y2.value).toEqual("y");
  });

  it("copies the naming context onto the new node", () => {
    let y = DescribedClass.substitute(ast("(λx. x) y"));
    let binder = y.namingContext[0];

    expect(y.binder).toEqual(binder);
  });

  it("is capture avoiding (1)", () => {
    let lambdaX = DescribedClass.substitute(ast("(λx. λx. x) y"));
    let x = lambdaX.children[1];

    expect(x.binder).toEqual(lambdaX);
  });

  it("is capture avoiding (2)", () => {
    let lambdaY = DescribedClass.substitute(ast("(λx. λy. x) y"));
    let y = lambdaY.children[1];
    let freeVar = lambdaY.namingContext[0];

    expect(y.binder).not.toEqual(lambdaY);
    expect(y.binder).toEqual(freeVar);
  });

  // We shouldn't clone nodes within trees because variables under that node
  // might be bound to an abstraction above the node. Instead, we should clone
  // the entire tree at a higher level.
  it("mutates its input", () => {
    let input = ast("(λx. x) y");
    let y = input.children[1];

    let output = DescribedClass.substitute(input);

    output.foo = "bar";
    expect(y.foo).toEqual("bar");
  });

  it("handle free variables that have vanished, e.g. the case above");
});
