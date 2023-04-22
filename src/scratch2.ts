import { expectTypeOf } from 'vitest'
import { mainnet } from './chains.js'
import type { BaseRpcRequests } from './clients/transports/createTransport.js'
import {
  http,
  type Chain,
  type Transport,
  type BlockTag,
  type Account,
  type Address,
  type TransactionRequest,
  type Formatted,
  type TransactionRequestFormatter,
  type Hex,
  type GetBlockReturnType,
  type GetTransportConfig,
  webSocket,
} from './index.js'
import type { PublicRequests, Requests } from './types/eip1193.js'
import type { MergeIntersectionProperties, Prettify } from './types/utils.js'
import type { Formatter } from './types/formatter.js'

export type ClientConfig<
  T extends {
    chain?: Chain | undefined
    transport?: Transport
  } = {
    chain: Chain | undefined
    transport: Transport
  },
> = {
  chain?: T['chain']
  key?: string
  name?: string
  pollingInterval?: number
  transport: T['transport']
  type?: string
}

export type Client<
  T extends {
    chain?: Chain | undefined
    requests?: BaseRpcRequests
    transport?: Transport
  } = {
    chain: Chain | undefined
    requests: Requests
    transport: Transport
  },
> = {
  chain: T['chain']
  key: string
  name: string
  pollingInterval: number
  request: T['requests'] extends BaseRpcRequests
    ? T['requests']['request']
    : BaseRpcRequests['request']
  transport: T['transport'] extends Transport
    ? ReturnType<T['transport']>['config'] & ReturnType<T['transport']>['value']
    : ReturnType<Transport>['config'] & ReturnType<Transport>['value']
  type: string
  uid: string
}

export declare function createClient<
  TChain extends Chain | undefined = undefined,
  TTransport extends Transport = Transport,
  TRequests extends BaseRpcRequests = Requests,
>(
  config: ClientConfig<{
    chain: TChain
    transport: TTransport
  }>,
): Client<{
  chain: TChain
  requests: TRequests
  transport: TTransport
}>

const client = createClient({
  chain: mainnet,
  transport: http(),
})
const client2 = createClient({ transport: http() })
const client3: Client = createClient({ transport: http() })
expectTypeOf(client).toMatchTypeOf<Client>()
expectTypeOf(client2).toMatchTypeOf<Client>()
expectTypeOf(client3).toMatchTypeOf<Client>()
expectTypeOf(client.chain).toEqualTypeOf(mainnet)
expectTypeOf(client2.chain).toEqualTypeOf(undefined)
expectTypeOf(client3.chain).toEqualTypeOf<Chain | undefined>()

// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------

export type PublicClientConfig<
  T extends {
    chain?: Chain | undefined
    transport?: Transport
  } = {
    chain: Chain | undefined
    transport: Transport
  },
> = Pick<
  ClientConfig<T>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
>

export type PublicClient<
  T extends {
    chain?: Chain | undefined
    includeActions?: boolean
    requests?: PublicRequests
    transport?: Transport
  } = {
    chain: Chain | undefined
    includeActions: true
    requests: Requests
    transport: Transport
  },
> = Prettify<
  Client<T> & (T['includeActions'] extends true ? PublicActions<T> : unknown)
>

export type PublicActions<
  T extends {
    chain?: Chain | undefined
    transport?: Transport
  } = {
    chain: Chain | undefined
    transport: Transport
  },
> = {
  call: (parameters: CallParameters<T['chain']>) => Promise<CallReturnType>
  getChainId: () => Promise<GetChainIdReturnType>
  watchBlocks: (
    args: WatchBlocksParameters<
      T['chain'],
      T['transport'] extends Transport ? T['transport'] : Transport
    >,
  ) => WatchBlocksReturnType
}

export declare function createPublicClient<
  TChain extends Chain | undefined = undefined,
  TTransport extends Transport = Transport,
>({
  chain,
  key = 'public',
  name = 'Public Client',
  transport,
  pollingInterval,
}: PublicClientConfig<{
  chain: TChain
  transport: TTransport
}>): PublicClient<{
  chain: TChain
  includeActions: true
  transport: TTransport
}>

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
const publicClient2 = createPublicClient({ transport: http() })
const publicClient3: PublicClient = createPublicClient({ transport: http() })
const publicClient4 = createPublicClient({ transport: webSocket() })
expectTypeOf(publicClient).toMatchTypeOf<PublicClient>()
expectTypeOf(publicClient2).toMatchTypeOf<PublicClient>()
expectTypeOf(publicClient3).toMatchTypeOf<PublicClient>()
expectTypeOf(publicClient4).toMatchTypeOf<PublicClient>()
expectTypeOf(publicClient.chain).toEqualTypeOf(mainnet)
expectTypeOf(publicClient2.chain).toEqualTypeOf(undefined)
expectTypeOf(publicClient3.chain).toEqualTypeOf<Chain | undefined>()
expectTypeOf(publicClient4.chain).toEqualTypeOf(undefined)

// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------

// export type AddChainParameters = {
//   chain: Chain
// }
// export async function addChain<
//   TChain extends Chain | undefined,
//   TAccount extends Account | undefined,
// >(
//   client: WalletClient<TChain, TAccount> | Client<TChain>,
//   { chain }: AddChainParameters,
// ): Promise<void> {
//   const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain
//   await client.request({
//     method: 'wallet_addEthereumChain',
//     params: [
//       {
//         chainId: numberToHex(id),
//         chainName: name,
//         nativeCurrency,
//         rpcUrls: rpcUrls.default.http,
//         blockExplorerUrls: blockExplorers
//           ? Object.values(blockExplorers).map(({ url }) => url)
//           : undefined,
//       },
//     ],
//   })
// }

