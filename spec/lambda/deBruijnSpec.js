"use strict";

const Lexer = lib("lambda/lexer");
const Parser = lib("lambda/parser");

const DescribedClass = lib("lambda/deBruijn");

describe("de Bruijn", () => {
  const ast = term => Parser.parse(Lexer.lex(term));

  it("sets the index of a variable", () => {
    let lambdaX = DescribedClass.canonicalise(ast("λx. x"));
    let x = lambdaX.children[1];

    expect(lambdaX.index).toBeUndefined();
    expect(x.index).toEqual(0);
  });

  it("sets the indices of nested variables", () => {
    let lambdaX = DescribedClass.canonicalise(ast("λx. x λy. y x"));
    let apply1 = lambdaX.children[1];
    let x1 = apply1.children[0];

    let lambdaY = apply1.children[1];
    let apply2 = lambdaY.children[1];

    let y = apply2.children[0];
    let x2 = apply2.children[1];

    expect(x1.index).toEqual(0);
    expect(y.index).toEqual(0);
    expect(x2.index).toEqual(1);
  });

  it("sets indices of variables to their name-matched nearest ancestor", () => {
    let lambdaX1 = DescribedClass.canonicalise(ast("λx. x λx. x λx. x"));
    let apply1 = lambdaX1.children[1];
    let x1 = apply1.children[0];

    let lambdaX2 = apply1.children[1];
    let apply2 = lambdaX2.children[1];
    let x2 = apply2.children[0];

    let lambdaX3 = apply2.children[1];
    let x3 = lambdaX3.children[1];

    expect(x1.index).toEqual(0);
    expect(x2.index).toEqual(0);
    expect(x3.index).toEqual(0);
  });

  it("sets indices for free variables, adding to the naming context", () => {
    let root = DescribedClass.canonicalise(ast("λx. y"));
    expect(root.namingContext.length).toEqual(1);

    let y = root.children[1];
    expect(y.index).toEqual(1);

    let binder = root.namingContext[0];
    expect(binder.type).toEqual("free-variable");
    expect(binder.value).toEqual("y");
    expect(binder.token).toEqual(y.token);
  });

  it("re-uses the same index for the same free variable", () => {
    let root = DescribedClass.canonicalise(ast("λx. y y"));
    let apply = root.children[1];
    let y1 = apply.children[0];
    let y2 = apply.children[1];

    expect(y1.index).toEqual(1);
    expect(y2.index).toEqual(1);
  });

  it("sets free variable indices independently of nested abstractions", () => {
    let apply = DescribedClass.canonicalise(ast("x λx. x"));
    let x1 = apply.children[0];

    let lambdaX = apply.children[1];
    let x2 = lambdaX.children[1];

    expect(x1.index).toEqual(0);
    expect(x2.index).toEqual(0);
  });

  it("sets the indicies for variables that are already canonical", () => {
    let lambda1 = DescribedClass.canonicalise(ast("λ. 0 λ. 1 0"));
    let apply1 = lambda1.children[1];
    let zero1 = apply1.children[0];

    let lambda2 = apply1.children[1];
    let apply2 = lambda2.children[1];
    let one = apply2.children[0];
    let zero2 = apply2.children[1];

    expect(zero1.index).toEqual(0);
    expect(one.index).toEqual(1);
    expect(zero2.index).toEqual(0);
  });

  it("creates free variables for de Brujin terms", () => {
    let root = DescribedClass.canonicalise(ast("λ. 1"));

    let binder = root.namingContext[0];
    expect(binder.type).toEqual("free-variable");
    expect(binder.value).toEqual("1");

    let one = root.children[1];
    expect(one.index).toEqual(1);
  });

  it("looks for abstraction params before testing de Bruijn indices", () => {
    let lambda1 = DescribedClass.canonicalise(ast("λ0. λ. 0"));
    let lambda2 = lambda1.children[1];
    let zero = lambda2.children[1];

    expect(zero.index).toEqual(1);
  });

  it("looks for Bruijn indices before testing free variables", () => {
    let lambda1 = DescribedClass.canonicalise(ast("λ. 1 λ. 1"));

    let apply = lambda1.children[1];
    let one1 = apply.children[0];

    let lambda2 = apply.children[1];
    let one2 = lambda2.children[1];

    expect(one1.index).toEqual(1);
    expect(one2.index).toEqual(1);
  });

  it("does not look up free variables by de Bruijn indices", () => {
    let lambda = DescribedClass.canonicalise(ast("λ. x y 1"));
    let apply1 = lambda.children[1];
    let apply2 = apply1.children[0];

    expect(apply1.type).toEqual("application");
    expect(apply2.type).toEqual("application");

    let x = apply2.children[0];
    let y = apply2.children[1];
    let one = apply1.children[1];

    expect(x.value).toEqual("x");
    expect(x.index).toEqual(1);

    expect(y.value).toEqual("y");
    expect(y.index).toEqual(2);

    expect(one.value).toEqual("1");
    expect(one.index).toEqual(3);
  });

  it("does not mutate its input", () => {
    let input = ast("λx. x");
    DescribedClass.canonicalise(input);

    let body = input.children[1];
    expect(body.index).toBeUndefined();
  });
});
