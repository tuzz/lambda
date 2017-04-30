"use strict";

const Node = lib("lambda/node");

describe("Node", () => {
  describe("deepClone", () => {
    let root, child, grand;

    beforeEach(() => {
      root  = new Node({ type: "type1", value: "value1", token: "token1" });
      child = new Node({ type: "type2", value: "value2", token: "token2" });
      grand = new Node({ type: "type3", value: "value3", token: "token3" });

      root.addChild(child);
      child.addChild(grand);
    });

    const expectNode = (node, type, value, token) => {
      expect(node.type).toEqual(type);
      expect(node.value).toEqual(value);
      expect(node.token).toEqual(token);
    };

    it("clones the node and its children", () => {
      let rootClone = root.deepClone();
      root.type = "mutated";
      expectNode(rootClone, "type1", "value1", "token1");

      let childClone = rootClone.children[0];
      child.value = "mutated";
      expectNode(childClone, "type2", "value2", "token2");

      let grandClone = childClone.children[0];
      grand.token = "mutated";
      expectNode(grandClone, "type3", "value3", "token3");
    });
  });
});
