import { localhost } from '@wagmi/chains'
import { expectTypeOf, test } from 'vitest'

import type { Client } from './createClient.js'
import { createClient } from './createClient.js'
import { http } from './transports/index.js'
import type { Chain } from '../chains.js'

test('with chain', () => {
  const client = createClient({
    chain: localhost,
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<Client>()
  expectTypeOf(client.chain).toEqualTypeOf(localhost)
})

test('without chain', () => {
  const client = createClient({ transport: http() })
  expectTypeOf(client).toMatchTypeOf<Client>()
  expectTypeOf(client.chain).toEqualTypeOf(undefined)
})

test('declared as Client', () => {
  const client: Client = createClient({ transport: http() })
  expectTypeOf(client).toMatchTypeOf<Client>()
  expectTypeOf(client.chain).toEqualTypeOf<Chain | undefined>()
})
