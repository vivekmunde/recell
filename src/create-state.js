import { createPublication, publish, subscribe } from 'pusu';

const defaultReducer = (newState, oldState) => ({
  ...oldState,
  ...newState,
});

const createState = (initialState, reducer) => {
  const fnReducer = reducer ?? defaultReducer;
  const publication = createPublication();
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
