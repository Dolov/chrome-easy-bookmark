import React from "react"

export const useBoolean = (defaultValue = false) => {
  const [value, setValue] = React.useState(defaultValue)
  const valueRef = React.useRef<boolean>()
  valueRef.current = value
  const toggle = () => {
    valueRef.current = !valueRef.current
    setValue(valueRef.current)
  }
  return [value, toggle, valueRef] as const
}

export const useRefState = <T,>(defaultValue: T) => {
  const [value, setValue] = React.useState(defaultValue)
  const valueRef = React.useRef(value)
  valueRef.current = value

  const setChangeValue = (nextValue: T) => {
    setValue(nextValue)
  }

  return [
    valueRef.current,
    setChangeValue,
    valueRef,
  ] as const
}

export const useUpdateEffect = (effect: React.EffectCallback, deps?: React.DependencyList) => {
  const isMounted = React.useRef(false)

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    return effect()
  }, deps)
}