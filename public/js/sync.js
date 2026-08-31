// =====================================================================
// مزامنة البيانات الفورية (Realtime Sync) بين الهاتف والويب
// عبر Firestore onSnapshot - أي تحديث يظهر فوراً على كل الأجهزة المسجّلة
// =====================================================================

function saveProgress(itemId, data) {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("المستخدم غير مسجل الدخول"));
  return db.collection("users").doc(user.uid).set(
    { progress: { [itemId]: { ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() } } },
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
