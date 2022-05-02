import {
  useEffect,
  useState
} from 'react'

import { EVM_WALLETS_CONFIG } from './config'
import { IUseBalanceOptions } from './types'

function useEVMBalance(options: IUseBalanceOptions) {
  const { isConnected, web3, name, address, chainId } = options
  const isEVMWallet = !!name && EVM_WALLETS_CONFIG.includes(name)
  const isSubscriptionIsAvailable = isEVMWallet && address && isConnected

  const [balance, setBalance] = useState<number | null>(null)

  // Call balance function on each changing of web3 or address
  useEffect(() => {
    if (isSubscriptionIsAvailable) {
      web3?.eth.getBalance(address, (e, rawBalance) => {
        if (!e) {
          setBalance(Number(rawBalance))
        }
      })
    }
  }, [isSubscriptionIsAvailable, address, web3, setBalance, chainId])

  // Subscribe to block changes
  useEffect(() => {
    const subscription = isSubscriptionIsAvailable && web3?.eth.subscribe('newBlockHeaders', (err) => {
      if (!err) {
        web3.eth.getBalance(address, (e, rawBalance) => {
          if (!e) {
            setBalance(Number(rawBalance))
          }
        })
      }
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [isSubscriptionIsAvailable, web3, setBalance, address])
  
  return balance
}

export { useEVMBalance }
