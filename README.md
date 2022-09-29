# Class (😎) with Hooks (🎣)

An experiment to render React class components that use React hooks in their render. (Made for fun, not recommended to be used). Install via `@devanshj/class-with-hooks` npm module.

Now you can write the following `Foo` component...

```jsx
import Re from "react"
import withHooks from "@devanshj/class-with-hooks"

const Foo = withHooks(class Foo extends Re.Component {
  state = { b: 0 }
  increment = () => this.setState(s => ({ b: s.b + 1 }))
  
  componentDidMount = () => void (this.intervalId = setInterval(this.increment, 2000))
  componentWillUnmount = () => clearInterval(this.intervalId)

  render = () => {
    let a = useCounter(1000)
    return `a = ${a}, b = ${this.state.b}`
  }
})

const useCounter = t => {
  let [a, increment] = Re.useReducer(x => x + 1, 0)
  Re.useEffect(() => {
    let i = setInterval(increment, t)
    return () => clearInterval(i)
  }, [])
  return a
}
```

And it'll render as if it were the following `Foo` component...

```jsx
import Re from "react"

const Foo = props => {
  let a = useCounter(1000)
  return <FooWithoutHooks a={a} {...props}/>
}

class FooWithoutHooks extends Re.Component {
  state = { b: 0 }
  increment = () => this.setState(s => ({ b: s.b + 1 }))
  
  componentDidMount = () => void (this.intervalId = setInterval(this.increment, 2000))
  componentWillUnmount = () => clearInterval(this.intervalId)

  render = () => {
    return `a = ${this.props.a}, b = ${this.state.b}`
  }
}

const useCounter = t => {
  let [a, increment] = Re.useReducer(x => x + 1, 0)
  Re.useEffect(() => {
    let i = setInterval(increment, t)
    return () => clearInterval(i)
  }, [])
  return a
}
```

See [the test](https://github.com/devanshj/class-with-hooks/tree/main/test/index.test.ts).

## Future explorations

- Support more class features. Current only `componentDidMount`, `componentDidUnmount`, `componentDidUpdate`, and `shouldComponentUpdate` are supported.

- An option to render hooks as descendants of the class. Currently hooks render as ancestors of the class. Former is rendering hooks as a higher-order component and latter is rendering hook as a render-prop.
