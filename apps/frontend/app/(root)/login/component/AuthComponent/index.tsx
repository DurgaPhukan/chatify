"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const router = useRouter();

  const saveAuthToken = (token: string) => {
    localStorage.setItem("authToken", token);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        if (payload.exp * 1000 > Date.now()) {
          router.push("/broadcasts");
        } else {
          localStorage.removeItem("authToken");
        }
      }
    } catch (error) {
      console.log("Error !", error)
    }

  }, [router]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) =>
      axios.post(`${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/login`, data),
    onSuccess: (response) => {
      saveAuthToken(response.data.accessToken);
      router.push("/broadcasts");
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: Omit<RegisterFormData, "confirmPassword">) =>
      axios.post(`${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/register`, data),
    onSuccess: (response) => {
      saveAuthToken(response.data.token);
      router.push("/broadcasts");
    },
  });

  // Handle Login
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    loginMutation.mutate({ email, password });
  };

  // Handle Register
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    registerMutation.mutate({ email, password, name });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        className="bg-pink-100 p-8 rounded-2xl shadow-2xl w-full max-w-lg h-[32rem]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* Toggle Button */}
        <div className="flex justify-center mb-6">
          <motion.button
            className={`px-6 py-2 rounded-l-2xl transition-all duration-300 ${isLogin ? "bg-pink-500 text-white" : "bg-white text-pink-500"
              }`}
            onClick={() => setIsLogin(true)}
            whileHover={{ scale: 1.05 }}
          >
            Login
          </motion.button>
          <motion.button
            className={`px-6 py-2 rounded-r-2xl transition-all duration-300 ${!isLogin ? "bg-pink-500 text-white" : "bg-white text-pink-500"
              }`}
            onClick={() => setIsLogin(false)}
            whileHover={{ scale: 1.05 }}
          >
            Register
          </motion.button>
        </div>

        {isLogin ? (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mt-20 text-3xl font-bold mb-6 text-center text-pink-600">
              Welcome Back
            </h2>
            <form className="flex-col items-end" onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
              <button
                type="submit"
                className="w-full bg-pink-500 text-white py-3 rounded-lg shadow-lg hover:bg-pink-600 transition-all duration-300"
              >
                Login
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
              Create an Account
            </h2>
            <form onSubmit={handleRegister}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter Password"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="submit"
                className="w-full bg-pink-500 text-white py-3 rounded-lg shadow-lg hover:bg-pink-600 transition-all duration-300"
              >
                Register
              </button>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;
