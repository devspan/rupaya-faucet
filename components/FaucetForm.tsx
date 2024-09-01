'use client'

import React, { useState, useEffect } from 'react'
import { MetaMaskSDK } from "@metamask/sdk"
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function FaucetForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [claimResult, setClaimResult] = useState<{ success: boolean; message: string; transactionHash?: string } | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [ethereum, setEthereum] = useState<any>(null)

  useEffect(() => {
    const initializeEthereum = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          setEthereum(window.ethereum)

          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (Array.isArray(accounts) && accounts.length > 0) {
            setWalletAddress(accounts[0])
          }
        } else {
          const MMSDK = new MetaMaskSDK({
            dappMetadata: {
              name: "RUPX Faucet",
              url: window.location.href,
            },
            shouldShimWeb3: true,
          })
          const provider = MMSDK.getProvider()
          if (provider) {
            setEthereum(provider)
          }
        }
      } catch (error) {
        console.error("Error initializing Ethereum:", error)
      }
    }

    initializeEthereum()
  }, [])

  useEffect(() => {
    if (ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletAddress(null)
        } else {
          setWalletAddress(accounts[0])
        }
      }

      ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [ethereum])

  const connectWallet = async () => {
    if (ethereum) {
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        if (Array.isArray(accounts) && accounts.length > 0) {
          setWalletAddress(accounts[0])
        } else {
          setClaimResult({ success: false, message: 'No accounts found. Please unlock MetaMask and try again.' })
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        setClaimResult({ success: false, message: 'Failed to connect wallet. Please try again.' })
      }
    } else {
      setClaimResult({ success: false, message: 'MetaMask is not detected. Please install MetaMask and refresh the page.' })
    }
  }

  const claimTokens = async () => {
    if (!walletAddress) {
      setClaimResult({ success: false, message: 'Please connect your wallet first' })
      return
    }
    if (!captchaToken) {
      setClaimResult({ success: false, message: 'Please complete the CAPTCHA' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, captchaToken }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Claim failed')
      }

      setClaimResult({
        success: true,
        message: 'Claim successful!',
        transactionHash: result.transactionHash
      })
    } catch (error: any) {
      console.error('Claim failed:', error)
      setClaimResult({ success: false, message: error.message || 'Claim failed. Please try again later.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="neobrutal-box">
      <h2 className="text-3xl font-bold mb-4 text-center bg-primary text-primary-foreground px-4 py-2 transform rotate-2 inline-block">
        Claim RUPX
      </h2>
      <p className="text-xl mb-6 text-center bg-secondary px-4 py-2 transform -rotate-1 inline-block border-4 border-primary">
        Connect your wallet to receive 0.1 RUPX
      </p>
      {!walletAddress ? (
        <Button
          onClick={connectWallet}
          className="neobrutal-button w-full mb-4"
        >
          Connect MetaMask
        </Button>
      ) : (
        <p className="text-lg mb-4 bg-background px-4 py-2 rounded-lg border-4 border-primary">
          Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </p>
      )}
      <div className="flex justify-center mb-4">
        <HCaptcha
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
          onVerify={(token) => setCaptchaToken(token)}
        />
      </div>
      <Button
        onClick={claimTokens}
        disabled={isLoading || !walletAddress || !captchaToken}
        className="neobrutal-button w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Processing Claim...
          </>
        ) : (
          'Claim 0.1 RUPX'
        )}
      </Button>
      {claimResult && (
        <Alert
          variant={claimResult.success ? "default" : "destructive"}
          className={`mt-6 border-4 ${claimResult.success ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}`}
        >
          <AlertDescription className="flex flex-col items-start text-lg">
            <div className="flex items-center">
              {claimResult.success ? (
                <CheckCircle className="mr-2 h-6 w-6" />
              ) : (
                <XCircle className="mr-2 h-6 w-6" />
              )}
              {claimResult.message}
            </div>
            {claimResult.transactionHash && (
              <p className="mt-2">
                Transaction:{' '}
                <a
                  href={`https://scan.rupaya.io/tx/${claimResult.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline"
                >
                  View on Explorer
                </a>
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}