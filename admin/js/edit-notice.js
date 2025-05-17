// Firebase 인스턴스는 firebase-config.js에서 가져옵니다.
if (typeof db === 'undefined') {
    const db = firebase.firestore();
}

// DOM 요소
let pageTitle, submitButton, deleteButton, editForm, editor, noticeTitle, noticeDescription, noticeVisibility;

// URL에서 공지사항 ID 가져오기
const urlParams = new URLSearchParams(window.location.search);
const noticeId = urlParams.get('id');

// DOM 요소 초기화
function initializeElements() {
    pageTitle = document.getElementById('pageTitle');
    submitButton = document.getElementById('submitButton');
    deleteButton = document.getElementById('deleteButton');
    editForm = document.getElementById('editNoticeForm');
    editor = document.getElementById('editor');
    noticeTitle = document.getElementById('noticeTitle');
    noticeDescription = document.getElementById('noticeDescription');
    noticeVisibility = document.getElementById('noticeVisibility');

    if (!pageTitle || !submitButton || !editForm || !editor || !noticeTitle || !noticeDescription || !noticeVisibility) {
        console.error('필수 DOM 요소를 찾을 수 없습니다.');
        return false;
    }
    return true;
}

// 페이지 초기화
async function initializePage() {
    if (!initializeElements()) {
        alert('페이지 초기화에 실패했습니다.');
        return;
    }

    if (noticeId) {
        // 수정 모드
        pageTitle.textContent = '공지사항 수정';
        submitButton.textContent = '수정';
        deleteButton.style.display = 'block';
        await loadNoticeData();
    } else {
        // 생성 모드
        pageTitle.textContent = '공지사항 작성';
        submitButton.textContent = '등록';
        deleteButton.style.display = 'none';
    }
    setupEditor();
    setupDeleteButton();
}

// 공지사항 데이터 로드
async function loadNoticeData() {
    try {
        const doc = await db.collection('notices').doc(noticeId).get();
        if (doc.exists) {
            const notice = doc.data();
            noticeTitle.value = notice.title || '';
            noticeDescription.value = notice.description || '';
            noticeVisibility.checked = notice.isVisible || false;
            editor.innerHTML = notice.content || '';
        } else {
            alert('존재하지 않는 공지사항입니다.');
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        alert('공지사항을 불러오는데 실패했습니다.');
    }
}

// 에디터 설정
function setupEditor() {
    const toolbar = document.querySelector('.editor-toolbar');
    if (!toolbar) {
        console.error('에디터 툴바를 찾을 수 없습니다.');
        return;
    }
    
    // 초기 상태 설정
    updateApplicationButtonState();
    
    // 툴바 버튼 이벤트 처리
    toolbar.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        e.preventDefault();
        const command = button.dataset.command;

        if (command === 'createLink') {
            const url = prompt('링크 URL을 입력하세요:');
            if (url) document.execCommand(command, false, url);
        } else if (command === 'insertApplicationButton') {
            // 신청하기 상태 토글
            const hasApplicationMarker = editor.querySelector('.application-button');
            if (hasApplicationMarker) {
                hasApplicationMarker.remove();
            } else {
                const marker = document.createElement('span');
                marker.style.display = 'none';
                marker.className = 'application-button';
                editor.appendChild(marker);
            }
            updateApplicationButtonState();
        } else {
            document.execCommand(command, false, null);
            if (!['bold', 'italic', 'underline'].includes(command)) {
                button.classList.toggle('active');
            }
        }
    });

    // 글자 크기 선택 이벤트
    const fontSizeSelect = toolbar.querySelector('.font-size');
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            document.execCommand('fontSize', false, e.target.value);
        });
    }

    // 신청하기 버튼 상태 업데이트 함수
    function updateApplicationButtonState() {
        const hasApplicationMarker = editor.querySelector('.application-button');
        const applicationButton = toolbar.querySelector('[data-command="insertApplicationButton"]');
        
        if (hasApplicationMarker) {
            applicationButton.classList.add('active');
            applicationButton.style.backgroundColor = '#1a73e8';
            applicationButton.style.color = 'white';
            applicationButton.innerHTML = '<i class="fas fa-check"></i> 신청가능';
        } else {
            applicationButton.classList.remove('active');
            applicationButton.style.backgroundColor = '';
            applicationButton.style.color = '';
            applicationButton.innerHTML = '<i class="fas fa-pen"></i> 신청불가';
        }
    }
}

// 폼 제출 처리
function setupFormSubmission() {
    if (!editForm) return;
    
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = noticeTitle.value;
        const description = noticeDescription.value;
        const content = editor.innerHTML;
        const isVisible = noticeVisibility.checked;

        try {
            if (noticeId) {
                // 수정 모드: 기존 공지사항 업데이트
                await db.collection('notices').doc(noticeId).update({
                    title,
                    description,
                    content,
                    isVisible,
                    updatedAt: new Date()
                });
            } else {
                // 새로운 공지사항 생성
                // 가장 높은 순서 값 조회
                const snapshot = await db.collection('notices').orderBy('order', 'desc').limit(1).get();
                const lastOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order || 0;
                
                await db.collection('notices').add({
                    title,
                    description,
                    content,
                    isVisible,
                    order: lastOrder + 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('공지사항 저장 중 오류 발생:', error);
            alert('공지사항 저장 중 오류가 발생했습니다.');
        }
    });
}

// 삭제 버튼 설정
function setupDeleteButton() {
    if (!deleteButton || !noticeId) return;
    
    deleteButton.addEventListener('click', async () => {
        if (confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
            try {
                await db.collection('notices').doc(noticeId).delete();
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('공지사항 삭제 중 오류 발생:', error);
                alert('공지사항 삭제 중 오류가 발생했습니다.');
            }
        }
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupFormSubmission();
}); 