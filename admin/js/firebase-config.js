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
let app;
try {
    app = firebase.app();
} catch {
    app = firebase.initializeApp(firebaseConfig);
}

// 공통으로 사용할 Firebase 인스턴스들
const db = firebase.firestore();
const auth = firebase.auth();

console.log('=== Firebase 초기화 완료 ===');
console.log('Firebase 앱:', app.name);
console.log('Firestore 인스턴스:', !!db);
console.log('Auth 인스턴스:', !!auth); 