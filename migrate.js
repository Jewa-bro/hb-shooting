const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

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