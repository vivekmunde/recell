import { createPublication, publish, subscribe } from 'pusu';

const defaultReducer = (newState, oldState) => ({
  ...oldState,
  ...newState,
});

const checkState = (state) => {
  const t = typeof state;
  if (t === 'boolean' || t === 'number' || t === 'string' || t === 'bigint' || t === 'symbol' || Array.isArray(state)) {
    throw new Error('State must be a JSON object.');
  }
};

const createState = (initialState, reducer) => {
  checkState(initialState);

  const fnReducer = reducer ?? defaultReducer;
  const publication = createPublication();
  let currentState = { ...(initialState ?? {}) };

  const getState = () => currentState;

  return {
    getState,
    setState: (newState) => {
      checkState(newState);
      currentState = fnReducer(newState, currentState);
      publish(publication, currentState);
    },
    subscribe: (listener) => {
      if (typeof listener !== 'function') {
        throw new Error('Subscriber must be a function.');
      }
      subscribe(publication, listener);
    },
  };
};

export default createState;
