import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

const InstructorSection = () => {
  return (
    <section id="instructor" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">지도자 약력</h2>
        
        <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row">
            {/* Profile Image */}
            <div className="md:w-1/3 bg-blue-900 text-white p-8 flex flex-col items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-white/10 mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/heebok.jpg"
                  alt="박희복 지도자"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold">박희복 지도자</h3>
              <p className="text-blue-200 mt-2 text-center">전문 사격 지도자</p>
            </div>
            
            {/* Profile Content */}
            <div className="md:w-2/3 p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center mb-4">
                    <Trophy className="h-5 w-5 text-blue-700 mr-2" />
                    <h3 className="text-lg font-bold text-gray-800">경력사항</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span>국가대표 후보(상비군) 코치</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span>청소년 국가대표 코치</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span>대한사격연맹 국가대표 꿈나무 감독</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span>대전광역시 사격연맹 전무이사</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span>대전광역시 체육회 사격전문 지도사</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span>대전대신고등학교 사격 지도사</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-center mb-4">
                      <Medal className="h-5 w-5 text-blue-700 mr-2" />
                      <h3 className="text-lg font-bold text-gray-800">자격 및 수료</h3>
                    </div>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>국제심판 자격증</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>대한사격연맹 심판자격증</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-center mb-4">
                      <Award className="h-5 w-5 text-blue-700 mr-2" />
                      <h3 className="text-lg font-bold text-gray-800">수상경력</h3>
                    </div>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>대한체육회 우수지도상</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>대한사격연맹 최우수지도상</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>대전광역시체육회 우수지도자상</span>
                      </li>
                    </ul>
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

export default InstructorSection;