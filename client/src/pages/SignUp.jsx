import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../constants";
import { useCC } from "../context/Context";

export const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [OTP, setOTP] = useState("");
  const [userOTP, setUserOTP] = useState("");
  const [emailVerify, setEmailVerify] = useState(false);
  const [OTPLoading, setOTPLoading] = useState(false);

  const { checkAuth, auth } = useCC();
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

  const getOTP = async (email) => {
    try {
      setOTPLoading(true);
      const res = await axios.get(BACKEND_URL +
        "/authentication/verifyEmail",
        { params: { email } }
      );
      setOTPLoading(false);
      alert("OTP sent to your email id");
      setOTP(res.data.OTP);
    } catch (error) {
      setOTPLoading(false);
      alert(error.response.data.message);
    }
  };

  const verifyOTP = () => {
    if (userOTP == OTP) {
      setEmailVerify(true);
      alert("OTP is verified!");
    } else {
      alert("OTP is incorrect!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !username) {
      alert("All fields are required!");
      return;
    }
    try {
      const res = await axios.post(
        BACKEND_URL + "/authentication/signup",
        { username, email, password }
      );
      if (res.status == 200) alert("User registered!");
      navigate("/signin");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  if (auth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">
        Loading...
      </div>
    );
  }

  const inputBase = `w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50
    focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition`;
  const disabledClass = `opacity-45 cursor-not-allowed`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm rounded-2xl border border-gray-100 p-10 flex flex-col gap-8"
      >
        {/* Header */}
        <div>
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-medium text-lg mb-3">
            Z
          </div>
          <h1 className="text-2xl font-medium text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Join Zynk — it only takes a minute</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                disabled={emailVerify}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputBase} flex-1 ${emailVerify ? disabledClass : ""}`}
              />
              {!OTP && !emailVerify && (
                OTPLoading ? (
                  <div className="w-9 h-9 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin self-center" />
                ) : (
                  <button
                    type="button"
                    onClick={() => getOTP(email)}
                    disabled={!email}
                    className="px-3 py-2.5 text-sm font-medium text-purple-600 border border-purple-300 rounded-lg
                      hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Get OTP
                  </button>
                )
              )}
            </div>

            {OTP && !emailVerify && (
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  onChange={(e) => setUserOTP(e.target.value)}
                  className="w-28 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50
                    focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition"
                />
                <button
                  type="button"
                  onClick={verifyOTP}
                  className="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg
                    hover:bg-purple-700 transition"
                >
                  Verify
                </button>
              </div>
            )}

            {emailVerify && (
              <p className="text-xs text-green-600 font-medium flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Email verified
              </p>
            )}
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Username</label>
            <input
              type="text"
              placeholder="yourname"
              disabled={!emailVerify}
              onChange={(e) => setUsername(e.target.value)}
              className={`${inputBase} ${!emailVerify ? disabledClass : ""}`}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              disabled={!emailVerify}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputBase} ${!emailVerify ? disabledClass : ""}`}
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Confirm password</label>
            <input
              type="password"
              placeholder="••••••••"
              disabled={!emailVerify}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputBase} ${!emailVerify ? disabledClass : ""}`}
            />
          </div>

          <button
            type="submit"
            className="mt-1 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-[0.98]
              text-white text-sm font-medium rounded-lg transition-all"
          >
            Sign up
          </button>
        </div>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/signin" className="text-purple-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};