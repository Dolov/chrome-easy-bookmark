import React from 'react'
import { theme } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

const { useToken } = theme;


export interface SearchInputRefProps {
  focus(): void
  addKeyword(value: string): void
}

export interface SearchInputProps {
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onChange?: (value: string[]) => void
  placeholder?: string
  onPressEnter?: () => void
}

const SearchInput: React.ForwardRefRenderFunction<SearchInputRefProps, SearchInputProps> = (props, ref) => {
  const { prefix, suffix, placeholder, onPressEnter, onChange } = props
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [value, setValue] = React.useState<string[]>([])
  const [focus, setFocus] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const { token } = useToken()

  const { colorPrimaryHover, colorPrimary, controlOutlineWidth, controlOutline } = token

  React.useImperativeHandle(ref, () => {
    return {
      focus() {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      },
      addKeyword(keyword) {
        if (value.includes(keyword)) return
        handleInputChange(keyword)
        setValue([...value, keyword])
      }
    }
  }, [value])

  const onInputChange = e => {
    const inputValue = e.target.value
    setInputValue(inputValue)
    handleInputChange(inputValue)
  }

  const handleInputChange = inputValue => {
    const nextValue = [
      ...value,
    ]
    if (inputValue) {
      nextValue.push(inputValue)
    }
    onChange && onChange(nextValue)
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === "Escape") return
    e.stopPropagation()
    if (e.key === 'Enter') {
      handleEnterEvent(inputValue)
      onPressEnter && onPressEnter()
    }
    if (e.key === "Backspace") {
      handleDeleteEvent(inputValue)
    }
  }

  const handleEnterEvent = (inputValue: string) => {
    if (!inputValue) return
    const include = value.includes(inputValue)
    let nextValues = [...value, inputValue]
    if (include) {
      nextValues = value.filter(item => item !== inputValue)
    }

    if (inputRef.current) {
      setInputValue("")
    }
    setValue(nextValues)
    onChange && onChange(nextValues)
  }

  const handleDeleteEvent = (inputValue: string) => {
    if (inputValue) return
    const nextValues = value.slice(0, -1)
    setValue(nextValues)
    onChange && onChange(nextValues)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!inputRef.current) return
    inputRef.current.focus()
  }

  const deleteItem = itemValue => {
    const nextValues = value.filter(item => item !== itemValue)
    setValue(nextValues)
    onChange && onChange(nextValues)
  }

  const editItem = itemValue => {
    setValue(value.filter(item => item !== itemValue))
    setInputValue(itemValue)
  }

  const onFocus = () => {
    setFocus(true)
  }

  const onBlur = () => {
    setFocus(false)
    handleEnterEvent(inputValue)
  }

  return (
    <div style={{
      "--color-primary": colorPrimary,
      "--control-outline": controlOutline,
      "--color-primary-hover": colorPrimaryHover,
      "--control-outline-width": `${controlOutlineWidth}px`,
    }}>
      <div
        onClick={handleContainerClick}
        className={`${focus? "focus": ""} search-input-container flex justify-between rounded-3xl mt-3 mb-2 cursor-text border border-solid border-[#d9d9d9] py-1 px-3`}
      >
        <div className="mr-1 flex items-center">{prefix}</div>
        <div className="flex flex-1">
          <div style={{ display: 'flex' }}>
            {value.map(item => {
              return (
                <div
                  key={item}
                  className="pr-2 pl-3 my-1 mr-1 bg-[#0000000f] rounded-[12px] flex justify-center items-center text-nowrap"
                >
                  <span
                    onClick={() => editItem(item)}
                    className="max-w-[200px] overflow-ellipsis overflow-hidden whitespace-nowrap"
                  >
                    {item}
                  </span>
                  <CloseOutlined onClick={() => deleteItem(item)} className="ml-1 cursor-pointer w-3 text-gray-400 hover:text-gray-500" />
                </div>
              )
            })}
          </div>
          <div className="flex flex-1 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={onInputChange}
              className="border-none outline-none text-[14px] w-full"
              onBlur={onBlur}
              onFocus={onFocus}
              onKeyUp={e => e.stopPropagation()}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
            />
          </div>
        </div>
        {suffix}
      </div>
    </div>
  )
}

export default React.forwardRef<SearchInputRefProps, SearchInputProps>(SearchInput)
