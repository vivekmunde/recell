import { createPublication, publish, subscribe } from 'pusu';

const defaultReducer = (newState, oldState) => {
  return {
    ...oldState,
    ...newState,
  };
};

const createState = (initialState, reducer, name) => {
  const fnReducer = reducer ?? defaultReducer;
  const publication = createPublication(name);
  let currentState = initialState ?? {};

  const getState = () => currentState;

  return {
    getState,
    setState: (newState) => {
      currentState = fnReducer(newState, currentState);
      publish(publication, currentState);
    },
    subscribe: (listener) => subscribe(publication, listener),
  };
};

export default createState;
