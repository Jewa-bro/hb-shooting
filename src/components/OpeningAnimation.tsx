import React from 'react';
import { useAnimation } from '../context/AnimationContext';

const OpeningAnimation = () => {
  const { showAnimation } = useAnimation();
  const [phase, setPhase] = React.useState(0);

  React.useEffect(() => {
    if (showAnimation) {
      setPhase(0);
      
      // 텍스트 페이드인 시작
      setTimeout(() => setPhase(1), 200);
      
      // 텍스트 확대 및 페이드아웃 시작
      setTimeout(() => setPhase(2), 1500);
    }
  }, [showAnimation]);

  if (!showAnimation) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70"
      style={{
        transition: 'all 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div 
        className={`text-center transition-all duration-1000 ease-in-out transform
          ${phase === 1 ? 'scale-100 opacity-100' : phase < 1 ? 'scale-90 opacity-0' : 'scale-150 opacity-0'}`}
        style={{
          transition: 'all 1000ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white">
          자신의 한계를 극복하라
        </h2>
      </div>
    </div>
  );
};

export default OpeningAnimation;