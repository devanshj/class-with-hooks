export { withHooks as default }

import Re from "react"

type WithHooks = 
  <P, S>(c: Re.ComponentClass<P, S>) => ((props: P) => Re.ReactElement)

const withHooks: WithHooks =
  C => withDisplayName(C.displayName ?? C.name, props => {

  let instance = useConstant(() => new C(props))
  ;(instance as { props: typeof instance.props }).props = props
  
  let [state, setState] = Re.useState(() => instance.state)
  type S = typeof state
  let forceUpdate = Re.useReducer(() => ({}), {})[1]
  useRunOnce(() => {
    instance.setState = inputState => {
      setState(currentState => {
        let newState =
          typeof inputState === "function"
            ? (inputState as ((s: S) => S))(currentState)
            : inputState as S

        instance.state = newState
        return newState
      })
    }
    instance.forceUpdate = forceUpdate
  })
  
  let isInitialRender = Re.useRef(true)
  Re.useEffect(() => {
    if (isInitialRender.current) isInitialRender.current = false
    instance.componentDidMount?.()
    return () => instance.componentWillUnmount?.()
  }, [])
  
  let previousProps = usePrevious(props)
  let previousState = usePrevious(state)
  Re.useEffect(() => {
    if (isInitialRender.current) return
    instance.componentDidUpdate?.(previousProps!, previousState!)
  })

  let shouldUpdate =
    isInitialRender.current ? true :
    instance.shouldComponentUpdate?.(props, state, undefined) ?? true

  let result = instance.render() as Re.ReactElement
  let previousResult = Re.useRef(undefined as Re.ReactElement | undefined)

  if (shouldUpdate) {
    previousResult.current = result
    return result
  }
  return previousResult.current!
})

// ---------------
// extras

type UseConstant = <T>(f: () => T) => T
const useConstant: UseConstant =
  f => Re.useState(() => f())[0]

type UsePrevious = <A>(a: A) => A | undefined
const usePrevious: UsePrevious = a => {
  let aP = Re.useRef(undefined as typeof a | undefined)
  Re.useEffect(() => void (aP.current = a), [a])
  return aP.current
}

type UseRunOnce = (f: () => void) => void
const useRunOnce: UseRunOnce = f => Re.useState(() => f())

type WithDisplayName = <F extends Function>(n: string, f: F) => F & { displayName: string }
const withDisplayName: WithDisplayName = (n, _f) => {
  let f = _f as typeof _f & { displayName: string }
  f.displayName = n
  return f
}

type Mutable<T> =
  { -readonly [K in keyof T]: T[K]
  }