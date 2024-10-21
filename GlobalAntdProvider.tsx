import { ConfigProvider, theme, type ConfigProviderProps } from "antd"
import React from "react"
import type { ReactNode } from "react"

export const GlobalAntdProvider = (
  props: ConfigProviderProps & { children: ReactNode }
) => {
  const { getPopupContainer, children } = props

  return (
    <ConfigProvider
      getPopupContainer={getPopupContainer}
      theme={{
        cssVar: true,
        hashed: false,
        algorithm: theme.darkAlgorithm,
        token: {}
      }}>
      {children}
    </ConfigProvider>
  )
}
