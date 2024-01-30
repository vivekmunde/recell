/**
 * A configuration object to configure the equality comparator which is used in the hook `useGetState`.
 *
 */
export type TContext = {
  /** An equality comparator function which receives previous and next selected state. It can used to compare these states to decide if the state has changed. It needs to return a boolean value. True: Meaning the selected state has not changed. False: Meaning selected value has changed.  */
  areEqual: <T>(prevState: T | undefined, nextState: T) => boolean;
};

/**
 * A function to get the current state of the cell.
 */
export type TOnGetState<T> = () => T;

/**
 * A function to update the state.
 * This function needs to be passed a `reducer` function as a parameter.
 * The `reducer` function receives the current state of the `cell` and it needs to return the updated state.
 */
export type TOnSetState<T> = (reducer: (state: T) => T) => void;

/**
 * A subsriber function which receives the selected state.
 */
export type TSubscriber<T> = (
  /** Selected state. */
  state: T
) => void;

/**
 * A subscriber function to subscribe to the state changes. It returns a function, which unsubscribes when called.
 *
 * @param {TSubscriber} subscriber - A subsriber function which receives the selected state.
 */
export type TOnSubscribe<T> = (subscriber: TSubscriber<T>) => () => void;

/**
 * Insitance of a cell.
 */
export type TCell<T> = {
  /** Function to get the current state. */
  getState: TOnGetState<T>;
  /** Function to set the state. */
  setState: TOnSetState<T>;
  /** A subscriber function to subscribe to the state changes. It returns a function, which unsubscribes when called. */
  subscribe: TOnSubscribe<T>;
};

/**
 * An equality comparator function which receives previous and next selected state.
 * It can used to compare these states to decide if the state has changed.
 * It needs to return a boolean value.
 * True: Meaning the selected state has not changed.
 * False: Meaning selected value has changed.
 */
export type TAreEqual<T> = (
  /** Previous selected state. */
  prevState: T | undefined,
  /** Next selected state. */
  nextState: T
) => boolean;

/**
 * A selector function which receives the complete state of the cell and needs to return the selected state.
 *
 * @param {TState} state - Current state of the cell.
 * @returns {TSelectedState} State selected by the selector.
 */
export type TSelector<TState, TSelectedState> = (
  state: TState
) => TSelectedState;
