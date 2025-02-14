"use client"
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function HomeComponent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthToken = () => {
      const authToken = localStorage.getItem("authToken");
      if (authToken) {
        try {
          const base64Url = authToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const decodedToken = JSON.parse(atob(base64));

          // Check if the token is expired
          if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.removeItem("authToken");
            setIsLoggedIn(false);
            router.push("/login");
          } else {
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("authToken");
          setIsLoggedIn(false);
          router.push("/login");
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuthToken();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <div className="bg-gray-100 flex flex-col items-center justify-center">
      {/* Header */}
      <header className="bg-white shadow-md w-full py-4 px-8">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-bold text-pink-600">Chatify</h1>
          <nav>
            <ul className="flex space-x-4">
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
                      src="/profile-icon.png" // Add your profile icon image here
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
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

      {/* Main Section */}
      <main className="flex-grow container mx-auto flex flex-col items-center text-center py-12">
        {/* Motto Section */}
        <section className="w-full text-center py-12 px-4 bg-gradient-to-r from-blue-200 via-white to-pink-200 rounded-lg shadow-lg mb-16">
          <h2 className="text-5xl font-extrabold text-gray-800 mb-6">
            Connect. Communicate. Collaborate.
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Chatify helps you connect with people worldwide, inspire each other,
            and combat loneliness. Discover a platform designed to motivate you
            and foster meaningful relationships in a digital era.
          </p>
          <div className="flex gap-2">
            <img
              src="https://images.unsplash.com/photo-1532635241-17e820acc59f?q=80&w=2015&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // Add an illustrative image here
              alt="Chatify Benefits"
              className="  max-w-md mx-auto rounded-lg shadow-md"
            />
            <img
              src="https://plus.unsplash.com/premium_photo-1663051303500-c85bef3f05f6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVvcGxlJTIwZ3JvdXB8ZW58MHx8MHx8fDA%3D" // Add an illustrative image here
              alt="Chatify Meeting"
              className="max-w-md mx-auto rounded-lg shadow-md"
            />
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBlb3BsZSUyMGdyb3VwfGVufDB8fDB8fHww" // Add an illustrative image here
              alt="Chatify world"
              className="max-w-xl mx-auto rounded-lg shadow-md"
            />
          </div>
        </section>

        {/* Redirect Button */}
        <button
          onClick={() => router.push(isLoggedIn ? "/broadcasts" : "/login")}
          className="mt-10 px-6 py-3 bg-pink-500 text-white rounded-full shadow-md hover:bg-pink-600 flex items-center space-x-2"
        >
          <span className="font-semibold">{isLoggedIn ? "Broadcasts" : "Login/Register"}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5l6 6m0 0l-6 6m6-6H4.5"
            />
          </svg>
        </button>
      </main>

      {/* Footer */}
      <footer className="bg-pink-400 w-full py-4 text-center text-white">
        <p>&copy; {new Date().getFullYear()} Chatify. All rights reserved.</p>
      </footer>
    </div>
  );
}
