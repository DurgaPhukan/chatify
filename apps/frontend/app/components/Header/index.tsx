"use client"
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if authToken exists in local storage
    const authToken = localStorage.getItem("authToken");
    setIsLoggedIn(!!authToken);
  }, []);

  const handleLogout = () => {
    // Remove authToken and redirect to login
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-md w-full py-4 px-8">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-bold text-pink-600">Chatify</h1>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <a href="/broadcasts" className="text-pink-700 hover:text-pink-600 font-semibold">
                Broadcasts
              </a>
            </li>
            <li>
              <a href="#about" className="text-pink-700 hover:text-pink-600 font-semibold">
                About
              </a>
            </li>
            <li>
              <a href="#contact" className="text-pink-700 hover:text-pink-600 font-semibold">
                Contact
              </a>
            </li>
            {isLoggedIn && (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-pink-700 hover:text-pink-600">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVvcGxlfGVufDB8fDB8fHww"
                    alt="Profile"
                    className="w-10 h-10  rounded-full"
                  />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg hidden group-hover:block">
                  <button
                    onClick={() => router.push("/profile")}
                    className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header