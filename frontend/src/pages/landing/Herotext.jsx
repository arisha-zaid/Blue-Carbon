import React, { useState, useRef, useEffect } from "react";

// Tailwind utility classes for headings/buttons are already in index.css
// If you have shared utilities, you can re-introduce them as needed
// import { buttonPrimary, heading1, heading5 } from "../../assets/utilityclasses/util.js";

// Local landing video asset
import introVideo from "./assets/videos/WhatsApp Video 2025-09-24 at 13.21.31_728fe209.mp4";

const HeroText = () => {
  const [open, setOpen] = useState(false);
  const videoRef = useRef(null);

  const openModal = () => setOpen(true);
  const closeModal = () => {
    // Pause video on close
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; // reset to start
      } catch (_) {}
    }
    setOpen(false);
  };

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div
      className="
        flex flex-col items-start justify-center leading-tight
        w-full h-2/3 mt-6 max-w-[90%]
        sm:max-w-[80%] sm:mt-88
        md:max-w-[70%] md:mt-12
        lg:max-w-[60%]
      "
    >
      <h1
        className="
          text-3xl font-black leading-tight
          bg-gradient-to-r from-[#208076] to-[#1c8177] text-transparent bg-clip-text
          pb-2
          sm:text-4xl sm:pb-3
          md:text-5xl
          lg:text-6xl
          xl:text-7xl
        "
      >
        Blockchain Powered Blue Carbon Registry
      </h1>

      <h5
        className="
          text-sm font-medium leading-snug
          text-[hsl(0,0%,50%)]
          max-w-[90%] mt-1
          sm:text-base sm:max-w-[85%] sm:mt-2
          md:text-lg md:max-w-[80%]
          lg:text-xl
        "
      >
        Turning Coastal Conservation into Climate Currency Where nature's
        restoration fuels tomorrow's economy
      </h5>

      <button
        className="
          text-sm font-bold
          text-[hsl(0,0%,90%)] bg-[hsl(174,59%,39%)] rounded-full
          hover:bg-[hsl(174,59%,45%)] transition-colors duration-200
          mt-6 py-3 px-6
          sm:text-base sm:mt-8 sm:py-4 sm:px-8
          md:text-lg md:mt-12 md:py-5 md:px-10
          lg:text-xl lg:mt-[3em]
        "
        onClick={openModal}
      >
        Watch Demo
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={closeModal}
              aria-label="Close video"
              className="absolute -top-3 -right-3 z-[60] grid place-items-center w-9 h-9 rounded-full bg-white/90 text-black shadow-md hover:bg-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video */}
            <video
              ref={videoRef}
              src={introVideo}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroText;