# recell

Distributed state management for React applications.

# Cell

A `cell` is a state store, having state accessing APIs. It can be a group of state variables, grouped logically or with respect to the context (screens and/or components). The collection of these distributed state cells forms the complete state of the application. An application can have multiple cells to have a distributed state instead of holding all state in a single centralised state object.

The state is decentralised and can always stay close and confined to the module/screen/component. The state of these cells can be initialised on the go as the screens mount and can be cleared as the screens unmount.

For example, a `cell` can hold the logged in user details which can be accessed across the application. Another `cell` can be created for the Dashboard screen which holds all the state required for the Dashboard screen. Likewise, multiple cells can be created across application.

# createCell()

Creates a `cell` with the default state and returns an object having the state accessing & updating methods.

### Type definition

```
declare const cell: <TState>(initialState: TState, config?: TCellConfiguration) => {
  publish: (reducer: TReducer<TState>) => void;
  subscribe: <TSelectedState>(subscriber: TSubscriber<TSelectedState>, selector?: TSelector<TState, TSelectedState> | undefined, areEqual?: TAreEqual<TSelectedState> | undefined) => TUnsubscribe;
  state: () => TState;
};
```

### Arguments

- `state`: A default value of the state.
- `config`: Configuration options.

### Return value

A cell object having the state accessing & updating methods.

- `publish`: A function to update the state in cell and publish the change to all the subscribers.
- `subscribe`: A subscriber function to subscribe to the state changes. It returns a function to unsubscribe the subscriber from state changes.
- `state`: A function to get the current state of the cell.

## Configuration

Configuration options to be provided to the cell being created.

### Type definition

```
export type TCellConfiguration = {
  name?: string;
  enableLogging?: boolean;
};

```

### Properties

- `name`: Name of the cell. Used in logging. Default: "Unknown".
- `enableLogging`: Enable/disable console logging. Useful in development and/or test environments. If enabled then each action "create" | "publish" | "subscribe" | "unsubscribe" | "notify" gets logged on console with relevent data.

### Example

```
import { createCell } from 'recell';
import TState from './types';

const usersAndRolesCell = createCell<TState>(
  {
    loadingUsers: false,
    users: [],
    usersLoadingError?: undefined,
    loadingRoles: false,
    roles: [],
    rolesLoadingError?: undefined,
  },
  { name: 'usersAndRolesCell' },
);

export default usersAndRolesCell;
```

# useSetState()

A hook to update the state of the `cell` and publish the updated state to all the subscribers/listeners.

### Type definition

```
type TOnSetState<T> = (reducer: (state: T) => T) => void;

declare const useSetState: <T>(cell: TCell<T>) => TOnSetState<T>;
```

### Arguments

- `cell`: A cell whose state needs to be updated.

### Return value

A function to update the state. This function needs to be passed a `reducer` function as a parameter. The `reducer` function receives the current state of the cell and it needs to return the updated state.

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

const useLoadUsers = () => {
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

    loadUsers();
  }, []);
};

const useLoadRoles = () => {
  const setState = useSetState(usersAndRolesCell);

  useEffect(() => {
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

    loadRoles();
  }, []);
};
```

# useGetState()

A state selector hook to retrieve the state from a cell. `useGetState` returns the new selected state whenever the state is the cell is updated.

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

# Using custom equality comparator function

```
const useGetReport = () => {
  const report = useGetState(
    cell,
    (state) => state.report),
    (prev, next) => {
      // Check if the report has changed
      // It can be checked by comparing updatedAt time stamp from previous and current state
      return prev.report.updatedAt === next.report.updatedAt;
    },
  );

  return report;
};
```

The custom equality comparator function checks if the report was changed by checking the `updatedAt` timestamp. So even if user reloads the report (click of refresh button) and if the report has not changed, the subscriber will not be called and hence the `useGetState` will not get triggered and the state will not be changed. This way the screen re-renders can be avoided.

# Selecting multiple state values

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

## Local configuration

The configuration provider can be screen/component specific. Meaning, it is not mandatory to have only one configuration provider. For example, a high data intensive screen can have its own provider configured with a deep equality comparator function which checks each an every property value to determine whether any of that value has changed or not.

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

# cell.publish()

It's a function to update the state in the cell and publish the state to all the subscribers. The publish function needs to be passed a function as an argument i.e. the `reducer` function. The `reducer` function receives the current state of the `cell` and it needs to return the updated state.

### Note

`useSetState` hook can be used instead of `publish`. `useSetState` hook internally uses the `publish` function from the cell.

### Type definition

```
type TReducer<TState> = (state: TState) => TState;

