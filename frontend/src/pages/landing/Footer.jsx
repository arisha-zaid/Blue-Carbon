import React from 'react';

const Footer = () => {
  return (
    <footer className=" text-gray-400 mt-36 px-auto pb-10">
      <div className="container mx-auto max-w-6xl">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Left Column */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-4xl font-bold  text-white">Carbon Drift</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[18px] ">
              <div>
                <a href="#" className="hover:text-gray-400 transition">Home</a>
                <br />
                <a href="#" className="hover:text-gray-400 transition">About us</a>
                <br />
                <a href="#" className="hover:text-gray-400 transition">Support</a>
                <br />
                <a href="#" className="hover:text-gray-400 transition">Program</a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-400 transition">Contact</a>
                <br />
                <a href="#" className="hover:text-gray-400 transition">FAQ</a>
                <br />
                <a href="#" className="hover:text-gray-400 transition">Explore</a>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="mt-8 pt-10 md:mt-0">
            <div className="bg-gray-200 rounded-[32px] p-2 shadow-lg">
              <p className="text-gray-900 font-semibold text-xl mb-1 relative left-3">Get started</p>
              <button className="w-full bg-gray-950 text-xl text-white px-10 py-5 rounded-3xl font-medium hover:bg-[#1a1a1a] transition flex items-center justify-center">
                Explore Now →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 text-sm">
          <p className="text-gray-400 mb-4 md:mb-0">
            Curated with ❤️ by team Carbon Drift
          </p>
          <p className="text-gray-500">
            © 2025 BlueMint. All rights reserved.
          </p>
        </div>

        {/* Watermark  */}
        {/* <h1 className=" mb-0 text-center font-bold text-[176px] opacity-10  max-h-[176px] overflow-hidden  pointer-events-none select-none  bottom-[10px] bg-clip-text bg-gradient-to-b from-gray-600 to-gray-800 text-transparent">
          Carbon Drift
        </h1> */}
      </div>
    </footer>
  );
};

export default Footer;