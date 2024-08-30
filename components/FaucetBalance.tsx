'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons'

const FAUCET_ADDRESS = '0x092C077cca05a02021E6b3DFCb8E315F421CCCC1'

export default function FaucetBalance() {
  const [balance, setBalance] = useState<string | null>(null)
  const [isLow, setIsLow] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
        const balanceWei = await provider.getBalance(FAUCET_ADDRESS)
        const balanceEth = ethers.formatEther(balanceWei)
        setBalance(balanceEth)
        setIsLow(parseFloat(balanceEth) < 10)
      } catch (error) {
        console.error('Failed to fetch balance:', error)
        setError('Failed to fetch balance. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const getProgressColor = (balance: number) => {
    if (balance < 5) return 'bg-neobrut-red'
    if (balance < 10) return 'bg-neobrut-yellow'
    return 'bg-neobrut-green'
  }

  return (
    <div className="neobrutal-box">
      <h2 className="text-3xl font-bold mb-4 text-center bg-neobrut-blue text-white px-4 py-2 transform -rotate-2 inline-block">
        Faucet Balance
      </h2>
      {isLoading ? (
        <Skeleton className="w-full h-16 bg-neobrut-yellow" />
      ) : error ? (
        <Alert variant="destructive" className="bg-neobrut-red text-white border-4 border-black">
          <ExclamationTriangleIcon className="h-6 w-6" />
          <AlertTitle className="text-xl font-bold">Error</AlertTitle>
          <AlertDescription className="text-lg">{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="text-5xl font-bold text-center mb-4 bg-neobrut-yellow px-4 py-2 transform rotate-1 inline-block border-4 border-black">
            {parseFloat(balance!).toFixed(2)} RUPX
          </div>
          <Progress
            value={Math.min((parseFloat(balance!) / 20) * 100, 100)}
            className={`h-4 ${getProgressColor(parseFloat(balance!))} border-2 border-black`}
          />
          <Alert
            variant={isLow ? 'destructive' : 'default'}
            className={`mt-4 border-4 ${isLow ? 'bg-neobrut-red text-white' : 'bg-neobrut-green text-black'}`}
          >
            {isLow ? (
              <ExclamationTriangleIcon className="h-6 w-6" />
            ) : (
              <CheckCircledIcon className="h-6 w-6" />
            )}
            <AlertTitle className="text-xl font-bold">
              {isLow ? 'Low Balance Warning' : 'Balance Status'}
            </AlertTitle>
            <AlertDescription className="text-lg">
              {isLow
                ? 'The faucet balance is running low. Please consider donating RUPX to keep the faucet running.'
                : 'The faucet balance is healthy.'}
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  )
}
