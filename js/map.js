// 네이버 지도 초기화
document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const location = new naver.maps.LatLng(36.3572, 127.3845); // 대전HB슈팅클럽 위치
    const mapOptions = {
        center: location,
        zoom: 17,
        zoomControl: true,
        zoomControlOptions: {
            position: naver.maps.Position.TOP_RIGHT
        }
    };

    const map = new naver.maps.Map(mapContainer, mapOptions);
    
    // 마커 추가
    const marker = new naver.maps.Marker({
        position: location,
        map: map,
        title: '대전HB슈팅클럽'
    });

    // 정보창 추가
    const contentString = [
        '<div class="iw_inner" style="padding: 10px;">',
        '   <h3 style="margin-bottom: 5px;">대전HB슈팅클럽</h3>',
        '   <p style="margin: 0;">',
        '       대전광역시 서구 둔산로 18<br/>',
        '       (둔산동 1160번지)<br/>',
        '       Tel: 010-5493-1789',
        '   </p>',
        '</div>'
    ].join('');

    const infowindow = new naver.maps.InfoWindow({
        content: contentString,
        maxWidth: 300,
        backgroundColor: "#fff",
        borderColor: "#888",
        borderWidth: 2,
        anchorSize: new naver.maps.Size(20, 10),
        anchorSkew: true,
        pixelOffset: new naver.maps.Point(20, -20)
    });

    naver.maps.Event.addListener(marker, "click", function() {
        if (infowindow.getMap()) {
            infowindow.close();
        } else {
            infowindow.open(map, marker);
        }
    });

    // 초기에 정보창 표시
    infowindow.open(map, marker);
}); 