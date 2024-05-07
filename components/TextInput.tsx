import React from 'react'
import { Input } from 'antd'
import { type InputRef } from 'antd'
export interface TextInputProps {
  value: string
  editing: boolean
  onSave(value: string): void
  title?: string
  children?: React.ReactNode
}

const TextInput: React.FC<TextInputProps> = props => {
  const { editing, value, onSave, children, title } = props

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
        size="small"
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
    <span title={title}>{children}</span>
  )
}

export default TextInput
