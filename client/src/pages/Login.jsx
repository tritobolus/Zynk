import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCC } from "../context/Context";
import { BACKEND_URL } from "../constants";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { checkAuth, getUsers, auth } = useCC();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth === null) {
      checkAuth();
    }
  }, [auth]);

  useEffect(() => {
    if (auth === true) {
      navigate("/");
    }
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("All fields are required.");
    try {
      const res = await axios.post(BACKEND_URL +
        "/authentication/signin",
        { email, password },
        { withCredentials: true }
      );
      await checkAuth();
      await getUsers();
      if (res.status === 200) navigate("/");
    } catch (error) {
      alert(error?.response?.data?.message || "Sign in failed.");
    }
  };

  if (auth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-background-tertiary] text-text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--color-background-tertiary] p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm rounded-2xl border border-gray-100 p-10 flex flex-col gap-8"
      >
        {/* Logo + heading */}
        <div>
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-medium text-lg mb-3">
            Z
          </div>
          <h1 className="text-2xl font-medium text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your Zynk space</p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="mt-1 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-sm font-medium rounded-lg transition-all"
          >
            Sign in
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400">
          No account?{" "}
          <Link to="/signup" className="text-purple-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};