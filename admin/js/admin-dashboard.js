// Firebase 인스턴스는 firebase-config.js에서 가져옵니다.

// DOM 요소
const logoutBtn = document.getElementById('logoutBtn');
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.dashboard-section');
const projectsList = document.getElementById('projectsList');
const addProjectBtn = document.getElementById('addProjectBtn');
const newNoticeBtn = document.getElementById('newNoticeBtn');
const noticesList = document.getElementById('noticesList');

let isLoggingOut = false;

// 로그아웃 처리
logoutBtn.addEventListener('click', async () => {
    if (isLoggingOut) return; // 중복 클릭 방지
    
    try {
        isLoggingOut = true;
        
        // 로그아웃 전에 현재 페이지의 상태를 정리
        projectsList.innerHTML = '';
        
        // Firebase 로그아웃 실행
        await auth.signOut();
        
        // 로컬 스토리지 클리어
        localStorage.removeItem('adminAuthToken');
        
        // 로그인 페이지로 리다이렉트
        window.location.replace('index.html');
    } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        alert('로그아웃 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        isLoggingOut = false;
    }
});

// 네비게이션 처리
if (navBtns.length > 0) {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.dataset.section;
            
            // 버튼 활성화 상태 변경
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 섹션 표시/숨김 처리
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// 프로젝트 목록 렌더링
async function renderProjects() {
    try {
        console.log('프로젝트 목록 로드 시작');
        console.log('DB 인스턴스:', !!db);
        
        const projectsRef = db.collection('projects');
        console.log('프로젝트 컬렉션 참조:', !!projectsRef);
        
        const snapshot = await projectsRef
            .orderBy('createdAt', 'desc')
            .get();

        projectsList.innerHTML = '';
        
        if (snapshot.empty) {
            console.log('프로젝트가 없음');
            projectsList.innerHTML = '<tr><td colspan="9" class="no-data">등록된 사업이 없습니다.</td></tr>';
            return;
        }

        // 각 프로젝트에 대해 통계 업데이트 후 렌더링
        for (const doc of snapshot.docs) {
            await updateProjectStats(doc.id);
            
            const project = doc.data();
            const row = document.createElement('tr');
            row.className = 'project-row';
            row.dataset.projectId = doc.id;
            
            row.innerHTML = `
                <td class="project-name-cell">
                    ${project.name || '제목 없음'}
                </td>
                <td>${project.description || ''}</td>
                <td>${formatDate(project.startDate)}</td>
                <td>${formatDate(project.endDate)}</td>
                <td class="total-stat">${project.totalApplications || 0}</td>
                <td class="approved-stat">${project.approvedApplications || 0}</td>
                <td class="pending-stat">${project.pendingApplications || 0}</td>
                <td class="rejected-stat">${project.rejectedApplications || 0}</td>
                <td class="action-cell">
                    <button class="edit-project-btn" data-id="${doc.id}">수정</button>
                    <button class="delete-project-btn" data-id="${doc.id}" style="margin-left: 8px;">삭제</button>
                </td>
            `;

            // 참가신청 목록 컨테이너 추가
            const applicationsContainer = document.createElement('tr');
            applicationsContainer.className = 'applications-container hidden';
            applicationsContainer.innerHTML = `
                <td colspan="9">
                    <div class="applications-grid">
                        <div class="applications-header">
                            <h3>참가신청 목록</h3>
                            <div class="applications-filters">
                                <select class="status-filter" data-project-id="${doc.id}">
                                    <option value="all">전체 보기</option>
                                    <option value="pending">대기</option>
                                    <option value="approved">승인</option>
                                    <option value="rejected">거절</option>
                                </select>
                            </div>
                        </div>
                        <table class="applications-table">
                            <thead>
                                <tr>
                                    <th>신청일</th>
                                    <th>신청자</th>
                                    <th>생년월일</th>
                                    <th>성별</th>
                                    <th>연락처</th>
                                    <th>상태</th>
                                    <th>승인순서</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody class="applications-list" data-project-id="${doc.id}">
                            </tbody>
                        </table>
                    </div>
                </td>
            `;

            projectsList.appendChild(row);
            projectsList.appendChild(applicationsContainer);

            // 수정 버튼 클릭 이벤트
            const editBtn = row.querySelector('.edit-project-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 이벤트 전파 중단
                handleEditProject(doc);
            });

            // 삭제 버튼 클릭 이벤트
            const deleteBtn = row.querySelector('.delete-project-btn');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation(); // 이벤트 전파 중단
                if (confirm('정말로 이 사업을 삭제하시겠습니까?')) {
                    try {
                        await db.collection('projects').doc(doc.id).delete();
                        await renderProjects();
                    } catch (error) {
                        console.error('사업 삭제 중 오류 발생:', error);
                        alert('사업 삭제 중 오류가 발생했습니다.');
                    }
                }
            });

            // 프로젝트 행 클릭 이벤트
            row.addEventListener('click', async (e) => {
                // 수정/삭제 버튼 클릭 시 이벤트 전파 중단
                if (e.target.closest('.edit-project-btn') || e.target.closest('.delete-project-btn')) {
                    return;
                }
                handleProjectRowClick(row, doc);
            });
        }
    } catch (error) {
        console.error('프로젝트 목록 로드 중 오류 발생:', error);
        projectsList.innerHTML = '<tr><td colspan="9" class="error-message">프로젝트 목록을 불러오는 중 오류가 발생했습니다.</td></tr>';
    }
}

