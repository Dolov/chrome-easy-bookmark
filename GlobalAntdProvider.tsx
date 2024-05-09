import React from "react"
import type { ReactNode } from "react"
import { ConfigProvider } from 'antd'
import { type ConfigProviderProps } from 'antd'

export const GlobalAntdProvider = (props: ConfigProviderProps & { children: ReactNode }) => {
  const { getPopupContainer, children } = props

  return (
    <ConfigProvider
      getPopupContainer={getPopupContainer}
      theme={{
        cssVar: true,
        hashed: false,
        token: {
        }
      }}>
      {children}
    </ConfigProvider>
  )
}