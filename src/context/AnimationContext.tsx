import React, { createContext, useContext, useState } from 'react';

type AnimationContextType = {
  showAnimation: boolean;
  mainPageOpacity: number;
  triggerAnimation: () => void;
};

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: React.ReactNode }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [mainPageOpacity, setMainPageOpacity] = useState(1);

  const triggerAnimation = () => {
    setShowAnimation(true);
    setMainPageOpacity(0.3);
    
    // 메인 페이지 페이드인 시작
    setTimeout(() => {
      setMainPageOpacity(1);
    }, 1500);
    
    // 애니메이션 종료
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
  };

  return (
    <AnimationContext.Provider value={{ showAnimation, mainPageOpacity, triggerAnimation }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};