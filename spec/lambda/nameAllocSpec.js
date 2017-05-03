"use strict";

const DescribedClass = lib("lambda/nameAlloc");

const Lexer = lib("lambda/lexer");
const Parser = lib("lambda/parser");
const DeBruijn = lib("lambda/deBruijn");
const FreeVars = lib("lambda/freeVars");

describe("NameAlloc", () => {
  let ast;

  beforeEach(() => {
    ast = FreeVars.annotate(
      DeBruijn.canonicalise(
        Parser.parse(
          Lexer.lex("λx. y λy. λy. y")
        )
      )
    );
  });

  it("allocates names to free variables", () => {
    let lambdaX = DescribedClass.allocate(ast);
    expect(lambdaX.namingContext.length).toEqual(1);

    let freeVarY = lambdaX.namingContext[0];
    expect(freeVarY.name).toEqual("y");
  });

  it("allocates names to abstractions", () => {
    let lambdaX = DescribedClass.allocate(ast);
    expect(lambdaX.name).toEqual("x");

    let apply = lambdaX.children[1];
    let lambdaY1 = apply.children[1];
    expect(lambdaY1.name).toEqual("y");

    let lambdaY2 = lambdaY1.children[1];
    expect(lambdaY2.name).toEqual("y");
  });

  describe("when a variable is bound by an outer abstraction", () => {
    beforeEach(() => {
      let apply = ast.children[1];
      let lambdaY1 = apply.children[1];
      let lambdaY2 = lambdaY1.children[1];
      let y = lambdaY2.children[1];

      y.binder = lambdaY1;
      ast = FreeVars.annotate(ast, true);

      apply = ast.children[1];
      lambdaY1 = apply.children[1];
      lambdaY2 = lambdaY1.children[1];
      y = lambdaY2.children[1];
    });

    it("picks a new name for the inner abstraction", () => {
      let lambdaX = DescribedClass.allocate(ast);
      let apply = lambdaX.children[1];
      let lambdaY1 = apply.children[1];
      let lambdaY2 = lambdaY1.children[1];

      expect(lambdaY2.name).toEqual("z");
    });
  });


  it("does not mutate its input", () => {
    DescribedClass.allocate(ast);
    expect(ast.name).toBeUndefined();
  });
});
