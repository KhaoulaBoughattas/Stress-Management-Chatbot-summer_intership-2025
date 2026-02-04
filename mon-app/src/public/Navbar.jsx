import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import UserProfile from './UserProfile'

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const location = useLocation()

  // Vérifie si un utilisateur est connecté
  useEffect(() => {
    const id = localStorage.getItem("idP")
    setIsLoggedIn(!!id)
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const id = localStorage.getItem("idP")
      setIsLoggedIn(!!id)
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const navItems = [
    { name: 'Accueil', path: '/home' },
    { name: 'Chat', path: '/chat' },
    { name: 'Rythme Cardiaque', path: '/heart-rate' },
    { name: 'Questionnaire', path: '/questionnaire' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">

          {/* Logo avec icône + texte */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center">
              {/* Icône cercle avec cœur */}
              <div className="h-10 w-10 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#a7d3f2] to-[#0072f5] rounded-full shadow-md"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-7 h-7">
                    {/* Son symbole (2 formes) */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white"
                      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                      className="absolute inset-0 w-full h-full opacity-80">
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z" />
                      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z" />
                    </svg>
                    {/* Cœur */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="white"
                      className="absolute inset-0 w-full h-full opacity-90 scale-50 translate-x-[4.5px] translate-y-[4.5px]">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Texte PsyBot */}
              <div className="ml-2 font-bold text-lg">
                <span className="text-[#a7d3f2]">Psy</span>
                <span className="text-[#0072f5]">Bot</span>
              </div>
            </Link>
          </div>

          {/* Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-[#0072f5] bg-blue-50'
                    : 'text-gray-600 hover:text-[#0072f5] hover:bg-gray-100'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {isLoggedIn ? (
              <UserProfile />
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-[#0072f5] text-white hover:bg-[#0056b3] transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-md text-sm font-medium border border-[#0072f5] text-[#0072f5] hover:bg-blue-50 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
