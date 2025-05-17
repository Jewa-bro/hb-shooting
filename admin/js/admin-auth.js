// DOM 요소
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessageDiv = document.getElementById('errorMessage');
const rememberEmailCheckbox = document.getElementById('rememberEmail');

// 로그인 페이지에서만 실행
if (loginForm && emailInput && passwordInput && errorMessageDiv && rememberEmailCheckbox) {
    // 저장된 이메일 불러오기
    const savedEmail = localStorage.getItem('adminEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberEmailCheckbox.checked = true;
    }

    // 에러 메시지 표시 함수
    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.add('show');
        // 비밀번호 필드 초기화
        passwordInput.value = '';
    }

    // 에러 메시지 숨기기 함수
    function hideError() {
        errorMessageDiv.textContent = '';
        errorMessageDiv.classList.remove('show');
    }

    // 로그인 폼 제출 처리
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        
        const email = emailInput.value;
        const password = passwordInput.value;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            
            // 아이디 저장 처리
            if (rememberEmailCheckbox.checked) {
                localStorage.setItem('adminEmail', email);
            } else {
                localStorage.removeItem('adminEmail');
            }
            
            // 로그인 성공 시 대시보드로 이동
            window.location.replace('dashboard.html');
        } catch (error) {
            let errorMessage;
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = '유효하지 않은 이메일 주소입니다.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = '비활성화된 계정입니다.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = '등록되지 않은 이메일입니다.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = '잘못된 비밀번호입니다.';
                    break;
                default:
                    errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
            }
            showError(errorMessage);
        }
    });
}

let authStateChangeHandler = null;

// 인증 상태 확인
function setupAuthStateListener() {
    // 이전 리스너가 있다면 제거
    if (authStateChangeHandler) {
        authStateChangeHandler();
    }

    // 새로운 리스너 등록
    authStateChangeHandler = auth.onAuthStateChanged((user) => {
        if (user && window.location.pathname.endsWith('index.html')) {
            // 이미 로그인된 상태에서 로그인 페이지에 접근하면 대시보드로 이동
            window.location.replace('dashboard.html');
        }
    });
}

// 페이지 로드 시 인증 상태 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
    setupAuthStateListener();
});

// 페이지 언로드 시 리스너 정리
window.addEventListener('beforeunload', () => {
    if (authStateChangeHandler) {
        authStateChangeHandler();
    }
}); 