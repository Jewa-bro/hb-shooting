import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import IntroSection from './components/IntroSection';
import InstructorSection from './components/InstructorSection';
import NoticeSection from './components/NoticeSection';
import PricingSection from './components/PricingSection';
import LocationSection from './components/LocationSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import OpeningAnimation from './components/OpeningAnimation';
import NoticeDetail from './pages/NoticeDetail';
import ApplicationForm from './pages/ApplicationForm';
import { AnimationProvider, useAnimation } from './context/AnimationContext';
import { Toaster } from 'react-hot-toast';

const MainContent = () => {
  const { mainPageOpacity } = useAnimation();
  
  return (
    <div 
      className="font-sans text-gray-800 bg-gray-50 transition-opacity duration-500"
      style={{ opacity: mainPageOpacity }}
    >
      <Header />
      <Routes>
        <Route path="/" element={
          <main>
            <IntroSection />
            <InstructorSection />
            <NoticeSection />
            <PricingSection />
            <LocationSection />
            <ContactSection />
          </main>
        } />
        <Route path="/notice/:id" element={<NoticeDetail />} />
        <Route path="/apply/:id" element={<ApplicationForm />} />
      </Routes>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Router>
        <AnimationProvider>
          <OpeningAnimation />
          <MainContent />
        </AnimationProvider>
      </Router>
    </>
  );
}

export default App;