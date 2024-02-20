import { useContext } from "react"
import { type Runtime } from "webextension-polyfill"
import { IKaspa, KaspaContext } from "../contexts/Kaspa"
import { Request, Response, ResponseMappings, RequestMappings } from "../wallet/messaging/protocol"

interface RequestCallback<M extends keyof RequestMappings> {
  success: (result: ResponseMappings[M]) => void
  error: (reason?: string) => void
}

class KaspaInterface {
  private port: Runtime.Port
  private state: IKaspa
  private setState: React.Dispatch<React.SetStateAction<IKaspa>>

  private nonce: number = 0
  private pendingMessages: Map<number, [ RequestCallback<any>['success'], RequestCallback<any>['error'] ]> = new Map()

  constructor(port: Runtime.Port, state: IKaspa, setState: any) {
    this.port = port
    this.state = state
    this.setState = setState

    this.registerListener()
  }

  get status () { 
    return this.state.status
  }

  get connection () { 
    return this.state.connection
  }

  async load () {
    const status = await this.request('wallet:status', [])
    const connection = await this.request('node:status', [])

    this.setState({
      status,
      connection
    })
  }

  async request <M extends keyof RequestMappings>(method: M, params: RequestMappings[M]) {
    const message: Request<M> = {
      id: this.nonce += 1,
      method,
      params: params
    }

    return new Promise<ResponseMappings[M]>((resolve, reject) => {
      this.pendingMessages.set(message.id, [ resolve, reject ])

      this.port.postMessage(message)
    })
  }

  private registerListener () {
    const onMessageListener = (message: Response) => {
      const messageCallbacks = this.pendingMessages.get(message.id)

      if (!messageCallbacks) return this.port.onMessage.removeListener(onMessageListener)
      const [ resolve, reject ] = messageCallbacks

      this.pendingMessages.delete(message.id)

      if (message.error) return reject(message.error)
      resolve(message.result)
    }

    this.port.onMessage.addListener(onMessageListener)
  } // add notification conditions to handle state(and possibly refactor account to be not "undefined" by events)
}

export default function useKaspa () {
  const context = useContext(KaspaContext)
  
  if (!context) throw new Error("Missing Kaspa context")

  return new KaspaInterface(context.connection, context.state, context.setState)
}
