import React from 'react';
import { GovtIcon, NgoIcon, InvestorIcon, OrganizationIcon } from './icons';

const partners = [
  { icon: <GovtIcon />, name: 'Governments' },
  { icon: <NgoIcon />, name: 'NGOs' },
  { icon: <InvestorIcon />, name: 'Investors' },
  { icon: <OrganizationIcon />, name: 'Organizations' },
];

const MarqueeSection = () => {
  return (
    <section className="w-full py-16 bg-transparent">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-[hsl(0,0%,85%)]">Our Partners & Stakeholders</h2>
        <p className="text-base md:text-lg text-[hsl(0,0%,65%)] mt-2">We collaborate with a diverse range of organizations.</p>
      </div>
      <div className="relative w-full max-w-5xl mx-auto flex justify-around items-center gap-8 flex-wrap">
        {partners.map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 mb-4 flex items-center justify-center text-green-400">
              {item.icon}
            </div>
            <span className="text-lg font-semibold text-[hsl(0,0%,80%)]">{item.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MarqueeSection;
