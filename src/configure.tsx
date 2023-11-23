import React, { useRef } from "react";
import ConfigurationContext from "./configuration-context";
import { TContext } from "./types";

const Configure: React.FC<{
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
