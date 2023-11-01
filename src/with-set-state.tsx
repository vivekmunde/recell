import React from 'react';
import { TCell, TOnSetState } from './types';
import useSetState from './use-set-state';

const fnWithSetState = <TProps, TState, TCellState>(
  Component: React.FunctionComponent<TProps & { onSetState: TOnSetState<TCellState> }> | React.ComponentClass<TProps & { onSetState: TOnSetState<TCellState> }, TState>,
  cell: TCell<TCellState>,
): React.FC<TProps> => {
  const WithSetState: React.FC<TProps> = (props) => {
    const setState = useSetState(cell);

    return <Component {...props} onSetState={setState} />;
  };

  return WithSetState;
};

export default fnWithSetState;
