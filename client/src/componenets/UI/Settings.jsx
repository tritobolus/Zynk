import React, { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoIosArrowBack } from "react-icons/io";
import { MdDone } from "react-icons/md";
import { useCC } from "../../context/Context";
import axios from "axios";
import { BACKEND_URL } from "../../constants";

export const Settings = () => {
  const { loginUser, getUsers, userId, handleSettings } = useCC();
  const [isUsername, setIsUsername] = useState(false);
  const [isBio, setIsBio] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newBio, setNewBio] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    setNewUsername(loginUser.username);
    setNewBio(loginUser.bio);
  }, []);

  const handleUsername = async () => {
    try {
      await axios.patch(BACKEND_URL + "/settings/changeUsername", {
        userId: loginUser._id,
        newUsername,
      });
      getUsers();
    } catch (error) {
      console.log(error);
    }
    setIsUsername(false);
  };

  const handleBio = async () => {
    try {
      await axios.patch(BACKEND_URL + "/settings/changeBio", {
        userId: loginUser._id,
        newBio,
      });
      getUsers();
    } catch (error) {
      console.log(error);
    }
    setIsBio(false);
  };

  const handleActiveStatus = async () => {
    try {
      await axios.patch(BACKEND_URL + "/settings/changeActiveStatus", {
        userId: loginUser._id,
        currentStatus: loginUser?.activestatus,
      });
      getUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDarkMode = async () => {
    try {
      await axios.patch(BACKEND_URL + "/settings/changeDarkMode", {
        userId: loginUser._id,
        currentDarkMode: loginUser?.darkmode,
      });
      getUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const handleProfileImage = async () => {
    try {
      if (!image) { alert("Please select an image"); return; }
      const imageData = new FormData();
      imageData.append("file", image);
      imageData.append("upload_preset", "MyImages");
      imageData.append("cloud_name", "dqxfpedkq");
      const data = await axios.post(
        "https://api.cloudinary.com/v1_1/dqxfpedkq/image/upload",
        imageData
      );
      await axios.patch(BACKEND_URL + "/settings/changeProfileImage/", {
        imageUrl: data.data.secure_url,
        userId,
      });
      getUsers();
      setImage(null);
    } catch (error) {
      console.log(error);
    }
  };

  const inputBase = `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all`;

  return (
    <div className="h-dvh w-85 p-5 pt-4 bg-white flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center ml-28 justify-between">
        <h2 className="text-lg font-medium text-gray-900">Settings</h2>
        <button
          onClick={handleSettings}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-lg transition"
        >
          <IoIosArrowBack size={16} /> Back
        </button>
      </div>

      {/* Edit Details */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Edit your details</p>
        <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-3">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Username</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled={!isUsername}
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className={`${inputBase} flex-1 ${
                  isUsername
                    ? "border-purple-400 bg-white ring-2 ring-purple-100"
                    : "border-transparent bg-transparent"
                }`}
              />
              {isUsername ? (
                <button onClick={handleUsername} className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600 hover:bg-purple-50 transition">
                  <MdDone size={18} />
                </button>
              ) : (
                <button onClick={() => setIsUsername(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600 hover:bg-purple-50 transition">
                  <CiEdit size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-200" />

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">Bio</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled={!isBio}
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                className={`${inputBase} flex-1 ${
                  isBio
                    ? "border-purple-400 bg-white ring-2 ring-purple-100"
                    : "border-transparent bg-transparent"
                }`}
              />
              {isBio ? (
                <button onClick={handleBio} className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600 hover:bg-purple-50 transition">
                  <MdDone size={18} />
                </button>
              ) : (
                <button onClick={() => setIsBio(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600 hover:bg-purple-50 transition">
                  <CiEdit size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Image */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Profile image</p>
        {!image ? (
          <label className="block w-full text-center border border-purple-400 text-purple-600 text-sm font-medium py-2.5 rounded-lg cursor-pointer hover:bg-purple-50 transition">
            Choose image
            <input onChange={(e) => setImage(e.target.files[0])} type="file" accept="image/*" hidden />
          </label>
        ) : (
          <div className="flex items-center gap-3">
            <img src={URL.createObjectURL(image)} alt="preview" className="h-11 w-11 object-cover rounded-full border border-gray-200" />
            <button onClick={handleProfileImage} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition">
              Save
            </button>
            <button onClick={() => setImage(null)} className="px-3 py-1.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100" />

      {/* Dark Mode */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-800">Dark mode</p>
        <button
          onClick={handleDarkMode}
          className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
            loginUser?.darkmode ? "bg-purple-600" : "bg-gray-300"
          }`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
            loginUser?.darkmode ? "left-4.5" : "left-0.5"
          }`} />
        </button>
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-800">Active status</p>
        <button
          onClick={handleActiveStatus}
          className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
            loginUser?.activestatus ? "bg-purple-600" : "bg-gray-300"
          }`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
            loginUser?.activestatus ? "left-4.5" : "left-0.5"
          }`} />
        </button>
      </div>

    </div>
  );
};