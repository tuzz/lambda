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
  const x     = token("identifier", "x");
  const y     = token("identifier", "y");
  const z     = token("identifier", "z");
  const w     = token("identifier", "w");

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
    root = DescribedClass.parse([λ, x, DOT, y]);
    expectNode(root, 1, "abstraction", "x");

    let body = root.children[0];
    expectNode(body, 0, "variable", "y");
  });

  it("parses nested abstractions", () => {
    root = DescribedClass.parse([λ, x, DOT, λ, y, DOT, x]);
    expectNode(root, 1, "abstraction", "x");

    let body = root.children[0];
    expectNode(body, 1, "abstraction", "y");

    let nestedBody = body.children[0];
    expectNode(nestedBody, 0, "variable", "x");
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

  it("throws an error if an abstraction's param is invalid", () => {
    expect(() => {
      DescribedClass.parse([λ, λ]);
    }).toThrow({
      name: "ParseError",
      message: "12:34: expected identifier but got 'λ'"
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
      message: "12:34: mismatched parentheses"
    });

    expect(() => {
      DescribedClass.parse([LEFT, LEFT, x, RIGHT]);
    }).toThrow({
      name: "ParseError",
      message: "12:34: mismatched parentheses"
    });

    expect(() => {
      DescribedClass.parse([LEFT, x, RIGHT, LEFT]);
    }).toThrow({
      name: "ParseError",
      message: "12:34: mismatched parentheses"
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

  it("parses types");
});
