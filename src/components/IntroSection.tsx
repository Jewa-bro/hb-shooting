import React, { useState, useEffect } from 'react';

const slideImages = [
  '/images/gunimage.jpg',
  '/images/concentration.jpg',
  '/images/industurctor.jpg'
];

const IntroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slideImages.length);
        setFadeIn(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      id="intro" 
      className="relative h-[calc(100vh-4rem)] md:h-screen flex items-center justify-center"
    >
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundImage: `url(${slideImages[currentSlide]})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-blue-900/50" />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          대전HB슈팅클럽
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white opacity-90 max-w-2xl mx-auto leading-relaxed px-4">
          안전한 레이저 사격으로 즐기는 실내 데이트의 명소
        </p>
        <div className="mt-8 sm:mt-10 mb-16">
          <button 
            onClick={() => {
              const pricingSection = document.getElementById('pricing');
              if (pricingSection) {
                window.scrollTo({
                  top: pricingSection.offsetTop - 64,
                  behavior: 'smooth'
                });
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 sm:px-8 rounded-full transition-all transform hover:scale-105 shadow-lg text-base sm:text-lg"
          >
            가격 확인하기
          </button>
        </div>

        {/* Slide navigation */}
        <div className="absolute bottom-8 sm:bottom-10 left-0 right-0 flex justify-center gap-2">
          {slideImages.map((_, index) => (
            <button 
              key={index}
              className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all ${
                currentSlide === index ? 'bg-white w-6 sm:w-8' : 'bg-white/50'
              }`}
              onClick={() => {
                setFadeIn(false);
                setTimeout(() => {
                  setCurrentSlide(index);
                  setFadeIn(true);
                }, 500);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntroSection;