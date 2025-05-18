// Swiper 설정
document.addEventListener('DOMContentLoaded', function() {
    const swiper = new Swiper('.swiper', {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // 슬라이드 이미지 추가
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    const images = [
        { src: 'images/gunimage.jpg', alt: '레이저 사격 체험' },
        { src: 'images/concentration.jpg', alt: '집중력 향상' },
        { src: 'images/industurctor.jpg', alt: '전문 강사진' }
    ];

    images.forEach(image => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `<img src="${image.src}" alt="${image.alt}">`;
        swiperWrapper.appendChild(slide);
    });
}); 