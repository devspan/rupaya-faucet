import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { verify } from 'hcaptcha'
import axios from 'axios'

function getEnvVariable(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const FAUCET_PRIVATE_KEY = getEnvVariable('FAUCET_PRIVATE_KEY')
const RPC_URL = getEnvVariable('RPC_URL')
const HCAPTCHA_SECRET = getEnvVariable('HCAPTCHA_SECRET_KEY')
const FAUCET_ADDRESS = getEnvVariable('FAUCET_ADDRESS')
const BLOCKSCOUT_API_URL = getEnvVariable('BLOCKSCOUT_API_URL')

const provider = new ethers.JsonRpcProvider(RPC_URL)
const faucetWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider)

const FAUCET_AMOUNT = ethers.parseEther('0.1') // 0.1 RUPX
const COOLDOWN_PERIOD = 12 * 60 * 60 * 1000 // 12 hours in milliseconds
const claims: Map<string, number> = new Map()

async function getFaucetBalance(): Promise<bigint> {
  try {
    const response = await axios.get(
      `${BLOCKSCOUT_API_URL}/api?module=account&action=balance&address=${FAUCET_ADDRESS}`
    )
    if (response.data.status !== '1') {
      throw new Error(`API Error: ${response.data.message}`)
    }
    return BigInt(response.data.result)
  } catch (error) {
    console.error('Error fetching faucet balance:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, captchaToken } = await request.json()

    if (
      !walletAddress ||
      !captchaToken ||
      typeof captchaToken !== 'string' ||
      typeof walletAddress !== 'string'
    ) {
      return NextResponse.json({ error: 'Missing or invalid required parameters' }, { status: 400 })
    }

    const captchaVerification = await verify(HCAPTCHA_SECRET, captchaToken)
    if (!captchaVerification.success) {
      return NextResponse.json({ error: 'Invalid captcha' }, { status: 400 })
    }

    const lastClaim = claims.get(walletAddress) || 0
    if (Date.now() - lastClaim < COOLDOWN_PERIOD) {
      const remainingTime = Math.ceil((COOLDOWN_PERIOD - (Date.now() - lastClaim)) / 60000)
      return NextResponse.json(
        { error: `Please wait ${remainingTime} minutes before claiming again` },
        { status: 429 }
      )
    }

    const faucetBalance = await getFaucetBalance()
    if (faucetBalance < FAUCET_AMOUNT) {
      return NextResponse.json(
        { error: 'Faucet is empty. Please try again later.' },
        { status: 503 }
      )
    }

    const tx = await faucetWallet.sendTransaction({
      to: walletAddress,
      value: FAUCET_AMOUNT,
    })

    const receipt = await tx.wait()

    if (receipt === null) {
      throw new Error('Transaction failed')
    }

    claims.set(walletAddress, Date.now())

    return NextResponse.json({
      success: true,
      message: 'Tokens claimed successfully',
      transactionHash: receipt.hash,
    })
  } catch (error: unknown) {
    console.error('Error processing claim:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to process claim: ${error.message}` },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to process claim. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const balance = await getFaucetBalance()
    return NextResponse.json({ balance: balance.toString() })
  } catch (error) {
    console.error('Error fetching faucet balance:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: `Failed to fetch faucet balance: ${error.message}` }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to fetch faucet balance' }, { status: 500 })
  }
}