import { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import NeonLogo from "../components/common/NeonLogo";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, signup } = useContext(AuthContext);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  const onsubmithandler = async (e) => {
    e.preventDefault();

    // Step 1 of signup (name, email, password)
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    // Final submit
    setLoading(true);
    if (currState === "Sign up") {
      const success = await signup({ fullName, email, password, bio });
      if (success) {
        setCurrState("Login");
        setIsDataSubmitted(false);
      }
    } else {
      await login({ email, password });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col">

      {/* Left */}
      <NeonLogo className="mb-8 lg:mb-0 scale-75 lg:scale-100" />

      {/* Right */}
      <form
        onSubmit={onsubmithandler}
        className="border border-[#1a1a24] bg-[#050505] text-white p-8 flex flex-col gap-5 rounded-2xl shadow-[0_0_30px_rgba(255,0,60,0.05)] w-full max-w-[400px] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>

        {/* Header */}
        <h2 className="font-bold text-3xl tracking-wide flex justify-between items-center z-10">
          {currState}

          <img
            src={assets.arrow_icon}
            alt="toggle"
            className="w-5 cursor-pointer"
            onClick={() => {
              setCurrState(currState === "Sign up" ? "Login" : "Sign up");
              setIsDataSubmitted(false);   // 🔴 always reset
            }}
          />
        </h2>

        {/* Full Name */}
        {currState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="p-3 bg-[#121217] border border-gray-800 rounded-xl focus:outline-none focus:border-[var(--neon-red)] transition-colors z-10 placeholder-gray-600"
          />
        )}

        {/* Email */}
        {!isDataSubmitted && (
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 bg-[#121217] border border-gray-800 rounded-xl focus:outline-none focus:border-[var(--neon-red)] transition-colors z-10 placeholder-gray-600"
          />
        )}

        {/* Password */}
        {!isDataSubmitted && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 bg-[#121217] border border-gray-800 rounded-xl focus:outline-none focus:border-[var(--neon-red)] transition-colors z-10 placeholder-gray-600"
          />
        )}

        {/* Bio */}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Provide a short bio..."
            required
            className="p-3 bg-[#121217] border border-gray-800 rounded-xl focus:outline-none focus:border-[var(--neon-red)] transition-colors z-10 placeholder-gray-600 custom-scrollbar"
          />
        )}

        {/* Checkbox */}
        {currState === "Sign up" && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
              className="accent-indigo-500 cursor-pointer"
            />
            <p>
              Agree to the <span className="underline cursor-pointer">Terms</span>{" "}
              & <span className="underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--neon-red)] text-white hover:bg-white hover:text-[var(--neon-red)] transition-all py-3 rounded-xl font-bold tracking-widest flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed uppercase shadow-[0_0_15px_rgba(255,0,60,0.2)] z-10"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            currState === "Sign up" ? "Create Account" : "Initiate Login"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center my-2 z-10">
          <div className="flex-1 border-t border-gray-800"></div>
          <span className="px-3 text-gray-500 text-[10px] tracking-widest uppercase">OR</span>
          <div className="flex-1 border-t border-gray-800"></div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-[#121217] border border-gray-800 hover:border-white hover:bg-white hover:text-black transition-all py-3 rounded-xl font-bold tracking-wider flex items-center justify-center gap-3 z-10 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* Bottom Toggle */}
        <div className="flex flex-col gap-2 text-sm text-gray-400 mt-2 z-10 text-center">
          {currState === "Sign up" ? (
            <p>
              Already have an account?{" "}
              <span
                className="cursor-pointer underline"
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false); // 🔴 reset here also
                }}
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Create an account{" "}
              <span
                className="cursor-pointer underline"
                onClick={() => {
                  setCurrState("Sign up");
                  setIsDataSubmitted(false); // 🔴 reset here also
                }}
              >
                Click here
              </span>
            </p>
          )}
        </div>

      </form>
    </div>
  );
};

export default LoginPage;
