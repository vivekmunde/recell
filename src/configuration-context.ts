import { createContext } from 'react';
import { TContext } from './types';

const ConfigurationContext = createContext<TContext>({
    areEqual: (a: unknown, b: unknown) => a === b,
});

export default ConfigurationContext;
