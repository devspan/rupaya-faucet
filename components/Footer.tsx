import Link from 'next/link'
import { Github, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-neobrut-blue text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-2xl font-extrabold bg-neobrut-yellow text-neobrut-blue px-4 py-2 transform rotate-2 inline-block shadow-neobrut">
              &copy; {new Date().getFullYear()} Rupaya Faucet
            </p>
            <p className="mt-2 text-lg font-bold">Powered by the Rupaya Network</p>
          </div>
          <nav className="flex space-x-6">
            <Link
              href="https://github.com/rupaya-project"
              className="hover:text-neobrut-yellow transition-colors transform hover:scale-110 hover:-rotate-6"
              aria-label="Rupaya GitHub"
            >
              <Github className="w-8 h-8" />
            </Link>
            <Link
              href="https://twitter.com/RupayaOfficial"
              className="hover:text-neobrut-yellow transition-colors transform hover:scale-110 hover:rotate-6"
              aria-label="Rupaya Twitter"
            >
              <Twitter className="w-8 h-8" />
            </Link>
          </nav>
        </div>
        <div className="mt-6 text-center text-lg">
          <Link
            href="/terms"
            className="hover:text-neobrut-yellow transition-colors bg-neobrut-blue-600 px-3 py-1 rounded-lg mr-4 transform hover:rotate-2 inline-block shadow-neobrut"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-neobrut-yellow transition-colors bg-neobrut-blue-600 px-3 py-1 rounded-lg transform hover:-rotate-2 inline-block shadow-neobrut"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
