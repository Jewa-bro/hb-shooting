import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoticeById, Notice } from '../api/notice';
import { ArrowLeft } from 'lucide-react';

const NoticeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      if (!id) return;
      try {
        const data = await getNoticeById(id);
        setNotice(data);
        setError(null);
      } catch (err) {
        setError('공지사항을 불러오는데 실패했습니다.');
        console.error('Error fetching notice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  const handleApply = () => {
    navigate(`/apply/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <p className="text-center">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <p className="text-center text-red-600">{error || '공지사항을 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  // 신청 가능한 공지사항인지 확인
  const isApplicationAvailable = notice.content.includes('신청') || 
                               notice.content.includes('모집') || 
                               notice.content.includes('참가');

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            뒤로 가기
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {notice.title}
            </h1>
            <div className="flex flex-col gap-2 text-gray-500 mb-6">
              <p>{notice.date}</p>
              {notice.description && (
                <p className="text-gray-600">{notice.description}</p>
              )}
            </div>
            
            <div className="prose max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: notice.content }}
              />
            </div>

            {isApplicationAvailable && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleApply}
                  className="bg-[#4285F4] hover:bg-[#3367D6] text-white font-medium py-2 px-6 rounded text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center min-w-[120px] h-[36px]"
                >
                  신청하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;