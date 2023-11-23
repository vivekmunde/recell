export type TContext = {
  areEqual: <T>(prevState: T | undefined, nextState: T) => boolean;
};

export type TOnGetState<T> = () => T;

export type TOnSetState<T> = (reducer: (state: T) => T) => void;

export type TSubscriber<T> = (state: T) => void;

export type TOnSubscribe<T> = (subscriber: TSubscriber<T>) => () => void;

export type TCell<T> = {
  getState: TOnGetState<T>;
  setState: TOnSetState<T>;
  subscribe: TOnSubscribe<T>;
};
