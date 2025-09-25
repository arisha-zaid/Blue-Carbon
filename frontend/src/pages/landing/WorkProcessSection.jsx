import React from 'react';

const steps = [
  {
    title: 'Monitor & Extraction',
    desc: 'Satellite data reveals coastal health through NDVI and NDWI indices.',
    step: '01',
  },
  {
    title: 'Carbon Sequestration Estimation',
    desc: 'NDVI & NDWI indices convert into carbon estimates via ecosystem-specific models.',
    step: '02',
  },
  {
    title: 'Registry & Credit',
    desc: 'Verified carbon data is tokenized into traceable credits via our blockchain-powered registry.',
    step: '03',
  },
];

const WorkProcessSection = () => (
  <section className="w-full py-16 px-4 sm:py-20 lg:px-8">
    <div className="max-w-5xl mx-auto">
      <div className="mb-12">
        {/* <div className="text-sm text-neutral-500 font-medium mb-4">
          Our Work Process
        </div> */}
        <h2 className="text-4xl md:text-5xl font-bold text-neutral-400 leading-tight max-w-md  text-center mx-auto mb-2" style={{textShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          {/* Step by Step for your Growth */}
          Our Work Process
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`relative rounded-lg p-6 min-h-[200px] transition-all duration-300 hover:-translate-y-1 bg-teal-800`}
          >
            {/* Large faded step number in top right */}
            <span className="absolute top-3 right-4 text-8xl font-bold text-teal-600 opacity-25 select-none pointer-events-none leading-none">
              {step.step}
            </span>
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex-1 mb-6">
                <h4 className="text-lg font-bold text-neutral-400 mb-3 pr-16 leading-tight">
                  {step.title}
                </h4>
                <p className="text-sm text-neutral-500 font-semibold leading-relaxed pr-12">
                  {step.desc}
                </p>
              </div>
              
              {/* Bottom section with divider */}
              <div className="mt-auto">
                <div className="w-full h-px bg-teal-600 opacity-30 mb-3"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 tracking-widest">
                    STEP
                  </span>
                  <span className="text-sm font-bold text-neutral-500">
                    {step.step}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WorkProcessSection;