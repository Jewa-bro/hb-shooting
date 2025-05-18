import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoticeById, getAvailablePrograms, type Program } from '../api/notice';
import { ArrowLeft } from 'lucide-react';
import { addDoc, collection, query, where, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

interface ApplicationFormData {
  projectId: string;
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: 'male' | 'female' | '';
  phone: string;
}

const ApplicationForm = () => {
  const { id: noticeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ApplicationFormData>({
    projectId: '',
    name: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    gender: '',
    phone: ''
  });
  const [notice, setNotice] = useState<any>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!noticeId) return;
      try {
        const [noticeData, programsData] = await Promise.all([
          getNoticeById(noticeId),
          getAvailablePrograms()
        ]);
        setNotice(noticeData);
        setPrograms(programsData);
        if (programsData.length > 0) {
          setFormData(prev => ({ ...prev, projectId: programsData[0].id }));
        }
      } catch (error) {
        console.error('데이터를 불러오는데 실패했습니다:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [noticeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId) {
        toast.error('참가할 사업을 선택해주세요.');
        return;
    }

    try {
      const applicationsRef = collection(db, 'applications');
      const duplicateQuery = query(
        applicationsRef,
        where('projectId', '==', formData.projectId),
        where('name', '==', formData.name),
        where('phone', '==', formData.phone)
      );
      
      const duplicateSnapshot = await getDocs(duplicateQuery);
      if (!duplicateSnapshot.empty) {
        toast.error('이미 동일한 정보로 해당 사업에 신청하셨습니다.');
        return;
      }

      const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;
      
      const applicationData = {
        projectId: formData.projectId,
        name: formData.name,
        birthYear: formData.birthYear,
        birthMonth: formData.birthMonth,
        birthDay: formData.birthDay,
        gender: formData.gender,
        phone: formData.phone,
        birthDate,
        noticeId: noticeId,
        createdAt: serverTimestamp(),
        status: 'pending'
      };

      const docRef = await addDoc(collection(db, 'applications'), applicationData);
      
      toast.success('신청이 완료되었습니다.');
      navigate('/');
      
    } catch (error) {
      console.error('신청 제출 중 오류 발생:', error);
      toast.error('신청 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const validateBirthInput = (name: string, value: string): string => {
    const currentYear = new Date().getFullYear();
    const numericValue = value.replace(/[^0-9]/g, '');
    
    switch (name) {
      case 'birthYear':
        if (numericValue.length <= 4) {
          if (numericValue.length === 4) {
            const year = parseInt(numericValue);
            if (year > currentYear || year < 1900) return '';
          }
          return numericValue;
        }
        return value.slice(0, 4);
        
      case 'birthMonth':
        if (numericValue.length <= 2) {
          const month = parseInt(numericValue);
          if (month > 12) return '';
          if (month < 1 && numericValue.length === 2) return '';
          return numericValue;
        }
        return value.slice(0, 2);
        
      case 'birthDay':
        if (numericValue.length <= 2) {
          const day = parseInt(numericValue);
          if (day > 31) return '';
          if (day < 1 && numericValue.length === 2) return '';
          return numericValue;
        }
        return value.slice(0, 2);
        
      default:
        return numericValue;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'projectId') {
        setFormData(prev => ({ ...prev, projectId: value }));
        return;
    }

    if (['birthYear', 'birthMonth', 'birthDay'].includes(name)) {
      const validatedValue = validateBirthInput(name, value);
      setFormData(prev => ({ ...prev, [name]: validatedValue }));
      return;
    }

    if (name === 'phone') {
      const cleaned = value.replace(/[^0-9]/g, '');
      let formatted = cleaned;
      
      if (cleaned.length >= 4 && cleaned.length <= 7) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else if (cleaned.length >= 8) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
      }
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <p className="text-center text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            뒤로가기
          </button>
          <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
              {'참가 신청'}
            </h1>
            <p className="text-center text-gray-600 mb-10">
              {programs.find(p => p.id === formData.projectId)?.description || '사업을 선택해주세요.'}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                  참가 사업 <span className="text-red-500">*</span>
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-gray-700"
                >
                  <option value="" disabled>사업을 선택해주세요</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-1">
                    생년 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="birthYear"
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleInputChange}
                    placeholder="YYYY"
                    maxLength={4}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label htmlFor="birthMonth" className="block text-sm font-medium text-gray-700 mb-1">
                    월 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="birthMonth"
                    name="birthMonth"
                    value={formData.birthMonth}
                    onChange={handleInputChange}
                    placeholder="MM"
                    maxLength={2}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  />
                </div>
                <div>
                  <label htmlFor="birthDay" className="block text-sm font-medium text-gray-700 mb-1">
                    일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="birthDay"
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleInputChange}
                    placeholder="DD"
                    maxLength={2}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  성별 <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-gray-700"
                >
                  <option value="" disabled>성별을 선택해주세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="010-1234-5678"
                  maxLength={13}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-150 ease-in-out"
                >
                  신청하기
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;