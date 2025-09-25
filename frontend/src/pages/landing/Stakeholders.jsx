import React from "react";
import GlobeIcon from "./assets/Globe 1 Streamline Cyber Duotone - Free.svg";

import {
    GovtIcon,
    NgoIcon,
    OrganizationIcon,
    PointerLineIcon,
    InvestorIcon,
} from "./icons.jsx";

const stakeholders = [
    { label: "Investor", icon: <InvestorIcon /> },
    { label: "Corporate", icon: <OrganizationIcon /> },
    { label: "Govt.", icon: <GovtIcon /> },
    { label: "NGO", icon: <NgoIcon /> },
];

const Stakeholders = () => {
    return (
        <section
            className="w-full py-12 px-4 sm:py-16 sm:px-6 md:py-20 lg:px-8"
            // style={{ background: "var(--color-bg)" }}
        >
            <div className="max-w-7xl mx-auto text-[hsl(0,0%,80%)]">
                <h2 className="text-5xl font-bold text-center text-[#666] mb-14">
                    Our Stakeholders
                </h2>
                <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
                    <div className="flex justify-center z-10 mb-8 sm:mb-12 md:mb-16">
                        <div className="glass-card flex flex-col items-center justify-center w-24 h-24 p-3 sm:w-28 sm:h-28 sm:p-4 md:w-32 md:h-32">
                            <img
                                src={GlobeIcon}
                                alt="Stakeholder"
                                className="w-8 h-8 mb-1 sm:w-10 sm:h-10 sm:mb-2 md:w-12 md:h-12"
                            />

                            <span className="text-sm font-semibold text-[hsl(0,0%,80%)] text-center sm:text-base md:text-lg">
                                Stakeholders
                            </span>
                        </div>
                    </div>
                    <div className="relative -top-12">
                        <PointerLineIcon />
                    </div>
                    <div className="grid grid-cols-2 w-full z-10 gap-4 sm:flex sm:justify-between sm:gap-10 text-[hsl(0,0%,80%)]">
                        {stakeholders.map((s, i) => {
                            const baseImg =
                                "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8";

                            let offset = "";
                            if (i === 0) offset = "-top-35 -left-12";
                            else if (i === stakeholders.length - 1)
                                offset = "-top-35 -right-12";
                            else if (i === 1) offset = "right-5 -top-10";
                            else if (i === 2) offset = "left-5 -top-10";

                            const containerOffsetClass = offset
                                ? `relative ${offset}`
                                : "";
                            const containerNameClass = offset
                                ? `relative ${offset}`
                                : "";

                            return (
                                <div
                                    key={s.label}
                                    className="flex flex-col items-center"
                                >
                                    <div
                                        className={`glass-card flex flex-col items-center justify-center w-16 h-16 mb-1 p-2 sm:w-20 sm:h-20 sm:mb-2 sm:p-3 md:w-24 md:h-24  text-[hsl(0,0%,80%)] ${containerOffsetClass}`}
                                    >
                                        <figure
                                            className="
                                            flex items-center justify-center
                                            w-8 h-8 mb-1
                                            sm:w-10 sm:h-10 sm:mb-2
                                            md:w-12 md:h-12
                                          "
                                            aria-hidden="true"
                                        >
                                            {s.icon}
                                        </figure>
                                    </div>
                                    <span
                                        className={`text-xs font-medium text-center sm:text-sm md:text-base ${containerNameClass}`}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Stakeholders;