// 참가신청 상태 업데이트
async function updateApplicationStatus(projectId, applicationId, status, row) {
    try {
        const container = row.closest('.applications-list');
        const applicationsContainer = container.closest('.applications-container');
        
        await db.collection('applications').doc(applicationId)
            .update({
                status: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        // 프로젝트 통계 업데이트
        await updateProjectStats(projectId);
        
        // 데이터 새로 로드
        const applications = await loadApplicationsData(projectId);
        const statusFilter = container.closest('.applications-grid').querySelector('.status-filter');
        
        // 현재 필터 상태 저장
        const currentFilter = statusFilter.value;
        
        // 승인된 신청 건들의 승인 시간순 정렬
        const approvedApplications = applications
            .filter(app => app.status === 'approved')
            .sort((a, b) => {
                const timeA = a.updatedAt ? a.updatedAt.toDate() : new Date(0);
                const timeB = b.updatedAt ? b.updatedAt.toDate() : new Date(0);
                return timeA - timeB;
            });

        // 승인 순서 맵 생성
        const approvalOrderMap = new Map();
        approvedApplications.forEach((app, index) => {
            approvalOrderMap.set(app.id, index + 1);
        });

        // 리스트 다시 렌더링
        renderApplications(applications, container, currentFilter, approvalOrderMap);
        
    } catch (error) {
        console.error('참가신청 상태 업데이트 중 오류 발생:', error);
        alert('상태 업데이트 중 오류가 발생했습니다.');
    }
}

// 프로젝트 통계 조회 함수 추가
async function getProjectStats(projectId) {
    const snapshot = await db.collection('projects').doc(projectId).get();
    return snapshot.data();
}

// 참가신청 목록 로드
async function loadApplications(projectId, container) {
    try {
        console.log('참가신청 목록 로드 시작 - 프로젝트 ID:', projectId);
        
        const snapshot = await db.collection('applications')
            .where('projectId', '==', projectId)
            .get();

        console.log('참가신청 데이터 받음:', {
            empty: snapshot.empty,
            size: snapshot.size
        });

        // 상태 필터 이벤트 리스너
        const statusFilter = container.closest('.applications-grid').querySelector('.status-filter');
        if (!statusFilter.hasEventListener) {  // 이벤트 리스너 중복 방지
            statusFilter.hasEventListener = true;
            statusFilter.addEventListener('change', () => {
                renderApplications(applications, container, statusFilter.value, approvalOrderMap);
            });
        }

        if (snapshot.empty) {
            container.innerHTML = '<tr><td colspan="8" class="no-data">참가신청 내역이 없습니다.</td></tr>';
            return;
        }

        // 데이터를 배열로 변환
        const applications = [];
        snapshot.forEach(doc => {
            applications.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // 승인된 신청 건들의 승인 시간순 정렬을 위한 배열
        const approvedApplications = applications
            .filter(app => app.status === 'approved')
            .sort((a, b) => {
                const timeA = a.updatedAt ? a.updatedAt.toDate() : new Date(0);
                const timeB = b.updatedAt ? b.updatedAt.toDate() : new Date(0);
                return timeA - timeB;
            });

        // 승인 순서 맵 생성
        const approvalOrderMap = new Map();
        approvedApplications.forEach((app, index) => {
            approvalOrderMap.set(app.id, index + 1);
        });

        // 초기 렌더링
        renderApplications(applications, container, statusFilter.value || 'all', approvalOrderMap);

    } catch (error) {
        console.error('참가신청 목록 로드 중 오류 발생:', error);
        container.innerHTML = '<tr><td colspan="8" class="error-message">참가신청 목록을 불러오는 중 오류가 발생했습니다.</td></tr>';
    }
}

// 참가신청 목록 렌더링 함수
function renderApplications(applications, container, filterStatus, approvalOrderMap) {
    container.innerHTML = '';

    // 상태 필터링
    const filteredApplications = applications.filter(application => {
        if (filterStatus === 'all') return true;
        return application.status === filterStatus;
    });

    if (filteredApplications.length === 0) {
        container.innerHTML = '<tr><td colspan="8" class="no-data">해당하는 참가신청 내역이 없습니다.</td></tr>';
        return;
    }

    // 날짜순 정렬
    filteredApplications.sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
        return dateB - dateA;
    });

    filteredApplications.forEach(application => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(application.createdAt) || ''}</td>
            <td>${application.name || ''}</td>
            <td>${formatDate(application.birthdate) || ''}</td>
            <td>${application.gender === 'male' ? '남성' : '여성'}</td>
            <td>${application.phone || ''}</td>
            <td>
                <span class="status-badge status-${application.status || 'pending'}">
                    ${getStatusText(application.status)}
                </span>
            </td>
            <td>${application.status === 'approved' ? (approvalOrderMap.get(application.id) || '-') : '-'}</td>
            <td class="action-cell">
                <button class="approve-btn ${application.status === 'approved' ? 'active' : ''}"
                        data-id="${application.id}" data-project-id="${application.projectId}">
                    승인
                </button>
                <button class="reject-btn ${application.status === 'rejected' ? 'active' : ''}"
                        data-id="${application.id}" data-project-id="${application.projectId}">
                    거절
                </button>
                <button class="delete-btn" data-id="${application.id}" data-project-id="${application.projectId}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // 기존 이벤트 리스너 설정...
        setupApplicationRowEventListeners(row, application, container);

        container.appendChild(row);
    });
}

