"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import GoogleOAuthButton from "../GoogleOAuthButton";

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

const AuthComponent = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  const saveAuthToken = (token: string) => {
    localStorage.setItem("authToken", token);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const urlParams = new URLSearchParams(window.location.search);
    const verificationToken = urlParams.get("token");

    if (verificationToken) {
      verifyEmail(verificationToken);
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          router.push("/broadcasts");
        } else {
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Token validation error:", error);
        localStorage.removeItem("authToken");
      }
    }
  }, [router]);

  const verifyEmail = async (token: string) => {
    setIsVerifying(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/verify?token=${token}`
      );
      setMessage("Email verified successfully! Please login.");
      setIsLogin(true); // Switch to login form after verification
      router.push("/auth"); // Redirect to login page
    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
        "Email verification failed. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    setIsResending(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/resend-verification-email`,
        { email }
      );
      setMessage("Verification email resent successfully. Please check your inbox.");
    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
        "Failed to resend verification email. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) =>
      axios.post(`${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/login`, data),
    onSuccess: (response) => {
      saveAuthToken(response.data.accessToken);
      router.push("/broadcasts");
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.message || "Login failed. Please try again.");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: Omit<RegisterFormData, "confirmPassword">) =>
      axios.post(`${process.env.NEXT_PUBLIC_BACK_END_URL}/auth/register`, data),
    onSuccess: (response) => {
      setMessage(
        response.data.message ||
        "Registration successful! Please check your email for verification."
      );
      setIsLogin(true); // Switch to login form after registration
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    },
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    loginMutation.mutate({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    registerMutation.mutate({
      email: formData.get("email") as string,
      name: formData.get("name") as string,
      password,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <motion.button
            className={`px-6 py-2 rounded-l-lg transition-all ${isLogin ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600"
              }`}
            onClick={() => {
              setIsLogin(true);
              setMessage(""); // Clear message when switching forms
            }}
            whileHover={{ scale: 1.05 }}
          >
            Login
          </motion.button>
          <motion.button
            className={`px-6 py-2 rounded-r-lg transition-all ${!isLogin ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600"
              }`}
            onClick={() => {
              setIsLogin(false);
              setMessage(""); // Clear message when switching forms
            }}
            whileHover={{ scale: 1.05 }}
          >
            Register
          </motion.button>
        </div>

        {message && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isLogin ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Welcome Back
              </h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-all"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
              <div className="mt-4">
                <GoogleOAuthButton />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Create Account
              </h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-all"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
              {message.includes("check your email") && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() =>
                      resendVerificationEmail(
                        (document.querySelector('input[name="email"]') as HTMLInputElement).value
                      )
                    }
                    className="text-pink-500 hover:underline"
                    disabled={isResending}
                  >
                    {isResending ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      "Resend Verification Email"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthComponent;