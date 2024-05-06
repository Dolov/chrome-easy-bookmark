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
