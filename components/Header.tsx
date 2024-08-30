'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Home, Info, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: 'https://www.rupaya.io', label: 'About', icon: Info },
    { href: 'https://scan.rupaya.io', label: 'Explorer', icon: Search },
  ]

  return (
    <header className="bg-neobrut-blue text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <div className="relative w-12 h-12 transform rotate-12">
              <Image
                src="/rupayalogodark.svg"
                alt="Rupaya Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className="text-2xl font-extrabold bg-neobrut-yellow text-neobrut-blue px-2 py-1 transform -rotate-2 shadow-neobrut">
              Rupaya Faucet
            </span>
          </Link>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {navItems.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-1 text-xl font-bold hover:bg-white hover:text-neobrut-blue px-3 py-2 rounded-lg transition-colors duration-200 transform hover:scale-105 hover:rotate-2 shadow-neobrut"
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
                className="text-white hover:bg-neobrut-blue-600"
              >
                <Menu className="h-8 w-8" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] bg-neobrut-blue border-l-4 border-neobrut-yellow"
            >
              <nav>
                <ul className="space-y-4">
                  {navItems.map(item => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center space-x-2 text-2xl font-bold text-white hover:bg-neobrut-yellow hover:text-neobrut-blue px-4 py-3 rounded-lg transition-colors duration-200 shadow-neobrut"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="w-8 h-8" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
