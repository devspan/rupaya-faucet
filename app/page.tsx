import Image from 'next/image'
import FaucetForm from '@/components/FaucetForm'
import FaucetBalance from '@/components/FaucetBalance'
import { Droplet, Info } from 'lucide-react'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-6xl font-extrabold text-black mb-4 flex items-center justify-center">
          <span className="inline-block mr-4 transform rotate-12">
            <Droplet className="h-16 w-16 text-neobrut-blue" />
          </span>
          <span className="bg-neobrut-blue text-white px-4 py-2 transform -rotate-3 shadow-neobrut">
            Rupaya Faucet
          </span>
        </h1>
        <p className="text-2xl text-black bg-neobrut-red text-white inline-block px-4 py-2 transform rotate-2 shadow-neobrut">
          Claim 0.1 RUPX every 12 hours
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="neobrutal-box">
          <FaucetBalance />
        </div>

        <div className="neobrutal-box">
          <FaucetForm />
        </div>
      </div>

      <section className="mt-12 text-black max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 bg-neobrut-green text-white inline-block px-4 py-2 transform -rotate-1 shadow-neobrut">
          <Info className="inline-block mr-2 transform rotate-12" />
          About Rupaya Faucet
        </h2>
        <p className="text-lg bg-white p-4 rounded-lg shadow-neobrut border-4 border-black">
          Rupaya Faucet is a free service that allows you to claim small amounts of RUPX for testing
          and development purposes on the Rupaya network. Use these coins responsibly and enjoy
          building on Rupaya!
        </p>
      </section>
    </div>
  )
}