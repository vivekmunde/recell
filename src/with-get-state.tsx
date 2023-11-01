import React from 'react';
import { TCell } from './types';
import useGetState from './use-get-state';

type TAreEqual<T> = (prevState: T | undefined, nextState: T) => boolean;

const fnWithGetState = <TProps, TState, TCellState, TSelectedCellState extends object>(
  Component: React.FunctionComponent<TProps & TSelectedCellState> | React.ComponentClass<TProps & TSelectedCellState, TState>,
  cell: TCell<TCellState>,
  selector: (state: TCellState) => TSelectedCellState,
  areEqual?: TAreEqual<TSelectedCellState>,
): React.FC<TProps> => {
  const WithGetState: React.FC<TProps> = (props) => {
    const state = useGetState(cell, selector, areEqual);

    return <Component {...props} {...state} />;
  };

  return WithGetState;
};

export default fnWithGetState;
