import type { PublicRequests } from '../types/eip1193.js'
import type { Transport } from './transports/createTransport.js'
import type { Client, ClientConfig } from './createClient.js'
import { createClient } from './createClient.js'
import { publicActions } from './decorators/index.js'
import type { PublicActions } from './decorators/index.js'
import type { Chain, Prettify } from '../types/index.js'

export type MulticallBatchOptions = {
  /** The maximum size (in bytes) for each calldata chunk. @default 1_024 */
  batchSize?: number
  /** The maximum number of milliseconds to wait before sending a batch. @default 16 */
  wait?: number
}

export type PublicClientConfig<
  T extends {
    Chain: Chain | undefined
    Transport: Transport
  } = {
    Chain: Chain | undefined
    Transport: Transport
  },
> = Pick<
  ClientConfig<T>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  /** Flags for batch settings. */
  batch?: {
    /** Toggle to enable `eth_call` multicall aggregation. */
    multicall?: boolean | MulticallBatchOptions
  }
}

export type PublicClient<
  T extends {
    Chain?: Chain | undefined
    IncludeActions?: boolean
    Transport?: Transport
  } = {
    Chain: Chain | undefined
    IncludeActions: true
    Transport: Transport
  },
> = Prettify<
<<<<<<< Updated upstream
  Client<TTransport, PublicRequests, TChain> &
    Pick<PublicClientConfig, 'batch'> &
    (TIncludeActions extends true ? PublicActions<TTransport, TChain> : unknown)
=======
  Client<T & { Requests: PublicRequests }> &
    (T['IncludeActions'] extends true ? PublicActions<T> : unknown)
>>>>>>> Stashed changes
>

/**
 * Creates a Public Client with a given [Transport](https://viem.sh/docs/clients/intro) configured for a [Chain](https://viem.sh/docs/clients/chains).
 *
 * - Docs: https://viem.sh/docs/clients/public.html
 *
 * A Public Client is an interface to "public" [JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) methods such as retrieving block numbers, transactions, reading from smart contracts, etc through [Public Actions](/docs/actions/public/introduction).
 *
 * @param config - {@link PublicClientConfig}
 * @returns A Public Client. {@link PublicClient}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 */
export function createPublicClient<
  TTransport extends Transport,
  TChain extends Chain | undefined = undefined,
>({
  batch,
  chain,
  key = 'public',
  name = 'Public Client',
  transport,
  pollingInterval,
<<<<<<< Updated upstream
}: PublicClientConfig<TTransport, TChain>): PublicClient<
  TTransport,
  TChain,
  true
> {
  const client = {
=======
}: PublicClientConfig<{ Chain: TChain; Transport: TTransport }>): PublicClient<{
  Chain: TChain
  IncludeActions: true
  Transport: TTransport
}> {
  const client = createClient({
    chain,
    key,
    name,
    pollingInterval,
    transport,
    type: 'publicClient',
  }) as PublicClient<{ Chain: TChain; Transport: TTransport }>
  return {
>>>>>>> Stashed changes
    batch,
    ...(createClient({
      chain,
      key,
      name,
      pollingInterval,
      transport,
      type: 'publicClient',
    }) as PublicClient<TTransport, TChain>),
  }
  return {
    ...client,
    ...publicActions(client),
  }
}
