import type { Address, Abi, TypedData } from 'abitype'
import type { BaseRpcRequests } from './clients/transports/createTransport.js'
import {
  http,
  type Account,
  type Chain,
  type JsonRpcAccount,
  type Transport,
  type Hex,
  type BlockTag,
  type TransactionRequestFormatter,
  type TransactionRequest,
  type Formatted,
  type TypedDataDefinition,
  type GetTransportConfig,
  type GetBlockReturnType,
  type Hash,
  type ContractFunctionConfig,
  type SendTransactionParameters,
  type GetValue,
  type SendTransactionReturnType,
  numberToHex,
  webSocket,
} from './index.js'
import type { PublicRequests, Requests, TestRequests } from './types/eip1193.js'
import type {
  IsUndefined,
  MergeIntersectionProperties,
  Prettify,
} from './types/utils.js'
import { mainnet } from './chains.js'
import { expectTypeOf } from 'vitest'
import type { Formatter } from './types/formatter.js'
import type { GetAccountParameter } from './types/account.js'
import type { GetChain } from './types/chain.js'
import { wagmiContractConfig } from './_test/abis.js'
import { parseAccount } from './utils/accounts.js'

export type AddChainParameters = {
  chain: Chain
}
export async function addChain<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: WalletClient<TChain, TAccount> | Client<TChain>,
  { chain }: AddChainParameters,
): Promise<void> {
  const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain
  await client.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: numberToHex(id),
        chainName: name,
        nativeCurrency,
        rpcUrls: rpcUrls.default.http,
        blockExplorerUrls: blockExplorers
          ? Object.values(blockExplorers).map(({ url }) => url)
          : undefined,
      },
    ],
  })
}

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
    | PublicClient<TChain>
    | WalletClient<TChain, TAccount>
    | Client<TChain>,
): Promise<GetChainIdReturnType>

export type SignTypedDataParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
  TAccount extends Account | undefined = undefined,
> = GetAccountParameter<TAccount> &
  TypedDataDefinition<TTypedData, TPrimaryType>
export type SignTypedDataReturnType = Hex
export declare function signTypedData<
  TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: WalletClient<TChain, TAccount> | Client<TChain>,
  {
    account = (client as WalletClient).account,
    domain,
    message,
    primaryType,
    types,
  }: SignTypedDataParameters<TTypedData, TPrimaryType, TAccount>,
): Promise<SignTypedDataReturnType>

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
    | PublicClient<{ chain: TChain; transport: TTransport }>
    | Client<{ chain: TChain; transport: TTransport }>,
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

export type WriteContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TChain extends Chain | undefined = Chain,
  TAccount extends Account | undefined = undefined,
  TChainOverride extends Chain | undefined = undefined,
> = ContractFunctionConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> &
  Omit<
    SendTransactionParameters<TChain, TAccount, TChainOverride>,
    'chain' | 'to' | 'data' | 'value'
  > &
  GetChain<TChain, TChainOverride> &
  GetValue<TAbi, TFunctionName, SendTransactionParameters<TChain>['value']>
export type WriteContractReturnType = SendTransactionReturnType
export declare function writeContract<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainOverride extends Chain | undefined = undefined,
>(
  client: WalletClient<TChain, TAccount> | Client<{ chain: TChain }>,
  {
    abi,
    address,
    args,
    functionName,
    ...request
  }: WriteContractParameters<
    TAbi,
    TFunctionName,
    TChain,
    TAccount,
    TChainOverride
  >,
): Promise<WriteContractReturnType>

export type DropTransactionParameters<
  TMode extends TestClientMode | undefined = undefined,
> = Prettify<
  {
    hash: Hash
  } & (IsUndefined<TMode> extends true
    ? { mode: TestClientMode }
    : { mode?: TestClientMode })
>
export async function dropTransaction<
  TChain extends Chain | undefined,
  TMode extends TestClientMode | undefined,
>(
  client:
    | (TMode extends TestClientMode ? TestClient<TChain, TMode> : never)
    | Client<TChain, Transport, TestRequests<string>>,
  {
    hash,
    mode: _mode = (client as TestClient).mode,
  }: DropTransactionParameters<TMode>,
) {
  return await (client as TestClient).request({
    method: `${_mode}_dropTransaction`,
    params: [hash],
  })
}

// --------------------------------------------------------------------------------------------------------------------------------------------------------------

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