// 참가신청 행 이벤트 리스너 설정
function setupApplicationRowEventListeners(row, application, container) {
    // 승인 버튼 클릭 이벤트
    row.querySelector('.approve-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        await updateApplicationStatus(application.projectId, application.id, 'approved', row);
    });

    // 거절 버튼 클릭 이벤트
    row.querySelector('.reject-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        await updateApplicationStatus(application.projectId, application.id, 'rejected', row);
    });

    // 삭제 버튼 클릭 이벤트
    row.querySelector('.delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('정말 이 신청을 삭제하시겠습니까?')) {
            try {
                const applicationsContainer = container.closest('.applications-container');
                await db.collection('applications').doc(application.id).delete();
                await updateProjectStats(application.projectId);
                
                // 데이터 새로 로드
                const applications = await loadApplicationsData(application.projectId);
                const statusFilter = container.closest('.applications-grid').querySelector('.status-filter');
                
                // 현재 필터 상태 저장
                const currentFilter = statusFilter.value;
                
                // 승인된 신청 건들의 승인 시간순 정렬
                const approvedApplications = applications
                    .filter(app => app.status === 'approved')
                    .sort((a, b) => {
                        const timeA = a.updatedAt ? a.updatedAt.toDate() : new Date(0);
                        const timeB = b.updatedAt ? b.updatedAt.toDate() : new Date(0);
                        return timeA - timeB;
                    });

                // 승인 순서 맵 생성
                const approvalOrderMap = new Map();
                approvedApplications.forEach((app, index) => {
                    approvalOrderMap.set(app.id, index + 1);
                });

                // 리스트 다시 렌더링
                renderApplications(applications, container, currentFilter, approvalOrderMap);
                
            } catch (error) {
                console.error('신청 삭제 중 오류 발생:', error);
                alert('신청 삭제 중 오류가 발생했습니다.');
            }
        }
    });
}

