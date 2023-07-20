import React from 'react'

const Dir = () => {

  return (
    <svg className="w-12 h-12 sm:w-16 sm:h-16 inline-block" height="1em" id="file-directory" width="1em" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient-file-directory" gradientUnits="userSpaceOnUse" x1="15%" x2="85%" y1="15%" y2="85%">
          <stop style={{"stopColor":"rgb(255, 27, 107)","stopOpacity":"1"}} offset="0%"/>
          <stop style={{"stopColor":"rgb(69, 202, 255)","stopOpacity":"1"}} offset="100%"/>
        </linearGradient>
        <linearGradient id="bgGradient-file-directory" gradientUnits="userSpaceOnUse" x1="15%" x2="85%" y1="15%" y2="85%">
          <stop style={{"stopColor":"rgb(255, 27, 107)","stopOpacity":"1"}} offset="0%"/>
          <stop style={{"stopColor":"rgb(69, 202, 255)","stopOpacity":"1"}} offset="100%"/>
        </linearGradient>
      </defs>
      <path d="M844,1024H180C80.589,1024,0,943.411,0,844l0-664C0,80.589,80.589,0,180,0l664,0c99.411,0,180,80.589,180,180v664C1024,943.411,943.411,1024,844,1024z" fill="url(&quot;#bgGradient-file-directory&quot;)"/>
      <svg className="StyledIconBase-ea9ulj-0 jZGNBW" width="610" fill="#F4F4F4" stroke="#000000" strokeOpacity="0" strokeWidth="0px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" x="207">
        <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3h-6.5a.25.25 0 01-.2-.1l-.9-1.2c-.33-.44-.85-.7-1.4-.7h-3.5z" fill="#F4F4F4" fillRule="evenodd" stroke="#000000" strokeOpacity="0" strokeWidth="0px"/>
      </svg>
    </svg>  
  )
}

const iconMap = {
  dir: Dir
}

const Icon: React.FC<{
  name: 'dir'
  size?: number
  style?: React.CSSProperties
}> = props => {
  const { name, size = 16, style } = props
  const MatchIcon = iconMap[name]
  return (
    <span style={{ fontSize: size, ...style }}>
      <MatchIcon />
    </span>
  )
}

export default Icon