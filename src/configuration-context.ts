import { createContext } from "react";
import { TContext } from "./types";

/**
 * A conext to configure the equality comparator which is used in the hook `useGetState`, while selecting the state.
 * If not provided the the default equality comparator is used.
 */
const ConfigurationContext = createContext<TContext>({
  /** An equality comparator function which receives previous and next selected state. It can used to compare these states to decide if the state has changed. It needs to return a boolean value. True: Meaning the selected state has not changed. False: Meaning selected value has changed. */
  areEqual: (a: unknown, b: unknown) => a === b,
});

export default ConfigurationContext;
