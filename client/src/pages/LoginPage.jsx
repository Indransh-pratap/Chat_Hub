import { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [agree, setAgree] = useState(false);

  const{login} = useContext(AuthContext)

  const onsubmithandler = (e) => {
    e.preventDefault();

    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
login(currState=== "Sign up"? 'signup': 'login',{fullName,email,password,bio})

  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">

      {/* Left */}
      <img
        src={assets.logo_big}
        alt="logo"
        className="w-[min(30vw,250px)]"
      />

      {/* Right */}
      <form
        onSubmit={onsubmithandler}
        className="border border-gray-500 bg-white/10 text-white p-6 flex flex-col gap-4 rounded-lg shadow-lg w-[320px]"
      >

        {/* Header */}
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
        
          <img
            src={assets.arrow_icon}
            alt="toggle"
            className="w-5 cursor-pointer"
            onClick={() => {
              setCurrState(currState === "Sign up" ? "Login" : "Sign up");
              setIsDataSubmitted(false);
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
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
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
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
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
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          className="bg-indigo-500 hover:bg-indigo-600 transition py-2 rounded-md"
        >
          {currState === "Sign up" ? "Create Account" : "Login"}
        </button>

        {/* Bottom Text (FIXED, SAME STYLE) */}
        <div className="flex flex-col gap-2 text-sm text-gray-400">
          {currState === "Sign up" ? (
            <p>
              Already have an account?{" "}
              <span
                className="cursor-pointer underline"
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
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
                  setIsDataSubmitted(false);
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
