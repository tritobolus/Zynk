import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import axios from "axios";

import { useCC } from "../../context/Context";
import { BACKEND_URL } from "../../constants";

export const MyProfile = ({ setProfile }) => {
  const { onlineUsers, userId, loginUser, setLoginUser, getUsers, avatarShapeClass } = useCC();
  const [defaultAvatars, setDefaultAvatars] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const res = await axios.get(BACKEND_URL + "/settings/defaultAvatars");
        setDefaultAvatars(res.data.avatars);
      } catch (error) {
        console.log("Failed to fetch default avatars", error);
      }
    };
    fetchDefaults();
  }, []);

  const handleSelectAvatar = async (imageUrl) => {
    try {
      // Optimistically update
      setLoginUser((prev) => ({ ...prev, profileImage: imageUrl }));
      
      await axios.patch(BACKEND_URL + "/settings/selectAvatar", {
        userId,
        imageUrl,
      });
      getUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const handleUploadCustomAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageData = new FormData();
      imageData.append("file", file);
      imageData.append("upload_preset", "MyImages");
      imageData.append("cloud_name", "dqxfpedkq");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dqxfpedkq/image/upload",
        imageData
      );

      const secureUrl = response.data.secure_url;
      const publicId = response.data.public_id;

      // Update backend customAvatars list
      const res = await axios.post(BACKEND_URL + "/settings/addCustomAvatar", {
        userId,
        url: secureUrl,
        publicId,
      });

      // Update state
      setLoginUser(res.data.updatedUser);
      getUsers();
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCustomAvatar = async (e, publicId) => {
    e.stopPropagation(); // prevent selecting the avatar when clicking delete
    if (!window.confirm("Are you sure you want to delete this custom avatar?")) return;

    try {
      const res = await axios.post(BACKEND_URL + "/settings/deleteCustomAvatar", {
        userId,
        publicId,
      });

      setLoginUser(res.data.updatedUser);
      getUsers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex flex-col pt-18 gap-y-6 rounded text-text-base bg-sidebar h-screen p-4 py-6 overflow-y-auto hide-scrollbar transition-all duration-500">
        
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium text-text-base">My Profile</h2>
        </div> */}

        {/* Profile Image & Name */}
        <div className="flex flex-col items-center gap-y-2">
          <div className="relative flex flex-col leading-tight">
            <img
              src={loginUser?.profileImage}
              alt=""
              className={`h-40 w-40 border border-primary object-cover overflow-hidden ${avatarShapeClass}`}
            />
            <div className="absolute top-29 right-2 flex items-center gap-2">
              <span
                className={`h-6 w-6 rounded-full ${onlineUsers.includes(userId) ? "bg-green-500 border-3 border-sidebar" : "bg-text-dim border-3 border-sidebar"}`}
              ></span>
            </div>
          </div>
          <p className="text-2xl font-semibold">{loginUser?.username}</p>
        </div>

        {/* Avatars Selection Gallery */}
        <div className="flex flex-col gap-y-2">
          <p className="text-primary text-md font-semibold">Choose Avatar</p>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Default Avatars */}
            {defaultAvatars.map((av) => (
              <button
                key={av._id}
                onClick={() => handleSelectAvatar(av.url)}
                className={`relative h-12 w-12 overflow-hidden border-2 transition ${avatarShapeClass} ${
                  loginUser?.profileImage === av.url
                    ? "border-primary scale-105 shadow-md"
                    : "border-border-color hover:scale-105"
                }`}
              >
                <img src={av.url} alt="Default Avatar" className="h-full w-full object-cover" />
              </button>
            ))}

            {/* Custom Avatars */}
            {loginUser?.customAvatars?.map((av) => (
              <div
                key={av.publicId}
                className="relative group h-12 w-12"
              >
                {/* Avatar Image (Click to Select) */}
                <div
                  onClick={() => handleSelectAvatar(av.url)}
                  className={`h-full w-full overflow-hidden border-2 cursor-pointer transition ${avatarShapeClass} ${
                    loginUser?.profileImage === av.url
                      ? "border-primary scale-105 shadow-md"
                      : "border-border-color hover:scale-105"
                  }`}
                >
                  <img src={av.url} alt="Custom Avatar" className="h-full w-full object-cover" />
                </div>
                
                {/* Small Trash Badge at Top-Right (Click to Delete) */}
                <button
                  onClick={(e) => handleDeleteCustomAvatar(e, av.publicId)}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  title="Delete Avatar"
                >
                  <RiDeleteBin6Line size={10} />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            <label className="h-12 w-12 rounded-full border-2 border-dashed border-text-muted hover:border-primary flex items-center justify-center cursor-pointer hover:scale-105 transition">
              {uploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
              ) : (
                <span className="text-lg text-text-muted hover:text-primary font-bold">+</span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCustomAvatar}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* BIO */}
        <div className="flex flex-col gap-y-1">
          <p className="text-primary text-md font-semibold">Bio</p>
          <p>{loginUser?.bio}</p>
        </div>

        {/* contacts */}
        <div className="">
          <div className="flex gap-x-3 items-center">
            <MdEmail size={20} className="text-primary" />
            <p>{loginUser?.email}</p>
          </div>
        </div>
      </div>
    </>
  );
};
