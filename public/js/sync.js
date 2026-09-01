// =====================================================================
// مزامنة البيانات الفورية (Realtime Sync) بين الهاتف والويب
// يشمل: المحفظة (Wallet)، الاشتراك في الدورات، وتقدّم المشاهدة
// =====================================================================

// --- محفظة الرصيد (Wallet) ---

function listenToWallet(onUpdate) {
  const user = auth.currentUser;
  if (!user) return () => {};
  return db.collection("users").doc(user.uid).onSnapshot((doc) => {
    if (doc.exists) onUpdate(doc.data().walletBalance || 0, doc.data().enrolledCourses || []);
  });
}

// --- الاشتراك في دورة (خصم من المحفظة) ---

async function enrollInCourse(courseId, price) {
  const user = auth.currentUser;
  if (!user) throw new Error("المستخدم غير مسجل الدخول");

  const ref = db.collection("users").doc(user.uid);
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.data() || {};
    const balance = data.walletBalance || 0;
    const enrolled = data.enrolledCourses || [];

    if (enrolled.includes(courseId)) return { alreadyEnrolled: true };
    if (balance < price) throw new Error("INSUFFICIENT_BALANCE");

    tx.update(ref, {
      walletBalance: balance - price,
      enrolledCourses: [...enrolled, courseId]
    });
    return { alreadyEnrolled: false };
  });
}

// --- شحن رصيد المحفظة (يُستخدم من لوحة المدير أو Cloud Function لاحقاً) ---

function topUpWallet(amount) {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("المستخدم غير مسجل الدخول"));
  return db.collection("users").doc(user.uid).update({
    walletBalance: firebase.firestore.FieldValue.increment(amount)
  });
}

// --- تقدّم مشاهدة الفصول (Chapters Progress) ---

function saveChapterProgress(courseId, chapterId, data) {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("المستخدم غير مسجل الدخول"));
  const key = `${courseId}__${chapterId}`;
  return db.collection("users").doc(user.uid).set(
    { progress: { [key]: { ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() } } },
    { merge: true }
  );
}

function listenToProgress(onUpdate) {
  const user = auth.currentUser;
  if (!user) return () => {};
  return db.collection("users").doc(user.uid).onSnapshot((doc) => {
    if (doc.exists) onUpdate(doc.data().progress || {});
  });
}

// --- الحالات السريرية (Clinical Cases) ---

function saveClinicalCaseResult(caseId, score, answers) {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("المستخدم غير مسجل الدخول"));
  return db
    .collection("users")
    .doc(user.uid)
    .collection("clinicalCases")
    .doc(caseId)
    .set({
      score,
      answers,
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function listenToAllUsersCases(onUpdate) {
  return db.collectionGroup("clinicalCases").onSnapshot((snap) => {
    const results = [];
    snap.forEach((d) => results.push({ id: d.id, ...d.data() }));
    onUpdate(results);
  });
}
