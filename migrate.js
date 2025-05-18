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
    // 1. Create new project
    const projectRef = await db.collection('projects').add({
      name: '사업명 1차',
      details: '1차 사업',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      stats: {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
      }
    });

    console.log('Created new project with ID:', projectRef.id);

    // 2. Get all applications
    const applications = await db.collection('applications').get();
    
    // 3. Update each application
    const batch = db.batch();
    let stats = { total: 0, approved: 0, pending: 0, rejected: 0 };
    
    applications.forEach(doc => {
      const data = doc.data();
      stats.total++;
      stats[data.status || 'pending']++;
      
      batch.update(doc.ref, {
        projectId: projectRef.id,
        projectName: '사업명 1차'
      });
    });

    // 4. Update project stats
    batch.update(projectRef, { stats: stats });
    
    // 5. Commit the batch
    await batch.commit();
    
    console.log('Migration completed successfully');
    console.log('Total applications migrated:', stats.total);
    console.log('Stats:', stats);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit();
}

migrateApplications(); 