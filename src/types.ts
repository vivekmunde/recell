/**
 * An equality comparator function which receives current and previous selected state.
 * It can used to compare these states to decide if the state has changed.
 * It needs to return a boolean value.
 * True: Meaning the selected state has not changed.
 * False: Meaning selected value has changed.
 * If the equality comparator function not passed then it uses the comparator function configured in the configuration provider.
 * If it's not configured in the configuration provider then it uses the default equality comparator i.e. (current, previous) => (current === previous).
 *
 * @param {T} currentState - Current selected state of the cell.
 * @param {T} previousState - Previous selected state of the cell.
 * @returns {boolean} A boolean result indicating if the selected state has changed or not. True: Meaning selected state has not changed. False: Meaning selected state has changed.
 */
export type TAreEqual<T> = (currentState: T, previousState: T) => boolean;

/**
 * A configuration object to configure the equality comparator which is used in the hook `useGetState`.
 *
 */
export type TContext = {
  /** An equality comparator function which receives current and previous selected state. It can used to compare these states to decide if the state has changed. It needs to return a boolean value. True: Meaning the selected state has not changed. False: Meaning selected value has changed. If the equality comparator function not passed then it uses the comparator function configured in the configuration provider. If it's not configured in the configuration provider then it uses the default equality comparator i.e. (current, previous) => (current === previous). */
  areEqual: <T>(currState: T | undefined, prevState: T) => boolean;
};

/**
 * A subscriber function to be called each time the state change is published.
 *
 * @param {TSelectedState} state - The selected state. If selector is not provided then the entire state is returned.
 */
export type TSubscriber<TSelectedState> = (state: TSelectedState) => void;

/**
 * An unsubscriber function, which when called unsubscribes the subscriber function from from the state updates.
 */
export type TUnsubscribe = () => void;

/**
 * A selector function to select the required state value(s) from the state.
 *
 * @param {TState} state - Latest state of the cell.
 * @returns {TSelectedState} Selected state.
 */
export type TSelector<TState, TSelectedState> = (
  state: TState
) => TSelectedState;

/**
 * A reducer function which recieves the current state fo the cell and should return the updated state.
 *
 * @param {function} state - Current state of the cell.
 * @returns {TState} Latest updated state.
 */
export type TReducer<TState> = (state: TState) => TState;

/**
 * Configuration options to be provided to the cell being created.
 *
 * @property {string} name - Name of the cell. Used in logging. Default: "Unknown".
 * @property {boolean} enableLogging - Enable/disable console logging. Useful in development and/or test environments. If enabled then each action "create" | "publish" | "subscribe" | "unsubscribe" | "notify" gets logged on console with relevent data.
 */
export type TCellConfiguration = {
  name?: string;
  enableLogging?: boolean;
};

/**
 * Action to log.
 */
export type TLogAction =
  /** When cell is created. */
  | "create"
  /** When state is published. */
  | "publish"
  /** When a subscriber function is subscribed. */
  | "subscribe"
  /** When a subscriber function is unsubscribed. */
  | "unsubscribe"
  /** When a subscriber function is called. */
  | "notify";

/**
 * Selected state to log.
 *
 * @property {TState} current - Current selected state of the cell.
 * @property {TState} previous - Previous selected state of the cell.
 */
export type TSelectedStateLog<TSelectedState> = {
  previous: TSelectedState;
  current: TSelectedState;
};

/**
 * State to log.
 *
 * @property {TState} current - Current state of the cell.
 * @property {TState} previous - Previous state of the cell.
 * @property {TState} selected - Selected state selected by the selector and then published and sent to the subscribers.
 */
export type TStateLog<TState, TSelectedState> = {
  current: TState;
  previous: TState;
  selected?: TSelectedStateLog<TSelectedState>;
};

/**
 * Information to log.
 *
 * @property {string} cell - Name of the cell. Default: 'Unknown'
 * @property {TLogAction} action - Action.
 * @property {TStateLog} state - State to log.
 * @property {any} - Any metadata. E.g. when the subscribers are called then the subscriber function name is added in the metadata.
 */
export type TLog<TStateLog, TMetaData> = {
  cell: string;
  action: TLogAction;
  state: TStateLog;
  meta?: TMetaData;
};

export type TCell<TState> = {
  /**
   * Updates the state in cell and calls all subscribers with the updated state.
   *
   * @param {TReducer} reducer - A reducer function which recieves the current state fo the cell and should return the updated state.
   */
  publish: (reducer: TReducer<TState>) => void;
  /**
   * Subscribes to the updates in the state of the cell.
   *
   * @param {TSubscriber} subscriber - A subscriber function to be called each time the state change is published. The subscriber function will recieve the data selected and returned by the selector function. If selector is not supplied then the subscruber function will receive the complete state.
   * @param {TSelector} selector - A selector function to select the required state value(s) from the state and return the selected state.
   * @param {TAreEqual} areEqual - An equality comparator function which receives current and previous selected state. It can used to compare these states to decide if the state has changed. It needs to return a boolean value. True: Meaning the selected state has not changed. False: Meaning selected value has changed. If the equality comparator function not passed then it uses the comparator function configured in the configuration provider. If it's not configured in the configuration provider then it uses the default equality comparator i.e. (current, previous) => (current === previous).
   * @returns {TUnsubscribe} An unsubscriber function, which when called unsubscribes the subscriber function from from the state updates.
   */
  subscribe: <TSelectedState>(
    subscriber: TSubscriber<TSelectedState>,
    selector?: TSelector<TState, TSelectedState> | undefined,
    areEqual?: TAreEqual<TSelectedState> | undefined
  ) => TUnsubscribe;
  /**
   * Returns the current state of the cell.
   */
  state: () => TState;
};
