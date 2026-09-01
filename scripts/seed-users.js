/**
 * سكربت إنشاء الحسابات التجريبية الخمسة في Firebase Authentication + Firestore
 * الاستخدام:
 *  1) حمّل مفتاح حساب الخدمة من Firebase Console → Project Settings → Service Accounts
 *     واحفظه باسم serviceAccountKey.json داخل مجلد scripts/
 *  2) نفّذ: cd scripts && npm install && node seed-users.js
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

const ACCOUNTS = [
  { email: "dr_sarah@jpa-academy.com", password: "sarah@2026", role: "صيدلي إكلينيكي", isAdmin: false, walletBalance: 200 },
  { email: "ahmed_pharma@jpa-academy.com", password: "ahmed@123", role: "طالب صيدلة (سنة تخرج)", isAdmin: false, walletBalance: 150 },
  { email: "nour_intern@jpa-academy.com", password: "nour@pass", role: "صيدلي امتياز متدرب", isAdmin: false, walletBalance: 100 },
  { email: "dr_tariq@jpa-academy.com", password: "tariq@med26", role: "طبيب بشري مراجع سريري", isAdmin: false, walletBalance: 200 },
  { email: "admin_jawda@jpa-academy.com", password: "admin@jawda2026", role: "مدير الأكاديمية (Admin)", isAdmin: true, walletBalance: 999999 }
];

async function seed() {
  for (const acc of ACCOUNTS) {
    try {
      let user;
      try {
        user = await auth.getUserByEmail(acc.email);
        console.log(`✔ موجود مسبقاً: ${acc.email}`);
      } catch {
        user = await auth.createUser({
          email: acc.email,
          password: acc.password,
          emailVerified: true
        });
        console.log(`✅ تم إنشاء الحساب: ${acc.email}`);
      }

      if (acc.isAdmin) {
        await auth.setCustomUserClaims(user.uid, { admin: true });
        console.log(`   ↳ تم منح صلاحية admin لـ ${acc.email}`);
      }

      await db.collection("users").doc(user.uid).set(
        {
          email: acc.email,
          role: acc.role,
          isAdmin: acc.isAdmin,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          walletBalance: acc.walletBalance,
          enrolledCourses: [],
          progress: {}
        },
        { merge: true }
      );
    } catch (err) {
      console.error(`❌ خطأ في إنشاء ${acc.email}:`, err.message);
    }
  }
  console.log("\nانتهى إنشاء جميع الحسابات التجريبية (مع تعبئة رصيد المحفظة الافتراضي).");
  process.exit(0);
}

seed();
