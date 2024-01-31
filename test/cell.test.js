import { createCell } from "../lib/es";

describe("recell: cell", () => {
  test("Should check subscriber type to be a function", () => {
    expect.hasAssertions();

    const { subscribe } = createCell({});

    const subscriberTypes = [true, 123, "string", Symbol("S"), [1, 2, 3]];

    subscriberTypes.forEach((subscriber) => {
      expect(() => {
        const unsubscribe = subscribe(subscriber);

        unsubscribe();
      }).toThrow(new Error("Subscriber must be a function."));
    });
  });

  test("Should check selector type to be a function", () => {
    expect.hasAssertions();

    const { subscribe } = createCell({});

    const selectorTypes = [true, 123, "string", Symbol("S"), [1, 2, 3]];

    selectorTypes.forEach((selector) => {
      expect(() => {
        const unsubscribe = subscribe(() => {}, selector);

        unsubscribe();
      }).toThrow(new Error("Selector must be a function."));
    });
  });

  test("Should check areEqual type to be a function", () => {
    expect.hasAssertions();

    const { subscribe } = createCell({});

    const isEqualTypes = [true, 123, "string", Symbol("S"), [1, 2, 3]];

    isEqualTypes.forEach((areEqual) => {
      expect(() => {
        const unsubscribe = subscribe(
          () => {},
          (s) => s,
          areEqual
        );

        unsubscribe();
      }).toThrow(new Error("Equality comparer must be a function."));
    });
  });

  test("Should return initial state", () => {
    expect.hasAssertions();

    const { subscribe } = createCell({ name: "name" });

    const unsubscribe1 = subscribe((state) => {
      expect(state).toEqual({ name: "name" });
    });

    const unsubscribe2 = subscribe(
      (state) => {
        expect(state).toEqual("name");
      },
      (state) => state.name
    );

    unsubscribe1();
    unsubscribe2();
  });

  test("Should return the current state", () => {
    expect.hasAssertions();

    const cellInstance = createCell({ name: "x" });

    expect(cellInstance.state()).toEqual({ name: "x" });

    cellInstance.publish(() => ({ name: "y" }));

    expect(cellInstance.state()).toEqual({ name: "y" });
  });

  test("Should return changed state", () => {
    expect.hasAssertions();

    const { subscribe, publish } = createCell({ name: "x" });

    let expectedState = { name: "x" };

    const unsubscribe = subscribe((state) => {
      expect(state).toEqual(expectedState);
    });

    publish(() => {
      expectedState = { name: "y" };

      return { name: "y" };
    });

    unsubscribe();
  });

  test("Should unsubscribe state changes", () => {
    expect.hasAssertions();

    const { subscribe, publish } = createCell({ name: "x" });

    const subscriber = jest.fn();

    const unsubscribe = subscribe(subscriber);

    publish(() => ({ name: "a" }));

    unsubscribe();

    publish(() => ({ name: "b" }));
    publish(() => ({ name: "c" }));

    expect(subscriber).toHaveBeenCalledTimes(2);
  });

  test("Should set current state as argument", () => {
    expect.hasAssertions();

    const { subscribe, publish } = createCell({ name: "x" });

    let expectedState = { name: "x" };

    const subscriber = (state) => {
      expect(state).toEqual(expectedState);
    };

    const unsubscribe = subscribe(subscriber);

    publish((state) => {
      expectedState = { name: "x" };

      expect(state).toEqual(expectedState);

      expectedState = { name: "y" };

      return { name: "y" };
    });

    publish((state) => {
      expectedState = { name: "y" };

      expect(state).toEqual(expectedState);

      expectedState = { name: "z" };

      return { name: "z" };
    });

    unsubscribe();
  });

  test("Should return selected state (I)", () => {
    expect.hasAssertions();

    const { subscribe, publish } = createCell({ name: "a", address: "x" });

    let expectedState = "a";

    const unsubscribe = subscribe(
      (state) => {
        expect(state).toEqual(expectedState);
      },
      (state) => state.name
    );

    publish((state) => {
      return { ...state, address: "y" };
    });

    publish((state) => {
      expectedState = "b";

      return { ...state, name: "b" };
    });

    unsubscribe();
  });

  test("Should return selected state (II)", () => {
    expect.hasAssertions();

    const { subscribe, publish } = createCell({
      name: "a",
      address: "x",
      phone: 123,
    });

    let expectedState = "a, x, 123";

    const unsubscribe = subscribe(
      (state) => {
        expect(state).toEqual(expectedState);
      },
      (state) => [state.name, state.address, state.phone].join(", ")
    );

    publish((state) => {
      expectedState = "a, y, 123";

      return { ...state, address: "y" };
    });

    publish((state) => {
      expectedState = "b, y, 123";

      return { ...state, name: "b" };
    });

    unsubscribe();
  });

  test("Should return selected state (III)", () => {
    expect.hasAssertions();

    const { subscribe, publish } = createCell({
      name: "a",
      address: "x",
      phone: 123,
    });

    let expectedState = { name: "a", phone: 123 };

    const unsubscribe = subscribe(
      (state) => {
        expect(state).toEqual(expectedState);
      },
      (state) => ({ name: state.name, phone: state.phone })
    );

    publish((state) => {
      expectedState = { name: "a", phone: 123 };

      return { ...state, address: "y" };
    });

    publish((state) => {
      expectedState = { name: "b", phone: 321 };

      return { ...state, name: "b", phone: 321 };
    });

    unsubscribe();
  });

  test("Should use equality comparator", () => {
    expect.hasAssertions();

    const { subscribe, publish } = createCell({
      name: "a",
      address: "x",
      phone: 123,
    });

    let expectedState = { name: "a" };

    const unsubscribe = subscribe(
      (state) => {
        expect(state).toEqual(expectedState);
      },
      (state) => ({ name: state.name }),
      (curr, prev) => {
        return curr.name === prev.name;
      }
    );

    publish((state) => {
      return { ...state, address: "y" };
    });

    publish((state) => {
      expectedState = { name: "b" };

      return { ...state, name: "b", phone: 321 };
    });

    unsubscribe();
  });
});
