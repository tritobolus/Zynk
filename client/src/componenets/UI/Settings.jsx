import React, { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoIosArrowBack } from "react-icons/io";
import { MdDone } from "react-icons/md";
import { IoCheckmarkCircle } from "react-icons/io5";
import { useCC } from "../../context/Context";
import axios from "axios";
import { BACKEND_URL } from "../../constants";

// Theme definitions — single source of truth for the UI
const THEMES = [
  {
    id: "violet",
    label: "Violet",
    color: "#7c3aed",
    light: "#ede9fe",
    description: "Clean & light",
  },
  {
    id: "midnight",
    label: "Midnight",
    color: "#a78bfa",
    light: "#1a1a2e",
    description: "Dark purple",
  },
  {
    id: "emerald",
    label: "Emerald",
    color: "#059669",
    light: "#d1fae5",
    description: "WhatsApp green",
  },
  {
    id: "ocean",
    label: "Ocean",
    color: "#2b9ced",
    light: "#212d3b",
    description: "Telegram dark",
  },
  {
    id: "sunset",
    label: "Sunset",
    color: "#be185d",
    light: "#fce7f3",
    description: "Warm rose",
  },
];

const SHAPES = [
  { id: "wobbly", label: "Wobbly", className: "rounded-[40%_60%_60%_40%/60%_40%_60%_40%]" },
  { id: "circle", label: "Circle", className: "rounded-full" },
  { id: "squircle", label: "Squircle", className: "rounded-2xl" },
  { id: "blob2", label: "Blob 2", className: "rounded-[60%_40%_30%_70%/60%_30%_70%_40%]" },
  { id: "teardrop", label: "Teardrop", className: "rounded-[0%_100%_100%_100%]" },
];

