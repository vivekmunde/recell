import { TCell, TOnSetState } from "./types";

const useSetState = <T>(cell: TCell<T>): TOnSetState<T> => cell.setState;

export default useSetState;
