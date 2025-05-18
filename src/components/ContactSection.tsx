import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';

const ContactSection = () => {
  return (
    <section id="contact" className="py-16 sm:py-20 bg-blue-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">상담 문의</h2>
        <p className="text-center text-blue-200 mb-8 sm:mb-12 px-4">
          궁금한 점이 있으시면 언제든지 연락주세요
        </p>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-blue-100 mb-2">영업시간</p>
              <p className="text-xl sm:text-2xl font-bold text-white">10:00 - 22:00 (연중무휴)</p>
              <p className="text-2xl sm:text-3xl font-bold mt-4 text-white">010-8246-0314</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href="tel:010-8246-0314" 
                className="bg-red-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center p-4 hover:bg-red-700 transition-colors shadow-lg"
              >
                <Phone className="h-5 w-5 mr-2" />
                <span className="font-bold">전화 상담하기</span>
              </a>
              
              <a 
                href="https://open.kakao.com/o/sTsBwJwh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-yellow-400 text-gray-900 rounded-lg sm:rounded-xl flex items-center justify-center p-4 hover:bg-yellow-500 transition-colors shadow-lg"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                <span className="font-bold">카카오톡 문의하기</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;