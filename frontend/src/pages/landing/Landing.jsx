import React from 'react';
import Navbar from './Navbar.jsx';
import HeroText from './Herotext.jsx';
import DashboardCard from './DashboardCard.jsx';
import KeyFeatures from './KeyFeatures.jsx';
import FAQ from './FAQ.jsx';
import Footer from './Footer.jsx';
import WorkProcessSection from './WorkProcessSection.jsx';
import ProjectsSection from './ProjectsSection.jsx';
import MarqueeSection from './MarqueeSection.jsx';
import TeamSection from './TeamSection.jsx';
import Ribbon from './Ribbon.jsx';
import bg2 from './assets/bg2.png';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div
        className="w-full min-h-screen bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url(${bg2})` }}
      >
        <Navbar />
        <div className="w-[95%] max-w-[1100px] mx-auto relative z-10 px-4 flex flex-col items-center justify-center h-[80vh] gap-5 sm:w-[90%] sm:px-0 md:items-center-safe md:justify-between md:h-[85vh] md:gap-10 lg:flex-row xl:max-w-[1400px] 2xl:max-w-[1600px]">
          <HeroText />
          <DashboardCard />
        </div>
      </div>
      <KeyFeatures />
      <WorkProcessSection />
      <ProjectsSection />
      <div className="my-4">
      <Ribbon />
      </div>
      {/* <MarqueeSection /> */}
      <TeamSection />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Landing;