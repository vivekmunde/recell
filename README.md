# recell
Distributed state management for React applications.

# Cell
A `cell` is a state store, having state accessing APIs. It can be a group of state variables, grouped logically or with respect to the context (screens and/or components). The collection of these distributed state cells forms the complete state of the application. An application can have multiple cells, to have a distributed the state instead of holding it in a single centralised state object.

For example, a `cell` can hold the logged in user which can be accessed across the application. Another `cell` can be created for the Dashboard screen which holds all the state required for the Dashboard screen. Likewise, multiple cells can be created across application. The state of these cells can be initialised on the go as the screens mount and can be cleared as the screens unmount.

The state is decentralised and can always stay close and confined to the module/screen/component.

# createCell
Creates a `cell` with the default state and state accessing & updating methods.

#### Type Definition
```
type TCreateCell = <T>(initialState: T) => TCell<T>;
```

#### Arguments
- `state`: A default value of the state. The default value can be `undefined`.

#### Return value
A cell object having the state accessing & updating methods.
- `getState`: Function to get the current state.
- `setState`: Function to set the state.
- `subscribe`: A subscriber function to subscribe to the state changes. It returns a function, which unsubscribes when called.

**Note**: `getState`, `setState` and `subscribe` are core APIs. To get and set state, please use hooks `useGetState` and `useSetState`. `subscribe` can be used for caching, is explained under the caching section.

#### Example
```
import { createCell } from 'recell';
import TState from './types';

const dashboardCell = createCell<TState>({
	loading: false,
	statistics: [],
	topPolicies: [],
	topCategories: [],
});

export default dashboardCell;
```

# useSetState
`useSetState` is a hook to update the state of the `cell`.

#### Type Definition
```
type TUseSetCell = <T>(cell: TCell<T>) => (reducer: (state: T) => T) => void;
```

#### Arguments
- `cell`: A cell whose state needs to be updated.

#### Return value
A function to update the state (we will refer it as `setState`).  The `setState` function needs to be passed with a `reducer` function. The `reducer` function receives the current state of the `cell` and it needs to return the updated state.
*Type definition*: `type TSetState = <T>(reducer: (state: T) =>  T) => void;`

```
import { useSetState } from 'recell';
import dashboardCell from './data/cell';
import useGetStatistics from './data/useGetStatistics';
import useGetTopPolicies from './data/useGetTopPolicies';
import useGetTopCategories from './data/useGetTopCategories';

const useLoadDashboardData = () => {
    const setState = useSetState(dashboardCell);
    const getStatistics = useGetStatistics();
    const getTopPolicies = useGetTopPolicies();
    const getTopCategories = useGetTopCategories();

    useEffect(() => {
        setState(/* reducer */ (currentState) => ({
            ...currentState,
            loading: true,
        }));

        Promise.all([
            getStatistics(),
            getTopPolicies(),
            getTopCategories(),
        ]).then((responses) => {
            setState(/* reducer */ (currentState) => ({
                ...currentState,
                statistics: responses[0].data,
                topPolicies: responses[1].data,
                topCategories: responses[2].data,
                loading: false,
            }));
        }).catch((error) => {
            setState(/* reducer */ (currentState) => ({
                ...currentState,
                statistics: undefined,
                topPolicies: undefined,
                topCategories: undefined,
                loading: false,
                error: error.message,
            }));
        });
    }, []);
};
```

# useGetState
`useGetState` is a state selector hook to retrieve the required state from a `cell`.

#### Type Definition
```
type TAreEqual<T> = (prevState: T | undefined, nextState: T) => boolean;

type TUseGetState = <TState, TSelectedState>(
  cell: TCell<TState>,
  selector: (state: TState) => TSelectedState,
  areEqual?: TAreEqual<TSelectedState>
) => TSelectedState
```

#### Arguments
- `cell`: The cell holding the state.
-  `selector`: A selector function which receives the complete state of the cell and needs to return the selected state.
- `areEqual` *(optional)* : An equality comparator function which receives previous and current selected state. It can used to compare these states to decide of the states have changed. It needs to return a boolean value. If not passed then it uses the comparator function configured in the configuration provider. If not configured in the configuration provider then it uses the default equality comparator.

#### Return value
Selected state.

```
import { useGetState } from 'recell';
import dashboardCell from './data/cell';

const StatisticsView = () => {
	const statistics = useGetState(dashboardCell, (state) => state.statistics);

	// return the view rendering the statistics
};

const TopPoliciesView = () => {
	const topPolicies = useGetState(dashboardCell, (state) => state.topPolicies);

	// return the view rendering the top policies
};

const TopCategoriesView = () => {
	const topCategories = useGetState(dashboardCell, (state) => state.topCategories);

	// return the view rendering the top categories
};

const DashboardView = () => {
	return (
		<div>
			<StatisticsView />
			<TopPoliciesView />
			<TopCategoriesView />
		</div>
	);
};

const Dashboard = () => {
	const loading = useGetState(dashboardCell, (state) => state.loading);

	return loading ? <Skeleton /> : <DashboardView />;
};

export default Dashboard;
```

### Using custom equality comparator function

```
const useGetReport = () => {
	const report = useGetState(
		cell,
		(state) => state.report),
		(prev, curr) => prev.report.updatedAt !== curr.report.updatedAt,
	;

	return report;
};
```

The custom equality comparator function checks of the report was updated. So even if user reloads the report and if the report has not changed, so the selector will always return previous report. This way the screen re-renders can be avoided.

# Configure
An optional stateless provider to configure the equality comparator which is used in the hook `useGetState` (explained later), while reading/selecting the state. If not provided the the default equality comparator is used.

#### Type Definition
```
type TConfigure = React.FC<{
  areEqual?: <T>(prevState: T | undefined, nextState: T) => boolean;
  children: React.ReactNode;
}> 
```

#### Default equality comparator
```
const areEqual = (a, b) =>  a === b;
```

#### Example

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

The cells are outside of the React component life cycle. Hence, by default, the cells cache the state in memory.

Before the components unmount, this state can be cleared, simply by assigning an empty object or `undefined` to the state.

#### Example

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

Assign the cached value from storage while initialising the state. To cache, subscribe to the state changes of the cell and cache the state value. 

```
import storage from 'local-storage';
import { createCell } from 'recell';

const cell = createCell(JSON.parse(storage.get('key') ?? {}));

cell.subscribe((state) => {
	storage.set('key', JSON.stringify(state));
});
```

If need to unsubscribe then subscribe to the cell state changes inside a hook/component. And unsubscribe for the hook/component unmounts.

```
import storage from 'local-storage';
import cell from './cell';

const SomeScreenOrHook = () => {
	useEffect(() => {
		const unsubscribe = cell.subscribe((state) => {
			storage.set('key', JSON.stringify(state));
		});
		
		return () => unsubscribe();
	}, []):
};
```

## Caching in database storage

Fetch the cached value using the backend APIs and assign the cached value to cell. To cache, subscribe to the state changes of the cell and update it to the database using the backend APIs. 

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

# License

MIT