export const Settings = () => {
  const { loginUser, getUsers, userId, handleSettings, setLoginUser, avatarShapeClass } = useCC();
  const [isUsername, setIsUsername] = useState(false);
  const [isBio, setIsBio] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newBio, setNewBio] = useState("");
  const [image, setImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [themeLoading, setThemeLoading] = useState(null);
  const [shapeLoading, setShapeLoading] = useState(null);

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

  // const handleProfileImage = async () => {
  //   try {
  //     setImageUploading(true);
  //     if (!image) { alert("Please select an image"); return; }
  //     const imageData = new FormData();
  //     imageData.append("file", image);
  //     imageData.append("upload_preset", "MyImages");
  //     imageData.append("cloud_name", "dqxfpedkq");
  //     const data = await axios.post(
  //       "https://api.cloudinary.com/v1_1/dqxfpedkq/image/upload",
  //       imageData
  //     );
  //     await axios.patch(BACKEND_URL + "/settings/changeProfileImage/", {
  //       imageUrl: data.data.secure_url,
  //       userId,
  //     });
  //     getUsers();
  //     setImage(null);
  //     setImageUploading(false);
  //   } catch (error) {
  //     console.log(error);
  //     setImageUploading(false);
  //   }
  // };

  const handleThemeChange = async (themeId) => {
    if (themeId === loginUser?.theme || themeLoading) return;
    try {
      setThemeLoading(themeId);
      // Optimistically update UI immediately via context
      setLoginUser((prev) => ({ ...prev, theme: themeId }));
      // Persist to backend
      await axios.patch(BACKEND_URL + "/settings/changeTheme", {
        userId: loginUser._id,
        theme: themeId,
      });
    } catch (error) {
      console.log(error);
      // Revert on error
      setLoginUser((prev) => ({ ...prev, theme: loginUser?.theme }));
    } finally {
      setThemeLoading(null);
    }
  };

  const handleShapeChange = async (shapeId) => {
    if (shapeId === loginUser?.avatarShape || shapeLoading) return;
    try {
      setShapeLoading(shapeId);
      setLoginUser((prev) => ({ ...prev, avatarShape: shapeId }));
      await axios.patch(BACKEND_URL + "/settings/changeAvatarShape", {
        userId: loginUser._id,
        avatarShape: shapeId,
      });
      getUsers();
    } catch (error) {
      console.log(error);
      setLoginUser((prev) => ({ ...prev, avatarShape: loginUser?.avatarShape }));
    } finally {
      setShapeLoading(null);
    }
  };

  const activeTheme = loginUser?.theme || "violet";
  const inputBase = `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all`;

  return (
    <div className="h-dvh p-5 pt-4 bg-sidebar flex flex-col gap-5 overflow-y-auto hide-scrollbar text-text-base">

      {/* Header */}
      <div className="flex items-center ml-28 justify-between">
        <h2 className="text-lg font-medium text-text-base">Settings</h2>
        <button
          onClick={handleSettings}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-base hover:bg-sidebar-hover px-2 py-1 rounded-lg transition"
        >
          <IoIosArrowBack size={16} /> Back
        </button>
      </div>

      {/* Edit Details */}
      <div>
        <p className="text-xs font-medium text-text-dim uppercase tracking-wide mb-2">Edit your details</p>
        <div className="bg-surface rounded-xl p-3 flex flex-col gap-3">
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
                    ? "border-primary bg-surface ring-2 ring-primary-light"
                    : "border-transparent bg-transparent"
                }`}
              />
              {isUsername ? (
                <button onClick={handleUsername} className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary-light transition">
                  <MdDone size={18} />
                </button>
              ) : (
                <button onClick={() => setIsUsername(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary-light transition">
                  <CiEdit size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="h-px bg-border-color" />

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
                    ? "border-primary bg-surface ring-2 ring-primary-light"
                    : "border-transparent bg-transparent"
                }`}
              />
              {isBio ? (
                <button onClick={handleBio} className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary-light transition">
                  <MdDone size={18} />
                </button>
              ) : (
                <button onClick={() => setIsBio(true)} className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary-light transition">
                  <CiEdit size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Image */}
      {/* <div>
        <p className="text-xs font-medium text-text-dim uppercase tracking-wide mb-2">Profile image</p>
        {!image ? (
          <label className="block w-full text-center border text-sm font-medium py-2.5 rounded-lg cursor-pointer transition"
            style={{ borderColor: "var(--primary)", color: "var(--primary)", backgroundColor: "transparent" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-light)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            Choose image
            <input onChange={(e) => setImage(e.target.files[0])} type="file" accept="image/*" hidden />
          </label>
        ) : (
          <div className="flex items-center gap-3">
            <img src={URL.createObjectURL(image)} alt="preview" className={`h-11 w-11 object-cover border border-border-color ${avatarShapeClass}`} />
            <button
              onClick={handleProfileImage}
              className={`px-3 py-1.5 text-white text-sm font-medium rounded-lg transition ${imageUploading ? "bg-gray-400 cursor-not-allowed" : "hover:bg-primary-light"}`}
              style={{ backgroundColor: "var(--primary)" }}
            >
              {imageUploading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setImage(null)} className="px-3 py-1.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        )}
      </div> */}

      <div className="h-px bg-border-color" />

      {/* ── Theme Selector ── */}
      <div>
        <p className="text-xs font-medium text-text-dim uppercase tracking-wide mb-3">App Theme</p>
        <div className="grid grid-cols-5 gap-3">
          {THEMES.map((theme) => {
            const isActive = activeTheme === theme.id;
            const isLoading = themeLoading === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                disabled={!!themeLoading}
                className="flex flex-col items-center gap-1.5 group"
                title={theme.label}
              >
                <div
                  className="relative w-10 h-10 rounded-full transition-all duration-200 shadow-md group-hover:scale-110"
                  style={{
                    backgroundColor: theme.color,
                    ring: isActive ? `3px solid ${theme.color}` : "none",
                    boxShadow: isActive
                      ? `0 0 0 3px white, 0 0 0 5px ${theme.color}`
                      : undefined,
                  }}
                >
                  {isActive && !isLoading && (
                    <IoCheckmarkCircle
                      className="absolute inset-0 m-auto text-white"
                      size={22}
                    />
                  )}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: isActive ? theme.color : "var(--text-muted)" }}
                >
                  {theme.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live preview swatch */}
        <div className="mt-4 rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: "var(--primary-light)" }}>
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
          <div className="flex flex-col">
            <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
              {THEMES.find((t) => t.id === activeTheme)?.label} theme active
            </p>
            <p className="text-xs text-text-dim font-medium">Your chat bubbles & highlights use this color</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-border-color" />

      {/* ── Avatar Shape Selector ── */}
      <div>
        <p className="text-xs font-medium text-text-dim uppercase tracking-wide mb-3">Avatar Shape</p>
        <div className="grid grid-cols-5 gap-3">
          {SHAPES.map((shape) => {
            const isActive = (loginUser?.avatarShape || "wobbly") === shape.id;
            const isLoading = shapeLoading === shape.id;
            return (
              <button
                key={shape.id}
                onClick={() => handleShapeChange(shape.id)}
                disabled={!!shapeLoading}
                className="flex flex-col items-center gap-1.5 group"
                title={shape.label}
              >
                <div
                  className={`relative w-10 h-10 transition-all duration-200 border border-primary group-hover:scale-110 ${shape.className}`}
                  style={{
                    backgroundColor: "var(--primary-light)",
                    boxShadow: isActive
                      ? `0 0 0 3px var(--sidebar), 0 0 0 5px var(--primary)`
                      : undefined,
                  }}
                >
                  {isActive && !isLoading && (
                    <IoCheckmarkCircle
                      className="absolute inset-0 m-auto text-primary"
                      size={20}
                    />
                  )}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium transition-colors text-text-muted"
                  style={{ color: isActive ? "var(--primary)" : "var(--text-muted)" }}
                >
                  {shape.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border-color" />

      {/* Active Status */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-base">Active status</p>
        <button
          onClick={handleActiveStatus}
          className="relative w-9 h-5 rounded-full transition-colors duration-200"
          style={{ backgroundColor: loginUser?.activestatus ? "var(--primary)" : "var(--surface-2)" }}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
            loginUser?.activestatus ? "left-4.5" : "left-0.5"
          }`} />
        </button>
      </div>

    </div>
  );
};