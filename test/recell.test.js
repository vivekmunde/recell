import React from 'react';
import { mount } from 'enzyme';
import { useGetState, useSetState, createState } from '../src';

describe('recell', () => {
  test('Demo', () => {
    expect.hasAssertions();

    const userDetailsCell = createState({ name: 'One' });

    const View1 = () => {
      const userDetails = useGetState(userDetailsCell);

      return (<span id="name1">{userDetails.name}</span>);
    };
    const View2 = () => {
      const userDetails = useGetState(userDetailsCell);

      return (<span id="name2">{userDetails.name}</span>);
    };

    const Button = () => {
      const setState = useSetState(userDetailsCell);

      const changeName = () => {
        setState({ name: 'two' });
      };

      return (<button id="button" onClick={changeName}>Change</button>);
    };

    const wrapper = mount(
      <div>
        <View1 />
        <View2 />
        <Button />
      </div>
    );

    expect(wrapper.find('#name1').text()).toEqual('One');
    expect(wrapper.find('#name2').text()).toEqual('One');

    wrapper.find('#button').simulate('click');

    expect(wrapper.find('#name1').text()).toEqual('two');
    expect(wrapper.find('#name2').text()).toEqual('two');
  });
});
