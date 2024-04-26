import React from "react"
import type { ReactNode } from "react"
import ConfigProvider from "antd/es/config-provider"

export const GlobalAntdProvider: React.FC<{ children: ReactNode }> = props => (
  <ConfigProvider
    theme={{
      token: {
      }
    }}>
    {props.children}
  </ConfigProvider>
)