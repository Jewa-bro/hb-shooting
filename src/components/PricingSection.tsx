import React from 'react';
import { Clock, CalendarDays, BadgeCheck } from 'lucide-react';

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-blue-900">가격 안내</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          대전HB슈팅클럽의 다양한 프로그램을 합리적인 가격으로 이용해보세요
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 체험 프로그램 */}
          <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-blue-900 text-white p-6">
              <div className="flex items-center mb-2">
                <Clock className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-bold">체험 프로그램</h3>
              </div>
              <p className="text-blue-100 text-sm">사격을 처음 접하시는 분들을 위한 프로그램</p>
            </div>
            
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div>
                    <span className="block font-semibold text-gray-800">1회 체험 (20발)</span>
                    <span className="text-sm text-gray-500">부담 없이 즐기는 첫 경험</span>
                  </div>
                  <div className="text-right">
                    <span className="block line-through text-gray-400 text-sm">2,000원</span>
                    <span className="block text-red-600 font-bold">무료</span>
                  </div>
                </li>
                
                <li className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div>
                    <span className="block font-semibold text-gray-800">30분 체험</span>
                    <span className="text-sm text-gray-500">기본 자세와 함께 충분한 체험</span>
                  </div>
                  <div className="text-right">
                    <span className="block line-through text-gray-400 text-sm">7,000원</span>
                    <span className="block text-red-600 font-bold">5,000원</span>
                  </div>
                </li>
                
                <li className="flex justify-between items-center">
                  <div>
                    <span className="block font-semibold text-gray-800">60분 체험</span>
                    <span className="text-sm text-gray-500">심도 있는 사격 체험</span>
                  </div>
                  <div className="text-right">
                    <span className="block line-through text-gray-400 text-sm">12,000원</span>
                    <span className="block text-red-600 font-bold">9,000원</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* 강습 프로그램 */}
          <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="bg-red-600 text-white p-6">
              <div className="flex items-center mb-2">
                <CalendarDays className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-bold">강습 프로그램</h3>
              </div>
              <p className="text-red-100 text-sm">체계적인 지도와 훈련을 원하시는 분들을 위한 프로그램</p>
            </div>
            
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div>
                    <span className="block font-semibold text-gray-800">주 1회 (월 4회)</span>
                    <span className="text-sm text-gray-500">기초부터 차근차근 배우기</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-800">평일 100,000원</span>
                    <span className="block text-gray-800">주말 150,000원</span>
                  </div>
                </li>
                
                <li className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div>
                    <span className="block font-semibold text-gray-800">주 2회 (월 8회)</span>
                    <span className="text-sm text-gray-500">실력 향상을 위한 집중 훈련</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-800">평일 200,000원</span>
                    <span className="block text-gray-800">주말 250,000원</span>
                  </div>
                </li>
                
                <li className="flex justify-between items-center">
                  <div>
                    <span className="block font-semibold text-gray-800">주 3회 (월 12회)</span>
                    <span className="text-sm text-gray-500">전문가 수준의 고강도 훈련</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-800">평일 300,000원</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <div className="inline-flex items-center bg-blue-50 text-blue-800 rounded-full px-4 py-2">
            <BadgeCheck className="h-5 w-5 mr-2 text-blue-600" />
            <span className="font-medium">자전거 프로그램 이용 시 10% 할인 혜택</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;