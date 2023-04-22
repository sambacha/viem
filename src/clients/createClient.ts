import type { Chain } from '../types/index.js'
import type { Requests } from '../types/eip1193.js'
import { uid } from '../utils/uid.js'
import type {
  BaseRpcRequests,
  Transport,
} from './transports/createTransport.js'

export type ClientConfig<
  T extends {
    Chain: Chain | undefined
    Transport: Transport
  } = {
    Chain: Chain | undefined
    Transport: Transport
  },
> = {
  /** Chain for the client. */
  chain?: T['Chain'] extends Chain ? T['Chain'] : Chain
  /** A key for the client. */
  key?: string
  /** A name for the client. */
  name?: string
  /**
   * Frequency (in ms) for polling enabled actions & events.
   * @default 4_000
   */
  pollingInterval?: number
  /** The RPC transport */
  transport: T['Transport']
  /** The type of client. */
  type?: string
}

export type Client<
  T extends {
    Chain?: Chain | undefined
    Requests?: BaseRpcRequests
    Transport?: Transport
  } = {
    Chain: Chain | undefined
    Requests: Requests
    Transport: Transport
  },
> = {
  /** Chain for the client. */
  chain: T['Chain']
  /** A key for the client. */
  key: string
  /** A name for the client. */
  name: string
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval: number
  /** Request function wrapped with friendly error handling */
  request:
    | (T['Requests'] extends BaseRpcRequests ? T['Requests']['request'] : never)
    | (T['Requests'] extends undefined ? BaseRpcRequests['request'] : never)
  /** The RPC transport */
  transport:
    | (T['Transport'] extends Transport
        ? ReturnType<T['Transport']>['config'] &
            ReturnType<T['Transport']>['value']
        : never)
    | (T['Transport'] extends undefined
        ? ReturnType<Transport>['config'] & ReturnType<Transport>['value']
        : never)
  /** The type of client. */
  type: string
  /** A unique ID for the client. */
  uid: string
}

type Res = undefined extends undefined ? true : false

/**
 * Creates a base client with the given transport.
 */
export function createClient<
  TTransport extends Transport,
  TRequests extends BaseRpcRequests,
  TChain extends Chain | undefined = undefined,
>({
  chain,
  key = 'base',
  name = 'Base Client',
  pollingInterval = 4_000,
  transport,
  type = 'base',
}: ClientConfig<{
  Chain: TChain
  Transport: TTransport
}>): Client<{
  Chain: TChain
  Requests: TRequests
  Transport: TTransport
}> {
  const { config, request, value } = transport({ chain, pollingInterval })
  return {
    chain: chain as TChain,
    key,
    name,
    pollingInterval,
    request,
    transport: { ...config, ...value },
    type,
    uid: uid(),
  }
}
