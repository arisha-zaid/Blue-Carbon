import React, { useState, useRef } from 'react';

const team = [
  { name: 'Udit Singh', role: 'ML & UI Expert' },
  { name: 'Rahul Pal', role: 'Backend Lead & Blockchain' },
  { name: 'Anshika', role: 'Domain Analyst' },
  { name: 'Arisha Zaid', role: 'Full Stack & Gen AI' },
  { name: 'Riya', role: 'Presentation Expert' },
  { name: 'Hritik', role: 'Research Expert' },
];

const getIndices = (center, length) => {
  const left = (center - 1 + length) % length;
  const right = (center + 1) % length;
  return [left, center, right];
};

const CARD_WIDTH = 300;
const MAX_DRAG_DISTANCE = CARD_WIDTH * 0.6;

const TeamSection = () => {
  const [centerIdx, setCenterIdx] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(null);

  const indices = getIndices(centerIdx, team.length);

  const constrainDragX = (newDragX) => {
    return Math.max(-MAX_DRAG_DISTANCE, Math.min(MAX_DRAG_DISTANCE, newDragX));
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  };

  const handleDragMove = (e) => {
    if (!isDragging || dragStartX.current === null) return;
    e.preventDefault();
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const newDragX = clientX - dragStartX.current;
    setDragX(constrainDragX(newDragX));
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const threshold = CARD_WIDTH / 4;
    
    if (dragX > threshold) {
      setCenterIdx((centerIdx - 1 + team.length) % team.length);
    } else if (dragX < -threshold) {
      setCenterIdx((centerIdx + 1) % team.length);
    }
    
    setIsDragging(false);
    setDragX(0);
    dragStartX.current = null;
  };

  return (
    <section className="w-full py-24 px-2 sm:py-28 sm:px-4 md:py-32 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-[hsl(0,0%,85%)] leading-tight mb-10" style={{textShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
          Meet Our Team
        </h2>
        <div
          className="relative flex items-center justify-center min-h-[340px] select-none mt-2 cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="flex items-center justify-center w-full gap-1 md:gap-2 relative h-[320px] md:h-[360px]">
            {indices.map((idx, pos) => {
              const isCenter = pos === 1;
              const base = 'absolute transition-all duration-400 ease-[cubic-bezier(.4,1,.4,1)] flex flex-col items-center justify-between min-h-[220px] aspect-[4/5] p-6';
              
              // Only disable transitions when actively dragging the center card
              const shouldDisableTransition = isDragging && isCenter;
              const transitionClass = shouldDisableTransition ? 'transition-none' : '';
              
              const size = isCenter
                ? 'z-20 scale-105 left-1/2 -translate-x-1/2 opacity-100'
                : pos === 0
                  ? 'z-10 scale-100 left-1/4 -translate-x-1/2 opacity-80'
                  : 'z-10 scale-100 left-3/4 -translate-x-1/2 opacity-80';
              
              // Use a more precise condition for when to apply drag transform
              const dragTransform = (isDragging && isCenter && Math.abs(dragX) > 0) 
                ? `translateX(calc(-50% + ${dragX}px)) scale(1.05)` 
                : undefined;

              const cardStyle = {
                width: isCenter ? CARD_WIDTH : 260,
                top: 0
              };

              if (dragTransform) {
                cardStyle.transform = dragTransform;
              }
              
              return (
                <div
                  key={idx}
                  className={`${base} ${transitionClass} ${size} rounded-3xl border border-[#292929] bg-white/10 backdrop-blur-md shadow-md`}
                  style={cardStyle}
                >
                  <div className="flex flex-col items-center w-full h-full justify-between">
                    <div className="flex items-center justify-center w-full mb-4">
                      <div className={`bg-[#292929] rounded-2xl ${isCenter ? 'w-24 h-24' : 'w-20 h-20'}`} />
                    </div>
                    <div className="flex flex-col items-center w-full">
                      <div className={`font-semibold text-[hsl(0,0%,85%)] mb-1 ${isCenter ? 'text-lg' : 'text-base'}`}>
                        {team[idx].name}
                      </div>
                      <div className={`text-[hsl(0,0%,65%)] ${isCenter ? 'text-sm' : 'text-xs opacity-80'}`}>
                        {team[idx].role}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;