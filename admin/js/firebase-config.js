// Firebase 구성 및 초기화를 IIFE로 감싸서 전역 변수 충돌 방지
const { db, auth } = (() => {
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

    // Firebase 앱이 이미 초기화되었는지 확인
    const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

    // 공통으로 사용할 Firebase 인스턴스들
    return {
        db: firebase.firestore(),
        auth: firebase.auth()
    };
})(); 