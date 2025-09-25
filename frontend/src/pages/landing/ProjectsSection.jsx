import React from 'react';
import Ribbon from './Ribbon.jsx';

const projectsData = [
  {
    title: 'Mangrove Restoration Initiative',
    description: 'Enhancing carbon sequestration and protecting coastal communities.',
    status: 'Ongoing',
    imageUrl: 'https://images.unsplash.com/photo-1651807428952-5f0637a7b3c2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    title: 'Coral Reef Conservation',
    description: 'A data-driven approach to monitor and protect crucial coral reefs.',
    status: 'Completed',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1690487577794-252b709a1752?q=80&w=1169&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    title: 'Seagrass Meadow Monitoring',
    description: 'Utilizing AI to track the health and carbon capture of seagrass meadows.',
    status: 'Ongoing',
    imageUrl: 'https://images.unsplash.com/photo-1717821646841-a7562db98f44?q=80&w=1171&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

const ProjectsSection = () => (
  <section className="w-full py-24 px-2 sm:py-28 sm:px-4 md:py-32 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-center text-[hsl(0,0%,85%)] leading-tight mb-4">Currently Ongoing Projects</h2>
      <p className="text-base md:text-lg text-[hsl(0,0%,65%)] text-center mt-1 mb-10 leading-tight">Explore our portfolio of blue carbon projects, from mangrove restoration to seagrass monitoring.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-4">
        {projectsData.map((project, idx) => (
          <div key={idx} className="bg-[#232323] rounded-xl flex flex-col justify-start aspect-[4/3] min-h-[120px] border border-[#292929] relative p-2 transition-all duration-300 hover:border-[#4ade80] hover:-translate-y-1">
            {/* Image Placeholder */}
            <div 
              className="w-full h-3/4 flex items-center justify-center bg-cover bg-center rounded-lg mb-2 relative"
              style={{ backgroundImage: `url(${project.imageUrl})` }}
            >
              <div className="absolute top-2 left-2 bg-[#4ade8099] px-2 py-0.5 rounded-full text-xs text-[#043309] font-extrabold uppercase border border-[#4ade80]">{project.status}</div>
            </div>
            {/* Ongoing Tag Overlay */}
            
            {/* Card Bottom */}
            <div className="w-full flex flex-col items-start">
              <div className="text-sm font-semibold text-[hsl(0,0%,85%)] mb-0.5">{project.title}</div>
              <div className="flex items-center w-full justify-between">
                <span className="text-xs font-medium text-[hsl(0,0%,65%)]">{project.description}</span>
                <span className="w-6 h-6 flex items-center justify-center bg-[#292929] rounded-full text-white ml-auto">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
  </section>
);

export default ProjectsSection;
