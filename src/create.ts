import * as pusu from "pusu";
import { TCell, TOnGetState, TOnSetState, TOnSubscribe } from "./types";

/**
 * Creates a new cell object.
 *
 * @param {T} initialState - Initial state.
 * @returns An instance of the cell having the state accessing & updating methods.
 */
const create = <T>(initialState: T): TCell<T> => {
  const publication = pusu.createPublication<T>("cell");
  let currentState = initialState;

  const getState: TOnGetState<T> = () => currentState;

  const setState: TOnSetState<T> = (reducer) => {
    currentState = reducer(currentState);

    if (currentState === undefined || currentState === null) {
      throw new Error("State cannot be undefined or null.");
    }

    pusu.publish(publication, currentState);
  };

  const subscribe: TOnSubscribe<T> = (subscriber) => {
    if (typeof subscriber !== "function") {
      throw new Error("Subscriber must be a function.");
    }

    return pusu.subscribe(publication, (state) => {
      subscriber(state as T);
    });
  };

  return {
    getState,
    setState,
    subscribe,
  };
};

export default create;
