# recell

Distributed state management for React applications.

# Cell

A `cell` is a state store, having state accessing APIs. It can be a group of state variables, grouped logically or with respect to the context (screens and/or components). The collection of these distributed state cells forms the complete state of the application. An application can have multiple cells to have a distributed state instead of holding all state in a single centralised state object.

The state is decentralised and can always stay close and confined to the module/screen/component. The state of these cells can be initialised on the go as the screens mount and can be cleared as the screens unmount.

For example, a `cell` can hold the logged in user details which can be accessed across the application. Another `cell` can be created for the Dashboard screen which holds all the state required for the Dashboard screen. Likewise, multiple cells can be created across application.

# createCell

Creates a `cell` with the default state and returns an object having the state accessing & updating methods.

### Type definition

```
declare const create: <T>(initialState: T) => TCell<T>;
```

### Arguments

- `state`: A default value of the state.

### Return value

A cell object having the state accessing & updating methods.

- `getState`: Function to get the current state.
- `setState`: Function to set the state.
- `subscribe`: A subscriber function to subscribe to the state changes. It returns a function, which unsubscribes when called.

### Example

```
import { createCell } from 'recell';
import TState from './types';

const usersAndRolesCell = createCell<TState>({
  loadingUsers: false,
  users: [],
  usersLoadingError?: undefined,
  loadingRoles: false,
  roles: [],
  rolesLoadingError?: undefined,
});

export default usersAndRolesCell;
```

# useSetState

`useSetState` is a hook to update the state of the `cell`.

### Type definition

```
type TOnSetState<T> = (reducer: (state: T) => T) => void;

declare const useSetState: <T>(cell: TCell<T>) => TOnSetState<T>;
```

### Arguments

- `cell`: A cell whose state needs to be updated.

### Return value

A function to update the state (we will refer it as `setState`). The `setState` function needs to be passed a `reducer` function as a parameter. The `reducer` function receives the current state of the `cell` and it needs to return the updated state.

## Reducer

The `reducer` function is a function responsible for updating the state. It receives the current state of the `cell` and it needs to return the updated state.

### Type definition

```
type TReducer = (reducer: (state: T) => T) => void;
```

### Example

```
import { useEffect } from 'react';
import { useSetState } from 'recell';
import usersAndRolesCell from '../cells/users-and-roles-cell';
import axios from 'axios';

const AComponentOrHook = () => {
  const setState = useSetState(usersAndRolesCell);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Reducer receives the complete state. So update only the needed state and return the complete state.

        // Before calling the API update only the loading & errors state
        setState(/* reducer */ (currentState) => ({
          ...currentState,
          loadingUsers: true,
          usersLoadingError: undefined,
        }));

        const respone = await axios.get('/users');

        // Update only the loading & users state
        setState(/* reducer */ (currentState) => ({
          ...currentState,
          loadingUsers: false,
          users: response.data,
        }));
      } catch (error) {
        // Update only the loading & error state
        setState(/* reducer */ (currentState) => ({
          ...currentState,
          loadingUsers: false,
          usersLoadingError: error.message,
        }));
      }
    };

    const loadRoles = async () => {
      try {
        // Reducer receives the complete state. So update only the needed state and return the complete state.

        // Before calling the API update only the loading & errors state
        setState(/* reducer */ (currentState) => ({
          ...currentState,
          loadingRoles: true,
          rolesLoadingError: undefined,
        }));

        const respone = await axios.get('/roles');

        // Update only the loading & roles state
        setState(/* reducer */ (currentState) => ({
          ...currentState,
          loadingRoles: false,
          roles: response.data,
        }));
      } catch (error) {
        // Update only the loading & error state
        setState(/* reducer */ (currentState) => ({
          ...currentState,
          loadingRoles: false,
          rolesLoadingError: error.message,
        }));
      }
    };

    loadUsers();
    loadRoles();
  }, []);
};
```

# useGetState

`useGetState` is a state selector hook to retrieve the state from a `cell`.

### Type definition

```
type TAreEqual<T> = (prevState: T | undefined, nextState: T) => boolean;

type TUseGetState = <TState, TSelectedState>(
  cell: TCell<TState>,
  selector: (state: TState) => TSelectedState,
  areEqual?: TAreEqual<TSelectedState>
) => TSelectedState
```

### Arguments

- `cell`: The cell holding the state.
- `selector`: A selector function which receives the complete state of the cell and needs to return the selected state.
- `areEqual`: An equality comparator function which receives previous and next selected state. It can used to compare these states to decide if the state has changed. It needs to return a boolean value. True: Meaning the selected state has not changed. False: Meaning selected value has changed. If the equality comparator function not passed then it uses the comparator function configured in the configuration provider. If not configured in the configuration provider then it uses the default equality comparator.

### Return value

Selected state.

### Example

```
import { useGetState } from 'recell';
import usersAndRolesCell from './cells/usersAndRolesCell';

const UsersView = () => {
  // Retrive the state from cell
  const loadingUsers = useGetState(usersAndRolesCell, (state) => state.loadingUsers);
  const users = useGetState(usersAndRolesCell, (state) => state.users);
  const usersLoadingError = useGetState(usersAndRolesCell, (state) => state.usersLoadingError);

  return loadingUsers
    ? <Loader />
    : usersLoadingError
      ? <Error message={usersLoadingError} />
      : <Users data={users} />;
};

const RolesView = () => {
  // Retrive the state from cell
  const loadingRoles = useGetState(usersAndRolesCell, (state) => state.loadingRoles);
  const roles = useGetState(usersAndRolesCell, (state) => state.roles);
  const rolesLoadingError = useGetState(usersAndRolesCell, (state) => state.rolesLoadingError);

  return loadingRoles
    ? <Loader />
    : rolesLoadingError
      ? <Error message={usersLoadingError} />
      : <Roles data={roles} />;
};
```

