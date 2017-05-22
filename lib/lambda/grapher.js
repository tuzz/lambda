const Printer = require("./printer");

class Grapher {
  static graph(ast, { binders = false, names = true } = {}) {
    return new this(ast, binders, names).graph();
  }

  constructor(ast, binders, names) {
    this.ast = ast;
    this.drawBinders = binders;
    this.showNames = names;
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
    const title = Printer.print(this.ast, { names: this.showNames });

    this.output += "subgraph cluster_tree {\n";
    this.output += `graph[label="${this.htmlSafe(title)}"];\n`;
    this.output += `graph[style="dotted"];\n`;
    this.graphNode(this.ast, this.ast.namingContext);
    this.output += "}\n";
  }

  graphNamingContext() {
    this.output += "subgraph cluster_free {\n";
    this.output += `graph[label="${this.htmlSafe("Γ")}"];\n`;
    this.output += `graph[style="dotted"];\n`;

    const namingContext = this.ast.namingContext || [];

    for (let i = 0; i < namingContext.length; i += 1) {
      const freeVar = namingContext[i];
      this.graphNode(freeVar);
    }

    this.output += "}\n";
  }

  graphNode(node, binders) {
    if (node.type === "abstraction") {
      binders = [node].concat(binders);
    }

    const id = this.id(node);

    this.output += id + "[";
    this.output += `label="${this.htmlSafe(this.label(node, binders))}"`;
    this.output += `,shape="${this.shape(node)}"`;
    this.output += `,color="${this.color(node)}"`;
    this.output += `,style="filled"`;
    this.output += "];\n";

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      this.graphNode(child, binders);

      const childId = this.id(child);
      this.output += id + " -> " + childId;
      this.output += `[dir="none"];\n`;
    }

    if (this.drawBinders && node.type === "variable") {
      const binder = binders[node.index];

      if (binder) {
        const binderId = this.id(binder);

        this.output += id + " -> " + binderId;
        this.output += `[constraint="false",style="dashed",color="#AAAAAA"];\n`;
      }
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

  label(node, binders) {
    switch (node.type) {
      case "abstraction": return this.abstractionName(node);
      case "application": return "apply";
      case "variable": return this.variableName(node, binders);
      case "type": return this.typeName(node);
      case "function-type": return "→";
      case "free-variable": return this.freeVarName(node);
    }
  }

  abstractionName(node) {
    return this.showNames ? "λ" + node.name : "λ";
  }

  variableName(node, binders) {
    const index = node.index.toString();
    const binder = binders[node.index];

    if (this.showNames) {
      return binder ? binder.name : "?";
    } else {
      return index;
    }
  }

  typeName(node) {
    return node.value ? node.value : "";
  }

  freeVarName(node) {
    const index = this.ast.namingContext.indexOf(node).toString();
    return this.showNames ? node.name : index;
  }

  shape(node) {
    switch (node.type) {
      case "abstraction": return "box";
      case "application": return "oval";
      case "variable": return "circle";
      case "type": return "diamond";
      case "function-type": return "pentagon";
      case "free-variable": return "square";
    }
  }

  color(node) {
    switch (node.type) {
      case "abstraction": return "#CAFEB8";
      case "application": return "#FFFF99";
      case "variable": return "#CCCCCC";
      case "type": return "#CACAFF";
      case "function-type": return "#FF9C94";
      case "free-variable": return "#FFC8F2";
    }
  }

  htmlSafe(string) {
    return string
			.replace(/λ/g, "&lambda;")
			.replace(/Γ/g, "&Gamma;")
			.replace(/→/g, "&rarr;");
  }
}

module.exports = Grapher;
