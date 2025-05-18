import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { useAnimation } from '../context/AnimationContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { triggerAnimation } = useAnimation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 64,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        window.scrollTo({
          top: element.offsetTop - 64,
          behavior: 'smooth'
        });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      triggerAnimation();
    } else {
      navigate('/');
    }
    scrollToSection('intro');
  };

  const isDetailPage = location.pathname.includes('/notice/') || location.pathname.includes('/apply');

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled || isDetailPage ? 'bg-white shadow-md py-2' : 'bg-transparent py-3'
      }`}
      style={{ transform: 'none' }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={handleLogoClick}
        >
          <Target 
            className={`h-6 w-6 sm:h-8 sm:w-8 mr-2 ${
              isScrolled || isDetailPage ? 'text-blue-900' : 'text-white'
            }`} 
          />
          <h1 
            className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
              isScrolled || isDetailPage ? 'text-blue-900' : 'text-white'
            }`}
          >
            대전HB슈팅클럽
          </h1>
        </div>

        <nav className="hidden md:block">
          <ul className="flex gap-6">
            {['intro', 'instructor', 'notice', 'pricing', 'location', 'contact'].map((section, index) => (
              <li key={index}>
                <button
                  className={`font-medium text-sm lg:text-base transition-colors duration-300 hover:text-blue-700 ${
                    isScrolled || isDetailPage ? 'text-gray-800' : 'text-white'
                  }`}
                  onClick={() => scrollToSection(section)}
                >
                  {section === 'intro' && '소개'}
                  {section === 'instructor' && '지도자 약력'}
                  {section === 'notice' && '공지사항'}
                  {section === 'pricing' && '가격안내'}
                  {section === 'location' && '찾아오시는 길'}
                  {section === 'contact' && '상담문의'}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <button 
          className="md:hidden p-2 -mr-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴 열기"
        >
          <div className={`w-6 h-0.5 mb-1.5 transition-all duration-300 ${
            isScrolled || isDetailPage ? 'bg-gray-800' : 'bg-white'
          } ${mobileMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`} />
          <div className={`w-6 h-0.5 mb-1.5 transition-all duration-300 ${
            isScrolled || isDetailPage ? 'bg-gray-800' : 'bg-white'
          } ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-6 h-0.5 transition-all duration-300 ${
            isScrolled || isDetailPage ? 'bg-gray-800' : 'bg-white'
          } ${mobileMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      <div 
        className={`md:hidden fixed left-0 right-0 bg-white shadow-lg transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[calc(100vh-4rem)] overflow-y-auto' : 'max-h-0 overflow-hidden'
        }`}
      >
        <ul className="py-2 px-4">
          {['intro', 'instructor', 'notice', 'pricing', 'location', 'contact'].map((section, index) => (
            <li key={index} className="border-b border-gray-100 last:border-none">
              <button
                className="w-full py-4 text-left font-medium text-gray-800 hover:text-blue-700 transition-colors"
                onClick={() => scrollToSection(section)}
              >
                {section === 'intro' && '소개'}
                {section === 'instructor' && '지도자 약력'}
                {section === 'notice' && '공지사항'}
                {section === 'pricing' && '가격안내'}
                {section === 'location' && '찾아오시는 길'}
                {section === 'contact' && '상담문의'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Header;