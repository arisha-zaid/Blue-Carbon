import React from 'react';

const Ribbon = () => {
  const content = (
    <div className="flex items-center">
      <span className="text-lg font-semibold text-black mx-20">Coastal carbon, counted and credited.</span>
      <span className="text-black font-semibold text-lg">✦</span>
      <span className="text-lg font-semibold text-black mx-20">Coastal carbon, counted and credited.</span>
      <span className="text-black font-semibold text-lg">✦</span>
      <span className="text-lg font-semibold text-black mx-20">Coastal carbon, counted and credited.</span>
      <span className="text-black font-semibold text-lg">✦</span>
      <span className="text-lg font-semibold text-black mx-20">Coastal carbon, counted and credited.</span>
      <span className="text-black font-semibold text-lg">✦</span>
    </div>
  );

  return (
    <div
      className="relative w-full bg-white py-4 overflow-hidden
                 before:absolute before:left-0 before:top-0 before:bottom-0 before:z-10 before:w-24 before:bg-gradient-to-r before:from-white before:to-transparent
                 after:absolute after:right-0 after:top-0 after:bottom-0 after:z-10 after:w-24 after:bg-gradient-to-l after:from-white after:to-transparent"
    >
      <div className="flex animate-scroll whitespace-nowrap">
        {content}
        {content}
      </div>
    </div>
  );
};

export default Ribbon;
