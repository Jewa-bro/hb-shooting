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
const noticeId = urlParams.get('noticeId');

// DOM 요소와 이벤트 핸들러 초기화
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소
    const noticeDescription = document.querySelector('.notice-description');
    const applicationForm = document.getElementById('applicationForm');
    const phoneInput = document.getElementById('phone');
    const birthdateInput = document.getElementById('birthdate');
    const projectRadioGroup = document.getElementById('projectRadioGroup');

    // 공지사항 정보 로드
    async function loadNoticeInfo() {
        if (!noticeId) {
            noticeDescription.textContent = '신청 관련 설명이 없습니다.';
            return;
        }

        try {
            const doc = await db.collection('notices').doc(noticeId).get();
            if (doc.exists) {
                const notice = doc.data();
                // 설명 글 표시
                noticeDescription.textContent = notice.description || '신청 관련 설명이 없습니다.';
            } else {
                noticeDescription.textContent = '신청 관련 설명이 없습니다.';
            }
        } catch (error) {
            console.error('공지사항 로드 실패:', error);
            noticeDescription.textContent = '신청 관련 설명이 없습니다.';
        }
    }

    // 사업 목록 로드
    async function loadProjects() {
        try {
            // 오늘 날짜의 시작 시점(00:00:00)을 기준으로 비교
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];
            
            console.log('Today:', todayStr);

            const snapshot = await db.collection('projects')
                .orderBy('startDate', 'asc')
                .get();
            
            projectRadioGroup.innerHTML = '';
            
            if (snapshot.empty) {
                projectRadioGroup.innerHTML = '<p class="no-projects">현재 신청 가능한 사업이 없습니다.</p>';
                return;
            }
            
            let hasAvailableProjects = false;
            
            snapshot.forEach(doc => {
                const project = doc.data();
                console.log('Project:', project.name, {
                    startDate: project.startDate,
                    endDate: project.endDate,
                    todayStr: todayStr
                });

                // 날짜가 유효한지 확인하고 안전하게 변환
                let startDateStr = '';
                let endDateStr = '';
                
                try {
                    // 날짜가 문자열로 저장된 경우 그대로 사용
                    if (typeof project.startDate === 'string') {
                        startDateStr = project.startDate;
                    } 
                    // Timestamp나 Date 객체인 경우 변환
                    else if (project.startDate && project.startDate.toDate) {
                        startDateStr = project.startDate.toDate().toISOString().split('T')[0];
                    }
                    else if (project.startDate instanceof Date) {
                        startDateStr = project.startDate.toISOString().split('T')[0];
                    }

                    if (typeof project.endDate === 'string') {
                        endDateStr = project.endDate;
                    }
                    else if (project.endDate && project.endDate.toDate) {
                        endDateStr = project.endDate.toDate().toISOString().split('T')[0];
                    }
                    else if (project.endDate instanceof Date) {
                        endDateStr = project.endDate.toISOString().split('T')[0];
                    }
                } catch (error) {
                    console.error('날짜 변환 중 오류:', error);
                    return; // 이 프로젝트는 건너뛰기
                }

                // 날짜가 유효하지 않으면 이 프로젝트는 표시하지 않음
                if (!startDateStr || !endDateStr) {
                    console.log('Invalid dates for project:', project.name);
                    return;
                }

                console.log('Converted dates:', {
                    startDateStr,
                    endDateStr,
                    todayStr,
                    isAvailable: startDateStr <= todayStr && endDateStr >= todayStr
                });

                if (startDateStr <= todayStr && endDateStr >= todayStr) {
                    hasAvailableProjects = true;
                    const label = document.createElement('label');
                    label.className = 'project-radio-label';
                    
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = 'projectId';
                    radio.value = doc.id;
                    radio.required = true;
                    
                    const info = document.createElement('div');
                    info.className = 'project-info';
                    
                    const name = document.createElement('div');
                    name.className = 'project-name';
                    name.textContent = project.name;
                    
                    info.appendChild(name);
                    label.appendChild(radio);
                    label.appendChild(info);
                    
                    projectRadioGroup.appendChild(label);
                }
            });

            if (!hasAvailableProjects) {
                projectRadioGroup.innerHTML = '<p class="no-projects">현재 신청 가능한 사업이 없습니다.</p>';
            }
        } catch (error) {
            console.error('사업 목록 로드 실패:', error);
            projectRadioGroup.innerHTML = '<p class="error-message">사업 목록을 불러오는데 실패했습니다.</p>';
        }
    }

    // 생년월일 초기화 및 유효성 검사 설정
    function initializeBirthdateInput() {
        // 오늘 날짜 기준으로 max 날짜 설정 (만 12세 이상)
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
        const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
        
        birthdateInput.max = maxDate.toISOString().split('T')[0];
        birthdateInput.min = minDate.toISOString().split('T')[0];
        
        // 기본값을 1990년으로 설정
        birthdateInput.value = '1990-01-01';
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

        const selectedProject = document.querySelector('input[name="projectId"]:checked');
        if (!selectedProject) {
            alert('사업을 선택해주세요.');
            return;
        }

        const projectId = selectedProject.value;
        try {
            // 선택된 프로젝트 정보 가져오기
            const projectDoc = await db.collection('projects').doc(projectId).get();
            if (!projectDoc.exists) {
                alert('선택한 사업이 존재하지 않습니다.');
                return;
            }
            const projectData = projectDoc.data();

            const formData = {
                projectId: projectId,
                projectName: projectData.name,
                name: document.getElementById('name').value,
                birthdate: document.getElementById('birthdate').value,
                gender: document.querySelector('input[name="gender"]:checked').value,
                phone: document.getElementById('phone').value,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // 중복 신청 확인 (전화번호, 이름, 프로젝트ID로 확인)
            const existingApplications = await db.collection('applications')
                .where('phone', '==', formData.phone)
                .where('name', '==', formData.name)
                .where('projectId', '==', projectId)
                .get();

            if (!existingApplications.empty) {
                alert('이미 해당 사업에 신청하셨습니다.\n동일한 이름과 전화번호로 중복 신청은 불가능합니다.');
                return;
            }

            // 신청 데이터 저장
            const docRef = await db.collection('applications').add(formData);
            
            // 프로젝트 통계 업데이트
            const projectRef = db.collection('projects').doc(projectId);
            await db.runTransaction(async (transaction) => {
                const projectDoc = await transaction.get(projectRef);
                if (!projectDoc.exists) {
                    throw new Error('사업이 존재하지 않습니다.');
                }
                
                const currentStats = projectDoc.data();
                transaction.update(projectRef, {
                    totalApplications: (currentStats.totalApplications || 0) + 1,
                    approvedApplications: currentStats.approvedApplications || 0,
                    pendingApplications: (currentStats.pendingApplications || 0) + 1,
                    rejectedApplications: currentStats.rejectedApplications || 0
                });
            });

            alert('신청이 완료되었습니다.');
            window.location.href = '/';
        } catch (error) {
            console.error('신청 처리 실패:', error);
            alert('신청 처리 중 오류가 발생했습니다.');
        }
    });

    // 초기화 함수 호출
    loadNoticeInfo();
    initializeBirthdateInput();
    loadProjects();
}); 