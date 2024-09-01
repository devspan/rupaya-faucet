import { NextResponse } from 'next/server'
import { ethers } from 'ethers'

function getEnvVariable(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const FAUCET_PRIVATE_KEY = getEnvVariable('FAUCET_PRIVATE_KEY')
const RPC_URL = getEnvVariable('RPC_URL')
const FAUCET_ADDRESS = getEnvVariable('FAUCET_ADDRESS')

const provider = new ethers.JsonRpcProvider(RPC_URL)
const faucetWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider)

async function getFaucetBalance(): Promise<bigint> {
  return await provider.getBalance(faucetWallet.address)
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