import React, { useRef } from "react";
import ConfigurationContext from "./configuration-context";
import { TContext } from "./types";

/**
 * An stateless provider to configure the equality comparator which is used in the hook `useGetState`, while reading/selecting the state.
 * If not provided the the default equality comparator is used.
 */
const Configure: React.FC<{
  /** An equality comparator function which receives previous and next selected state. It can used to compare these states to decide if the state has changed. It needs to return a boolean value. True: Meaning the selected state has not changed. False: Meaning selected value has changed. */
  areEqual?: <T>(prevState: T | undefined, nextState: T) => boolean;
  children: React.ReactNode;
}> = ({ areEqual, children }) => {
  const refValue = useRef<TContext>({
    areEqual: areEqual ?? ((a, b) => a === b),
  });

  return (
    <ConfigurationContext.Provider value={refValue.current}>
      {children}
    </ConfigurationContext.Provider>
  );
};

export default Configure;
