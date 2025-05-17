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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// DOM 요소
const noticeTitle = document.getElementById('noticeTitle');
const noticeDate = document.getElementById('noticeDate');
const noticeContentContainer = document.getElementById('noticeContent');
const noticeContentArea = document.querySelector('.notice-content');
const applicationButtonContainer = document.getElementById('applicationButtonContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const loadingText = document.getElementById('loadingText');

// URL에서 공지사항 ID 가져오기
const urlParams = new URLSearchParams(window.location.search);
const noticeId = urlParams.get('id');

// 로딩 상태 표시/숨김 함수
function showLoading() {
    loadingSpinner.style.display = 'block';
    loadingText.style.display = 'block';
    noticeContentContainer.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
    loadingText.style.display = 'none';
    noticeContentContainer.style.display = 'block';
}

// 공지사항 로드
async function loadNoticeDetail() {
    if (!noticeId) {
        window.location.href = 'index.html#notice';
        return;
    }

    showLoading();

    try {
        const doc = await db.collection('notices').doc(noticeId).get();
        
        if (!doc.exists) {
            hideLoading();
            noticeContentArea.innerHTML = '<p class="error-message">존재하지 않는 공지사항입니다.</p>';
            return;
        }

        const notice = doc.data();
        
        // 제목 설정
        noticeTitle.textContent = notice.title || '';
        
        // 날짜 설정
        const date = notice.createdAt ? notice.createdAt.toDate().toLocaleDateString() : '날짜 없음';
        noticeDate.textContent = `작성일: ${date}`;
        
        // 내용 설정 (줄바꿈 유지)
        const content = notice.content || notice.description || '내용이 없습니다.';
        noticeContentArea.innerHTML = content.replace(/\\n/g, '<br>');

        // 문서 제목 업데이트
        document.title = `${notice.title} - 대전HB슈팅클럽`;

        // 신청하기 버튼 표시 여부 확인 및 추가
        const noticeActions = document.querySelector('.notice-actions');
        if (noticeActions) {
            // 기존 버튼들 초기화
            noticeActions.innerHTML = '';
            
            // 목록으로 버튼
            const leftActions = document.createElement('div');
            leftActions.className = 'left-actions';
            
            const backButton = document.createElement('a');
            backButton.href = 'index.html';
            backButton.className = 'back-button';
            backButton.innerHTML = '<i class="fas fa-arrow-left"></i> 홈으로';
            
            leftActions.appendChild(backButton);
            noticeActions.appendChild(leftActions);

            // 신청하기가 활성화된 경우에만 버튼 추가
            if (notice.content && notice.content.includes('application-button')) {
                const rightActions = document.createElement('div');
                rightActions.className = 'right-actions';
                
                const applyButton = document.createElement('a');
                applyButton.href = `application-form.html?noticeId=${noticeId}`;
                applyButton.className = 'application-button';
                applyButton.innerHTML = '<i class="fas fa-pen"></i> 신청하기';
                
                rightActions.appendChild(applyButton);
                noticeActions.appendChild(rightActions);
            }
        }

        hideLoading();

    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        hideLoading();
        noticeContentArea.innerHTML = '<p class="error-message">공지사항을 불러오는데 실패했습니다.</p>';
    }
}

// 페이지 로드 시 공지사항 로드
document.addEventListener('DOMContentLoaded', loadNoticeDetail); 