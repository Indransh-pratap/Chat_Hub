import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { Shield, Camera, Flame } from "lucide-react";
import Navbar from "../components/Navbar";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const navigate = useNavigate();

  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const [selectedImg, setselectedImg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/chat");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);

    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({
        profilePic: base64Image,
        fullName: name,
        bio,
      });
      navigate("/chat");
    };
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[var(--bg-dark)] overflow-hidden">
      <Navbar />
      
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 overflow-y-auto custom-scrollbar relative z-10 flex items-start justify-center">
        <div className="w-full max-w-4xl bg-[#0a0a0d] text-gray-300 border border-[#ff003c40] flex flex-col items-center justify-between md:flex-row-reverse rounded-2xl shadow-[0_0_30px_rgba(255,0,60,0.1)] overflow-hidden mt-0 md:mt-10">
          
          {/* Form Side */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 p-8 md:p-12 w-full md:w-2/3"
          >
            <h3 className="text-2xl font-bold tracking-widest text-[var(--neon-red)] uppercase flex items-center gap-3">
              <Shield className="w-6 h-6" /> Dossier Configuration
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-widest text-gray-500 uppercase font-semibold">Classification Image</label>
              <label
                htmlFor="avatar"
                className="flex items-center gap-4 cursor-pointer group"
              >
                <input
                  onChange={(e) => setselectedImg(e.target.files[0])}
                  type="file"
                  id="avatar"
                  accept=".png,.jpg,.jpeg"
                  hidden
                />
                <div className="relative">
                  <img
                    src={
                      selectedImg
                        ? URL.createObjectURL(selectedImg)
                        : (authUser?.profilePic || assets.avatar_icon)
                    }
                    alt="avatar"
                    className={`w-16 h-16 object-cover border-2 border-gray-600 group-hover:border-[var(--neon-red)] transition-all ${selectedImg ? "rounded-full shadow-[0_0_15px_var(--neon-red)]" : "rounded-lg"}`}
                  />
                  <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-full text-[var(--neon-red)]">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-white transition-colors">UPDATE VISUAL DATA</span>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-widest text-gray-500 uppercase font-semibold">Operative Identifier</label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                required
                placeholder="Designation"
                className="p-3 bg-[#121217] text-white border border-gray-800 rounded-lg focus:outline-none focus:border-[var(--neon-red)] focus:ring-1 focus:ring-[var(--neon-red)] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-widest text-gray-500 uppercase font-semibold">Decrypted Bio</label>
              <textarea
                onChange={(e) => setBio(e.target.value)}
                value={bio}
                placeholder="Enter psychological profile..."
                required
                rows={4}
                className="p-3 bg-[#121217] text-white border border-gray-800 rounded-lg focus:outline-none focus:border-[var(--neon-red)] focus:ring-1 focus:ring-[var(--neon-red)] transition-all custom-scrollbar"
              />
            </div>

            <button
              type="submit"
              className="mt-4 bg-[var(--neon-red)] hover:bg-white hover:text-[var(--dark-red)] text-white font-bold tracking-widest p-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,0,60,0.4)]"
            >
              COMMIT CHANGES
            </button>
          </form>

          {/* Profile Display Side */}
          <div className="w-full md:w-1/3 bg-[#121217] border-t md:border-t-0 md:border-r border-gray-800 p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden h-full min-h-[400px]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
            
            <img
              className={`w-40 h-40 object-cover rounded-full border-4 border-[#ff003c40] shadow-[0_0_30px_rgba(255,0,60,0.2)] z-10 ${selectedImg ? "border-[var(--neon-red)]" : ""}`}
              src={selectedImg ? URL.createObjectURL(selectedImg) : (authUser?.profilePic || assets.logo_icon)}
              alt="Profile"
            />

            <div className="text-center z-10 w-full space-y-4">
              <div>
                <h4 className="text-xl font-bold text-white tracking-widest">{name || "UNKNOWN"}</h4>
                <p className="text-xs text-[var(--neon-red)] uppercase mt-1">Status: Active</p>
              </div>

              <div className="bg-black/40 border border-[#ff003c20] rounded-xl p-4 mt-6">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current Streak</p>
                <div className="flex items-center justify-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-2xl font-bold text-white tracking-widest">04 <span className="text-sm text-gray-400">DAYS</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
