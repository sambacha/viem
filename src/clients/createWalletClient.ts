import type { Client, ClientConfig } from './createClient.js'
import { createClient } from './createClient.js'
import type { Transport } from './transports/createTransport.js'
import type {
  Account,
  Address,
  Chain,
  JsonRpcAccount,
  Prettify,
} from '../types/index.js'
import { walletActions } from './decorators/index.js'
import type { WalletActions } from './decorators/index.js'
import { parseAccount } from '../utils/index.js'
import type { Requests } from '../types/eip1193.js'

export type WalletClientConfig<
  T extends {
    AccountOrAddress: Account | Address | undefined
    Chain: Chain | undefined
    Transport: Transport
  } = {
    AccountOrAddress: Account | Address | undefined
    Chain: Chain | undefined
    Transport: Transport
  },
> = Pick<
  ClientConfig<T>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  /** The Account to use for the Wallet Client. This will be used for Actions that require an account as an argument. */
  account?: T['AccountOrAddress'] extends Account | Address
    ? T['AccountOrAddress']
    : Account | Address
}

export type WalletClient<
  T extends {
    Account?: Account | undefined
    Chain?: Chain | undefined
    IncludeActions?: boolean
    Transport?: Transport
  } = {
    Account: Account | undefined
    Chain: Chain | undefined
    IncludeActions: true
    Transport: Transport
  },
> = Prettify<
  Client<T & { Requests: Requests }> &
    (T['IncludeActions'] extends true ? WalletActions<T> : unknown) & {
      /** The Account to use for the Wallet Client. */
      account: T['Account']
    }
>

/**
 * Creates a Wallet Client with a given [Transport](https://viem.sh/docs/clients/intro) configured for a [Chain](https://viem.sh/docs/clients/chains).
 *
 * - Docs: https://viem.sh/docs/clients/wallet.html
 *
 * A Wallet Client is an interface to interact with [Ethereum Account(s)](https://ethereum.org/en/glossary/#account) and provides the ability to retrieve accounts, execute transactions, sign messages, etc. through [Wallet Actions](https://viem.sh/docs/actions/wallet/introduction).
 *
 * The Wallet Client supports signing over:
 * - [JSON-RPC Accounts](https://viem.sh/docs/clients/wallet.html#json-rpc-accounts) (e.g. Browser Extension Wallets, WalletConnect, etc).
 * - [Local Accounts](https://viem.sh/docs/clients/wallet.html#local-accounts-private-key-mnemonic-etc) (e.g. private key/mnemonic wallets).
 *
 * @param config - {@link WalletClientConfig}
 * @returns A Wallet Client. {@link WalletClient}
 *
 * @example
 * // JSON-RPC Account
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * @example
 * // Local Account
 * import { createWalletClient, custom } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…')
 *   chain: mainnet,
 *   transport: http(),
 * })
 */
export function createWalletClient<
  TTransport extends Transport,
  TChain extends Chain | undefined = undefined,
  TAccountOrAddress extends Account | Address | undefined = undefined,
>({
  account,
  chain,
  transport,
  key = 'wallet',
  name = 'Wallet Client',
  pollingInterval,
}: WalletClientConfig<{
  AccountOrAddress: TAccountOrAddress
  Chain: TChain
  Transport: TTransport
}>): WalletClient<{
  Account: TAccountOrAddress extends Address
    ? Prettify<JsonRpcAccount<TAccountOrAddress>>
    : TAccountOrAddress
  Chain: TChain
  IncludeActions: true
  Transport: TTransport
}> {
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
  } as WalletClient<{
    Account: TAccountOrAddress extends Address
      ? Prettify<JsonRpcAccount<TAccountOrAddress>>
      : TAccountOrAddress
    Chain: TChain
    IncludeActions: true
    Transport: TTransport
  }>
  return {
    ...client,
    ...walletActions(client),
  }
}
