"use strict";

const Lexer = lib("lambda/lexer");
const Parser = lib("lambda/parser");

const DescribedClass = lib("lambda/deBruijn");

describe("de Bruijn", () => {
  const ast = term => Parser.parse(Lexer.lex(term));

  it("sets the binder and index of a variable", () => {
    let lambdaX = DescribedClass.canonicalise(ast("λx. x"));
    expect(lambdaX.binder).toBeUndefined();

    let x = lambdaX.children[1];
    expect(x.binder).toEqual(lambdaX);
    expect(x.index).toEqual(0);
  });

  it("sets the binders of nested variables", () => {
    let lambdaX = DescribedClass.canonicalise(ast("λx. x λy. y x"));

    let apply1 = lambdaX.children[1];
    expect(apply1.type).toEqual("application");
    expect(apply1.binder).toBeUndefined();

    let x1 = apply1.children[0];
    expect(x1.type).toEqual("variable");
    expect(x1.binder).toEqual(lambdaX);
    expect(x1.index).toEqual(0);

    let lambdaY = apply1.children[1];
    expect(lambdaY.type).toEqual("abstraction");
    expect(lambdaY.binder).toBeUndefined();

    let apply2 = lambdaY.children[1];
    expect(apply2.type).toEqual("application");
    expect(apply2.binder).toBeUndefined();

    let y = apply2.children[0];
    expect(y.type).toEqual("variable");
    expect(y.binder).toEqual(lambdaY);
    expect(y.index).toEqual(0);

    let x2 = apply2.children[1];
    expect(x2.type).toEqual("variable");
    expect(x2.binder).toEqual(lambdaX);
    expect(x2.index).toEqual(1);
  });

  it("binds nested variables to their nearest name-matched ancestor", () => {
    let lambdaX1 = DescribedClass.canonicalise(ast("λx. x λx. x λx. x"));
    let apply1 = lambdaX1.children[1];
    let x1 = apply1.children[0];

    let lambdaX2 = apply1.children[1];
    let apply2 = lambdaX2.children[1];
    let x2 = apply2.children[0];

    let lambdaX3 = apply2.children[1];
    let x3 = lambdaX3.children[1];

    expect(x1.binder).toEqual(lambdaX1);
    expect(x1.index).toEqual(0);

    expect(x2.binder).toEqual(lambdaX2);
    expect(x2.index).toEqual(0);

    expect(x3.binder).toEqual(lambdaX3);
    expect(x3.index).toEqual(0);
  });

  it("binds free variables to the naming context on the root node", () => {
    let root = DescribedClass.canonicalise(ast("λx. y"));
    expect(root.namingContext.length).toEqual(1);

    let binder = root.namingContext[0];
    expect(binder.type).toEqual("free-variable");
    expect(binder.value).toEqual("y");

    let y = root.children[1];
    expect(y.binder).toEqual(binder);
    expect(y.index).toEqual(1);

    expect(binder.token).toEqual(y.token);
  });

  it("binds free variables to the same elements if their names match", () => {
    let root = DescribedClass.canonicalise(ast("λx. y y"));
    let binder = root.namingContext[0];

    let apply = root.children[1];
    expect(apply.type).toEqual("application");

    let y1 = apply.children[0];
    expect(y1.binder).toEqual(binder);
    expect(y1.index).toEqual(1);

    let y2 = apply.children[1];
    expect(y2.binder).toEqual(binder);
    expect(y2.index).toEqual(1);
  });

  it("binds free variables independently of nested abstractions", () => {
    let apply = DescribedClass.canonicalise(ast("x λx. x"));
    let binder = apply.namingContext[0];

    let x1 = apply.children[0];
    expect(x1.binder).toEqual(binder);
    expect(x1.index).toEqual(0);

    let lambdaX = apply.children[1];
    expect(lambdaX.type).toEqual("abstraction");

    let x2 = lambdaX.children[1];
    expect(x2.binder).toEqual(lambdaX);
    expect(x2.index).toEqual(0);
  });

  it("binds variables that are already de Bruijn formatted", () => {
    let lambda1 = DescribedClass.canonicalise(ast("λ. 0 λ. 1 0"));
    let apply1 = lambda1.children[1];
    let zero1 = apply1.children[0];

    let lambda2 = apply1.children[1];
    let apply2 = lambda2.children[1];
    let one = apply2.children[0];
    let zero2 = apply2.children[1];

    expect(zero1.binder).toEqual(lambda1);
    expect(zero1.index).toEqual(0);

    expect(one.binder).toEqual(lambda1);
    expect(one.index).toEqual(1);

    expect(zero2.binder).toEqual(lambda2);
    expect(zero2.index).toEqual(0);
  });

  it("binds free variables in de Bruijn formatted terms", () => {
    let root = DescribedClass.canonicalise(ast("λ. 1"));

    let binder = root.namingContext[0];
    expect(binder.type).toEqual("free-variable");
    expect(binder.value).toEqual("1");

    let one = root.children[1];
    expect(one.binder).toEqual(binder);
    expect(one.index).toEqual(1);
  });

  it("binds to abstraction params before testing de Bruijn indices", () => {
    let lambda1 = DescribedClass.canonicalise(ast("λ0. λ. 0"));
    let lambda2 = lambda1.children[1];
    let zero = lambda2.children[1];

    expect(zero.binder).toEqual(lambda1);
    expect(zero.index).toEqual(1);
  });

  it("binds to de Bruijn indices before testing free variables", () => {
    let lambda1 = DescribedClass.canonicalise(ast("λ. 1 λ. 1"));
    let binder = lambda1.namingContext[0];

    let apply = lambda1.children[1];
    let one1 = apply.children[0];

    let lambda2 = apply.children[1];
    let one2 = lambda2.children[1];

    expect(one1.binder).toEqual(binder);
    expect(one1.index).toEqual(1);

    expect(one2.binder).toEqual(lambda1);
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
    expect(x.binder).toEqual(lambda.namingContext[0]);
    expect(x.index).toEqual(1);

    expect(y.value).toEqual("y");
    expect(y.binder).toEqual(lambda.namingContext[1]);
    expect(y.index).toEqual(2);

    expect(one.value).toEqual("1");
    expect(one.binder).toEqual(lambda.namingContext[2]);
    expect(one.index).toEqual(3);
  });

  it("does not mutate its input", () => {
    let input = ast("λx. x");
    DescribedClass.canonicalise(input);

    let body = input.children[1];
    expect(body.binder).toBeUndefined();
    expect(body.index).toBeUndefined();
  });
});
