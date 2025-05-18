import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBVxlZYZEQ0z0FO7NtAGjnpXKAHOGC6Ypw",
  authDomain: "hbshooting-ed578.firebaseapp.com",
  projectId: "hbshooting-ed578",
  storageBucket: "hbshooting-ed578.appspot.com",
  messagingSenderId: "1096525186906",
  appId: "1:1096525186906:web:c0c4c0c5c2dc99b1a4b12b",
  measurementId: "G-RLSQM90L2E"
};

// Firebase 초기화
let firebaseApp: FirebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig);
} catch (error: any) {
  if (!/already exists/.test(error.message)) {
    console.error('Firebase 초기화 에러:', error);
  }
  firebaseApp = initializeApp(firebaseConfig, 'default');
}

const db = getFirestore(firebaseApp);

export interface Notice {
  id: string;
  title: string;
  date: string;
  content: string;
  description?: string;
  isVisible?: boolean;
}

export interface Program {
  id: string;
  name: string;
  price: string;
  description: string;
  isAvailable?: boolean;
  order?: number;
  startDate: Date;
  endDate: Date;
}

// 모든 공지사항 가져오기
export const getNotices = async (): Promise<Notice[]> => {
  try {
    const noticesRef = collection(db, 'notices');
    const snapshot = await getDocs(noticesRef);
    
    if (snapshot.empty) {
      console.log('공지사항이 없습니다.');
      return [];
    }

    return snapshot.docs
      .filter(doc => doc.data().isVisible)
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          date: data.createdAt?.toDate?.() 
            ? data.createdAt.toDate().toLocaleDateString() 
            : new Date().toLocaleDateString(),
          content: data.content || '',
          description: data.description || ''
        };
      });
  } catch (error) {
    console.error('공지사항 조회 중 에러 발생:', error);
    return [];
  }
};

// 특정 공지사항 가져오기
export const getNoticeById = async (id: string): Promise<Notice | null> => {
  if (!id) return null;

  try {
    const noticeRef = doc(db, 'notices', id);
    const noticeDoc = await getDoc(noticeRef);
    
    if (!noticeDoc.exists()) {
      console.log('해당 공지사항을 찾을 수 없습니다:', id);
      return null;
    }

    const data = noticeDoc.data();
    return {
      id: noticeDoc.id,
      title: data.title || '',
      date: data.createdAt?.toDate?.() 
        ? data.createdAt.toDate().toLocaleDateString() 
        : new Date().toLocaleDateString(),
      content: data.content || '',
      description: data.description || '',
      isVisible: data.isVisible || false
    };
  } catch (error) {
    console.error('공지사항 상세 조회 중 에러 발생:', error);
    return null;
  }
};

// 신청 가능한 프로그램 목록 가져오기
export const getAvailablePrograms = async (): Promise<Program[]> => {
  try {
    console.log('프로그램 조회 시작');
    
    // 컬렉션 목록 확인
    const collections = await getDocs(collection(db, 'projects'));
    console.log('컬렉션 정보:', {
      path: 'projects',
      empty: collections.empty,
      size: collections.size,
      metadata: collections.metadata
    });

    if (collections.empty) {
      console.log('컬렉션이 비어있거나 접근할 수 없습니다.');
      return [];
    }

    // 현재 한국 시간 계산
    const now = new Date();
    
    // 날짜 비교를 위한 날짜만 있는 버전 (시간은 00:00:00)
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    console.log('현재 시각 (KST):', now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
    console.log('오늘 날짜 (KST):', today.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }));

    const programs = collections.docs
      .filter(doc => {
        const data = doc.data();
        console.log(`\n문서 [${doc.id}] 확인 중:`, data);

        // 필수 필드 존재 확인
        if (!data.name) {
          console.log(`- ${doc.id}: name 필드 없음`);
        }
        if (!data.startDate) {
          console.log(`- ${doc.id}: startDate 필드 없음`);
          return false;
        }
        if (!data.endDate) {
          console.log(`- ${doc.id}: endDate 필드 없음`);
          return false;
        }

        try {
          // Firestore 타임스탬프를 Date 객체로 변환
          const startDate = data.startDate.toDate();
          const endDate = data.endDate.toDate();
          
          // 날짜 비교를 위해 시작일은 00:00:00, 종료일은 23:59:59로 설정
          const startDateForCompare = new Date(startDate);
          const endDateForCompare = new Date(endDate);
          startDateForCompare.setHours(0, 0, 0, 0);
          endDateForCompare.setHours(23, 59, 59, 999);
          
          console.log(`- ${doc.id} 날짜 정보:`, {
            name: data.name,
            startDate: startDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
            endDate: endDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
            isAvailable: data.isAvailable
          });

          const isWithinPeriod = today >= startDateForCompare && today <= endDateForCompare;
          const isAvailable = data.isAvailable !== false;

          console.log(`- ${doc.id} 상태:`, {
            isWithinPeriod,
            isAvailable,
            today: today.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
          });
          
          return isWithinPeriod && isAvailable;
        } catch (error) {
          console.error(`- ${doc.id} 날짜 처리 중 에러:`, error);
          return false;
        }
      })
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          price: typeof data.price === 'number' 
            ? `${data.price.toLocaleString()}원` 
            : data.price || '',
          description: data.description || '',
          order: data.order || 0,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate()
        };
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log('\n=== 최종 결과 ===');
    console.log('필터링 된 프로그램 수:', programs.length);
    if (programs.length > 0) {
      console.log('신청 가능한 프로그램:', JSON.stringify(programs, null, 2));
    } else {
      console.log('신청 가능한 프로그램이 없습니다.');
    }
    
    return programs;
  } catch (error: any) {
    console.error('프로그램 목록 조회 중 에러 발생:', error);
    console.error('에러 상세:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return [];
  }
}; 