// 참가신청 데이터 로드 함수
async function loadApplicationsData(projectId) {
    const snapshot = await db.collection('applications')
        .where('projectId', '==', projectId)
        .get();

    const applications = [];
    snapshot.forEach(doc => {
        applications.push({
            id: doc.id,
            ...doc.data()
        });
    });
    return applications;
}

// 프로젝트 통계 업데이트
async function updateProjectStats(projectId) {
    try {
        console.log('프로젝트 통계 업데이트 시작:', projectId);
        
        const snapshot = await db.collection('applications')
            .where('projectId', '==', projectId)
            .get();

        console.log('신청 데이터 조회 결과:', {
            empty: snapshot.empty,
            size: snapshot.size
        });

        let stats = {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0
        };

        snapshot.forEach(doc => {
            const application = doc.data();
            stats.total++;
            
            switch (application.status) {
                case 'approved':
                    stats.approved++;
                    break;
                case 'rejected':
                    stats.rejected++;
                    break;
                default:
                    stats.pending++;
            }
        });

        console.log('계산된 통계:', stats);

        // 프로젝트 문서 업데이트
        await db.collection('projects').doc(projectId).update({
            totalApplications: stats.total,
            approvedApplications: stats.approved,
            pendingApplications: stats.pending,
            rejectedApplications: stats.rejected
        });

        // UI 업데이트
        const projectRow = document.querySelector(`tr[data-project-id="${projectId}"]`);
        if (projectRow) {
            projectRow.querySelector('.total-stat').textContent = stats.total;
            projectRow.querySelector('.approved-stat').textContent = stats.approved;
            projectRow.querySelector('.pending-stat').textContent = stats.pending;
            projectRow.querySelector('.rejected-stat').textContent = stats.rejected;
        }

        console.log('프로젝트 통계 업데이트 완료');
    } catch (error) {
        console.error('프로젝트 통계 업데이트 중 오류 발생:', error);
    }
}

// 새 프로젝트 추가
addProjectBtn.addEventListener('click', () => {
    const row = document.createElement('tr');
    row.className = 'edit-mode';
    row.innerHTML = `
        <td>
            <input type="text" class="project-name" placeholder="사업명" required>
        </td>
        <td>
            <textarea class="project-description" placeholder="세부사항"></textarea>
        </td>
        <td>
            <input type="text" class="project-start-date" placeholder="시작일">
        </td>
        <td>
            <input type="text" class="project-end-date" placeholder="종료일">
        </td>
        <td colspan="4"></td>
        <td class="action-cell">
            <button class="save-project-btn">저장</button>
            <button class="cancel-project-btn" style="margin-left: 8px;">취소</button>
        </td>
    `;

    projectsList.insertBefore(row, projectsList.firstChild);

    // Flatpickr 초기화
    initializeDatePickers(row);

    // 저장 버튼 클릭 이벤트
    row.querySelector('.save-project-btn').addEventListener('click', async () => {
        const name = row.querySelector('.project-name').value.trim();
        const description = row.querySelector('.project-description').value.trim();
        const startDate = row.querySelector('.project-start-date')._flatpickr.selectedDates[0];
        const endDate = row.querySelector('.project-end-date')._flatpickr.selectedDates[0];

        if (!name || !startDate || !endDate) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        try {
            await db.collection('projects').add({
                name,
                description,
                startDate,
                endDate,
                createdAt: new Date(),
                totalApplications: 0,
                approvedApplications: 0,
                pendingApplications: 0,
                rejectedApplications: 0
            });

            await renderProjects();
        } catch (error) {
            console.error('프로젝트 추가 중 오류 발생:', error);
        }
    });

    // 취소 버튼 클릭 이벤트
    row.querySelector('.cancel-project-btn').addEventListener('click', () => {
        row.remove();
    });
});