// --------------------------------------------------------------------------------------------------------------------------------------------------------------

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
export function publicActions<
  TChain extends Chain | undefined = Chain | undefined,
  TTransport extends Transport = Transport,
>(
  client: PublicClient<{ chain: TChain; transport: TTransport }>,
): PublicActions<{ chain: TChain; transport: TTransport }> {
  return {
    call: (args) => call(client, args),
    getChainId: () => getChainId(client),
    watchBlocks: (args) => watchBlocks(client, args),
  }
}

export function createPublicClient<
  TChain extends Chain | undefined = undefined,
  TTransport extends Transport = Transport,
>({
  chain,
  key = 'public',
  name = 'Public Client',
  transport,
  pollingInterval,
}: PublicClientConfig<{ chain: TChain; transport: TTransport }>): PublicClient<{
  chain: TChain
  includeActions: true
  transport: TTransport
}> {
  {
    const client = createClient({
      chain,
      key,
      name,
      pollingInterval,
      transport,
      type: 'publicClient',
    }) as PublicClient<{ chain: TChain; transport: TTransport }>
    return {
      ...client,
      ...publicActions(client),
    }
  }
}

// --------------------------------------------------------------------------------------------------------------------------------------------------------------

export type WalletClientConfig<
  TChain extends Chain | undefined = Chain | undefined,
  TAccountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  TTransport extends Transport = Transport,
> = Pick<
  ClientConfig<TChain, TTransport>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  account?: TAccountOrAddress
}

export type WalletClient<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TTransport extends Transport = Transport,
  TIncludeActions extends boolean = true,
> = Prettify<
  Client<TChain, TTransport, Requests> &
    (TIncludeActions extends true
      ? WalletActions<TChain, TAccount>
      : unknown) & {
      account: TAccount
    }
>

export type WalletActions<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
> = {
  addChain: (args: AddChainParameters) => Promise<void>
  getChainId: () => Promise<GetChainIdReturnType>
  signTypedData: <
    TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string,
  >(
    args: SignTypedDataParameters<TTypedData, TPrimaryType, TAccount>,
  ) => Promise<SignTypedDataReturnType>
  writeContract: <
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
    TChainOverride extends Chain | undefined,
  >(
    args: WriteContractParameters<
      TAbi,
      TFunctionName,
      TChain,
      TAccount,
      TChainOverride
    >,
  ) => Promise<WriteContractReturnType>
}
export function walletActions<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TTransport extends Transport = Transport,
>(
  client: WalletClient<TChain, TAccount, TTransport>,
): WalletActions<TChain, TAccount> {
  return {
    addChain: (args) => addChain(client, args),
    getChainId: () => getChainId(client),
    signTypedData: (args) => signTypedData(client, args),
    writeContract: (args) => writeContract(client, args),
  }
}

export function createWalletClient<
  TChain extends Chain | undefined = undefined,
  TAccountOrAddress extends Account | Address | undefined = undefined,
  TTransport extends Transport = Transport,
>({
  account,
  chain,
  transport,
  key = 'wallet',
  name = 'Wallet Client',
  pollingInterval,
}: WalletClientConfig<TChain, TAccountOrAddress, TTransport>): WalletClient<
  TChain,
  TAccountOrAddress extends Address
    ? Prettify<JsonRpcAccount<TAccountOrAddress>>
    : TAccountOrAddress,
  TTransport,
  true
> {
  const client = {
    ...createClient({
      chain,
      key,
      name,
      pollingInterval,
      transport: (opts) => transport({ ...opts, retryCount: 0 }),
      type: 'walletClient',
    }),
    account: account ? parseAccount(account) : undefined,
  } as WalletClient<
    TChain,
    TAccountOrAddress extends Address
      ? JsonRpcAccount<TAccountOrAddress>
      : TAccountOrAddress,
    TTransport
  >
  return {
    ...client,
    ...walletActions(client),
  }
}

// --------------------------------------------------------------------------------------------------------------------------------------------------------------

export type TestClientMode = 'anvil' | 'hardhat'

export type TestClientConfig<
  TChain extends Chain | undefined = Chain | undefined,
  TMode extends TestClientMode = TestClientMode,
  TTransport extends Transport = Transport,
> = Pick<
  ClientConfig<TChain, TTransport>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  /** Mode of the test client. Available: "anvil" | "hardhat" */
  mode: TMode
}

