import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { verify } from 'hcaptcha'
import axios from 'axios'

const FAUCET_AMOUNT = ethers.parseEther('0.1') // 0.1 RUPX
const COOLDOWN_PERIOD = 12 * 60 * 60 * 1000 // 12 hours in milliseconds
const claims = new Map<string, number>()

function checkEnvVariables() {
  const FAUCET_PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY
  const RPC_URL = process.env.RPC_URL
  const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET_KEY
  const FAUCET_ADDRESS = process.env.FAUCET_ADDRESS
  const BLOCKSCOUT_API_URL = process.env.BLOCKSCOUT_API_URL

  if (!FAUCET_PRIVATE_KEY || !RPC_URL || !HCAPTCHA_SECRET || !FAUCET_ADDRESS || !BLOCKSCOUT_API_URL) {
    throw new Error('Missing required environment variables')
  }

  return {
    FAUCET_PRIVATE_KEY,
    RPC_URL,
    HCAPTCHA_SECRET,
    FAUCET_ADDRESS,
    BLOCKSCOUT_API_URL
  }
}

async function getFaucetBalance(): Promise<bigint> {
  const { BLOCKSCOUT_API_URL, FAUCET_ADDRESS } = checkEnvVariables()
  try {
    const response = await axios.get(
      `${BLOCKSCOUT_API_URL}/api?module=account&action=balance&address=${FAUCET_ADDRESS}`
    )
    return BigInt(response.data.result)
  } catch (error) {
    console.error('Error fetching faucet balance:', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const { FAUCET_PRIVATE_KEY, RPC_URL, HCAPTCHA_SECRET } = checkEnvVariables()

    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const faucetWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider)

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
  } catch (error: any) {
    console.error('Error processing claim:', error)
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
    return NextResponse.json({ error: 'Failed to fetch faucet balance' }, { status: 500 })
  }
}