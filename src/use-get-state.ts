import { useContext, useEffect, useRef, useState } from "react";
import ConfigurationContext from "./configuration-context";
import { TCell, TSubscriber } from "./types";

type TAreEqual<T> = (prevState: T | undefined, nextState: T) => boolean;

const useGetState = <TState, TSelectedState>(
  cell: TCell<TState>,
  selector: (state: TState) => TSelectedState,
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