## Using custom equality comparator function

```
const useGetReport = () => {
  const report = useGetState(
    cell,
    (state) => state.report),
    (prev, curr) => {
      // Check if the report has changed
      // It can be checked by comparing updatedAt time stamp from previous and current state
      return prev.report.updatedAt === curr.report.updatedAt;
    },
  );

  return report;
};
```

The custom equality comparator function checks if the report was changed by checking the `updatedAt` timestamp. So even if user reloads the report (click of refresh button) and if the report has not changed, the subscriber will not be called and hence the `useGetState` will not get triggered and the state will not be changed. This way the screen re-renders can be avoided.

## Selecting multiple state values

Multiple values can be retrieved from state in a single selector. But, that will always create a new object, meaning a new state. So the component will always get rendered even if the state has not changed. So its recommended to select the state as is.

Below selector will always create a new object and return. So for any state update the selector will create a new state as a new object.

```
const {
  loadingUsers,
  users,
  usersLoadingError,
} = useGetState(
  usersAndRolesCell,
  (state) => ({
    loadingUsers: state.loadingUsers,
    users: state.users,
    usersLoadingError: state.usersLoadingError,
  }),
);
```

So always prefer using a separate selector for each state value.

```
const loadingUsers = useGetState(usersAndRolesCell, (state) => state.loadingUsers);
const users = useGetState(usersAndRolesCell, (state) => state.users);
const usersLoadingError = useGetState(usersAndRolesCell, (state) => state.usersLoadingError);
```

If multiple values are to be selected in a single selector then use a custom equality comparer function to check state changes.

```
const {
  loadingUsers,
  users,
  usersLoadingError,
} = useGetState(
  usersAndRolesCell,
  (state) => ({
    loadingUsers: state.loadingUsers,
    users: state.users,
    usersLoadingError: state.usersLoadingError,
  }),
  (prev, curr) => {
    return prev.loadingUsers === curr.loadingUsers
      && prev.users === curr.users
      && prev.usersLoadingError === curr.usersLoadingError;
  },
);
```

# Configure

An optional stateless provider to configure the equality comparator which is used in the hook `useGetState` (explained later), while reading/selecting the state. If not provided the the default equality comparator is used.

### Type definition

```
type TConfigure = React.FC<{
  areEqual?: <T>(prevState: T | undefined, nextState: T) => boolean;
  children: React.ReactNode;
}>
```

### Default equality comparator

```
const areEqual = (a, b) =>  a === b;
```

### Example

```
import { Configure } from 'recell';
import equal from 'fast-deep-equal';

const App = () => {
  return (
    <Configure areEqual={(prev, curr) => equal(a, b)}>
      // children ...
    </Configure>
  );
};
```

The configuration provider can be screen specific. Meaning, it is not mandatory to have only one configuration provider. For example, a high data intensive screen can have its own provider configured with a deep equality comparator function which checks each an every property value to determine whether any of that value has changed or not.

### Example

```
import { Configure } from 'recell';
import equal from 'fast-deep-equal';

const PerformanceIntensiveScreen = () => {
  return (
    <Configure areEqual={(prev, curr) => equal(a, b)}>
      // Filters and Table
    </Configure>
  );
};
```

# Caching

The cells are outside of the React component life cycle. Hence, by default, the cells cache their current state in memory.

Before the components unmount, this state can be cleared, simply by assigning an empty object or `undefined` to the state.

### Example

```
import { useEffect } from 'react';
import { useSetState } from 'recell';
import cell from './cell';

const Screen = () => {
  const setState = useSetState(cell);

  useEffect(() => {
    return () => {
      setState(() => undefined);
    };
  }, []);
};
```

## Caching in session/local storage

To cache, subscribe to the state changes of the cell and cache the state value. Assign the cached value from storage while initializing the state.

### Example

```
import storage from 'local-storage';
import { createCell } from 'recell';

// Get the state from storage and initialize the state in cell
const cell = createCell(JSON.parse(storage.get('key') ?? {}));

// Subscribe to the changes in the state of the cell
// Store the state in storage
cell.subscribe((state) => {
  storage.set('key', JSON.stringify(state));
});
```

## Caching in database storage

To cache, subscribe to the state changes of the cell and update it to the database using the backend APIs. Fetch the cached value using the backend APIs and assign the cached value to cell.

### Example

```
import axios from 'axios';
import { createCell } from 'recell';

const cell = createCell({ loadingCache: true });

cell.subscribe((state) => {
  axios.post('/url', state);
});
```

```
import { useSetState } from 'recell';
import cell from './cell';

const Screen = () => {
  const setState = useSetState(cell);

  useEffect(() => {
    axios.get('/url')
      .then((response) => {
        setState((currentState) => ({
          ...currentState,
          loadingCache: false,
          ...response.data,
        }))
      .catch((error) => {
        setState((currentState) => ({
          ...currentState,
          loadingCache: false,
        }));
    });
  }, []);
};
```

### Unsubscribe from state changes

Subscribe to the cell state changes inside a hook/component. Then call the unsubscribe function, returned by the `cell.subscribe` function, before the hook/component unmounts.

#### Example

```
import storage from 'local-storage';
import cell from './cell';

const SomeScreenOrHook = () => {
  useEffect(() => {
    const unsubscribe = cell.subscribe((state) => {
      // set the value in session/local/db storage
    });

    return () => unsubscribe();
  }, []):
};
```

# License

MIT
