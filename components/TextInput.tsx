import React from 'react'
import { Input } from 'antd'
import { type InputRef, type InputProps } from 'antd'
export interface TextInputProps {
  value: string
  editing: boolean
  onSave(value: string): void
  url?: string
  type?: "add-folder"
  children?: React.ReactNode
}

const INPUT_MAX_LEN = 40

const TextInput: React.FC<TextInputProps> = props => {
  const { editing, value, onSave, children, url, type } = props
  const addFolder = type === "add-folder"
  const [inputValue, setInputValue] = React.useState<string>(value)
  const inputRef = React.useRef<InputRef>()

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  React.useEffect(() => {
    if (!editing) return
    if (!inputRef.current) return
    if (addFolder) {
      inputRef.current.select()
      return
    }
    inputRef.current.focus({
      cursor: 'end',
    })
  }, [editing])

  if (editing) {
    const inputProps = {
      value: inputValue,
      onClick: e => e.stopPropagation(),
      onChange: e => setInputValue(e.target.value),
      onBlur: () => onSave(inputValue),
      onPressEnter:() => onSave(inputValue),
    }

    if (addFolder || value.length < INPUT_MAX_LEN) {
      return (
        <Input
          size="small"
          ref={inputRef}
          {...inputProps}
        />
      )
    }

    return (
      <Input.TextArea
        autoSize={{
          minRows: 2,
        }}
        size="small"
        ref={inputRef}
        {...inputProps}
      />
    )
  }

  return (
    <span>{children}</span>
  )
}

export default TextInput
