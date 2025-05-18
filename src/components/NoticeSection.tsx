import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Bell, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getNotices } from '../api/notice';

interface Notice {
  id: string;
  title: string;
  date: string;
  content: string;
  description: string;
}

const NoticeSection = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNotice, setActiveNotice] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await getNotices();
        setNotices(data);
        setError(null);
      } catch (err) {
        setError('공지사항을 불러오는데 실패했습니다.');
        console.error('Error fetching notices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const toggleNotice = (id: string) => {
    setActiveNotice(activeNotice === id ? null : id);
  };

  const handleDetailClick = (id: string) => {
    window.scrollTo(0, 0);
    navigate(`/notice/${id}`);
  };

  const displayedNotices = showAll ? notices : notices.slice(0, 3);

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p>공지사항을 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="notice" className="py-16 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-blue-900">공지사항</h2>
        <p className="text-center text-gray-600 mb-8 sm:mb-12">
          대전HB슈팅클럽의 새로운 소식을 확인하세요
        </p>
        
        <div className="max-w-3xl mx-auto">
          {displayedNotices.length === 0 ? (
            <p className="text-center text-gray-500">등록된 공지사항이 없습니다.</p>
          ) : (
            displayedNotices.map((notice) => (
              <div 
                key={notice.id}
                className="mb-4 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleNotice(notice.id)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <Bell className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{notice.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{notice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDetailClick(notice.id);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-4 hidden sm:flex items-center"
                    >
                      <span className="text-sm">자세히</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                    {activeNotice === notice.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
                <div 
                  className={`px-4 overflow-hidden transition-all duration-300 ${
                    activeNotice === notice.id ? 'max-h-32' : 'max-h-0'
                  }`}
                >
                  <div className="py-4 border-t border-gray-100">
                    <p className="text-gray-700 text-sm sm:text-base">
                      {notice.description || '20명 선착순 마감됩니다'}
                    </p>
                    <button 
                      onClick={() => handleDetailClick(notice.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center sm:hidden"
                    >
                      자세히 보기
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {notices.length > 3 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {showAll ? (
                  <>
                    접기
                    <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    더보기
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NoticeSection;