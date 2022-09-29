import withHooks from "../src"

import Re from "react"
import ReTest from "react-test-renderer"

beforeAll(() => {
  jest.useFakeTimers()
})

test("works", () => {
  
  // ---------------
  // Shared

  class TestWithoutRender<P = {}> extends Re.Component<{ skipWhenBIs?: number } & P, { b: number }>  {
    state = { b: 0 }
    increment = () => this.setState(s => ({ b: s.b + 1 }))
    
    intervalId = undefined as number | undefined
    componentDidMount = () => void (this.intervalId = +setInterval(this.increment, 2000))
    componentWillUnmount = () => clearInterval(this.intervalId)
  
    shouldComponentUpdate =
      (props: { skipWhenBIs?: number } & P, state: { b: number }) =>
        props.skipWhenBIs === undefined ? true : state.b !== props.skipWhenBIs
  }

  type UseCounter = (duration: number) => number
  const useCounter: UseCounter = t => {
    let [a, increment] = Re.useReducer(x => x + 1, 0)
    Re.useEffect(() => {
      let i = setInterval(increment, t)
      return () => clearInterval(i)
    }, [])
    return a
  }

  // ---------------
  // Actual

  class TestActual extends TestWithoutRender {
    render = () => {
      let a = useCounter(1000)
      return `a = ${a}, b = ${this.state.b}`
    }
  }
  ;(TestActual as { displayName?: string }).displayName = `Test`
  const TestWithHooksActual = withHooks(TestActual)
  
  
  // ---------------
  // Expected

  class TestExpected extends TestWithoutRender<{ a: number }> {
    render = () => `a = ${this.props.a}, b = ${this.state.b}`
  }
  const TestWithHooksExpected: typeof TestWithHooksActual = (props) => {
    let a = useCounter(1000)
    return Re.createElement(TestExpected, { ...props, a })
  }
  ;(TestWithHooksExpected as { displayName?: string }).displayName = `Test`
  
  
  // ---------------
  // Assert

  expectElementsToRenderEqual(
    Re.createElement(TestWithHooksActual),
    Re.createElement(TestWithHooksExpected)
  )

  expectElementsToRenderEqual(
    Re.createElement(TestWithHooksActual, { skipWhenBIs: 2 }),
    Re.createElement(TestWithHooksExpected, { skipWhenBIs: 2 })
  )
})


type ExpectElementsToRenderEqual = (a: Re.ReactElement, b: Re.ReactElement) => void
const expectElementsToRenderEqual: ExpectElementsToRenderEqual =
  (a, b) => {

  let aDisplayName = (a.type as { displayName?: string }).displayName
  let bDisplayName = (b.type as { displayName?: string }).displayName
  
  expect(aDisplayName).toBe(bDisplayName)

  let aRenderer: ReTest.ReactTestRenderer | undefined
  let bRenderer: ReTest.ReactTestRenderer | undefined
  ReTest.act(() => {
    aRenderer = ReTest.create(a)
    bRenderer = ReTest.create(b)
  })

  expect(aRenderer!.toJSON()).toStrictEqual(bRenderer!.toJSON())

  for (let _ of Array(10).fill(undefined)) {
    lapse(1000)
    expect(aRenderer!.toJSON()).toStrictEqual(bRenderer!.toJSON())
  }

  aRenderer!.unmount()
  bRenderer!.unmount()
}

type Lapse = (t: number) => void
const lapse: Lapse = t => ReTest.act(() => jest.advanceTimersByTime(t))
