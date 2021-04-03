import React from 'react';
import useSetState from './use-set-state';

const fnWithSetState = (Component, cell) => {
  const WithSetState = (props) => {
    const setState = useSetState(cell);

    return <Component {...props} setState={setState} />;
  };

  return WithSetState;
};

export default fnWithSetState;