export type FormattedCall<
  TFormatter extends Formatter | undefined = Formatter,
> = MergeIntersectionProperties<
  Omit<Formatted<TFormatter, TransactionRequest, true>, 'from'>,
  TransactionRequest
>
export type CallParameters<
  TChain extends Chain | undefined = Chain | undefined,
> = FormattedCall<TransactionRequestFormatter<TChain>> & {
  account?: Account | Address
} & (
    | {
        blockNumber?: bigint
        blockTag?: never
      }
    | {
        blockNumber?: never
        blockTag?: BlockTag
      }
  )
export type CallReturnType = { data: Hex | undefined }
export declare function call<TChain extends Chain | undefined>(
  client: PublicClient<{ chain: TChain }> | Client<{ chain: TChain }>,
  args: CallParameters<TChain>,
): Promise<CallReturnType>

export type GetChainIdReturnType = number
export declare function getChainId<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client:
    | PublicClient<{ chain: TChain }>
    // | WalletClient<TChain, TAccount>
    | Client<{ chain: TChain }>,
): Promise<GetChainIdReturnType>

// export type SignTypedDataParameters<
//   TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
//   TPrimaryType extends string = string,
//   TAccount extends Account | undefined = undefined,
// > = GetAccountParameter<TAccount> &
//   TypedDataDefinition<TTypedData, TPrimaryType>
// export type SignTypedDataReturnType = Hex
// export declare function signTypedData<
//   TTypedData extends TypedData | { [key: string]: unknown },
//   TPrimaryType extends string,
//   TChain extends Chain | undefined,
//   TAccount extends Account | undefined,
// >(
//   client: WalletClient<TChain, TAccount> | Client<TChain>,
//   {
//     account = (client as WalletClient).account,
//     domain,
//     message,
//     primaryType,
//     types,
//   }: SignTypedDataParameters<TTypedData, TPrimaryType, TAccount>,
// ): Promise<SignTypedDataReturnType>

export type OnBlockParameter<TChain extends Chain | undefined = Chain> =
  GetBlockReturnType<TChain>
export type OnBlock<TChain extends Chain | undefined = Chain> = (
  block: OnBlockParameter<TChain>,
  prevBlock: OnBlockParameter<TChain> | undefined,
) => void
type PollOptions = {
  blockTag?: BlockTag
  emitMissed?: boolean
  emitOnBegin?: boolean
  includeTransactions?: boolean
  pollingInterval?: number
}
export type WatchBlocksParameters<
  TChain extends Chain | undefined = Chain,
  TTransport extends Transport = Transport,
> = {
  onBlock: OnBlock<TChain>
  onError?: (error: Error) => void
} & (GetTransportConfig<TTransport>['type'] extends 'webSocket'
  ?
      | {
          blockTag?: never
          emitMissed?: never
          emitOnBegin?: never
          includeTransactions?: never
          poll?: false
          pollingInterval?: never
        }
      | (PollOptions & { poll?: true })
  : PollOptions & { poll?: true })
export type WatchBlocksReturnType = () => void
export declare function watchBlocks<
  TTransport extends Transport,
  TChain extends Chain | undefined,
>(
  client:
    | PublicClient<{ chain: TChain; transport: Transport }>
    | Client<{ chain: TChain; transport: Transport }>,
  {
    blockTag = 'latest',
    emitMissed = false,
    emitOnBegin = false,
    onBlock,
    onError,
    includeTransactions = false,
    poll,
    pollingInterval = client.pollingInterval,
  }: WatchBlocksParameters<TChain, TTransport>,
): WatchBlocksReturnType

// export type WriteContractParameters<
//   TAbi extends Abi | readonly unknown[] = Abi,
//   TFunctionName extends string = string,
//   TChain extends Chain | undefined = Chain,
//   TAccount extends Account | undefined = undefined,
//   TChainOverride extends Chain | undefined = undefined,
// > = ContractFunctionConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> &
//   Omit<
//     SendTransactionParameters<TChain, TAccount, TChainOverride>,
//     'chain' | 'to' | 'data' | 'value'
//   > &
//   GetChain<TChain, TChainOverride> &
//   GetValue<TAbi, TFunctionName, SendTransactionParameters<TChain>['value']>
// export type WriteContractReturnType = SendTransactionReturnType
// export declare function writeContract<
//   TChain extends Chain | undefined,
//   TAccount extends Account | undefined,
//   TAbi extends Abi | readonly unknown[],
//   TFunctionName extends string,
//   TChainOverride extends Chain | undefined = undefined,
// >(
//   client: WalletClient<TChain, TAccount> | Client<TChain>,
//   {
//     abi,
//     address,
//     args,
//     functionName,
//     ...request
//   }: WriteContractParameters<
//     TAbi,
//     TFunctionName,
//     TChain,
//     TAccount,
//     TChainOverride
//   >,
// ): Promise<WriteContractReturnType>

// export type DropTransactionParameters<
//   TMode extends TestClientMode | undefined = undefined,
// > = Prettify<
//   {
//     hash: Hash
//   } & (IsUndefined<TMode> extends true
//     ? { mode: TestClientMode }
//     : { mode?: TestClientMode })
// >
// export async function dropTransaction<
//   TChain extends Chain | undefined,
//   TMode extends TestClientMode | undefined,
// >(
//   client:
//     | (TMode extends TestClientMode ? TestClient<TChain, TMode> : never)
//     | Client<TChain, Transport, TestRequests<string>>,
//   {
//     hash,
//     mode: _mode = (client as TestClient).mode,
//   }: DropTransactionParameters<TMode>,
// ) {
//   return await (client as TestClient).request({
//     method: `${_mode}_dropTransaction`,
//     params: [hash],
//   })
// }
