// =====================================================================
// مزامنة البيانات الفورية (Realtime Sync) بين الهاتف والويب
// يشمل: المحفظة (Wallet)، الاشتراك في الدورات، تقدّم المشاهدة،
// وشحن الرصيد من لوحة المدير (v2)
// =====================================================================

// --- محفظة الرصيد (Wallet) ---

function listenToWallet(onUpdate) {
  let unsubDoc = () => {};
  const unsubAuth = auth.onAuthStateChanged((user) => {
    unsubDoc();
    if (!user) return;
    unsubDoc = db.collection("users").doc(user.uid).onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data();
          onUpdate(data.walletBalance || 0, data.enrolledCourses || []);
        } else {
          onUpdate(0, []);
        }
      },
      (err) => console.error("listenToWallet error:", err)
    );
  });
  return () => {
    unsubDoc();
    unsubAuth();
  };
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

// --- شحن رصيد المستخدم الحالي نفسه (غير مستخدمة حالياً في الواجهة) ---

function topUpWallet(amount) {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("المستخدم غير مسجل الدخول"));
  return db.collection("users").doc(user.uid).update({
    walletBalance: firebase.firestore.FieldValue.increment(amount)
  });
}

// --- 🆕 شحن رصيد مستخدم آخر بواسطة المدير (Admin Top-up) ---
// يعتمد على قاعدة firestore.rules التي تسمح للمدير بتحديث حقل
// walletBalance فقط (وليس أي حقل آخر) لأي مستخدم في المنصة.
// كما يُسجَّل كل عملية شحن في سجل تدقيق (walletTransactions) للشفافية.

function topUpWalletForUser(targetUid, amount, note) {
  const admin = auth.currentUser;
  if (!admin) return Promise.reject(new Error("المدير غير مسجل الدخول"));
  if (!targetUid) return Promise.reject(new Error("لم يتم تحديد المستخدم"));
  if (!amount || isNaN(amount) || amount === 0) {
    return Promise.reject(new Error("مبلغ غير صالح"));
  }

  const userRef = db.collection("users").doc(targetUid);
  const txRef = userRef.collection("walletTransactions").doc();

  const batch = db.batch();
  batch.update(userRef, {
    walletBalance: firebase.firestore.FieldValue.increment(amount)
  });
  batch.set(txRef, {
    amount: amount,
    adminEmail: admin.email,
    note: note || "",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  return batch.commit();
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
  let unsubDoc = () => {};
  const unsubAuth = auth.onAuthStateChanged((user) => {
    unsubDoc();
    if (!user) return;
    unsubDoc = db.collection("users").doc(user.uid).onSnapshot((doc) => {
      if (doc.exists) onUpdate(doc.data().progress || {});
    });
  });
  return () => {
    unsubDoc();
    unsubAuth();
  };
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
