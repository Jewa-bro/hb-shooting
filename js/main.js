// Swiper 초기화
const swiper = new Swiper('.swiper', {
    // 기본 설정
    direction: 'horizontal',
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },

    // 페이지네이션
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },

    // 네비게이션 화살표
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

// 슬라이더 이미지 데이터
const sliderImages = [
    {
        src: 'images/industurctor.jpg',
        alt: '전문 강사의 사격 교육',
        title: '전문 강사진의 체계적인 교육',
        description: '국가대표 출신 전문 강사진이 안전하고 체계적인 교육을 제공합니다.'
    }
];

// 슬라이더 이미지 동적 추가
const swiperWrapper = document.querySelector('.swiper-wrapper');
sliderImages.forEach(image => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `
        <img src="${image.src}" alt="${image.alt}">
        <div class="slide-content">
            <h3>${image.title}</h3>
            <p>${image.description}</p>
        </div>
    `;
    swiperWrapper.appendChild(slide);
});

// 공지사항 데이터
const notices = [
    {
        title: '5월 운영시간 안내',
        content: '5월 연휴 기간 정상 운영합니다. (10:00-22:00)'
    },
    {
        title: '단체 예약 안내',
        content: '10인 이상 단체 예약시 10% 할인 혜택을 드립니다.'
    },
    {
        title: '초보자 강습 프로그램',
        content: '매주 토요일 오전 11시 초보자 무료 강습을 진행합니다.'
    }
];

// 공지사항 동적 추가
const noticeList = document.querySelector('.notice-list');
notices.forEach(notice => {
    const noticeItem = document.createElement('div');
    noticeItem.className = 'notice-item';
    noticeItem.innerHTML = `
        <h3>${notice.title}</h3>
        <p>${notice.content}</p>
    `;
    noticeList.appendChild(noticeItem);
});

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

createMobileMenu();
initSmoothScroll(); 