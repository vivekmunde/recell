import * as pusu from "pusu";
import log from "./log";
import {
  TCellConfiguration,
  TLogAction,
  TStateLogInfo,
  TCell,
  TCreateCell,
} from "./types";

/**
 * Creates and returns a new cell object with publish & subscribe methods.
 *
 * @param {TState} initialState - Initial state to be set in the cell.
 * @returns {Object} Cell.
 */
const createCell: TCreateCell = <TState>(
  initialState: TState,
  config?: TCellConfiguration
): TCell<TState> => {
  const _name = config?.name;
  const _loggingEnabled = config?.enableLogging;

  let previousState = initialState;
  let currentState = initialState;

  const _log = <TSelectedState, TMetaData>(
    action: TLogAction,
    selectedState?: {
      previous: TSelectedState;
      current: TSelectedState;
    },
    meta?: TMetaData
  ) => {
    if (_loggingEnabled) {
      const stateToLog: TStateLogInfo<TState, TSelectedState> = {
        current: currentState,
        previous: previousState,
        selected: selectedState,
      };
      log(_name, action, stateToLog, meta);
    }
  };

  _log("create");

  const publication = pusu.createPublication<TState>({ name: _name });

  const subscribe = <TSelectedState>(
    subscriber: (state: TSelectedState) => void,
    selector?: (state: TState) => TSelectedState,
    areEqual?: (
      currentState: TSelectedState,
      previousState: TSelectedState
    ) => boolean
  ) => {
    if (typeof subscriber !== "function") {
      throw new Error("Subscriber must be a function.");
    }

    if (selector && typeof selector !== "function") {
      throw new Error("Selector must be a function.");
    }

    if (areEqual && typeof areEqual !== "function") {
      throw new Error("Equality comparer must be a function.");
    }

    _log<undefined, { subscriber: string }>("subscribe", undefined, {
      subscriber: subscriber.name,
    });

    const unsubscribe = pusu.subscribe(publication, (state) => {
      const prevSelectedState = (
        selector ? selector(previousState) : previousState
      ) as TSelectedState;
      const currSelectedState = (
        selector ? selector(state) : state
      ) as TSelectedState;

      const fnIsEqual = areEqual
        ? areEqual
        : (a: TSelectedState, b: TSelectedState) => a === b;

      if (!fnIsEqual(currSelectedState, prevSelectedState)) {
        _log<TSelectedState, { subscriber: string }>(
          "notify",
          { current: currSelectedState, previous: prevSelectedState },
          {
            subscriber: subscriber.name,
          }
        );

        subscriber(currSelectedState);
      }
    });

    const notifyImmediately = () => {
      const selectedState = (
        selector ? selector(currentState) : currentState
      ) as TSelectedState;

      _log<TSelectedState, { subscriber: string }>(
        "notify",
        { current: selectedState, previous: selectedState },
        {
          subscriber: subscriber.name,
        }
      );

      subscriber(selectedState);
    };

    notifyImmediately();

    return () => {
      _log<undefined, { subscriber: string }>("unsubscribe", undefined, {
        subscriber: subscriber.name,
      });

      unsubscribe();
    };
  };

  const publish = (reducer: (state: TState) => TState): void => {
    previousState = currentState;

    currentState = reducer(currentState);

    _log<undefined, undefined>("publish", undefined);

    pusu.publish(publication, currentState);
  };

  const getState = (): TState => currentState;

  return { publish, subscribe, state: getState };
};

export default createCell;
