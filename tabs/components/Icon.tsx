import React from 'react'
import classnames from 'classnames'

const Dir = () => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient-file-directory" gradientUnits="userSpaceOnUse" x1="15%" x2="85%" y1="15%" y2="85%">
          <stop style={{ "stopColor": "rgb(255, 27, 107)", "stopOpacity": "1" }} offset="0%" />
          <stop style={{ "stopColor": "rgb(69, 202, 255)", "stopOpacity": "1" }} offset="100%" />
        </linearGradient>
        <linearGradient id="bgGradient-file-directory" gradientUnits="userSpaceOnUse" x1="15%" x2="85%" y1="15%" y2="85%">
          <stop style={{ "stopColor": "rgb(255, 27, 107)", "stopOpacity": "1" }} offset="0%" />
          <stop style={{ "stopColor": "rgb(69, 202, 255)", "stopOpacity": "1" }} offset="100%" />
        </linearGradient>
      </defs>
      <path d="M844,1024H180C80.589,1024,0,943.411,0,844l0-664C0,80.589,80.589,0,180,0l664,0c99.411,0,180,80.589,180,180v664C1024,943.411,943.411,1024,844,1024z" fill="url(&quot;#bgGradient-file-directory&quot;)" />
      <svg className="StyledIconBase-ea9ulj-0 jZGNBW" width="610" fill="#F4F4F4" stroke="#000000" strokeOpacity="0" strokeWidth="0px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" x="207">
        <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3h-6.5a.25.25 0 01-.2-.1l-.9-1.2c-.33-.44-.85-.7-1.4-.7h-3.5z" fill="#F4F4F4" fillRule="evenodd" stroke="#000000" strokeOpacity="0" strokeWidth="0px" />
      </svg>
    </svg>
  )
}

const Open = () => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="#F4F4F4"
      xmlns="http://www.w3.org/2000/svg" filter="none" stroke="#000000" stroke-width="0px" x="207"
      stroke-opacity="0">
      <g data-name="Layer 2" stroke="#000000" fill="#F4F4F4" stroke-width="0px" stroke-opacity="0">
        <g data-name="external-link" stroke="#000000" fill="#F4F4F4" stroke-width="0px" stroke-opacity="0">
          <path
            d="M20 11a1 1 0 00-1 1v6a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h6a1 1 0 000-2H6a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3v-6a1 1 0 00-1-1z"
            stroke="#000000" fill="currentColor" stroke-width="0px" stroke-opacity="0"></path>
          <path
            d="M16 5h1.58l-6.29 6.28a1 1 0 000 1.42 1 1 0 001.42 0L19 6.42V8a1 1 0 001 1 1 1 0 001-1V4a1 1 0 00-1-1h-4a1 1 0 000 2z"
            stroke="#000000" fill="currentColor" stroke-width="0px" stroke-opacity="0"></path>
        </g>
      </g>
    </svg>
  )
}

const iconMap = {
  dir: Dir,
  open: Open,
}

const Icon: React.FC<{
  name: 'dir' | 'open'
  size?: number
  style?: React.CSSProperties
  className?: string
}> = props => {
  const { name, size = 16, style, className } = props
  const MatchIcon = iconMap[name]
  return (
    <span
      className={classnames(className, "flex items-center")}
      style={{ fontSize: size, ...style }}
    >
      <MatchIcon />
    </span>
  )
}

export default Icon