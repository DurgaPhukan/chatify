"use client"
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Bell, Plus, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import Link from "next/link";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const [userDetails, setUserDetails] = useState({
    email: "",
    userId: ""
  })

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      const payload = JSON.parse(atob(authToken.split(".")[1]));
      const isTokenExpired = payload.exp * 1000 < Date.now(); // `exp` is in seconds, convert to milliseconds

      if (isTokenExpired) {
        handleLogout()
      } else {
        setUserDetails({
          email: payload.email,
          userId: payload.sub,
        });
        setIsLoggedIn(true)
      }
    }
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const navigationItems = [
    { href: "/broadcasts", label: "View Broadcasts", icon: Bell },
    { href: "/broadcasts/create", label: "Create Broadcast", icon: Plus },
    // { href: "#about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const profileMenuItems = [
    { label: "Profile", icon: User, onClick: () => router.push("/profile") },
    { label: "Settings", icon: Settings, onClick: () => router.push("/settings") },
    { label: "Logout", icon: LogOut, onClick: handleLogout },
  ];

  return (
    <header className="bg-white shadow-md w-full py-4 px-8 fixed top-0 z-50">
      <div className=" mx-auto w-full flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-pink-600 hover:text-pink-500 transition-colors cursor-pointer"
            onClick={() => router.push("/")}>
            Chatify
          </h1>
        </div>

        <nav className="flex-1 ml-16">
          <ul className="flex space-x-6 items-center">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-600 hover:text-pink-600 font-medium transition-colors"
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {isLoggedIn && (
          <div className="relative">
            <button
              className="flex items-center space-x-3 text-gray-700 hover:text-pink-600 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <h1 className="bg-gray-200 w-10 h-10 flex items-center justify-center rounded-full font-bold text-2xl">{userDetails.email[0].toUpperCase()}</h1>
              {/* <img
                src="/api/placeholder/40/40"
                alt="Profile"
                className="w-10 h-10 rounded-full ring-2 ring-pink-100 transition-all hover:ring-pink-300"
              /> */}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-100 transition-all">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Signed in as</p>
                  <p className="text-sm text-gray-500 truncate">{userDetails.email}</p>
                </div>
                {profileMenuItems.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;