import React, { useState, useEffect } from "react";
import { useCC } from "../../../context/Context";
import axios from "axios";

import { CiEdit } from "react-icons/ci";
import { MdDone } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BACKEND_URL } from "../../../constants";

export const GroupSettings = ({ group }) => {
  const { onlineUsers, userId, users, loginUser, getGroups } = useCC();
  const [isGroupName, setIsGroupName] = useState(false);
  const [isBio, setIsBio] = useState(false);

  const [newGroupName, setNewGroupName] = useState("");
  const [newBio, setNewBio] = useState("");

  const [image, setImage] = useState(null);

  useEffect(() => {
    setNewGroupName(group.groupName);
    setNewBio(group.bio);
  }, []);

  const handleGroupName = async () => {
    try {
      const res = await axios.patch(BACKEND_URL + "/settings/changeGroupName", {
        groupId: group._id,
        newGroupName: newGroupName,
      });

      console.log(res);
      getGroups();
      setIsGroupName(false);
    } catch (error) {
      console.log(error);
    }
    setIsGroupName(false);
  };

  const handleBio = async () => {
    try {
      const res = await axios.patch(BACKEND_URL + "/settings/changeGroupBio", {
        groupId: group._id,
        newBio: newBio,
      });

      console.log(res);
      getGroups();
      setIsBio(false);
    } catch (error) {
      console.log(error);
    }
    setIsBio(false);
  };

  const handleGroupProfileImage = async () => {
    try {
      if (!image) {
        alert("Please select a image");
        return;
      }

      const imageData = new FormData();
      imageData.append("file", image);
      imageData.append("upload_preset", "MyImages");
      imageData.append("cloud_name", "dqxfpedkq");

      const data = await axios.post(
        "https://api.cloudinary.com/v1_1/dqxfpedkq/image/upload",
        imageData,
      );

      const imageUrl = data.data.secure_url;

      //upload the image in custome avatar schema
      await axios.patch(BACKEND_URL + `/settings/changeGroupProfileImage/`, {
        imageUrl,
        groupId: group._id,
      });

      getGroups();
      setImage(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-y-3">
        {/* group details edit */}
        <div className="flex flex-col gap-y-3 ">
          <p className="text-lg font-bold">Edit group details</p>
          <div
            className="flex flex-col gap-y-2 p-2 rounded-2xl bg-surface animation border border-border-color"
          >
            {/* username */}
            <div className="flex flex-col gap-y-1">
              <p className="font-semibold">groupname: </p>
              <div className="flex justify-between items-center gap-x-2">
                <input
                  disabled={!isGroupName}
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="px-2 py-1 border border-border-color bg-input-bg text-text-base rounded-xl w-full focus:outline-none focus:border-primary"
                />
                {isGroupName ? (
                  <MdDone
                    onClick={() => handleGroupName()}
                    size={25}
                    className="text-primary hover:cursor-pointer"
                  />
                ) : (
                  <CiEdit
                    onClick={() => setIsGroupName(true)}
                    size={25}
                    className="text-primary hover:cursor-pointer"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-y-1">
              <p className="font-semibold">description: </p>
              <div className="flex justify-between items-center gap-x-2">
                <input
                  disabled={!isBio}
                  type="text"
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="px-2 py-1 border border-border-color bg-input-bg text-text-base rounded-xl w-full focus:outline-none focus:border-primary"
                />
                {isBio ? (
                  <MdDone
                    onClick={() => handleBio()}
                    size={25}
                    className="text-primary hover:cursor-pointer"
                  />
                ) : (
                  <CiEdit
                    onClick={() => setIsBio(true)}
                    size={25}
                    className="text-primary hover:cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* change profile image */}

        <div className="flex flex-col gap-y-1">
          <p>Change Profile Image</p>
          {!image ? (
            <label className="block w-full text-center border border-primary text-primary py-2 rounded-lg cursor-pointer hover:bg-primary-light transition">
              Choose Image
              <input
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                accept="image/*"
                hidden
              />
            </label>
          ) : (
            <div className="flex justify-between ">
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="h-12 w-12 object-cover rounded-full"
              />
              <button
                onClick={() => handleGroupProfileImage()}
                className="px-3 py-1 bg-primary hover:bg-primary-dark rounded-xl text-white cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setImage(false)}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-xl text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
