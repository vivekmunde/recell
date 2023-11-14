import * as pusu from "pusu";
import { TCell, TOnGetState, TOnSetState, TOnSubscribe } from "./types";

const createCell = <T>(initialState: T): TCell<T> => {
  const publication = pusu.createPublication<T>("cell");
  let currentState = initialState;

  const getState: TOnGetState<T> = () => currentState;

  const setState: TOnSetState<T> = (reducer) => {
    currentState = reducer(currentState);
    pusu.publish(publication, currentState);
  };

  const subscribe: TOnSubscribe<T> = (subscriber) => {
    if (typeof subscriber !== "function") {
      throw new Error("Subscriber must be a function.");
    }

    return pusu.subscribe(publication, subscriber);
  };

  return {
    getState,
    setState,
    subscribe,
  };
};

export default createCell;
