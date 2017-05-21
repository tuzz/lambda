"use strict";

const DescribedClass = lib("lambda/parser");
const Token = lib("lambda/token");

describe("Parser", () => {
  let root;

  const token = (type, value) => {
    return new Token({ type: type, value: value, line: 12, column: 34 });
  };

  const λ     = token("keyword", "λ");
  const DOT   = token("keyword", ".");
  const LEFT  = token("keyword", "(");
  const RIGHT = token("keyword", ")");
  const COLON = token("keyword", ":");
  const ARROW = token("keyword", "->");
  const x     = token("identifier", "x");
  const y     = token("identifier", "y");
  const z     = token("identifier", "z");
  const w     = token("identifier", "w");
  const zero  = token("identifier", "0");

  const expectNode = (node, children, type, value) => {
    expect(node.children.length).toEqual(children);
    expect(node.type).toEqual(type);

    if (value) {
      expect(node.value).toEqual(value);
    }
  };

  it("parses variables", () => {
    root = DescribedClass.parse([x]);
    expectNode(root, 0, "variable", "x");
  });

  it("parses abstractions", () => {
    root = DescribedClass.parse([λ, DOT, zero]);
    expectNode(root, 2, "abstraction", undefined);

    let type = root.children[0];
    expectNode(type, 0, "type", undefined);

    let body = root.children[1];
    expectNode(body, 0, "variable", "0");
  });

  it("parses abstractions with parameters", () => {
    root = DescribedClass.parse([λ, x, DOT, x]);
    expectNode(root, 2, "abstraction", "x");

    let type = root.children[0];
    expectNode(type, 0, "type", undefined);

    let body = root.children[1];
    expectNode(body, 0, "variable", "x");
  });

  it("parses abstractions with types", () => {
    root = DescribedClass.parse([λ, COLON, x, DOT, zero]);
    expectNode(root, 2, "abstraction", undefined);

    let type = root.children[0];
    expectNode(type, 0, "type", "x");

    let body = root.children[1];
    expectNode(body, 0, "variable", "0");
  });

  it("parses nested abstractions", () => {
    root = DescribedClass.parse([λ, DOT, λ, DOT, zero]);
    expectNode(root, 2, "abstraction", undefined);

    let type = root.children[0];
    expectNode(type, 0, "type", undefined);

    let body = root.children[1];
    expectNode(body, 2, "abstraction", undefined);

    let nestedType = body.children[0];
    expectNode(nestedType, 0, "type", undefined);

    let nestedBody = body.children[1];
    expectNode(nestedBody, 0, "variable", "0");
  });

  it("parses function types", () => {
    root = DescribedClass.parse([λ, COLON, x, ARROW, y, DOT, zero]);
    expectNode(root, 2, "abstraction", undefined);

    let type = root.children[0];
    expectNode(type, 2, "function-type", undefined);

    let left = type.children[0];
    expectNode(left, 0, "type", "x");

    let right = type.children[1];
    expectNode(right, 0, "type", "y");
  });

  it("parses nested function types", () => {
    root = DescribedClass.parse([λ, COLON, x, ARROW, y, ARROW, z, DOT, zero]);
    expectNode(root, 2, "abstraction", undefined);

    let type = root.children[0];
    expectNode(type, 2, "function-type", undefined);

    let left = type.children[0];
    expectNode(left, 0, "type", "x");

    let right = type.children[1];
    expectNode(right, 2, "function-type", undefined);

    let rightLeft = right.children[0];
    expectNode(rightLeft, 0, "type", "y");

    let rightRight = right.children[1];
    expectNode(rightRight, 0, "type", "z");
  });

  it("parses incomplete function types", () => {
    root = DescribedClass.parse([λ, COLON, ARROW, x, ARROW, DOT, zero]);
    expectNode(root, 2, "abstraction", undefined);

    let type = root.children[0];
    expectNode(type, 2, "function-type", undefined);

    let left = type.children[0];
    expectNode(left, 0, "type", undefined);

    let right = type.children[1];
    expectNode(right, 2, "function-type", undefined);

    let rightLeft = right.children[0];
    expectNode(rightLeft, 0, "type", "x");

    let rightRight = right.children[1];
    expectNode(rightRight, 0, "type", undefined);
  });

  it("parses applications", () => {
    root = DescribedClass.parse([x, y, z]);
    expectNode(root, 2, "application");

    let left = root.children[0];
    expectNode(left, 2, "application");

    let right = root.children[1];
    expectNode(right, 0, "variable", "z");

    let leftLeft = left.children[0];
    expectNode(leftLeft, 0, "variable", "x");

    let leftRight = left.children[1];
    expectNode(leftRight, 0, "variable", "y");
  });

  // x (y z)
  it("parses parentheses", () => {
    root = DescribedClass.parse([x, LEFT, y, z, RIGHT]);
    expectNode(root, 2, "application");

    let left = root.children[0];
    expectNode(left, 0, "variable", "x");

    let right = root.children[1];
    expectNode(right, 2, "application");

    let rightLeft = right.children[0];
    expectNode(rightLeft, 0, "variable", "y");

    let rightRight = right.children[1];
    expectNode(rightRight, 0, "variable", "z");
  });

  //x (y (z w))
  it("parses nested parentheses", () => {
    root = DescribedClass.parse([x, LEFT, y, LEFT, z, w, RIGHT, RIGHT]);
    expectNode(root, 2, "application");

    let left = root.children[0];
    expectNode(left, 0, "variable", "x");

    let right = root.children[1];
    expectNode(right, 2, "application");

    let rightLeft = right.children[0];
    expectNode(rightLeft, 0, "variable", "y");

    let rightRight = right.children[1];
    expectNode(rightRight, 2, "application");

    let rightRightLeft = rightRight.children[0];
    expectNode(rightRightLeft, 0, "variable", "z");

    let rightRightRight = rightRight.children[1];
    expectNode(rightRightRight, 0, "variable", "w");
  });

  it("parses arbitrarily nested parentheses", () => {
    root = DescribedClass.parse([LEFT, LEFT, LEFT, x, RIGHT, RIGHT, RIGHT, y]);
    expectNode(root, 2, "application");

    let left = root.children[0];
    expectNode(left, 0, "variable", "x");

    let right = root.children[1];
    expectNode(right, 0, "variable", "y");
  });

  it("does not mutate its input", () => {
    let tokens = [x];
    DescribedClass.parse(tokens);
    expect(tokens).toEqual([x]);
  });

  it("throws an error if given an empty array", () => {
    expect(() => {
      DescribedClass.parse([]);
    }).toThrow({
      name: "ParseError",
      message: "unexpected end of input"
    });
  });

  it("throws an error if expecting more tokens", () => {
    expect(() => {
      DescribedClass.parse([λ, x, DOT]);
    }).toThrow({
      name: "ParseError",
      message: "unexpected end of input"
    });
  });

  it("throws an error if the top-level parse fails", () => {
    expect(() => {
      DescribedClass.parse([DOT]);
    }).toThrow({
      name: "ParseError",
      message: "12:34: unexpected '.'"
    });
  });

  it("throws an error if an abstraction's dot is missing", () => {
    expect(() => {
      DescribedClass.parse([λ, x, y]);
    }).toThrow({
      name: "ParseError",
      message: "12:34: expected . but got 'y'"
    });
  });

  it("throws an error if parentheses aren't closed", () => {
    expect(() => {
      DescribedClass.parse([LEFT]);
    }).toThrow({
      name: "ParseError",
      message: "unexpected end of input"
    });

    expect(() => {
      DescribedClass.parse([LEFT, LEFT, x, RIGHT]);
    }).toThrow({
      name: "ParseError",
      message: "unexpected end of input"
    });

    expect(() => {
      DescribedClass.parse([LEFT, x, RIGHT, LEFT]);
    }).toThrow({
      name: "ParseError",
      message: "unexpected end of input"
    });
  });

  it("throws an error if parentheses aren't opened", () => {
    expect(() => {
      DescribedClass.parse([x, RIGHT]);
    }).toThrow({
      name: "ParseError",
      message: "12:34: unexpected ')'"
    });

    expect(() => {
      DescribedClass.parse([LEFT, x, RIGHT, RIGHT]);
    }).toThrow({
      name: "ParseError",
      message: "12:34: unexpected ')'"
    });
  });
});