type TPublish = (reducer: TReducer<TState>) => void;
```

### Arguments

- `reducer`: The `reducer` function to update and return the state. It receives the current state of the `cell` and it needs to return the updated state.

### Example

```
import { useEffect } from 'react';
import usersAndRolesCell from '../cells/users-and-roles-cell';
import axios from 'axios';

const useLoadUsers = () => {
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Reducer receives the complete state. So update only the needed state and return the complete state.

        // Before calling the API update only the loading & errors state
        usersAndRolesCell.publish(/* reducer */ (currentState) => ({
          ...currentState,
          loadingUsers: true,
          usersLoadingError: undefined,
        }));

        const respone = await axios.get('/users');

        // Update only the loading & users state
        usersAndRolesCell.publish(/* reducer */ (currentState) => ({
          ...currentState,
          loadingUsers: false,
          users: response.data,
        }));
      } catch (error) {
        // Update only the loading & error state
        usersAndRolesCell.publish(/* reducer */ (currentState) => ({
          ...currentState,
          loadingUsers: false,
          usersLoadingError: error.message,
        }));
      }
    };

    loadUsers();
  }, []);
};

const useLoadRoles = () => {
  useEffect(() => {
    const loadRoles = async () => {
      try {
        // Reducer receives the complete state. So update only the needed state and return the complete state.

        // Before calling the API update only the loading & errors state
        usersAndRolesCell.publish(/* reducer */ (currentState) => ({
          ...currentState,
          loadingRoles: true,
          rolesLoadingError: undefined,
        }));

        const respone = await axios.get('/roles');

        // Update only the loading & roles state
        usersAndRolesCell.publish(/* reducer */ (currentState) => ({
          ...currentState,
          loadingRoles: false,
          roles: response.data,
        }));
      } catch (error) {
        // Update only the loading & error state
        usersAndRolesCell.publish(/* reducer */ (currentState) => ({
          ...currentState,
          loadingRoles: false,
          rolesLoadingError: error.message,
        }));
      }
    };

    loadRoles();
  }, []);
};
```

# cell.subscribe()

It's a function to revieve the state and the updates in state. Each time the state is updated in the cell, the subscrbier function is called with the latest updated state.

### Type definition

```
type TAreEqual<T> = (prevState: T | undefined, nextState: T) => boolean;

type TUnsubscribe = () => void;

type TSubscribe = <TSelectedState>(subscriber: TSubscriber<TSelectedState>, selector?: TSelector<TState, TSelectedState> | undefined, areEqual?: TAreEqual<TSelectedState> | undefined) => TUnsubscribe;

```

### Arguments

- `subscriber`: A subscriber function to be called each time the state change is changed and published. The subscriber function will recieve the data selected and returned by the `selector` function. If `selector` is not supplied then the subscruber function will receive the complete state.
- `selector`: A selector function to select the required state value(s) from the state and return the selected state.
- `areEqual`: An equality comparator function which receives previous and current selected state. This equality comparater function can be used to determine if the current selected state has changed from the previous selected state. If there is no change in the selected state then the subscribers will not be called. True: Meaning the selected state has not changed. False: Meaning the selected state has changed. If not passed then it uses the default comparator function (current, previous) => (current === previous).

### Return value

An unsubscriber function, which when called unsubscribes the subscriber function from from the state updates.

### Example

```
import usersAndRolesCell from './cells/usersAndRolesCell';

