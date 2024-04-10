import type Wallet from "../../kaspa/wallet"
import type Node from "../../kaspa/node"
import type Account from "../../kaspa/account"
import type { Request, Response, RequestMappings, ResponseMappings } from "../protocol"
import type Provider from "./provider"

type MappingsRecord<M extends keyof RequestMappings = keyof RequestMappings> = {
  [ K in M ]: (...params: RequestMappings[K]) => ResponseMappings[K] extends boolean ? void : (Promise<ResponseMappings[K]> | ResponseMappings[K])
}

export default class Router {
  mappings: MappingsRecord

  constructor ({ wallet, node, account, provider }: { 
    wallet: Wallet,
    node: Node,
    account: Account
    provider: Provider
  }) {
    this.mappings = {
      'wallet:status': () => wallet.status,
      'wallet:create': (password) => wallet.create(password),
      'wallet:import': (mnemonic, password) => wallet.import(mnemonic, password),
      'wallet:unlock': (password) => wallet.unlock(0, password),
      'wallet:export': (password) => wallet.export(password),
      'wallet:lock': () => wallet.lock(),
      'wallet:reset': () => wallet.reset(),
      'node:connection': () => node.connected,
      'node:connect': (address) => node.reconnect(address),
      'account:addresses': () => account.addresses,
      'account:balance': () => account.balance,
      'account:utxos': () => account.utxos,
      'account:initiateSend': (recipient, amount) => account.initiateSend(recipient, amount),
      'account:signPendings': (password) => account.signPendings(password),
      'account:submitSigned': () => account.submitSigned(),
      'provider:connect': (url) => provider.connect(url),
      'provider:connectedURL': () => provider.connectedURL,
      'provider:disconnect': () => provider.disconnect()
    }  
  }

  async routeMessage <M extends keyof RequestMappings>(request: Request<M>) {
    let response: Response<M> = {
      id: request.id,
      result: false,
    }

    const methodHandler = this.mappings[request.method]

    try {
      response.result = (await methodHandler(...request.params) ?? true) as ResponseMappings[M]
    } catch (error) {
      if (typeof error === 'string') {
        response.error = error
      } else if (error instanceof Error) {
        response.error = error.message
      }
    }
    
    return response
  }
}