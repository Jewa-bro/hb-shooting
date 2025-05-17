// 슬라이더 설정
const slides = [
    {
        image: 'images/industurctor.jpg',
        title: '안전한 실내 레이저 사격',
        description: '누구나 쉽게 즐길 수 있는 레이저 사격을 경험해보세요'
    },
    {
        image: 'images/gunimage.jpg',
        title: '최신식 장비 구비',
        description: '정확한 사격을 위한 최신 레이저 장비를 구비하고 있습니다'
    },
    {
        image: 'images/concentration.jpg',
        title: '집중력 향상',
        description: '사격을 통해 집중력과 정신력을 향상시켜보세요'
    }
];

// 슬라이드 동적 생성
const swiperWrapper = document.querySelector('.swiper-wrapper');
slides.forEach(slide => {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'swiper-slide';
    slideDiv.innerHTML = `
        <img src="${slide.image}" alt="${slide.title}">
        <div class="slide-content">
            <h3>${slide.title}</h3>
            <p>${slide.description}</p>
        </div>
    `;
    swiperWrapper.appendChild(slideDiv);
});

// Swiper 초기화
const swiper = new Swiper('.swiper', {
    init: false, // 수동 초기화
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true, // 동적 불릿 추가
        dynamicMainBullets: 1
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    on: {
        init: function() {
            this.update(); // 초기화 시 업데이트
        }
    }
});

// Swiper 수동 초기화
swiper.init();

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

// 공지사항 로드 및 표시
async function loadNotices() {
    try {
        const snapshot = await db.collection('notices')
            .where('isVisible', '==', true)  // 노출 상태인 공지사항만 가져오기
            .get();

        const noticeList = document.querySelector('.notice-list');
        noticeList.innerHTML = ''; // 기존 내용 초기화

        if (snapshot.empty) {
            noticeList.innerHTML = '<div class="no-notices">등록된 공지사항이 없습니다.</div>';
            return;
        }

        // 문서들을 배열로 변환하고 order 필드로 정렬
        const notices = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            notices.push({
                id: doc.id,
                ...data,
                order: data.order || Number.MAX_SAFE_INTEGER // order가 없는 경우 맨 뒤로
            });
        });

        // order 기준으로 정렬
        notices.sort((a, b) => a.order - b.order);

        notices.forEach(notice => {
            const date = notice.createdAt ? notice.createdAt.toDate().toLocaleDateString() : '날짜 없음';
            
            const noticeItem = document.createElement('div');
            noticeItem.className = 'notice-item';
            
            noticeItem.innerHTML = `
                <div class="notice-header">
                    <span class="notice-date">${date}</span>
                </div>
                <h3>${notice.title || ''}</h3>
                <p>${notice.description || ''}</p>
                <a href="notice-detail.html?id=${notice.id}" class="notice-footer">
                    <span class="notice-link">자세히 보기</span>
                </a>
            `;
            
            noticeList.appendChild(noticeItem);
        });
    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        const noticeList = document.querySelector('.notice-list');
        noticeList.innerHTML = '<div class="error-message">공지사항을 불러오는데 실패했습니다.</div>';
    }
}

// 페이지 로드 시 공지사항 불러오기
document.addEventListener('DOMContentLoaded', loadNotices);

// 스크롤 시 헤더 스타일 변경
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    } else {
        header.style.backgroundColor = '#fff';
    }
});

// 스무스 스크롤 기능 추가
const initSmoothScroll = () => {
    const navLinks = document.querySelectorAll('.nav a, .logo-container');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // 모바일 메뉴가 열려있다면 닫기
                    if (window.innerWidth <= 768) {
                        const nav = document.querySelector('.nav');
                        nav.classList.remove('active');
                        nav.style.display = 'none';
                    }
                }
            }
        });
    });
};

// 모바일 메뉴 토글
const createMobileMenu = () => {
    const nav = document.querySelector('.nav');
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.innerHTML = '☰';
    menuButton.style.display = 'none';

    // 모바일 화면에서만 메뉴 버튼 표시
    const checkScreenSize = () => {
        if (window.innerWidth <= 768) {
            menuButton.style.display = 'block';
            nav.classList.remove('active');
            nav.style.display = 'none';
        } else {
            menuButton.style.display = 'none';
            nav.style.display = 'block';
        }
    };

    menuButton.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
            nav.classList.remove('active');
            nav.style.display = 'none';
        } else {
            nav.classList.add('active');
            nav.style.display = 'block';
        }
    });

    // 메뉴 항목 클릭시 메뉴 닫기
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                nav.classList.remove('active');
                nav.style.display = 'none';
            }
        });
    });

    document.querySelector('.header .container').prepend(menuButton);
    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();
};

// 네이버 지도 초기화
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

    // 네이버 맵 API가 로드되었는지 확인
    if (typeof naver === 'undefined') {
        console.error('Naver Maps API not loaded');
        mapContainer.innerHTML = '<div style="padding: 20px; text-align: center;">지도를 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.</div>';
        return;
    }

    // naver.maps 객체가 있는지 확인
    if (!naver.maps) {
        console.error('Naver Maps module not loaded');
        mapContainer.innerHTML = '<div style="padding: 20px; text-align: center;">지도를 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.</div>';
        return;
    }

    try {
        const mapOptions = {
            center: new naver.maps.LatLng(36.3614132, 127.3826455),
            zoom: 15,
            zoomControl: true,
            zoomControlOptions: {
                position: naver.maps.Position.TOP_RIGHT
            }
        };

        const map = new naver.maps.Map(mapContainer, mapOptions);

        // 마커 추가
        const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(36.3614132, 127.3826455),
            map: map
        });

        // 정보창 추가
        const contentString = [
            '<div class="iw_inner" style="padding:10px;min-width:200px;text-align:center;">',
            '   <h4 style="margin-bottom:5px;color:#1e3a8a;">대전HB슈팅클럽</h4>',
            '   <p style="font-size:13px;color:#666;">대전광역시 대덕대로 317번길 20<br/>선사엔조이 5층</p>',
            '</div>'
        ].join('');

        const infowindow = new naver.maps.InfoWindow({
            content: contentString,
            maxWidth: 300,
            backgroundColor: "#fff",
            borderColor: "#ddd",
            borderWidth: 1,
            anchorSize: new naver.maps.Size(20, 20),
            anchorSkew: true,
            pixelOffset: new naver.maps.Point(0, -10)
        });

        naver.maps.Event.addListener(marker, "click", function(e) {
            if (infowindow.getMap()) {
                infowindow.close();
            } else {
                infowindow.open(map, marker);
            }
        });

        // 초기에 정보창 표시
        infowindow.open(map, marker);

        // 지도 로드 완료 후 콘솔에 로그
        naver.maps.Event.once(map, 'init_stylemap', function() {
            console.log('Map initialized successfully');
        });

    } catch (error) {
        console.error('Error initializing map:', error);
        mapContainer.innerHTML = '<div style="padding: 20px; text-align: center;">지도를 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.</div>';
    }
}

// DOM이 완전히 로드된 후 지도 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 약간의 지연을 주어 API가 완전히 로드되도록 함
    setTimeout(initMap, 500);
});

// 초기화 함수 호출
window.addEventListener('load', () => {
    createMobileMenu();
    initSmoothScroll();
});

// 네이버 지도 인증 실패 핸들러
window.navermap_authFailure = function() {
    console.error('네이버 지도 인증 실패');
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = '<div style="padding: 20px; text-align: center;">네이버 지도 인증에 실패했습니다.<br>관리자에게 문의해주세요.</div>';
    }
}; 