const UsersView = () => {
  const [loadingUsers, setLoadingUsers] = useState(usersAndRolesCell.state().loadingUsers);
  const [users, setUsers] = useState(usersAndRolesCell.state().users);
  const [usersLoadingError, setUsersLoadingError] = useState(usersAndRolesCell.state().usersLoadingError);

  useEffect(() => {
    // Subscribe to the state changes and set state locally

    const unsubscribeLoadingUsersSubscriber = usersAndRolesCell.subscribe((value) => {
      setLoadingUsers(value);
    }, (state) => state.loadingUsers);

    const unsubscribeUsersSubscriber = usersAndRolesCell.subscribe((value) => {
      setUsers(value);
    }, (state) => state.users);

    const unsubscribeUsersLoadingErrorSubscriber = usersAndRolesCell.subscribe((value) => {
      setUsersLoadingError(value);
    }, (state) => state.usersLoadingError);

    return () => {
      // Unsubscribe all the subscribers before unmounting

      unsubscribeLoadingUsersSubscriber();
      unsubscribeUsersSubscriber();
      unsubscribeUsersLoadingErrorSubscriber();
    };
  }, []);

  return loadingUsers
    ? <Loader />
    : usersLoadingError
      ? <Error message={usersLoadingError} />
      : <Users data={users} />;
};
```

## Prefer `useGetState` over `subscribe`

When accessing the state of the cell inside a React component/hooks, always prefer to use `useGetState` hook instead of `subscribe`. `useGetState` hook internally uses the `subscribe` function from the cell. `useGetState` hook takes care of state initialization, subscribing and unsubscribing to/from the state updates before unmounting.

## When to use `subscribe`

`subscribe` is useful for the logic outside of the components and hooks, where the state changes are not meant for updating the local state or view. For example, for session/local storage caching, which has been explained in the caching section.

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

# Logging

Logging can be enabled while creating the cell. If logging is enabled then each action ('create','publish','subscribe','unsubscribe','notify') will get logged with relative data. Logging can be enabled in development environment.

### Type definition

```
type TLogAction =
  | "create"
  | "publish"
  | "subscribe"
  | "unsubscribe"
  | "notify";

type TSelectedStateLog<TSelectedState> = {
  previous: TSelectedState;
  current: TSelectedState;
};

type TStateLog<TState, TSelectedState> = {
  current: TState;
  previous: TState;
  selected?: TSelectedStateLog<TSelectedState>;
};

type TLog<TStateLog, TMetaData> = {
  cell: string;
  action: TLogAction;
  state: TStateLog;
  meta?: TMetaData;
};
```

### Properties

- cell: Name of the cell. Default = "Unknown".
- action: "create" | "publish" | "subscribe" | "unsubscribe" | "notify".
- state: Current and previous state of the cell. It also includes the current and previous selected state in case of action 'notify'.
- meta: Any metadata. E.g. when a subscriber is notified then the sibscriber function's name is added in the metadata.

#### Actions

- create: When cell is created.
- publish: When state is updated and published to subscribers.
- subscribe: When a subscriber function is subscribed.
- unsubscribe: When a subscriber function is unsubscribed.
- notify: When a subscriber function is called with the state.

### Example

```
import { createCell } from 'recell';

const dashboardCell = createCell(
  {
    loading: false,
    users: [],
    roles: [],
  },
  {
    name: 'dashboardCell',
    enableLogging: process.env.NODE_ENV === 'development',
  },
);
```

### Log Examples

```
'recell', { cell: 'dashboardCell', action: 'create', state : { current: { loading: true, users: [], roles: [] }, previous: { loading: true, users: [], roles: [] } } }
```

```
'recell', { cell: 'dashboardCell', action: 'publish', state : { current: { loading: true, users: [], roles: [] }, previous: { loading: false, users: [], roles: [] } } }
```

```
'recell', { cell: 'dashboardCell', action: 'notify', state : { current: { loading: true, users: [], roles: [] }, previous: { loading: false, users: [], roles: [] } }, meta: { subscriber: 'sibscribeToDashboardCell' } }
```

```
'recell', { cell: 'dashboardCell', action: 'publish', state : { current: { loading: false, users: [{ name: 'a' }], roles: [{ name: 'admin' }] }, previous: { loading: true, users: [], roles: [] } } }
```

```
'recell', { cell: 'dashboardCell', action: 'subscribe', state : { current: { loading: false, users: [{ name: 'a' }], roles: [{ name: 'admin' }] }, previous: { loading: true, users: [], roles: [] } } }
```

```
'recell', { cell: 'dashboardCell', action: 'notify', state : { current: { loading: false, users: [{ name: 'a' }], roles: [{ name: 'admin' }] }, previous: { loading: true, users: [], roles: [] } }, meta: { subscriber: 'sibscribeToDashboardCell' } }
```

# License

MIT

# License

MIT
