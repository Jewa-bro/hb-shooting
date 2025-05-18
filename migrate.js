const admin = require('firebase-admin');
require('dotenv').config();

// 필수 환경 변수 검증
const requiredEnvVars = [
  'FIREBASE_TYPE',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_AUTH_URI',
  'FIREBASE_TOKEN_URI',
  'FIREBASE_AUTH_PROVIDER_CERT_URL',
  'FIREBASE_CLIENT_CERT_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('다음 환경 변수가 설정되지 않았습니다:', missingEnvVars.join(', '));
  console.error('.env 파일이 프로젝트 루트 디렉토리에 있는지 확인해주세요.');
  process.exit(1);
}

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateApplications() {
  try {
    console.log('=== 마이그레이션 시작 ===');

    // 1. 기존 applications 컬렉션에서 고유한 program 값 추출
    console.log('[1/4] 기존 applications 컬렉션에서 고유한 program 값 추출 중...');
    const applicationsSnapshot = await db.collection('applications').get();
    const programSet = new Set();
    
    applicationsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.program) {
        programSet.add(data.program);
      }
    });
    console.log('추출된 고유 program ID 개수:', programSet.size);
    console.log('고유 program ID 목록:', Array.from(programSet));
    if (programSet.size === 0) {
        console.log('처리할 program ID가 없습니다. 마이그레이션을 종료합니다.');
        process.exit(0);
    }

    // 2. 각 program에 대해 새로운 project 생성
    console.log('\n[2/4] 각 program ID에 대해 새로운 project 문서 생성 중...');
    const programToProjectMap = new Map();
    
    for (const originalProgramId of programSet) {
      // Firestore에서 projects 컬렉션에 해당 originalProgramId로 이미 생성된 project가 있는지 확인
      const existingProjectQuery = await db.collection('projects').where('originalProgramId', '==', originalProgramId).limit(1).get();
      
      if (!existingProjectQuery.empty) {
        const existingProjectId = existingProjectQuery.docs[0].id;
        programToProjectMap.set(originalProgramId, existingProjectId);
        console.log(`Program ID ${originalProgramId}에 대한 Project가 이미 존재합니다. 기존 Project ID 사용: ${existingProjectId}`);
      } else {
        const projectRef = await db.collection('projects').add({
          name: `사업 ${originalProgramId}`, // 실제 사업명은 나중에 수정 필요
          details: '기존 데이터에서 마이그레이션됨',
          startDate: null,
          endDate: null,
          originalProgramId: originalProgramId, // 원래 program ID 저장
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          stats: { total: 0, approved: 0, pending: 0, rejected: 0 }
        });
        programToProjectMap.set(originalProgramId, projectRef.id);
        console.log(`Program ID ${originalProgramId}에 대한 새 Project 생성 완료. 새 Project ID: ${projectRef.id}`);
      }
    }
    console.log('Program ID 와 새 Project ID 매핑 완료:', Array.from(programToProjectMap.entries()));

    // 3. applications 컬렉션 업데이트
    console.log('\n[3/4] applications 컬렉션 업데이트 중...');
    let batch = db.batch();
    let batchCount = 0;
    let totalProcessed = 0;
    let successfullyUpdated = 0;
    let skippedCount = 0;
    
    for (const appDoc of applicationsSnapshot.docs) {
      const appData = appDoc.data();
      const newProjectId = programToProjectMap.get(appData.program);
      
      if (newProjectId) {
        let newCreatedAt = appData.createdAt; // 기본적으로 기존 값 사용
        if (typeof appData.createdAt === 'string') {
          const match = appData.createdAt.match(/(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2})시 (\d{1,2})분 (\d{1,2})초/);
          if (match) {
            const [_, year, month, day, ampm, hour, minute, second] = match;
            let adjustedHour = parseInt(hour);
            if (ampm === '오후' && adjustedHour !== 12) adjustedHour += 12;
            if (ampm === '오전' && adjustedHour === 12) adjustedHour = 0;
            try {
                const dateObj = new Date(Date.UTC(year, month - 1, day, adjustedHour, minute, second));
                if (!isNaN(dateObj)) {
                    newCreatedAt = admin.firestore.Timestamp.fromDate(dateObj);
                    console.log(`문서 ID ${appDoc.id}: createdAt 문자열 "${appData.createdAt}" -> Timestamp로 변환 성공`);
                } else {
                    console.warn(`문서 ID ${appDoc.id}: createdAt 문자열 "${appData.createdAt}" -> Date 객체 변환 실패 (NaN). 서버 타임스탬프 사용.`);
                    newCreatedAt = admin.firestore.FieldValue.serverTimestamp(); // 변환 실패 시 서버 시간
                }
            } catch (e) {
                console.error(`문서 ID ${appDoc.id}: createdAt 문자열 "${appData.createdAt}" -> Date 객체 생성 중 오류 발생. 서버 타임스탬프 사용. 오류:`, e);
                newCreatedAt = admin.firestore.FieldValue.serverTimestamp();
            }
          } else {
            console.warn(`문서 ID ${appDoc.id}: createdAt 문자열 "${appData.createdAt}" 형식이 예상과 다릅니다. 서버 타임스탬프 사용.`);
            newCreatedAt = admin.firestore.FieldValue.serverTimestamp(); // 형식 불일치 시 서버 시간
          }
        } else if (appData.createdAt && typeof appData.createdAt.toDate === 'function') {
            // 이미 Timestamp 객체인 경우 그대로 사용
            newCreatedAt = appData.createdAt;
            console.log(`문서 ID ${appDoc.id}: createdAt이 이미 Timestamp 객체입니다.`);
        } else if (appData.createdAt instanceof Date) {
            // 이미 Date 객체인 경우 Timestamp로 변환
            newCreatedAt = admin.firestore.Timestamp.fromDate(appData.createdAt);
            console.log(`문서 ID ${appDoc.id}: createdAt이 Date 객체입니다. Timestamp로 변환합니다.`);
        }


        batch.update(appDoc.ref, {
          projectId: newProjectId,
          program: admin.firestore.FieldValue.delete(), // program 필드 삭제
          createdAt: newCreatedAt,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`문서 ID ${appDoc.id}: 업데이트 준비 완료 (projectId: ${newProjectId})`);
        successfullyUpdated++;
        batchCount++;
        totalProcessed++;

        if (batchCount >= 490) { // Firestore는 한 번의 batch write에 최대 500개의 작업만 허용
          console.log(`${batchCount}개 작업 배치 커밋 중... (총 처리: ${totalProcessed} / ${applicationsSnapshot.size})`);
          await batch.commit();
          batch = db.batch(); // 새 배치 시작
          batchCount = 0;
          console.log('배치 커밋 완료.');
        }
      } else {
        console.warn(`문서 ID ${appDoc.id}: program 필드 "${appData.program}"에 해당하는 projectId를 찾을 수 없어 건너뛰었습니다.`);
        skippedCount++;
        totalProcessed++;
      }
    }

    if (batchCount > 0) {
      console.log(`남은 ${batchCount}개 작업 배치 커밋 중... (총 처리: ${totalProcessed} / ${applicationsSnapshot.size})`);
      await batch.commit();
      console.log('최종 배치 커밋 완료.');
    }
    console.log(`Applications 컬렉션 업데이트 완료. 총 문서: ${applicationsSnapshot.size}, 성공: ${successfullyUpdated}, 건너뛴: ${skippedCount}`);

    // 4. 각 프로젝트의 통계 업데이트
    console.log('\n[4/4] 각 프로젝트 통계 업데이트 중...');
    for (const [originalProgramId, finalProjectId] of programToProjectMap) {
      const relatedApplications = await db.collection('applications')
        .where('projectId', '==', finalProjectId)
        .get();

      const stats = { total: relatedApplications.size, approved: 0, pending: 0, rejected: 0 };
      relatedApplications.forEach(doc => {
        const status = doc.data().status || 'pending';
        stats[status]++;
      });

      await db.collection('projects').doc(finalProjectId).update({ 
          stats: stats,
          updatedAt: admin.firestore.FieldValue.serverTimestamp() 
      });
      console.log(`Project ID ${finalProjectId} (원래 Program ID: ${originalProgramId}) 통계 업데이트 완료:`, stats);
    }

    console.log('\n=== 모든 마이그레이션 작업 완료 ===');
    
  } catch (error) {
    console.error('마이그레이션 중 심각한 오류 발생:', error);
    console.error('오류 스택:', error.stack);
  } finally {
    // Firebase Admin SDK는 명시적으로 종료할 필요는 없지만, 스크립트가 확실히 끝나도록 process.exit() 호출
    process.exit(0);
  }
}

migrateApplications(); 