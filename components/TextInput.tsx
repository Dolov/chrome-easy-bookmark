import React from 'react'
import { Input } from 'antd'
import { type InputRef } from 'antd'
export interface TextInputProps {
  value: string
  editing: boolean
  onSave(value: string): void
}

const TextInput: React.FC<TextInputProps> = props => {
  const { editing, value, onSave } = props

  const [inputValue, setInputValue] = React.useState<string>(value)
  const inputRef = React.useRef<InputRef>()

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  React.useEffect(() => {
    if (!editing) return
    if (!inputRef.current) return
    inputRef.current.select()
  }, [editing])

  if (editing) {
    return (
      <Input
        autoFocus
        ref={inputRef}
        value={inputValue}
        onClick={e => e.stopPropagation()}
        onChange={e => setInputValue(e.target.value)}
        onBlur={() => onSave(inputValue)}
        onPressEnter={() => onSave(inputValue)}
      />
    )
  }

  return (
    <span>{value}</span>
  )
}

export default TextInput
