// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDZYUI9FHBdP6s3D6jlVAv6LbRfJ5uEBBk",
  authDomain: "hbshooting-ed578.firebaseapp.com",
  projectId: "hbshooting-ed578",
  storageBucket: "hbshooting-ed578.appspot.com",
  messagingSenderId: "1015643094995",
  appId: "1:1015643094995:web:c7e5e6d0f9c8e2c2b4b4b4"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firestore 인스턴스 생성
const db = firebase.firestore(); 