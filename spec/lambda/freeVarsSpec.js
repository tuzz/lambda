"use strict";

const DescribedClass = lib("lambda/freeVars");

const Lexer = lib("lambda/lexer");
const Parser = lib("lambda/parser");
const DeBrujin = lib("lambda/deBrujin");

describe("FreeVars", () => {
  const ast = term =>
    DeBrujin.canonicalise(
      Parser.parse(
        Lexer.lex(term)
      )
    );

  it("adds a list of free variables to each abstraction", () => {
    let lambdaX = DescribedClass.annotate(ast("λx. y λy. x y z"));
    expect(lambdaX.freeVars.length).toEqual(2);

    let y = lambdaX.freeVars[0];
    expect(y.type).toEqual("variable");
    expect(y.value).toEqual("y");

    let z = lambdaX.freeVars[1];
    expect(z.type).toEqual("variable");
    expect(z.value).toEqual("z");

    let apply = lambdaX.children[1];
    let lambdaY = apply.children[1];

    expect(lambdaY.freeVars.length).toEqual(2);

    let x = lambdaY.freeVars[0];
    expect(x.type).toEqual("variable");
    expect(x.value).toEqual("x");

    z = lambdaY.freeVars[1];
    expect(z.type).toEqual("variable");
    expect(z.value).toEqual("z");
  });

  it("does not mutate its input", () => {
    let input = ast("λx. y");
    DescribedClass.annotate(input);

    expect(input.freeVars).toBeUndefined();
  });
});
