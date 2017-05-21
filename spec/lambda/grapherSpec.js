"use strict";

const Lexer = lib("lambda/lexer");
const Parser = lib("lambda/parser");
const DeBruijn = lib("lambda/deBruijn");
const NameAlloc = lib("lambda/nameAlloc");

const DescribedClass = lib("lambda/grapher");

describe("Grapher", () => {
  let result;

  const ast = term => NameAlloc.allocate(
    DeBruijn.canonicalise(
      Parser.parse(
        Lexer.lex(term)
      )
    )
  );

  const fixture1 = fixture("graph.dot");
  const fixture2 = fixture("binders.dot");
  const fixture3 = fixture("nameless.dot");

  it("returns a dot graph for the tree", () => {
    result = DescribedClass.graph(ast("λx:T1->T2. x y"));
    expect(result).toEqual(fixture1);
  });

  it("can optionally build with arrows to binders", () => {
    result = DescribedClass.graph(ast("λx:T1->T2. x y"), { binders: true });
    expect(result).toEqual(fixture2);
  });

  it("can optionally build without names", () => {
    result = DescribedClass.graph(ast("λx:T1->T2. x y"), { names: false });
    expect(result).toEqual(fixture3);
  });
});
