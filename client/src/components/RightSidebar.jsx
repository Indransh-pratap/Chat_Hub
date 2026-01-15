 import assets, { imagesDummyData } from "../assets/assets";

const RightSidebar = ({ selectedUser }) => {
  if (!selectedUser) return null;

  return  selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full h-full relative overflow-y-scroll ${selectedUser?"max-md:hidden" : ""}`}>
      {/* -------- User Info -------- */}
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className="w-20 aspect-[1/1] rounded-full"
        />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {selectedUser.fullName}
        </h1>
        <p className="px-10 mx-auto text-center">{selectedUser.bio}</p>
      </div>

      <hr className="border-[#ffffff50] my-4" />

      {/* -------- Media Gallery -------- */}
      <div className="px-5 text-xs">
        <p className="font-medium mb-2">Media</p>
        <div className="max-h-[200px] overflow-y-auto grid grid-cols-2 gap-4">
          {imagesDummyData.map((img, index) => (
            <div
              key={index}
              className="cursor-pointer rounded overflow-hidden"
              onClick={() => window.open(img.url || img.src || img.image)}
            >
              <img
                src={img.url || img.src || img.image}
                alt=""
                className="h-24 w-full object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      </div>
{/* <!---Logout button---> */}

<button class="absolute bottom-5 left-1/2 transform -translate-x-1/2
bg-gradient-to-r from-purple-400 to-violet-600 text-white
border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer">
  Logout
</button>
 
    </div>
  );
};

export default RightSidebar;
