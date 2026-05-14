'use client'

import { MantineProvider } from '@mantine/core'
import { SessionProvider } from 'next-auth/react'

export default function ClientProviders({ children }) {
  return (
    <SessionProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        {children}
      </MantineProvider>
    </SessionProvider>
  )
}