// Flatpickr 초기화 함수
function initializeDatePickers(container) {
    const dateInputs = container.querySelectorAll('.project-start-date, .project-end-date');
    dateInputs.forEach(input => {
        flatpickr(input, {
            locale: 'ko',
            dateFormat: 'Y-m-d',
            altInput: false,
            allowInput: true
        });
        // 입력 필드 스타일 조정
        input.style.width = '120px';
    });
}

// 날짜 포맷 함수
function formatDate(date) {
    if (!date) return '';
    if (typeof date === 'string') return date;
    
    const d = date.toDate ? date.toDate() : new Date(date);
    
    // createdAt 필드인 경우 시간까지 표시
    if (date.seconds && date.nanoseconds) {
        return d.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }
    
    // 그 외의 날짜는 기존 형식대로 표시
    return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 상태 텍스트 반환 함수
function getStatusText(status) {
    switch (status) {
        case 'approved':
            return '승인';
        case 'rejected':
            return '거절';
        default:
            return '대기';
    }
}

// 인증 상태 확인
let authStateChangeHandler = null;
let initialAuthCheckDone = false;

function setupAuthStateListener() {
    // 이전 리스너가 있다면 제거
    if (authStateChangeHandler) {
        authStateChangeHandler();
    }

    // 새로운 리스너 등록
    authStateChangeHandler = auth.onAuthStateChanged((user) => {
        if (!user && !isLoggingOut && window.location.pathname.endsWith('dashboard.html')) {
            // 로그아웃 상태이고 대시보드 페이지에 있을 때만 리다이렉트
            window.location.replace('index.html');
        } else if (user && !initialAuthCheckDone) {
            // 최초 인증 확인 후 데이터 로드
            initialAuthCheckDone = true;
            renderProjects();
        }
    });
}

// 페이지 로드 시 인증 상태 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
    console.log("--- Date/Time Diagnosis ---");
    const now = new Date();
    console.log("Current Date Object (from 'new Date()'):", now);
    console.log("Formatted with toString():", now.toString());
    console.log("Formatted as UTC (toISOString()):", now.toISOString());
    console.log("Formatted with toLocaleString('ko-KR') (client's default timezone):", now.toLocaleString('ko-KR'));
    console.log("Formatted with toLocaleDateString('ko-KR') (client's default timezone):", now.toLocaleDateString('ko-KR'));
    try {
        console.log("Attempting toLocaleString with Asia/Seoul timezone:", now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
    } catch (e) {
        console.warn("Could not format with explicit Asia/Seoul timezone. This might indicate an issue with Intl API support or timezone data in this browser environment.", e);
    }
    console.log("Client's reported timezone offset from UTC (minutes):", now.getTimezoneOffset());
    console.log("--- End Date/Time Diagnosis ---");

    if (logoutBtn) {
        setupAuthStateListener();
    }
    if (noticesList) {
        loadNotices();
    }
});

// 페이지 언로드 시 리스너 정리
window.addEventListener('beforeunload', () => {
    if (authStateChangeHandler) {
        authStateChangeHandler();
    }
});

