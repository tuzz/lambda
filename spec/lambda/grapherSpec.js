"use strict";

const Lexer = lib("lambda/lexer");
const Parser = lib("lambda/parser");
const DeBruijn = lib("lambda/deBruijn");
const FreeVars = lib("lambda/freeVars");
const NameAlloc = lib("lambda/nameAlloc");

const DescribedClass = lib("lambda/grapher");
const fs = require("fs");

describe("Grapher", () => {
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

  const fixture1 = fs.readFileSync("spec/support/graph.dot", "utf8");
  const fixture2 = fs.readFileSync("spec/support/binders.dot", "utf8");

  it("returns a dot graph for the tree", () => {
    result = DescribedClass.graph(ast("λx:T. x y"));
    expect(result).toEqual(fixture1);
  });

  it("can optionally build with arrows to binders", () => {
    result = DescribedClass.graph(ast("λx:T. x y"), { binders: true });
    expect(result).toEqual(fixture2);
  });
});
