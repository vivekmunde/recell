import useGetState from './use-get-state';

const fnWithGetState = (Component, cell, selector, areEqual) => {
  const WithGetState = (props) => {
    const state = useGetState(cell, selector, areEqual);

    return <Component {...props} {...state} />;
  };

  return WithGetState;
};

export default fnWithGetState;
