import React from "react";
import { useNavigate } from "react-router-dom";
import {buttonPrimary, heading1,heading5} from "../../assets/utilityclasses/util.js";
const HeroText = () => {
    const navigate = useNavigate();
    return (
        <div className="
          flex flex-col items-start justify-center leading-tight
          w-full h-2/3 mt-6 max-w-[90%]
          sm:max-w-[80%] sm:mt-88
          md:max-w-[70%] md:mt-12
          lg:max-w-[60%]
        ">
            <h1 className={`
              text-3xl font-black leading-tight
              bg-gradient-to-r from-[#208076] to-[#1c8177] text-transparent bg-clip-text
              pb-2
              sm:text-4xl sm:pb-3
              md:text-5xl
              lg:text-6xl
              xl:text-7xl
            `}>
                Blockchain Powered Blue Carbon Registry
            </h1>
            <h5 className="
              text-sm font-medium leading-snug
              text-[hsl(0,0%,50%)]
              max-w-[90%] mt-1
              sm:text-base sm:max-w-[85%] sm:mt-2
              md:text-lg md:max-w-[80%]
              lg:text-xl
            ">
                Turning Coastal Conservation into Climate Currency Where
                nature's restoration fuels tomorrow's economy
            </h5>

            <button className={`
              text-sm font-bold
              text-[hsl(0,0%,90%)] bg-[hsl(174,59%,39%)] rounded-full
              hover:bg-[hsl(174,59%,45%)] transition-colors duration-200
              mt-6 py-3 px-6
              sm:text-base sm:mt-8 sm:py-4 sm:px-8
              md:text-lg md:mt-12 md:py-5 md:px-10
              lg:text-xl lg:mt-[3em]
            `} onClick={() => navigate('/login')}>
                Get Started
            </button>
        </div>
    );
};
export default HeroText;