// 새 공지사항 버튼 클릭 이벤트
if (newNoticeBtn) {
    newNoticeBtn.addEventListener('click', () => {
        window.location.href = 'edit-notice.html';
    });
}

// 공지사항 목록 로드
async function loadNotices() {
    if (!noticesList) return;
    
    try {
        // 모든 공지사항을 가져오도록 수정
        const snapshot = await db.collection('notices')
            .orderBy('createdAt', 'desc')  // 임시로 생성일 기준 정렬
            .get();

        noticesList.innerHTML = '';
        
        if (snapshot.empty) {
            noticesList.innerHTML = '<tr><td colspan="7" class="no-data">등록된 공지사항이 없습니다.</td></tr>';
            return;
        }

        let notices = [];
        let maxOrder = 0;
        
        // 첫 번째 순회: 최대 order 값 찾기와 데이터 수집
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.order && data.order > maxOrder) {
                maxOrder = data.order;
            }
            notices.push({ id: doc.id, ...data });
        });

        // order 필드가 없는 문서들에 대해 순차적으로 값 할당
        const batch = db.batch();
        notices = notices.map((notice, index) => {
            if (typeof notice.order === 'undefined') {
                const newOrder = maxOrder + index + 1;
                notice.order = newOrder;
                
                // Firestore 업데이트를 위한 배치 작업 추가
                const docRef = db.collection('notices').doc(notice.id);
                batch.update(docRef, { order: newOrder });
            }
            return notice;
        });

        // 배치 작업 실행
        await batch.commit();

        // order 기준으로 정렬
        notices.sort((a, b) => a.order - b.order);

        notices.forEach((notice, index) => {
            const row = document.createElement('tr');
            row.className = 'notice-row';
            row.draggable = true;
            row.dataset.id = notice.id;
            row.dataset.order = notice.order;
            
            row.innerHTML = `
                <td class="notice-number">${index + 1}</td>
                <td class="notice-title">${notice.title || ''}</td>
                <td class="notice-description">${notice.description || ''}</td>
                <td>${formatDate(notice.createdAt)}</td>
                <td>${notice.updatedAt ? formatDate(notice.updatedAt) : '-'}</td>
                <td>
                    <button class="visibility-toggle-btn ${notice.isVisible ? 'visible' : ''}" data-id="${notice.id}">
                        <i class="fas ${notice.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                        ${notice.isVisible ? '노출' : '숨김'}
                    </button>
                </td>
                <td class="action-cell">
                    <button class="edit-notice-btn" data-id="${notice.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-notice-btn" data-id="${notice.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            setupDragAndDrop(row);
            setupNoticeRowEventListeners(row, notice);
            noticesList.appendChild(row);
        });
    } catch (error) {
        console.error('공지사항 목록 로드 중 오류 발생:', error);
        if (noticesList) {
            noticesList.innerHTML = '<tr><td colspan="7" class="error-message">공지사항 목록을 불러오는 중 오류가 발생했습니다.</td></tr>';
        }
    }
}

// 드래그 앤 드롭 설정
function setupDragAndDrop(row) {
    row.addEventListener('dragstart', (e) => {
        row.classList.add('dragging');
        e.dataTransfer.setData('text/plain', row.dataset.id);
    });

    row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });

    row.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingRow = document.querySelector('.dragging');
        if (draggingRow === row) return;
        
        row.classList.add('drag-over');
    });

    row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over');
    });

    row.addEventListener('drop', async (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');
        
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedRow = document.querySelector(`[data-id="${draggedId}"]`);
        if (!draggedRow || draggedRow === row) return;

        const draggedOrder = parseInt(draggedRow.dataset.order);
        const targetOrder = parseInt(row.dataset.order);

        // 순서 업데이트
        await updateNoticesOrder(draggedId, draggedOrder, targetOrder);
        
        // 목록 새로고침
        await loadNotices();
    });
}

// 공지사항 순서 업데이트
async function updateNoticesOrder(draggedId, oldOrder, newOrder) {
    try {
        const batch = db.batch();
        const notices = await db.collection('notices').get();
        
        notices.forEach(doc => {
            const notice = doc.data();
            const order = notice.order || 0;
            let newOrderValue = order;

            if (doc.id === draggedId) {
                newOrderValue = newOrder;
            } else if (oldOrder < newOrder && order > oldOrder && order <= newOrder) {
                newOrderValue = order - 1;
            } else if (oldOrder > newOrder && order >= newOrder && order < oldOrder) {
                newOrderValue = order + 1;
            }

            if (newOrderValue !== order) {
                batch.update(doc.ref, { order: newOrderValue });
            }
        });

        await batch.commit();
    } catch (error) {
        console.error('순서 업데이트 중 오류 발생:', error);
        alert('순서 변경 중 오류가 발생했습니다.');
    }
}

// 공지사항 행 이벤트 리스너 설정
function setupNoticeRowEventListeners(row, notice) {
    // 노출 상태 토글 버튼 이벤트
    const visibilityBtn = row.querySelector('.visibility-toggle-btn');
    if (visibilityBtn) {
        visibilityBtn.addEventListener('click', async () => {
            try {
                // 현재 상태를 반전
                notice.isVisible = !notice.isVisible;
                
                // Firestore 업데이트
                await db.collection('notices').doc(notice.id).update({
                    isVisible: notice.isVisible,
                    updatedAt: new Date()
                });
                
                // UI 업데이트
                visibilityBtn.className = `visibility-toggle-btn ${notice.isVisible ? 'visible' : ''}`;
                visibilityBtn.innerHTML = `
                    <i class="fas ${notice.isVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    ${notice.isVisible ? '노출' : '숨김'}
                `;
            } catch (error) {
                console.error('노출 상태 변경 중 오류 발생:', error);
                alert('노출 상태 변경 중 오류가 발생했습니다.');
                // 오류 발생 시 상태 되돌리기
                notice.isVisible = !notice.isVisible;
            }
        });
    }

    // 수정 버튼 클릭 이벤트
    const editBtn = row.querySelector('.edit-notice-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            window.location.href = `edit-notice.html?id=${notice.id}`;
        });
    }

    // 삭제 버튼 클릭 이벤트
    const deleteBtn = row.querySelector('.delete-notice-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
                try {
                    await db.collection('notices').doc(notice.id).delete();
                    await loadNotices();
                } catch (error) {
                    console.error('공지사항 삭제 중 오류 발생:', error);
                    alert('공지사항 삭제 중 오류가 발생했습니다.');
                }
            }
        });
    }
}

// 프로젝트 수정 핸들러 함수
async function handleEditProject(doc) {
    try {
        const projectData = doc.data();
        const row = document.querySelector(`tr[data-project-id="${doc.id}"]`);
        
        // 수정 모드 클래스 추가
        row.classList.add('edit-mode');
        
        // 수정 모드로 전환
        row.innerHTML = `
            <td>
                <input type="text" class="project-name" value="${projectData.name || ''}" placeholder="사업명 입력" required>
            </td>
            <td>
                <textarea class="project-description" placeholder="세부사항 입력">${projectData.description || ''}</textarea>
            </td>
            <td>
                <input type="text" class="project-start-date" value="${projectData.startDate ? projectData.startDate.toDate().toISOString().split('T')[0] : ''}" placeholder="시작일 선택" required>
            </td>
            <td>
                <input type="text" class="project-end-date" value="${projectData.endDate ? projectData.endDate.toDate().toISOString().split('T')[0] : ''}" placeholder="종료일 선택" required>
            </td>
            <td class="total-stat">${projectData.totalApplications || 0}</td>
            <td class="approved-stat">${projectData.approvedApplications || 0}</td>
            <td class="pending-stat">${projectData.pendingApplications || 0}</td>
            <td class="rejected-stat">${projectData.rejectedApplications || 0}</td>
            <td class="action-cell">
                <button class="save-edit-btn" data-id="${doc.id}">저장</button>
                <button class="cancel-edit-btn" data-id="${doc.id}">취소</button>
            </td>
        `;

        // Flatpickr 초기화 전에 날짜 값을 변수에 저장
        const startDate = projectData.startDate ? projectData.startDate.toDate() : null;
        const endDate = projectData.endDate ? projectData.endDate.toDate() : null;

        // Flatpickr 초기화
        const startDatePicker = flatpickr(row.querySelector('.project-start-date'), {
            locale: 'ko',
            dateFormat: 'Y-m-d',
            defaultDate: startDate
        });

        const endDatePicker = flatpickr(row.querySelector('.project-end-date'), {
            locale: 'ko',
            dateFormat: 'Y-m-d',
            defaultDate: endDate
        });

        // 저장 버튼 이벤트 리스너
        const saveBtn = row.querySelector('.save-edit-btn');
        saveBtn.addEventListener('click', async () => {
            const name = row.querySelector('.project-name').value.trim();
            const description = row.querySelector('.project-description').value.trim();
            const startDateInput = row.querySelector('.project-start-date');
            const endDateInput = row.querySelector('.project-end-date');
            
            if (!name) {
                alert('사업명을 입력해주세요.');
                return;
            }
            if (!startDateInput.value) {
                alert('시작일을 선택해주세요.');
                return;
            }
            if (!endDateInput.value) {
                alert('종료일을 선택해주세요.');
                return;
            }

            try {
                // 저장 버튼 비활성화
                saveBtn.disabled = true;
                saveBtn.textContent = '수정 중...';
                const startDate = new Date(startDateInput.value);
                const endDate = new Date(endDateInput.value);

                await db.collection('projects').doc(doc.id).update({
                    name,
                    description,
                    startDate,
                    endDate,
                    updatedAt: new Date()
                });

                // 수정 모드 클래스 제거
                row.classList.remove('edit-mode');
                
                await renderProjects();
            } catch (error) {
                console.error('프로젝트 수정 중 오류 발생:', error);
                alert('프로젝트 수정 중 오류가 발생했습니다.');
                // 저장 버튼 다시 활성화
                saveBtn.disabled = false;
                saveBtn.textContent = '저장';
            }
        });

        // 취소 버튼 이벤트 리스너
        row.querySelector('.cancel-edit-btn').addEventListener('click', async () => {
            // 수정 모드 클래스 제거
            row.classList.remove('edit-mode');
            await renderProjects();
        });

    } catch (error) {
        console.error('프로젝트 수정 모드 전환 중 오류 발생:', error);
        alert('프로젝트 수정 모드 전환 중 오류가 발생했습니다.');
    }
}

// 프로젝트 행 클릭 이벤트 처리
function handleProjectRowClick(row, doc) {
    const container = row.nextElementSibling;
    const allRows = document.querySelectorAll('.project-row');
    
    // 다른 모든 행의 선택 상태 제거
    allRows.forEach(r => {
        if (r !== row) {
            r.classList.remove('selected');
            const nextContainer = r.nextElementSibling;
            if (nextContainer && nextContainer.classList.contains('applications-container')) {
                nextContainer.classList.remove('expanded');
                setTimeout(() => {
                    nextContainer.classList.add('hidden');
                }, 300);
            }
        }
    });
    
    // 현재 행의 선택 상태 토글
    row.classList.toggle('selected');
    
    // 컨테이너 애니메이션
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        // 약간의 지연 후 expanded 클래스 추가
        setTimeout(() => {
            container.classList.add('expanded');
        }, 10);
        
        console.log('참가신청 목록 로드 시작:', doc.id);
        // 참가신청 목록 로드 및 통계 업데이트
        loadApplications(doc.id, container.querySelector('.applications-list'));
        updateProjectStats(doc.id);
    } else {
        container.classList.remove('expanded');
        // 애니메이션 완료 후 hidden 클래스 추가
        setTimeout(() => {
            container.classList.add('hidden');
        }, 300);
    }
} 