// 공지사항 로드 및 표시
document.addEventListener('DOMContentLoaded', async function() {
    const noticeList = document.querySelector('.notice-list');
    if (!noticeList) return;

    try {
        const querySnapshot = await db.collection('notices')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        if (querySnapshot.empty) {
            noticeList.innerHTML = '<p class="no-notice">등록된 공지사항이 없습니다.</p>';
            return;
        }

        const notices = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return `
                <div class="notice-item">
                    <a href="notice-detail.html?id=${doc.id}">
                        <h3>${data.title}</h3>
                        <p>${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}</p>
                        <span class="date">${new Date(data.createdAt.toDate()).toLocaleDateString()}</span>
                    </a>
                </div>
            `;
        });

        noticeList.innerHTML = notices.join('');
    } catch (error) {
        console.error('공지사항을 불러오는 중 오류가 발생했습니다:', error);
        noticeList.innerHTML = '<p class="error">공지사항을 불러오는 중 오류가 발생했습니다.</p>';
    }
}); 