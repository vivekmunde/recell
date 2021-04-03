import { useEffect, useState, useRef } from 'react';
import equal from 'fast-deep-equal';

const defaultSelector = state => state;

const useGetState = (cell, selector, areEqual) => {
  const fnSelector = selector ?? defaultSelector;
  const fnAreEqual = areEqual ?? equal;

  if (typeof fnSelector !== 'function') {
    throw new Error('Selector must be a function.');
  }
  if (typeof fnAreEqual !== 'function') {
    throw new Error('Equality comparer must be a function.');
  }

  const ref = useRef({ state: null });
  const [state, setState] = useState(fnSelector(cell.getState()));

  useEffect(() => {
    ref.current.state = state;

    const subscriber = (newState) => {
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
