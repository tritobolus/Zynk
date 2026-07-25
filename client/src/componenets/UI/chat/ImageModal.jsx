import React, { useState } from "react";
import { IoClose, IoDownloadOutline } from "react-icons/io5";

export const ImageModal = ({ imageUrl, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!imageUrl) return null;

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      setIsDownloading(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const filename =
        imageUrl.split("/").pop()?.split("?")[0] || "chat_image.jpg";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
      // Fallback: Open image in new tab if CORS prevents direct blob fetch
      window.open(imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-center items-center p-4 animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center cursor-default"
      >
        {/* Top Controls */}
        <div className="absolute -top-12 right-0 flex items-center gap-x-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition cursor-pointer flex items-center gap-x-1"
            title="Download Image"
          >
            <IoDownloadOutline size={20} />
            {isDownloading && (
              <span className="text-xs font-medium">Downloading...</span>
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition cursor-pointer"
            title="Close"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Full Image */}
        <img
          src={imageUrl}
          alt="Full Preview"
          className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
};
