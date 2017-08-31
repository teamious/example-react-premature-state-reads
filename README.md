# README

This repo contains sample code for dealing with parallel requests to modify
your props over multiple components in the render lifecycle.

To demonstrate the problem, consider the following object:

```ts
const values = [
    'Andrew',
    'Brooke',
]
```

`values` represents a piece of the state object contained in our root component.
Now, for each index in the `values` array we want to be represented by a `Node`
component. The `Node` component is fairly simple, it should render a UI for the
value:

```tsx
interface NodeProps {
    value: string;
}

class Node extends React.Component<NodeProps, {}> {
    render() {
        return (
            <div>
                {this.props.value}
            </div>
        )
    }
}
```

In addition to rendering the value, each `Node` should modify it's own
value (by adding the value to itself) after mounting and then notify the parent
via a function named `onChange`.

```tsx
componentDidMount() {
    this.props.onChange(this.props.value + this.props.value);
}
```

The `Node` class will end up looking like this:

```tsx
interface NodeProps {
    value: string;
    onChange: (value: string) => void;
}

class Node extends React.Component<NodeProps, {}> {
    componentDidMount() {
        this.props.onChange(this.props.value + this.props.value);
    }

    render() {
        return (
            <div>
                {this.props.value}
            </div>
        )
    }
}
```

Now, in our root component we can write the logic to render a `Node` to handle
each value in the `state`. We also

```tsx
interface AppState {
    values: string[]
}

class App extends React.Component<{}, AppState> {
    constructor() {
        super();
        this.state = {
            values: ['Andrew', 'Brooke'],
        }
    }
    render() {
        return (
            <div>
              {this.state.values.map(value => <Node value={value}/>)}
            </div>
        );
    }
}
```

However, the `App` class isn't complete yet. It needs to pass an `onChange`
event to the Node so that it can be notified when the `Node` propagates its
new value in it's `componentDidMount` lifecycle hook. We can implement an
`onChange` function and use it in our `render` function:

```tsx
    onChange(index: number, value: string) {
        const values = this.state.values.slice();
        values[index] = value;
        this.setState({values})
    }

    render() {
        return (
            <div>
                {this.state.values.map((value, index) => (
                    <Node value={value} onChange={this.onChange.bind(this, index))}/>
                )}
            </div>
        );
    }
```

Now, right now you may think everything goes and works fine. In your HTML, you
would expect to see:

```
AndrewAndrew
BrookeBrook
```

But actually you will see this:

```
Andrew
BrookeBrooke
```

This is the problem of the premature state reads. If you've read about React,
you should know that the `setState` is not synchronous. Basically, React
will batch the state changes in order to be more efficient. The problem this
presents is that you cannot expect your state change to be read immediately.

In the example above, when the first node calls `onChange` the state at
that point in time is `['Andrew', 'Brooke']`. After calling `setState`
you might think that `this.state.values` looks like this:
`['AndrewAndrew', 'Brooke']`. Then when the second Node calls `onChange`,
it will use use the new state object `['AndrewAndrew', 'Brooke']' and update it
to `['AndrewAndrew', 'BrookeBrooke']`. This won't happen because the second
`onChange` performs a premature state read and gets back `['Andrew', 'Brooke']`
and returns `['Andrew', 'BrookeBrooke']`. When the second Node calls setState,
it essentially overwrites the first Node's `onChange` result.

This is a problem that we encountered developing
[react-dynamic-formbuilder](https://www.npmjs.org/react-dynamic-formbuilder).
The problem is that our `FormInput` component (think of it is being similar to
`App` class above) receives multiple requests to change our value object after
each component mounts. In our case, each change request operates on a value
object that lives in props. After each change request, the context of FormInput
is notified via an `onChange` event. The problem is that the context of
FormInput does not immediately pass the props down before `FormInput` services
the next change request. This results in a stale read of props and results in
overwriting prior change requests.

In order to solve this problem, a solution that was proposed was to copy props
into state and work directly on the state object. However, at first glance, this
solution proved to pose the same problem. The state object would be stale (or
read prematurely) when attempting to service multiple synchronous change
requests.

After doing research on the `setState` API, we found an alternative usage.
Basically, you can substitute a function for the value you might normally
pass into `setState` (as of React v15.16.1 and possibly earlier);

```tsx
this.setState({
    values: ['Andrew', 'Brooke']
})

// can also be written as this

this.setState(() => {
    return {
        values: ['Andrew', 'Brooke'],
    }
})
```

Nothing special, right? But that's not all. The function you pass into
`setState` can access the previous state object before it has been used to
render the component.

```tsx
this.setState((prevState) => {
    const values = prevState.values.slice()
    values[i] = newValue
    return {values}
})
```

Using this approach, your state change requests can build ontop of prior
changes and avoid the stale read problem described above.

### Demo

You can see the demo by running:

```
npm install
npm start
```

and then navigate to localhost:8080.