export type TestClient<
  TChain extends Chain | undefined = Chain | undefined,
  TMode extends TestClientMode = TestClientMode,
  TTransport extends Transport = Transport,
  TIncludeActions extends boolean = true,
> = Client<TChain, TTransport, TestRequests<TMode>> &
  (TIncludeActions extends true
    ? TestActions<TChain, TMode, TTransport>
    : unknown) & {
    mode: TMode
  }

export type TestActions<
  TChain extends Chain | undefined = undefined,
  TMode extends TestClientMode = TestClientMode,
  TTransport extends Transport = Transport,
> = {
  dropTransaction: (args: DropTransactionParameters<TMode>) => Promise<void>
}
export function testActions<
  TChain extends Chain | undefined = undefined,
  TMode extends TestClientMode = TestClientMode,
  TTransport extends Transport = Transport,
>(
  client: TestClient<TChain, TMode, TTransport>,
): TestActions<TChain, TMode, TTransport> {
  return {
    dropTransaction: (args) => dropTransaction(client, args),
  }
}

export function createTestClient<
  TChain extends Chain | undefined = undefined,
  TMode extends TestClientMode = TestClientMode,
  TTransport extends Transport = Transport,
>({
  chain,
  key = 'test',
  name = 'Test Client',
  mode,
  pollingInterval,
  transport,
}: TestClientConfig<TChain, TMode, TTransport>): TestClient<
  TChain,
  TMode,
  TTransport,
  true
> {
  const client = {
    ...createClient({
      chain,
      key,
      name,
      pollingInterval,
      transport,
      type: 'testClient',
    }),
    mode,
  } as TestClient<TChain, TMode, TTransport>
  return {
    ...client,
    ...testActions(client),
  }
}

// --------------------------------------------------------------------------------------------------------------------------------------------------------------

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

const walletClient = createWalletClient({
  account: '0x',
  chain: mainnet,
  transport: http(),
})
const walletClient2 = createWalletClient({
  account: '0x',
  transport: http(),
})
const walletClient3: WalletClient = createWalletClient({ transport: http() })
const walletClient4 = createWalletClient({
  chain: mainnet,
  transport: http(),
})
expectTypeOf(walletClient).toMatchTypeOf<WalletClient>()
expectTypeOf(walletClient2).toMatchTypeOf<WalletClient>()
expectTypeOf(walletClient3).toMatchTypeOf<WalletClient>()
expectTypeOf(walletClient4).toMatchTypeOf<WalletClient>()
expectTypeOf(walletClient.chain).toEqualTypeOf(mainnet)
expectTypeOf(walletClient2.chain).toEqualTypeOf(undefined)
expectTypeOf(walletClient3.chain).toEqualTypeOf<Chain | undefined>()
expectTypeOf(walletClient4.chain).toEqualTypeOf(mainnet)
expectTypeOf(walletClient.account).toEqualTypeOf<JsonRpcAccount<'0x'>>()
expectTypeOf(walletClient2.account).toEqualTypeOf<JsonRpcAccount<'0x'>>()
expectTypeOf(walletClient3.account).toEqualTypeOf<Account | undefined>()
expectTypeOf(walletClient4.account).toEqualTypeOf(undefined)

const testClient = createTestClient({
  mode: 'anvil',
  chain: mainnet,
  transport: http(),
})
const testClient2 = createTestClient({ mode: 'anvil', transport: http() })
const testClient3: TestClient = createTestClient({
  mode: 'anvil',
  transport: http(),
})
expectTypeOf(testClient).toMatchTypeOf<TestClient>()
expectTypeOf(testClient2).toMatchTypeOf<TestClient>()
expectTypeOf(testClient3).toMatchTypeOf<TestClient>()
expectTypeOf(testClient.chain).toEqualTypeOf(mainnet)
expectTypeOf(testClient2.chain).toEqualTypeOf(undefined)
expectTypeOf(testClient3.chain).toEqualTypeOf<Chain | undefined>()
expectTypeOf(testClient.mode).toEqualTypeOf<'anvil'>()
expectTypeOf(testClient2.mode).toEqualTypeOf<'anvil'>()
expectTypeOf(testClient3.mode).toEqualTypeOf<TestClientMode>()

// --------------------------------------------------------------------------------------------------------------------------------------------------------------

