"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [requires2FA, setRequires2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const [showError, setShowError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (requires2FA) {
      document.getElementById("otp")?.focus();
    }
  }, [requires2FA]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "" || password === "") {
      setShowError(true);
      return;
    }

    setShowError(false);
    setApiError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Invalid email or password!");
      }

      // ⭐ IF 2FA REQUIRED
      if (data.requires2FA) {
        setRequires2FA(true);
        setTempUserId(data.userId);
        setTenantId(data.tenantId);
        return;
      }

      // ⭐ LOGIN SUCCESS WITHOUT 2FA
      window.location.href = "/dashboard";
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ 2FA VERIFY HANDLER
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || !tempUserId) return;

    if (otpCode.trim() === "") setApiError("Please enter the otp");

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: tempUserId,
          token: otpCode,
          tenantId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Invalid verification code");
      }
      window.location.href = "/dashboard";

      // router.push("/dashboard");
      // router.refresh();
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {requires2FA ? "Two-Factor Verification" : "Welcome Back"}
        </h1>

        <p className="text-gray-500 text-center mb-8">
          {requires2FA
            ? "Enter code from your authenticator"
            : "Sign in to continue shopping"}
        </p>

        {/* ERROR */}
        {apiError && (
          <p className="bg-red-100 text-red-600 p-2 rounded-md text-center mb-4 text-sm">
            {apiError}
          </p>
        )}

        {/* ⭐ LOGIN FORM */}
        {!requires2FA && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email Address
              </label>

              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ⭐ Forgot Password */}
            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        )}

        {/* ⭐ 2FA FORM */}
        {requires2FA && (
          <form onSubmit={handleVerify2FA} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Authentication Code
              </label>

              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                className="w-full border rounded-lg px-3 py-2 text-center tracking-widest"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </div>

            {/* ⭐ Forgot password still visible */}
            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showError, setShowError] = useState(false);
//   const [apiError, setApiError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const { tenant } = useTenant();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Mock validation for demo purposes
//     if (email === "" || password === "") {
//       setShowError(true);
//       return;
//     }

//     setShowError(false);
//     setApiError(null);
//     setLoading(true);
//     // TODO: handle real authentication (API call)
//     try {
//       const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data?.message || "Invalid email or password!");
//       }
//       console.log(data);
//       // window.location.href = "/dashboard";
//     } catch (err: any) {
//       console.error("LOGIN ERROR:", err);
//       setApiError(err.message);
//       toast.error(err.message, {
//         duration: 6000, // 6 seconds
//         style: {
//           border: "1px solid #4f46e5",
//           padding: "12px",
//           color: "#333",
//         },
//         iconTheme: {
//           primary: "#4f46e5",
//           secondary: "#fff",
//         },
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
//         {/* Header */}
//         <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
//           Welcome Back
//         </h1>
//         <p className="text-gray-500 text-center mb-8">
//           Sign in to continue shopping
//         </p>

//         {/* Error message */}
//         {showError && (
//           <p className="bg-red-100 text-red-600 p-2 rounded-md text-center mb-4 text-sm">
//             Please enter your email and password
//           </p>
//         )}

//         {/* Login Form */}
//         <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
//           <div>
//             <label className="block text-gray-700 font-medium mb-1">
//               Email Address
//             </label>
//             <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
//               <FiMail className="text-gray-400 mr-2" />
//               <input
//                 type="email"
//                 placeholder="you@example.com"
//                 className="w-full outline-none text-gray-700"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-gray-700 font-medium mb-1">
//               Password
//             </label>
//             <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
//               <FiLock className="text-gray-400 mr-2" />
//               <input
//                 type="password"
//                 placeholder="Enter your password"
//                 className="w-full outline-none text-gray-700"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Forgot Password */}
//           <div className="flex justify-end">
//             <Link
//               href="/forgot-password"
//               className="text-sm text-indigo-600 hover:underline"
//             >
//               Forgot password?
//             </Link>
//           </div>

//           {/* Submit Button */}
//           {/* <Link href={"/signup"}> */}
//           <button
//             type="submit"
//             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
//           >
//             Log In
//           </button>
//           {/* </Link> */}
//         </form>

//         {/* Signup Link */}
//         <p className="text-center text-gray-600 text-sm mt-6">
//           Don’t have an account?{" "}
//           <Link
//             href="/signup"
//             className="text-indigo-600 font-medium hover:underline"
//           >
//             Sign up
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
