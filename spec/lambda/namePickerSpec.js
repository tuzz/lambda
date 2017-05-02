"use strict";

const DescribedClass = lib("lambda/namePicker");

describe("NamePicker", () => {
  let result;

  const alphabet = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
    "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
    "u", "v", "w", "x", "y", "z"
  ];

  const primeAlphabet = [
    "a'", "b'", "c'", "d'", "e'", "f'", "g'", "h'", "i'", "j'",
    "k'", "l'", "m'", "n'", "o'", "p'", "q'", "r'", "s'", "t'",
    "u'", "v'", "w'", "x'", "y'", "z'"
  ];

  it("picks the hint name", () => {
    result = DescribedClass.pick("foo");
    expect(result).toEqual("foo");
  });

  it("increments the first letter if the name is taken", () => {
    result = DescribedClass.pick("foo", ["foo"]);
    expect(result).toEqual("g");

    result = DescribedClass.pick("foo", ["foo", "g"]);
    expect(result).toEqual("h");
  });

  it("picks 'x' if the hint is undefined", () => {
    result = DescribedClass.pick(undefined);
    expect(result).toEqual("x");

    result = DescribedClass.pick(undefined, ["x"]);
    expect(result).toEqual("y");
  });

  it("wraps around after 'z'", () => {
    result = DescribedClass.pick("z", ["z"]);
    expect(result).toEqual("a");

    result = DescribedClass.pick("z", ["z", "a"]);
    expect(result).toEqual("b");
  });

  it("adds primes after the alphabet is used up", () => {
    result = DescribedClass.pick("f", alphabet);
    expect(result).toEqual("f'");

    result = DescribedClass.pick("f", ["f'"].concat(alphabet));
    expect(result).toEqual("g'");
  });

  it("continues to add primes", () => {
    const combined = alphabet.concat(primeAlphabet);

    result = DescribedClass.pick("f", combined);
    expect(result).toEqual("f''");

    result = DescribedClass.pick("f", ["f''"].concat(combined));
    expect(result).toEqual("g''");
  });

  it("lowercases uppercase names", () => {
    result = DescribedClass.pick("F");
    expect(result).toEqual("f");

    result = DescribedClass.pick("F", ["f"]);
    expect(result).toEqual("g");
  });
});
