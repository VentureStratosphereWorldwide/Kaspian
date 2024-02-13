import { createContext, useState, type ReactNode } from "react"

export interface ISettings {
  version: number
  nodes: {
    name: string
    address: string
    locked: boolean
  }[]
  selectedNode: number
}

export const defaultSettings: ISettings = {
  version: 1,
  nodes: [
    {
      name: "Aspectron",
      address: "wss://kaspa.aspectron.com:443/mainnet",
      locked: true
    }
  ],
  selectedNode: 0
}

export const SettingsContext = createContext<{
  state: ISettings
  setState: React.Dispatch<React.SetStateAction<ISettings>>
} | undefined>(undefined)

export function SettingsProvider({ children }: {
  children: ReactNode
}) {
  const [ state, setState ] = useState(defaultSettings)

  return (
    <SettingsContext.Provider value={{ state, setState }}>
      {children}
    </SettingsContext.Provider>
  )
}
