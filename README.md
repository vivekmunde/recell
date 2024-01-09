# recell
Distributed state management for React application

# Cell
A `cell` is a group of state variables, grouped logically or with respect to the context. The collection of these distributed state `cells` forms the complete state of the application.

For example, a cell can hold the logged in user which can be accessed across the application. Another cell can be created for the Dashboard screen which holds all the state required for the Dashboard screen.

An application can have multiple cells, to distribute the state instead of holding it in a single centralised state object.

# Configure
It's **optional** to configure. A root provider to configure the equality comparator which is used in the hook `useGetState`, while reading/selecting the state. If not provided the the default equality comparator is used.

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

# createCell
Creates a `cell` with the default state and state accessing & updating methods.

#### Type Definition
```
type TCreateCell = <T>(initialState: T) => TCell<T>;
```

#### Arguments
- `state`: A default value of the state. The default value can be `undefined`.

#### Return value
A cell having the state accessing & updating methods.

#### Example
```
import { createCell } from 'recell';

const dashboardCell = createCell({});

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
A function to update state (we will refer it as `setState`).  The `setState` function needs to be passed with a `reducer` function. The `reducer` function receives the current state of the `cell` and it needs to return the updated state.

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
- `areEqual`*(optional)* : An equality comparator function which receives previous and current selected state. It can used to compare these states to decide of the states have changed. It needs to return a boolean value. If not passed then it uses the comparator function configured in the configuration provider. If not configured in the configuration provider then it uses the default equality comparator.

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
