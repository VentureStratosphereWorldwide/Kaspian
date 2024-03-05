import { createContext, useState, ReactNode } from "react"
import { runtime, type Runtime } from "webextension-polyfill"
import { Status } from "@/wallet/kaspa/wallet"
import { Connection } from "@/wallet/kaspa/node"

export interface IKaspa {
  status: Status
  connection: Connection
  addresses: [ string[], string[] ]
  balance: string
  utxos: [ string, string ][]
}

export const defaultState: IKaspa = {
  status: Status.Uninitialized,
  connection: Connection.Disconnected,
  addresses: [[], []],
  balance: '0 KAS',
  utxos: []
}

export const KaspaContext = createContext<{
  connection: Runtime.Port
  state: IKaspa
  setState: React.Dispatch<React.SetStateAction<IKaspa>>
} | undefined>(undefined)

export function KaspaProvider ({ children }: {
  children: ReactNode
}) {
  const connection = runtime.connect({ name: "@kaspian/client" }) 
  const [ state, setState ] = useState(defaultState)

  return (
    <KaspaContext.Provider value={{ connection, state, setState }}>
      {children}
    </KaspaContext.Provider>
  )
}
