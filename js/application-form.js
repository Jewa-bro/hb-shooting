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
    console.log('DOM 로드됨');
    
    // DOM 요소
    const applicationForm = document.getElementById('applicationForm');
    console.log('폼 요소:', applicationForm);
    
    if (!applicationForm) {
        console.error('applicationForm을 찾을 수 없습니다.');
        return;
    }

    const projectDescription = document.querySelector('.project-description');
    const phoneInput = document.getElementById('phone');
    const birthYear = document.getElementById('birthYear');
    const birthMonth = document.getElementById('birthMonth');
    const birthDay = document.getElementById('birthDay');
    const birthdate = document.getElementById('birthdate');
    const projectRadioGroup = document.getElementById('projectRadioGroup');

    // 프로젝트 선택 시 설명 업데이트
    projectRadioGroup.addEventListener('change', async (e) => {
        if (e.target.type === 'radio') {
            try {
                const projectId = e.target.value;
                const doc = await db.collection('projects').doc(projectId).get();
                if (doc.exists) {
                    const project = doc.data();
                    projectDescription.textContent = project.description || '신청 관련 설명이 없습니다.';
                }
            } catch (error) {
                console.error('프로젝트 정보 로드 실패:', error);
                projectDescription.textContent = '프로젝트 정보를 불러오는데 실패했습니다.';
            }
        }
    });

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
            projectDescription.textContent = '사업을 선택해주세요.';
            
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

                // 모든 프로젝트를 표시하도록 수정 (날짜 제한 없이)
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
            });

            if (!hasAvailableProjects) {
                projectRadioGroup.innerHTML = '<p class="no-projects">현재 신청 가능한 사업이 없습니다.</p>';
            }
        } catch (error) {
            console.error('사업 목록 로드 실패:', error);
            projectRadioGroup.innerHTML = '<p class="error-message">사업 목록을 불러오는데 실패했습니다.</p>';
        }
    }

    // 생년월일 입력 처리
    function updateBirthdate() {
        // null 체크 추가
        if (!birthYear || !birthMonth || !birthDay || !birthdate) {
            console.error('생년월일 입력 필드를 찾을 수 없습니다.');
            return;
        }

        if (birthYear.value && birthMonth.value && birthDay.value) {
            try {
                // 월과 일이 한 자리 수인 경우 앞에 0을 붙임
                const month = birthMonth.value.padStart(2, '0');
                const day = birthDay.value.padStart(2, '0');
                birthdate.value = `${birthYear.value}-${month}-${day}`;
            } catch (error) {
                console.error('생년월일 처리 중 오류:', error);
            }
        }
    }

    // 자동 포커스 이동 처리
    if (birthYear) {
        birthYear.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            if (e.target.value.length === 4 && birthMonth) {
                birthMonth.focus();
            }
            updateBirthdate();
        });
    }

    if (birthMonth) {
        birthMonth.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            let value = e.target.value;
            if (value.length === 1 && parseInt(value) > 1) {
                value = '0' + value;
                e.target.value = value;
            }
            if (value.length === 2) {
                if (parseInt(value) > 12) {
                    e.target.value = '12';
                } else if (parseInt(value) < 1) {
                    e.target.value = '01';
                }
                if (birthDay) {
                    birthDay.focus();
                }
            }
            updateBirthdate();
        });
    }

    if (birthDay) {
        birthDay.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            let value = e.target.value;
            if (value.length === 1 && parseInt(value) > 3) {
                value = '0' + value;
                e.target.value = value;
            }
            if (value.length === 2) {
                if (parseInt(value) > 31) {
                    e.target.value = '31';
                } else if (parseInt(value) < 1) {
                    e.target.value = '01';
                }
                // 다음 입력 필드로 이동 (예: 성별 라디오 버튼)
                const genderInputs = document.querySelectorAll('input[name="gender"]');
                if (genderInputs.length > 0) {
                    genderInputs[0].focus();
                }
            }
            updateBirthdate();
        });
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
        const projectValidationInput = document.querySelector('.project-validation-input');

        if (!selectedProject) {
            // 프로젝트 라디오 그룹으로 스크롤
            projectRadioGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // validation 툴팁 표시를 위한 처리
            if (projectValidationInput) {
                projectValidationInput.value = '';
                projectValidationInput.focus();
                projectValidationInput.blur();
                projectValidationInput.reportValidity();
            }
            return;
        }

        // 프로젝트가 선택되면 validation input을 유효한 상태로 만듦
        if (projectValidationInput) {
            projectValidationInput.value = 'valid';
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

    // 프로젝트 선택 시 validation input 업데이트
    projectRadioGroup.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
            const projectValidationInput = document.querySelector('.project-validation-input');
            if (projectValidationInput) {
                projectValidationInput.value = 'valid';
            }
        }
    });

    // 초기화 함수 호출
    loadProjects();
    console.log('초기화 완료');
}); 