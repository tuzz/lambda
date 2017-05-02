class NamePicker {
  static pick(hint, reserved) {
    return new this(hint, reserved).pick();
  }

  constructor(hint, reserved) {
    this.hint = (hint || "x").toLowerCase();
    this.reserved = reserved || [];
    this.primes = 0;
  }

  pick() {
    let attempt = this.hint;

    while (this.isTaken(attempt)) {
      attempt = this.next(attempt);
    }

    return attempt;
  }

  isTaken(name) {
    return this.reserved.indexOf(name) !== -1;
  }

  next(name) {
    let code = name.charCodeAt(0);

    code += 1;
    code = this.normalise(code);

    if (this.wrappedAround(code)) {
      this.primes += 1;
    }

    name = String.fromCharCode(code);
    for (let i = 0; i < this.primes; i += 1) {
      name += "'";
    }

    return name;
  }

  normalise(code) {
    if (code >= 65 && code <= 90) {
      return code + 32;
    } else if (code >= 97 && code <= 122) {
      return code;
    } else {
      return 97;
    }
  }

  wrappedAround(code) {
    let original = this.hint.charCodeAt(0);
    original = this.normalise(original);
    return original === code;
  }
}

module.exports = NamePicker;
