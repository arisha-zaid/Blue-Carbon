import React from 'react';

const Leaderboard = () => {
  const leaderboardData = [
    {
      id: 1,
      rank: 2,
      name: "Marine Solutions",
      score: 2847,
      credits: "1,250 tons CO₂",
      avatar: "MS"
    },
    {
      id: 2,
      rank: 1,
      name: "Blue Alliance", 
      score: 3156,
      credits: "1,890 tons CO₂",
      avatar: "BC",
      isWinner: true
    },
    {
      id: 3,
      rank: 3,
      name: "Ocean Guardians",
      score: 2134,
      credits: "985 tons CO₂", 
      avatar: "OG"
    }
  ];


  const sortedData = [...leaderboardData].sort((a, b) => a.rank - b.rank);
  

  const firstPlace = sortedData.find(item => item.rank === 1);
  const secondPlace = sortedData.find(item => item.rank === 2);
  const thirdPlace = sortedData.find(item => item.rank === 3);

  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center text-[#666] mb-12">
          Leaderboard
        </h2>
        
        <div className="flex items-center justify-center gap-8 flex-wrap">
        
          <div className="flex flex-col items-center justify-center w-[260px] h-[380px] bg-white/6 backdrop-blur-sm rounded-2xl p-6 relative shadow-[0_8px_20px_rgba(0,0,0,0.45)]">
            <span className="absolute top-4 right-[50%] translate-x-[50%] text-sm text-[hsl(0,0%,35%)] opacity-75 font-medium">#2</span>
            <div className="w-20 h-20 rounded-full bg-[#2a2a2a] flex items-center justify-center text-2xl font-bold text-white mb-4">{secondPlace?.avatar}</div>
            <h3 className="text-xl font-semibold text-white text-center mb-1">{secondPlace?.name}</h3>
            <p className="text-sm text-[#666] mb-4 text-center">{secondPlace?.credits}</p>
            <div className="text-2xl font-bold text-white">{secondPlace?.score.toLocaleString()}</div>
          </div>

          
          <div className="flex flex-col items-center justify-center w-[300px] h-[420px] bg-white/8 backdrop-blur-sm rounded-[28px] p-8 relative border border-[#2f2f2f] shadow-[0_12px_30px_rgba(0,0,0,0.7)]">
            <span className="absolute top-4 right-[50%] translate-x-[50%] text-sm text-[hsl(0,0%,35%)] opacity-75 font-medium">#1</span>
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center text-3xl font-bold text-white mb-4 ring-2 ring-yellow-400/25">1</div>
            <h3 className="text-2xl font-bold text-white text-center mb-1">{firstPlace?.name}</h3>
            <p className="text-sm text-[#666] mb-4 text-center">{firstPlace?.credits}</p>
            <div className="text-3xl font-extrabold text-white mb-3">{firstPlace?.score.toLocaleString()}</div>
            <div className="px-3 py-1 rounded-full bg-yellow-500 text-xs font-medium text-white">Winner</div>
          </div>

          
          <div className="flex flex-col items-center justify-center w-[260px] h-[380px] bg-white/6 backdrop-blur-sm rounded-2xl p-6 relative shadow-[0_8px_20px_rgba(0,0,0,0.45)]">
            <span className="absolute top-4 right-[50%] translate-x-[50%] text-sm text-[hsl(0,0%,35%)] opacity-75 font-medium">#3</span>
            <div className="w-20 h-20 rounded-full bg-[#2a2a2a] flex items-center justify-center text-2xl font-bold text-white mb-4">{thirdPlace?.avatar}</div>
            <h3 className="text-xl font-semibold text-white text-center mb-1">{thirdPlace?.name}</h3>
            <p className="text-sm text-[#666] mb-4 text-center">{thirdPlace?.credits}</p>
            <div className="text-2xl font-bold text-white">{thirdPlace?.score.toLocaleString()}</div>
          </div>
        </div>
        
        {/* Additional stats or info */}
        <div className="text-center mt-8">
          <p className="text-[#66666672] text-base">
            Based on verified carbon credits and environmental impact
          </p>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
