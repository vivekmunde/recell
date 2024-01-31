import { mount } from "enzyme";
import areEqual from "fast-deep-equal";
import React from "react";
import { Configure, createCell, useGetState, useSetState } from "../lib/es";

describe("recell: hooks", () => {
  test("Should check selector type to be a function", () => {
    expect.hasAssertions();

    const cellInstance = createCell({});

    const selectorTypes = [
      true,
      123,
      "string",
      Symbol("S"),
      [1, 2, 3],
      undefined,
    ];

    const View = (selector) => {
      let state = {};
      expect(() => {
        state = useGetState(cellInstance, selector);
      }).toThrow(new Error("Selector must be a function."));
      return <div>{JSON.stringify(state)}</div>;
    };

    selectorTypes.forEach((selector) => mount(<View selector={selector} />));
  });

  test("Should initialize default state", () => {
    expect.hasAssertions();

    const userDetailsCell = createCell({ name: "Default" });

    const View1 = () => {
      const userDetails = useGetState(userDetailsCell, (state) => state);
      return <span id="name1">{userDetails.name}</span>;
    };

    const wrapper = mount(
      <div>
        <View1 />
      </div>
    );

    expect(wrapper.find("#name1").text()).toEqual("Default");
  });

  test("Should update store state and assign the updated state to subscriber components", () => {
    expect.hasAssertions();

    const userDetailsCell = createCell({ name: "One" });

    const View1 = () => {
      const name = useGetState(userDetailsCell, (state) => state.name);
      return <span id="name1">{name}</span>;
    };

    const View2 = () => {
      const name = useGetState(userDetailsCell, (state) => state.name);
      return <span id="name2">{name}</span>;
    };

    const Button1 = () => {
      const setState = useSetState(userDetailsCell);
      const changeName = () => {
        setState(() => ({ name: "Two" }));
      };
      return (
        <button id="button1" onClick={changeName}>
          Change
        </button>
      );
    };

    const Button2 = () => {
      const setState = useSetState(userDetailsCell);
      const changeName = () => {
        setState(() => ({ name: "Three" }));
      };
      return (
        <button id="button2" onClick={changeName}>
          Change
        </button>
      );
    };

    const wrapper = mount(
      <Configure>
        <View1 />
        <View2 />
        <Button1 />
        <Button2 />
      </Configure>
    );

    expect(wrapper.find("#name1").text()).toEqual("One");
    expect(wrapper.find("#name2").text()).toEqual("One");

    wrapper.find("#button1").simulate("click");

    expect(wrapper.find("#name1").text()).toEqual("Two");
    expect(wrapper.find("#name2").text()).toEqual("Two");

    wrapper.find("#button2").simulate("click");

    expect(wrapper.find("#name1").text()).toEqual("Three");
    expect(wrapper.find("#name2").text()).toEqual("Three");
  });

  test("Should use the default configuration", () => {
    expect.hasAssertions();

    const userDetailsCell = createCell({ name: "One" });

    const View1 = () => {
      const name = useGetState(userDetailsCell, (state) => state.name);
      return <span id="name1">{name}</span>;
    };

    const View2 = () => {
      const name = useGetState(userDetailsCell, (state) => state.name);
      return <span id="name2">{name}</span>;
    };

    const Button1 = () => {
      const setState = useSetState(userDetailsCell);
      const changeName = () => {
        setState(() => ({ name: "Two" }));
      };
      return (
        <button id="button1" onClick={changeName}>
          Change
        </button>
      );
    };

    const Button2 = () => {
      const setState = useSetState(userDetailsCell);
      const changeName = () => {
        setState(() => ({ name: "Three" }));
      };
      return (
        <button id="button2" onClick={changeName}>
          Change
        </button>
      );
    };

    const wrapper = mount(
      <div>
        <View1 />
        <View2 />
        <Button1 />
        <Button2 />
      </div>
    );

    expect(wrapper.find("#name1").text()).toEqual("One");
    expect(wrapper.find("#name2").text()).toEqual("One");

    wrapper.find("#button1").simulate("click");

    expect(wrapper.find("#name1").text()).toEqual("Two");
    expect(wrapper.find("#name2").text()).toEqual("Two");

    wrapper.find("#button2").simulate("click");

    expect(wrapper.find("#name1").text()).toEqual("Three");
    expect(wrapper.find("#name2").text()).toEqual("Three");
  });

  test("Should return only the selected state", () => {
    expect.hasAssertions();

    const userDetailsCell = createCell({
      name: "One",
      address: "ABC Road, PQR Apartment, XYZ, 123",
      profession: "Engineer",
    });

    const Name = () => {
      const name = useGetState(userDetailsCell, ({ name }) => name);
      return <span id="name">{name}</span>;
    };

    const Address = () => {
      const address = useGetState(userDetailsCell, ({ address }) => address);
      return <span id="address">{address}</span>;
    };

    const Profession = () => {
      const profession = useGetState(
        userDetailsCell,
        ({ profession }) => profession
      );
      return <span id="profession">{profession}</span>;
    };

    const wrapper = mount(
      <div>
        <Name />
        <Address />
        <Profession />
      </div>
    );

    expect(wrapper.find("#name").text()).toEqual("One");
    expect(wrapper.find("#address").text()).toEqual(
      "ABC Road, PQR Apartment, XYZ, 123"
    );
    expect(wrapper.find("#profession").text()).toEqual("Engineer");
  });

  test("Should re-render only if the selected state has changed", () => {
    expect.hasAssertions();

    const userDetailsCell = createCell({
      name: "One",
      address: "ABC Road, PQR Apartment, XYZ, 123",
      profession: "Engineer",
    });

    const fnNameSubscriber = jest.fn();
    const Name = () => {
      const name = useGetState(userDetailsCell, ({ name }) => name);
      fnNameSubscriber();
      return <span id="name">{name}</span>;
    };

    const fnAddressSubscriber = jest.fn();
    const Address = () => {
      const address = useGetState(userDetailsCell, ({ address }) => address);
      fnAddressSubscriber();
      return <span id="address">{address}</span>;
    };

    const fnProfessionSubscriber = jest.fn();
    const Profession = () => {
      const profession = useGetState(
        userDetailsCell,
        ({ profession }) => profession
      );
      fnProfessionSubscriber();
      return <span id="profession">{profession}</span>;
    };

    const ChangeName = () => {
      const setState = useSetState(userDetailsCell);
      const changeName = () => {
        setState((state) => ({ ...state, name: "Two" }));
      };
      return (
        <button id="changeName" onClick={changeName}>
          Change
        </button>
      );
    };

    const ChangeAddress = () => {
      const setState = useSetState(userDetailsCell);
      const changeAddress = () => {
        setState((state) => ({
          ...state,
          address: "LMN Road, Q Apartment, HTQ, 321",
        }));
      };
      return (
        <button id="changeAddress" onClick={changeAddress}>
          Change
        </button>
      );
    };

    const SetSameProfession = () => {
      const setState = useSetState(userDetailsCell);
      const setSameProfession = () => {
        setState((state) => ({ ...state, profession: "Engineer" }));
      };
      return (
        <button id="setSameProfession" onClick={setSameProfession}>
          Change
        </button>
      );
    };

    const wrapper = mount(
      <Configure areEqual={(a, b) => areEqual(a, b)}>
        <Name />
        <Address />
        <Profession />
        <ChangeName />
        <ChangeAddress />
        <SetSameProfession />
      </Configure>
    );

    expect(wrapper.find("#name").text()).toEqual("One");
    expect(fnNameSubscriber).toHaveBeenCalledTimes(1);
    expect(wrapper.find("#address").text()).toEqual(
      "ABC Road, PQR Apartment, XYZ, 123"
    );
    expect(fnAddressSubscriber).toHaveBeenCalledTimes(1);
    expect(wrapper.find("#profession").text()).toEqual("Engineer");
    expect(fnProfessionSubscriber).toHaveBeenCalledTimes(1);

    wrapper.find("#changeName").simulate("click");

    expect(wrapper.find("#name").text()).toEqual("Two");
    expect(fnNameSubscriber).toHaveBeenCalledTimes(2);
    expect(wrapper.find("#address").text()).toEqual(
      "ABC Road, PQR Apartment, XYZ, 123"
    );
    expect(fnAddressSubscriber).toHaveBeenCalledTimes(1);
    expect(wrapper.find("#profession").text()).toEqual("Engineer");
    expect(fnProfessionSubscriber).toHaveBeenCalledTimes(1);

    wrapper.find("#changeAddress").simulate("click");

    expect(wrapper.find("#name").text()).toEqual("Two");
    expect(fnNameSubscriber).toHaveBeenCalledTimes(2);
    expect(wrapper.find("#address").text()).toEqual(
      "LMN Road, Q Apartment, HTQ, 321"
    );
    expect(fnAddressSubscriber).toHaveBeenCalledTimes(2);
    expect(wrapper.find("#profession").text()).toEqual("Engineer");
    expect(fnProfessionSubscriber).toHaveBeenCalledTimes(1);

    wrapper.find("#setSameProfession").simulate("click");

    expect(wrapper.find("#name").text()).toEqual("Two");
    expect(fnNameSubscriber).toHaveBeenCalledTimes(2);
    expect(wrapper.find("#address").text()).toEqual(
      "LMN Road, Q Apartment, HTQ, 321"
    );
    expect(fnAddressSubscriber).toHaveBeenCalledTimes(2);
    expect(wrapper.find("#profession").text()).toEqual("Engineer");
    expect(fnProfessionSubscriber).toHaveBeenCalledTimes(1);
  });

  test("Should call the custom equality comparison function", () => {
    expect.hasAssertions();

    const userDetailsCell = createCell({
      name: "One",
      address: "ABC Road, PQR Apartment, XYZ, 123",
      profession: "Engineer",
    });

    const Name = () => {
      const { name } = useGetState(
        userDetailsCell,
        ({ name }) => ({ name }),
        (prev, curr) => prev.name === curr.name
      );
      return <span id="name">{name}</span>;
    };

    const Address = () => {
      const address = useGetState(
        userDetailsCell,
        ({ address }) => address,
        (prev, curr) => prev === curr
      );
      return <span id="address">{address}</span>;
    };

    const ChangeName = () => {
      const setState = useSetState(userDetailsCell);
      const changeName = () => {
        setState((state) => ({ ...state, name: "Two" }));
      };
      return (
        <button id="changeName" onClick={changeName}>
          Change
        </button>
      );
    };

    const ChangeAddress = () => {
      const setState = useSetState(userDetailsCell);
      const changeAddress = () => {
        setState((state) => ({
          ...state,
          address: "LMN Road, Q Apartment, HTQ, 321",
        }));
      };
      return (
        <button id="changeAddress" onClick={changeAddress}>
          Change
        </button>
      );
    };

    const wrapper = mount(
      <Configure>
        <Name />
        <Address />
        <ChangeName />
        <ChangeAddress />
      </Configure>
    );

    expect(wrapper.find("#name").text()).toEqual("One");
    expect(wrapper.find("#address").text()).toEqual(
      "ABC Road, PQR Apartment, XYZ, 123"
    );

    wrapper.find("#changeName").simulate("click");
    wrapper.find("#changeAddress").simulate("click");

    expect(wrapper.find("#name").text()).toEqual("Two");
    expect(wrapper.find("#address").text()).toEqual(
      "LMN Road, Q Apartment, HTQ, 321"
    );
  });
});
