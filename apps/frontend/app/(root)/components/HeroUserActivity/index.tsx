"use client"
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const HeroUserActivity = () => {
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

  return (
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
  )
}

export default HeroUserActivity