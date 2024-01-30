import { useContext, useEffect, useRef, useState } from "react";
import ConfigurationContext from "./configuration-context";
import { TAreEqual, TCell, TSelector, TSubscriber } from "./types";

/**
 * A state selector hook to retrieve the state from a cell.
 *
 * @param {TCell} cell - An instance of the cell, whose state is to be read.
 * @param {TSelector} selector - A selector function which will receive the complete state of the cell and needs to return the selected state.
 * @param {TAreEqual} areEqual - An equality comparator function which will receive previous and next selected state. It can used to compare these states to decide if the state has changed. It needs to return a boolean value. True: Meaning the selected state has not changed. False: Meaning selected value has changed. If the equality comparator function not passed then it uses the comparator function configured in the configuration provider. If not configured in the configuration provider then it uses the default equality comparator.
 * @returns {TSelectedState} Selected state.
 */
const useGetState = <TState, TSelectedState>(
  cell: TCell<TState>,
  selector: TSelector<TState, TSelectedState>,
  areEqual?: TAreEqual<TSelectedState>
): TSelectedState => {
  const configuration = useContext(ConfigurationContext);

  const fnSelector = selector ?? ((state) => state);
  const fnAreEqual: TAreEqual<TSelectedState> =
    areEqual ?? configuration.areEqual;

  if (typeof fnSelector !== "function") {
    throw new Error("Selector must be a function.");
  }
  if (typeof fnAreEqual !== "function") {
    throw new Error("Equality comparer must be a function.");
  }

  const ref = useRef<{ state: TSelectedState }>({
    state: fnSelector(cell.getState()),
  });
  const [state, setState] = useState<TSelectedState>(
    fnSelector(cell.getState())
  );

  useEffect(() => {
    ref.current.state = state;

    const subscriber: TSubscriber<TState> = (newState) => {
      const newSelectedState = fnSelector(newState);

      if (!fnAreEqual(ref.current.state, newSelectedState)) {
        ref.current.state = newSelectedState;
        setState(newSelectedState);
      }
    };

    return cell.subscribe(subscriber);
  }, []);

  return state;
};

export default useGetState;
