import { NextResponse } from 'next/server'

const FAUCET_ADDRESS = '0x18e5b3dee30232CB8a83e4883E17df34d79E7296'
const API_URL = `https://scan.rupaya.io/api?module=account&action=balance&address=${FAUCET_ADDRESS}`

export async function GET() {
  try {
    const response = await fetch(API_URL)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}