await getChainId(client)
await getChainId(client2)
await getChainId(client3)
await getChainId(publicClient)
await getChainId(publicClient2)
await getChainId(publicClient3)
await getChainId(publicClient4)
await getChainId(walletClient)
await getChainId(walletClient2)
await getChainId(walletClient3)
await getChainId(walletClient4)
await publicClient.getChainId()
await publicClient2.getChainId()
await publicClient3.getChainId()
await walletClient2.getChainId()
await walletClient3.getChainId()
await walletClient4.getChainId()

await addChain(client, { chain: mainnet })
await addChain(client2, { chain: mainnet })
await addChain(client3, { chain: mainnet })
await addChain(walletClient, { chain: mainnet })
await addChain(walletClient2, { chain: mainnet })
await addChain(walletClient3, { chain: mainnet })
await addChain(walletClient4, { chain: mainnet })
await walletClient.addChain({ chain: mainnet })
await walletClient2.addChain({ chain: mainnet })
await walletClient3.addChain({ chain: mainnet })
await walletClient4.addChain({ chain: mainnet })

await call(client, {
  data: '0x06fdde03',
  account: '0x',
  to: '0x',
})
await call(publicClient, {
  data: '0x06fdde03',
  account: '0x',
  to: '0x',
})
await publicClient.call({
  data: '0x06fdde03',
  account: '0x',
  to: '0x',
})

const types = {
  Name: [
    { name: 'first', type: 'string' },
    { name: 'last', type: 'string' },
  ],
  Person: [
    { name: 'name', type: 'Name' },
    { name: 'wallet', type: 'address' },
    { name: 'favoriteColors', type: 'string[3]' },
    { name: 'age', type: 'uint8' },
    { name: 'isCool', type: 'bool' },
  ],
  Mail: [
    { name: 'timestamp', type: 'uint256' },
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
    { name: 'hash', type: 'bytes' },
  ],
} as const
const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0x0000000000000000000000000000000000000000',
} as const
await signTypedData(client, {
  account: '0x',
  domain,
  types,
  primaryType: 'Name',
  message: {
    first: 'Cow',
    last: 'Burns',
  },
})
await signTypedData(walletClient, {
  domain,
  types,
  primaryType: 'Name',
  message: {
    first: 'Cow',
    last: 'Burns',
  },
})
await walletClient.signTypedData({
  domain,
  types,
  primaryType: 'Name',
  message: {
    first: 'Cow',
    last: 'Burns',
  },
})

await watchBlocks(client, {
  onBlock: (block, prevBlock) => {
    console.log({ block, prevBlock })
  },
})
await watchBlocks(publicClient, {
  onBlock: (block, prevBlock) => {
    console.log({ block, prevBlock })
  },
})
await watchBlocks(publicClient4, {
  onBlock: (block, prevBlock) => {
    console.log({ block, prevBlock })
  },
})
await publicClient.watchBlocks({
  onBlock: (block, prevBlock) => {
    console.log({ block, prevBlock })
  },
})
await publicClient4.watchBlocks({
  onBlock: (block, prevBlock) => {
    console.log({ block, prevBlock })
  },
})

await dropTransaction(client, {
  mode: 'anvil',
  // ^?
  hash: '0x',
})
await dropTransaction(testClient, {
  hash: '0x',
})
await testClient.dropTransaction({
  hash: '0x',
})

await writeContract(client, {
  ...wagmiContractConfig,
  account: '0x',
  functionName: 'mint',
})
await writeContract(walletClient, {
  ...wagmiContractConfig,
  functionName: 'mint',
})
await writeContract(walletClient2, {
  ...wagmiContractConfig,
  functionName: 'mint',
  chain: mainnet,
})
await writeContract(walletClient3, {
  ...wagmiContractConfig,
  functionName: 'mint',
  account: '0x',
  chain: mainnet,
})
await writeContract(walletClient4, {
  ...wagmiContractConfig,
  functionName: 'mint',
  account: '0x',
})
await walletClient.writeContract({
  ...wagmiContractConfig,
  functionName: 'mint',
})
await walletClient2.writeContract({
  ...wagmiContractConfig,
  functionName: 'mint',
  chain: mainnet,
})
await walletClient3.writeContract({
  ...wagmiContractConfig,
  functionName: 'mint',
  account: '0x',
  chain: mainnet,
})
await walletClient4.writeContract({
  ...wagmiContractConfig,
  functionName: 'mint',
  account: '0x',
})

// TODO
// - writeContract chain
// - multicall unnecessary Narrow contracts
