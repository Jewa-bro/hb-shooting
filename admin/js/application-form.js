// Firebase 구성
const firebaseConfig = {
    apiKey: "AIzaSyDlQJxTFw27-hn-2LPDR4Fc3WX7QL1d3KA",
    authDomain: "hbshooting-ed578.firebaseapp.com",
    projectId: "hbshooting-ed578",
    storageBucket: "hbshooting-ed578.firebasestorage.app",
    messagingSenderId: "607611130808",
    appId: "1:607611130808:web:3940d481ccee044aa8754d",
    measurementId: "G-G8E15F2TVC"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// URL에서 공지사항 ID 가져오기
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('projectId');

// DOM 요소
const projectDescription = document.querySelector('.project-description');
const applicationForm = document.getElementById('applicationForm');
const phoneInput = document.getElementById('phone');

// 사업 정보 로드
async function loadProjectInfo() {
    try {
        // Firebase 서버 시간 확인
        const serverTimeRef = await db.collection('_serverTime').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        const serverTimeDoc = await serverTimeRef.get();
        const serverTimestamp = serverTimeDoc.data().timestamp;
        
        console.log('Firebase Server Time:', {
            serverTimestamp: serverTimestamp,
            serverDate: serverTimestamp.toDate(),
            serverDateISO: serverTimestamp.toDate().toISOString(),
            localTime: new Date()
        });

        // 테스트 후 임시 문서 삭제
        await serverTimeRef.delete();

        const doc = await db.collection('projects').doc(projectId).get();
        if (doc.exists) {
            const project = doc.data();
            
            // Firebase 타임스탬프 원본 데이터 출력
            console.log('Firebase Raw Data:', {
                startDate: project.startDate,
                endDate: project.endDate,
                startDateType: typeof project.startDate,
                startDateToString: project.startDate.toString(),
                startDateToDate: project.startDate.toDate(),
                startDateTimestamp: project.startDate.toDate().getTime()
            });

            function getKSTDateString(date) {
                // KST는 UTC+9
                const kstOffset = 9 * 60; // 9시간을 분으로 변환
                const utc = date.getTime() + (date.getTimezoneOffset() * 60000); // 현재 로컬 시간을 UTC로 변환
                const kstTime = new Date(utc + (kstOffset * 60000)); // UTC에 KST 오프셋 적용
                
                const year = kstTime.getFullYear();
                const month = String(kstTime.getMonth() + 1).padStart(2, '0');
                const day = String(kstTime.getDate()).padStart(2, '0');
                
                return `${year}-${month}-${day}`;
            }

            const today = getKSTDateString(serverTimestamp.toDate());
            const startDate = getKSTDateString(project.startDate.toDate());
            const endDate = getKSTDateString(project.endDate.toDate());

            console.log('Date Comparison (KST):', {
                today: today,
                startDate: startDate,
                endDate: endDate,
                currentTimeInKST: new Date(Date.now() + (9 * 60 * 60 * 1000)).toISOString()
            });

            if (today >= startDate && today <= endDate) {
                projectDescription.textContent = project.description || '신청 관련 설명이 없습니다.';
                applicationForm.style.display = 'block';
            } else {
                alert('신청 기간이 아닙니다.');
                window.location.href = '/';
            }
        } else {
            alert('존재하지 않는 사업입니다.');
            window.location.href = '/';
        }
    } catch (error) {
        console.error('사업 정보 로드 실패:', error);
        alert('사업 정보를 불러오는데 실패했습니다.');
    }
}

// 전화번호 형식 자동 변환
phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // 숫자만 남기기
    if (value.length >= 10) {
        value = value.match(/(\d{3})(\d{4})(\d{4})/);
        e.target.value = !value[2] ? value[1] : value[1] + '-' + value[2] + (value[3] ? '-' + value[3] : '');
    }
});

// 폼 제출 처리
applicationForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        birthdate: document.getElementById('birthdate').value,
        gender: document.querySelector('input[name="gender"]:checked').value,
        phone: document.getElementById('phone').value,
        projectId: projectId,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // 중복 신청 확인
        const existingApplications = await db.collection('applications')
            .where('phone', '==', formData.phone)
            .where('projectId', '==', projectId)
            .get();

        if (!existingApplications.empty) {
            alert('이미 신청하셨습니다.');
            return;
        }

        // 신청 데이터 저장
        await db.collection('applications').add(formData);
        alert('신청이 완료되었습니다.');
        window.location.href = '/';
    } catch (error) {
        console.error('신청 처리 실패:', error);
        alert('신청 처리 중 오류가 발생했습니다.');
    }
});

// 페이지 로드 시 사업 정보 불러오기
loadProjectInfo(); 