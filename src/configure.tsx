import React, { useRef } from "react";
import ConfigurationContext from "./configuration-context";
import { TConfigure, TContext } from "./types";

/**
 * An stateless provider to configure the equality comparator which is used in the hook `useGetState`, while reading/selecting the state.
 * If not provided the the default equality comparator is used.
 */
const Configure: TConfigure = ({ areEqual, children }) => {
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
