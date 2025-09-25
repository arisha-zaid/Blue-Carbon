import React from 'react';
import { 
  AIEstimatorIcon, 
  BlockchainRegistryIcon, 
  PerformanceTrackingIcon, 
  GeospatialValidationIcon 
} from './icons';
import '../../index.css';


const features = [
  {
    title: 'AI Estimator',
    description: 'Satellite imagery reveals spatial patterns of CO₂ uptake in mangroves, seagrasses, and tidal marshes.',
    icon: <AIEstimatorIcon />,
  },
  {
    title: 'Blockchain Registry',
    description: 'Immutable entries ensure transparency in tracking blue carbon credits from mangroves to marshlands.',
    icon: <BlockchainRegistryIcon />,
  },
  {
    title: 'Track Performance with live data',
    description: 'Real-time monitoring of carbon sequestration metrics with interactive dashboards and alerts.',
    icon: <PerformanceTrackingIcon />,
  },
  {
    title: 'Geospatial Check of Carbon Hotspots',
    description: 'Mapping verified coastal carbon sinks through satellite imagery and ground truthing.',
    icon: <GeospatialValidationIcon />,
  },
];

const KeyFeatures = () => {
  return (
    <div 
      className="
        w-full
        py-12 px-4
        sm:py-16 sm:px-6
        md:py-20
        lg:px-8
      " 
    
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="
          text-4xl font-bold text-center text-[hsl(0,0%,40%)]
          mb-12
          leading-tight
          sm:text-3xl sm:mb-12 sm:leading-tight
          md:text-4xl md:mb-16 md:leading-tight
          lg:text-5xl lg:leading-tight
        ">Key Features</h1>
        <div className="
          grid grid-cols-1
          gap-4
          sm:grid-cols-2 sm:gap-6
          lg:grid-cols-4 lg:gap-8
        ">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="
                glass-card flex flex-col items-flex-start
                gap-3 p-4
                transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                sm:gap-4 sm:p-6
                lg:p-8
                mb:[5em]

              "
            >
              <figure className="
                mb-1
                sm:mb-2
              " aria-hidden="true">
                {feature.icon}
              </figure>
              <h3 className="
                text-lg font-bold text-left text-[hsl(0,0%,85%)]
                leading-tight
                sm:text-xl sm:leading-tight
                md:text-2xl md:leading-tight
              ">{feature.title}</h3>
              <p className="
                text-sm text-[hsl(0,0%,65%)] leading-snug
                sm:text-base sm:leading-normal
              ">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default KeyFeatures;