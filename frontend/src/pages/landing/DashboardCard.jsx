import React from "react";
import SplitText from "./utils/SplitText";
export default function DashboardCard({ totalProjects = 20, totalCredits = 24.5 }) {
  return (
    <div className="
      max-w-sm aspect-square flex flex-col
      min-w-[256px]
      rounded-2xl bg-[hsl(0,0%,10%)] opacity-60 border-[hsl(0,0%,20%)] border-2 border-opacity-30
      p-4
      sm:max-w-md sm:rounded-3xl sm:border-4 sm:p-6
      md:max-w-lg md:p-8
      lg:max-w-xl lg:rounded-4xl lg:border-5 lg:p-10
      xl:max-w-2xl
      backdrop-blur-10xl
    ">


      <div className="
        flex items-center justify-between
        mb-4
        sm:mb-6
        md:mb-8
        lg:mb-10
        gap-10
      ">
        <h2 className="
          text-xl font-bold text-white
          sm:text-2xl
          md:text-3xl md:font-extrabold
          lg:text-4xl
        ">Dashboard</h2>
        <div className="
          relative flex items-center justify-around
          bg-[hsl(0,0%,20%)] rounded-full
          text-[hsl(0,0%,75%)]
          font-medium
          px-2 py-0.5
          gap-1
        ">
          <p className="text-[hsl(122,100%,57%)]">Live</p>
          <div className="
            relative
            w-2 h-2
            sm:w-2.5 sm:h-2.5
            md:w-3 md:h-3
          ">
            
            <span className="
              absolute inset-0 block rounded-full
              bg-[hsl(122,78%,45%)] opacity-60
              animate-ping
            "></span>

         
            <span className="
              relative block w-full h-full rounded-full
              bg-[hsl(122,100%,57%)] z-10
            "></span>
          </div>
        </div>
      </div>

      <div className="
        flex flex-col justify-center
        gap-1 mb-3
        text-[hsl(0,0%,75%)]
        sm:mb-4
      ">
        <p className="
          text-xs font-semibold text-[hsl(0,0%,60%)]
          sm:text-sm
        ">Total Projects</p>
        <p className="
          text-2xl font-bold text-white
          sm:text-3xl
          md:text-4xl
          lg:text-5xl
        ">{totalProjects}+</p>
      </div>

      <div className="
        flex flex-col justify-center
        gap-1
        text-[hsl(0,0%,75%)]
      ">
        <p className="
          text-xs font-semibold text-[hsl(0,0%,60%)]
          sm:text-sm
        ">Total Credits</p>
        <p className="
          text-2xl font-bold text-white
          sm:text-3xl
          md:text-4xl
          lg:text-5xl
        ">
          ${totalCredits.toFixed(2)} 
          <span className="
            text-xs font-medium
            sm:text-sm
            md:text-base
          ">/ ton</span>
        </p>
      </div>
    </div>
  );
}

