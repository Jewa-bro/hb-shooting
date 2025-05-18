import React from 'react';
import { MapPin, Clock, Car } from 'lucide-react';

const LocationSection = () => {
  return (
    <section id="location" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">찾아오시는 길</h2>
        
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Map Section */}
            <div className="md:w-3/5 h-80 md:h-auto relative">
              {/* Using an image as placeholder for the map */}
              <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-gray-500" />
                <span className="sr-only">지도</span>
                {/* In a real implementation, this would be replaced with a proper map component */}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center gap-2">
                <a 
                  href="https://map.naver.com/p/directions/-/-/-/transit?c=15.00,0,0,0,dh&destination=place%2F16292781" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  길찾기
                </a>
                <a 
                  href="https://map.naver.com/p/entry/place/16292781"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white border border-blue-900 text-blue-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  지도 크게보기
                </a>
              </div>
            </div>
            
            {/* Info Section */}
            <div className="md:w-2/5 p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">오시는 방법</h3>
              
              <div className="space-y-6">
                <div className="flex">
                  <MapPin className="h-5 w-5 text-blue-900 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">주소</h4>
                    <p className="text-gray-700">대전광역시 대덕대로 317번길 20 선사엔조이 5층</p>
                    <p className="text-gray-500 text-sm mt-1">(정부청사역 3번 출구에서 도보 11분)</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Car className="h-5 w-5 text-blue-900 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">주차</h4>
                    <p className="text-gray-700">건물 내 지하주차장 2시간 무료</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Clock className="h-5 w-5 text-blue-900 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">영업시간</h4>
                    <p className="text-gray-700">10:00 - 22:00 (연중무휴)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;