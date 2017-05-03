const Printer = require("./printer");

class Grapher {
  static graph(ast, { binders = false } = {}) {
    return new this(ast, binders).graph();
  }

  constructor(ast, binders) {
    this.ast = ast;
    this.binders = binders;
    this.output = "";
    this.nodes = [];
  }

  graph() {
    this.output += "digraph g {\n";
    this.setFont();
    this.graphNamingContext();
    this.graphTree();
    this.output += "}\n";

    return this.output;
  }

  setFont() {
    this.output += `graph[fontname="helvetica"];\n`;
    this.output += `node[fontname="helvetica"];\n`;
    this.output += `edge[fontname="helvetica"];\n`;
  }

  graphTree() {
    const title = Printer.print(this.ast);

    this.output += "subgraph cluster_tree {\n";
    this.output += `graph[label="${this.htmlSafe(title)}"];\n`;
    this.output += `graph[style="dotted"];\n`;
    this.graphNode(this.ast);
    this.output += "}\n";
  }

  graphNamingContext() {
    this.output += "subgraph cluster_free {\n";
    this.output += `graph[label="${this.htmlSafe("Γ")}"];\n`;
    this.output += `graph[style="dotted"];\n`;

    const namingContext = this.ast.namingContext;

    for (let i = 0; i < namingContext.length; i += 1) {
      const freeVar = namingContext[i];
      this.graphNode(freeVar);
    }

    this.output += "}\n";
  }

  graphNode(node) {
    const id = this.id(node);

    this.output += id + "[";
    this.output += `label="${this.htmlSafe(this.label(node))}"`;
    this.output += `,shape="${this.shape(node)}"`;
    this.output += `,color="${this.color(node)}"`;
    this.output += `,style="filled"`;
    this.output += "];\n";

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      this.graphNode(child);

      const childId = this.id(child);
      this.output += id + " -> " + childId;
      this.output += `[dir="none"];\n`;
    }

    if (this.binders && node.binder) {
      const binderId = this.id(node.binder);
      this.output += id + " -> " + binderId;
      this.output += `[constraint="false",style="dashed",color="#AAAAAA"];\n`;
    }
  }

  id(node) {
    let index = this.nodes.indexOf(node);

    if (index === -1) {
      this.nodes.push(node);
      index = this.nodes.length - 1;
    }

    return "node_" + index;
  }

  label(node) {
    switch (node.type) {
      case "abstraction": return "λ" + node.name;
      case "application": return "apply";
      case "variable": return node.binder.name;
      case "type": return this.typeName(node);
      case "free-variable": return node.name;
    }
  }

  typeName(node) {
    return node.value ? node.value : "";
  }

  shape(node) {
    switch (node.type) {
      case "abstraction": return "box";
      case "application": return "oval";
      case "variable": return "circle";
      case "type": return "diamond";
      case "free-variable": return "square";
    }
  }

  color(node) {
    switch (node.type) {
      case "abstraction": return "#CAFEB8";
      case "application": return "#FFFF99";
      case "variable": return "#CCCCCC";
      case "type": return "#CACAFF";
      case "free-variable": return "#FFC8F2";
    }
  }

  htmlSafe(string) {
    return string.replace(/λ/g, "&lambda;").replace(/Γ/, "&Gamma;");
  }
}

module.exports = Grapher;
