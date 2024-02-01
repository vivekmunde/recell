import { useContext, useEffect, useState } from "react";
import ConfigurationContext from "./configuration-context";
import { TAreEqual, TCell, TSelector } from "./types";

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

  const [state, setState] = useState<TSelectedState>(() => {
    if (typeof selector !== "function") {
      throw new Error("Selector must be a function.");
    }

    return selector(cell.state());
  });

  useEffect(() => {
    return cell.subscribe<TSelectedState>(
      (selectedState) => {
        setState(selectedState);
      },
      selector,
      areEqual ?? configuration.areEqual
    );
  }, []);

  return state;
};

export default useGetState;
