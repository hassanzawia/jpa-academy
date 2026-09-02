// =====================================================================
// نظام تقييد الدخول لجهاز واحد فقط (Single Device Session)
// منصة الجودة للفارمسي أكاديمي - مناسب لأغراض التدريب والامتحانات
// =====================================================================
//
// الفكرة: عند تسجيل الدخول، يُنشأ معرّف جلسة عشوائي (Session ID) يُحفظ:
//   1) محلياً في هذا المتصفح (localStorage)
//   2) في Firestore ضمن مستند المستخدم (activeSessionId)
//
// أي صفحة محمية تستمع باستمرار (onSnapshot) لتغيّر activeSessionId.
// إن سجّل نفس الحساب الدخول من جهاز آخر، يتغيّر activeSessionId في
// Firestore، فتكتشف كل الأجهزة الأخرى المفتوحة عدم التطابق فوراً
// وتُسجّل خروجها تلقائياً مع تنبيه للمستخدم.
// =====================================================================

const SESSION_STORAGE_KEY = "jpa_session_id";

// توليد معرّف جلسة عشوائي فريد
function generateSessionId() {
  return (
    Math.random().toString(36).substring(2, 10) +
    "-" +
    Date.now().toString(36)
  );
}

// 🆕 تُستدعى فور نجاح تسجيل الدخول - تُنشئ جلسة جديدة نشطة
// وتُبطل تلقائياً أي جلسة سابقة مفتوحة لنفس الحساب على جهاز آخر
async function startNewSession(uid) {
  const sessionId = generateSessionId();
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  await db.collection("users").doc(uid).update({
    activeSessionId: sessionId,
    activeSessionAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return sessionId;
}

// 🆕 تُستدعى في كل صفحة محمية (courses.html, course-player.html, admin.html)
// تراقب باستمرار هل ما زالت جلسة هذا الجهاز هي الجلسة النشطة رسمياً
function enforceSingleDeviceSession() {
  let unsubDoc = () => {};
  const unsubAuth = auth.onAuthStateChanged((user) => {
    unsubDoc();
    if (!user) return;

    const localSessionId = localStorage.getItem(SESSION_STORAGE_KEY);

    unsubDoc = db.collection("users").doc(user.uid).onSnapshot((doc) => {
      if (!doc.exists) return;
      const remoteSessionId = doc.data().activeSessionId;

      // إن وُجدت جلسة محلية وجلسة عن بعد ولم تتطابقا => جهاز آخر سجّل الدخول
      if (remoteSessionId && localSessionId && remoteSessionId !== localSessionId) {
        unsubDoc();
        localStorage.removeItem(SESSION_STORAGE_KEY);
        alert("⚠️ تم تسجيل الدخول إلى هذا الحساب من جهاز آخر.\nسيتم تسجيل خروجك من هذا الجهاز الآن.");
        auth.signOut().then(() => {
          window.location.href = "login.html";
        });
      }
    });
  });

  return () => {
    unsubDoc();
    unsubAuth();
  };
}
