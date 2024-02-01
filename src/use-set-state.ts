import { TCell, TReducer } from "./types";

/**
 * A hook to update the state of the cell.
 *
 * @param {TCell} cell - An instance of the cell, whose state is to be updated.
 * @returns {TOnSetState} A function to update the state. This function needs to be passed a `reducer` function as a parameter. The `reducer` function receives the current state of the `cell` and it needs to return the updated state.
 */
const useSetState = <TState>(
  cell: TCell<TState>
): ((reducer: TReducer<TState>) => void) => cell.publish;

export default useSetState;
