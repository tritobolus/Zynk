import React, { useState, useRef } from "react";
import { IoPlay, IoPause, IoMic } from "react-icons/io5";

export const VoicePlayer = ({ audioUrl, isMyMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || !secs) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const maxVal = duration > 0 ? duration : 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / maxVal) * 100));

  return (
    <div className="flex items-center gap-x-3 py-1 pr-1 min-w-[220px]">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex justify-center items-center flex-shrink-0 transition active:scale-95 shadow-sm cursor-pointer ${
          isMyMessage
            ? "bg-white text-primary hover:bg-primary-light"
            : "bg-primary text-white hover:bg-primary-dark"
        }`}
      >
        {isPlaying ? (
          <IoPause size={16} />
        ) : (
          <IoPlay size={16} className="ml-0.5" />
        )}
      </button>

      {/* Progress Bar & Details */}
      <div className="flex flex-col flex-1 gap-y-1">
        <div className="relative flex items-center w-full">
          <input
            type="range"
            min="0"
            max={maxVal}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none"
            style={{
              background: `linear-gradient(to right, ${
                isMyMessage ? "#ffffff" : "var(--primary)"
              } ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%)`,
            }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] opacity-80 font-medium">
          <div className="flex items-center gap-x-1">
            <IoMic className="text-xs" />
            <span>{formatTime(currentTime)}</span>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
