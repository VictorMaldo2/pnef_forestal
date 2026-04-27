'use client'

import { MantineProvider } from '@mantine/core'

export default function ClientProviders({ children }) {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      {children}
    </MantineProvider>
  )
}