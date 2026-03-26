import { useEffect, useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const GoogleSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setGoogleSession } = useContext(AuthContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setGoogleSession(token)
        .then(() => {
          navigate("/chat");
        })
        .catch(() => {
          setError("Failed to establish secure session.");
          setTimeout(() => navigate("/login"), 3000);
        });
    } else {
      setError("Invalid authentication token. Sequence aborted.");
      setTimeout(() => navigate("/login"), 3000);
    }
  }, [searchParams, navigate, setGoogleSession]);

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col items-center justify-center p-4">
      {!error && <div className="w-16 h-16 border-4 border-t-[var(--neon-red)] border-[#1a1a24] rounded-full animate-spin mb-6"></div>}
      {error && <div className="text-4xl mb-6">⚠️</div>}
      <h2 className="text-xl md:text-2xl font-bold tracking-widest text-white mb-2 text-center uppercase">
        {error ? "Authentication Failure" : "Decrypting Google Credentials..."}
      </h2>
      <p className={`text-sm tracking-wide ${error ? "text-[var(--neon-red)]" : "text-gray-400 animate-pulse"} text-center`}>
        {error || "Establishing secure connection to the central mainframe."}
      </p>
    </div>
  );
};

export default GoogleSuccess;
