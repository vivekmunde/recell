import React from 'react';
import { mount } from 'enzyme';
import { useGetState, useSetState, createState, withGetState, withSetState } from '../src';

describe('recell', () => {
  test('Should initialize default empty state', () => {
    expect.hasAssertions();

    const userDetailsCell = createState();

    const View1 = () => {
      const userDetails = useGetState(userDetailsCell);
      return (<span id="name1">{userDetails.name ?? 'NotAvailable'}</span>);
    };

    const wrapper = mount(
      <div>
        <View1 />
      </div>
    );

    expect(wrapper.find('#name1').text()).toEqual('NotAvailable');
  });

  test('Should update store state and assign the updated state to subscriber components', () => {
    expect.hasAssertions();

    const userDetailsCell = createState({ name: 'One' });

    const View1 = () => {
      const userDetails = useGetState(userDetailsCell);
      return (<span id="name1">{userDetails.name}</span>);
    };

    const View2 = withGetState(({ name }) => {
      return (<span id="name2">{name}</span>);
    }, userDetailsCell);

    const Button1 = () => {
      const setState = useSetState(userDetailsCell);
      const changeName = () => {
        setState({ name: 'Two' });
      };
      return (<button id="button1" onClick={changeName}>Change</button>);
    };

    const Button2 = withSetState(({ setState }) => {
      const changeName = () => {
        setState({ name: 'Three' });
      };
      return (<button id="button2" onClick={changeName}>Change</button>);
    }, userDetailsCell);

    const wrapper = mount(
      <div>
        <View1 />
        <View2 />
        <Button1 />
        <Button2 />
      </div>
    );

    expect(wrapper.find('#name1').text()).toEqual('One');
    expect(wrapper.find('#name2').text()).toEqual('One');

    wrapper.find('#button1').simulate('click');

    expect(wrapper.find('#name1').text()).toEqual('Two');
    expect(wrapper.find('#name2').text()).toEqual('Two');

    wrapper.find('#button2').simulate('click');

    expect(wrapper.find('#name1').text()).toEqual('Three');
    expect(wrapper.find('#name2').text()).toEqual('Three');
  });

  test('Should return only the selected state (using selector)', () => {
    expect.hasAssertions();

    const userDetailsCell = createState({ name: 'One', address: 'ABC Road, PQR Apartment, XYZ, 123', profession: 'Engineer' });

    const Name = () => {
      const name = useGetState(userDetailsCell, (({ name }) => name));
      return (<span id="name">{name}</span>);
    };

    const Address = withGetState(({ address }) => {
      return (<span id="address">{address}</span>);
    }, userDetailsCell, ({ address }) => ({ address }));

    const Profession = () => {
      const { profession } = useGetState(userDetailsCell, ({ profession }) => ({ profession }));
      return (<span id="profession">{profession}</span>);
    };

    const wrapper = mount(
      <div>
        <Name />
        <Address />
        <Profession />
      </div>
    );

    expect(wrapper.find('#name').text()).toEqual('One');
    expect(wrapper.find('#address').text()).toEqual('ABC Road, PQR Apartment, XYZ, 123');
    expect(wrapper.find('#profession').text()).toEqual('Engineer');
  });

  test('Should re-render only if the selected state has changed', () => {
    expect.hasAssertions();

    const userDetailsCell = createState({ name: 'One', address: 'ABC Road, PQR Apartment, XYZ, 123', profession: 'Engineer' });

    const fnNameSubscriber = jest.fn();
    const Name = () => {
      const name = useGetState(userDetailsCell, (({ name }) => name));
      fnNameSubscriber();
      return (<span id="name">{name}</span>);
    };

    const fnAddressSubscriber = jest.fn();
    const Address = withGetState(({ address }) => {
      fnAddressSubscriber();
      return (<span id="address">{address}</span>);
    }, userDetailsCell, ({ address }) => ({ address }));

    const fnProfessionSubscriber = jest.fn();
    const Profession = () => {
      const { profession } = useGetState(userDetailsCell, ({ profession }) => ({ profession }));
      fnProfessionSubscriber();
      return (<span id="profession">{profession}</span>);
    };

    const ChangeName = () => {
      const setState = useSetState(userDetailsCell);
      const changeName = () => {
        setState({ name: 'Two' });
      };
      return (<button id="changeName" onClick={changeName}>Change</button>);
    };

    const ChangeAddress = withSetState(({ setState }) => {
      const changeAddress = () => {
        setState({ address: 'LMN Road, Q Apartment, HTQ, 321' });
      };
      return (<button id="changeAddress" onClick={changeAddress}>Change</button>);
    }, userDetailsCell);

    const SetSameProfession = () => {
      const setState = useSetState(userDetailsCell);
      const setSameProfession = () => {
        setState({ profession: 'Engineer' });
      };
      return (<button id="setSameProfession" onClick={setSameProfession}>Change</button>);
    };

    const wrapper = mount(
      <div>
        <Name />
        <Address />
        <Profession />
        <ChangeName />
        <ChangeAddress />
        <SetSameProfession />
      </div>
    );

    expect(wrapper.find('#name').text()).toEqual('One');
    expect(fnNameSubscriber).toHaveBeenCalledTimes(1);
    expect(wrapper.find('#address').text()).toEqual('ABC Road, PQR Apartment, XYZ, 123');
    expect(fnAddressSubscriber).toHaveBeenCalledTimes(1);
    expect(wrapper.find('#profession').text()).toEqual('Engineer');
    expect(fnProfessionSubscriber).toHaveBeenCalledTimes(1);

    wrapper.find('#changeName').simulate('click');

    expect(wrapper.find('#name').text()).toEqual('Two');
    expect(fnNameSubscriber).toHaveBeenCalledTimes(2);
    expect(wrapper.find('#address').text()).toEqual('ABC Road, PQR Apartment, XYZ, 123');
    expect(fnAddressSubscriber).toHaveBeenCalledTimes(1);
    expect(wrapper.find('#profession').text()).toEqual('Engineer');
    expect(fnProfessionSubscriber).toHaveBeenCalledTimes(1);

    wrapper.find('#changeAddress').simulate('click');

    expect(wrapper.find('#name').text()).toEqual('Two');
    expect(fnNameSubscriber).toHaveBeenCalledTimes(2);
    expect(wrapper.find('#address').text()).toEqual('LMN Road, Q Apartment, HTQ, 321');
    expect(fnAddressSubscriber).toHaveBeenCalledTimes(2);
    expect(wrapper.find('#profession').text()).toEqual('Engineer');
    expect(fnProfessionSubscriber).toHaveBeenCalledTimes(1);

    wrapper.find('#setSameProfession').simulate('click');

    expect(wrapper.find('#name').text()).toEqual('Two');
    expect(fnNameSubscriber).toHaveBeenCalledTimes(2);
    expect(wrapper.find('#address').text()).toEqual('LMN Road, Q Apartment, HTQ, 321');
    expect(fnAddressSubscriber).toHaveBeenCalledTimes(2);
    expect(wrapper.find('#profession').text()).toEqual('Engineer');
    expect(fnProfessionSubscriber).toHaveBeenCalledTimes(1);
  });

  test('Should call the custom equality comparison function and re-render only if not equal', () => {
    expect.hasAssertions();

    const userDetailsCell = createState({ name: 'One', address: 'ABC Road, PQR Apartment, XYZ, 123', profession: 'Engineer' });

    const Name = () => {
      const name = useGetState(userDetailsCell, (({ name }) => name), (prev, curr) => prev === curr);
      return (<span id="name">{name}</span>);
    };

    const Address = withGetState(({ address }) => {
      return (<span id="address">{address}</span>);
    }, userDetailsCell, ({ address }) => ({ address }), (prev, curr) => prev === curr);

    const ChangeName = () => {
      const setState = useSetState(userDetailsCell);
      const changeName = () => {
        setState({ name: 'Two' });
      };
      return (<button id="changeName" onClick={changeName}>Change</button>);
    };

    const ChangeAddress = withSetState(({ setState }) => {
      const changeAddress = () => {
        setState({ address: 'LMN Road, Q Apartment, HTQ, 321' });
      };
      return (<button id="changeAddress" onClick={changeAddress}>Change</button>);
    }, userDetailsCell);

    const wrapper = mount(
      <div>
        <Name />
        <Address />
        <ChangeName />
        <ChangeAddress />
      </div>
    );

    expect(wrapper.find('#name').text()).toEqual('One');
    expect(wrapper.find('#address').text()).toEqual('ABC Road, PQR Apartment, XYZ, 123');

    wrapper.find('#changeName').simulate('click');
    wrapper.find('#changeAddress').simulate('click');

    expect(wrapper.find('#name').text()).toEqual('Two');
    expect(wrapper.find('#address').text()).toEqual('LMN Road, Q Apartment, HTQ, 321');
  });
});
