// =====================================================================
// نظام تقييد الدخول لجهاز واحد فقط (Single Device Session)
// 🔍 v3: مهلة زمنية وقائية على كتابة الجلسة الجديدة
// =====================================================================

const SESSION_STORAGE_KEY = "jpa_session_id";

function generateSessionId() {
  return (
    Math.random().toString(36).substring(2, 10) +
    "-" +
    Date.now().toString(36)
  );
}

async function startNewSession(uid) {
  const sessionId = generateSessionId();
  dlog(`startNewSession: generated sessionId=${sessionId} for uid=${uid}`);
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);

  dlog("startNewSession: calling db.update()...");
  await withTimeout(
    db.collection("users").doc(uid).update({
      activeSessionId: sessionId,
      activeSessionAt: firebase.firestore.FieldValue.serverTimestamp()
    }),
    8000,
    "startNewSession.update()"
  );
  dlog("startNewSession: activeSessionId written to Firestore successfully");
  return sessionId;
}

function enforceSingleDeviceSession() {
  dlog("enforceSingleDeviceSession() attached");
  let unsubDoc = () => {};
  const unsubAuth = auth.onAuthStateChanged((user) => {
    unsubDoc();
    if (!user) {
      dlog("enforceSingleDeviceSession: no user, skipping");
      return;
    }

    const localSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    dlog(`enforceSingleDeviceSession: localSessionId=${localSessionId}`);

    unsubDoc = db.collection("users").doc(user.uid).onSnapshot(
      (doc) => {
        if (!doc.exists) {
          dlog("enforceSingleDeviceSession: user doc does not exist (onSnapshot)");
          return;
        }
        const remoteSessionId = doc.data().activeSessionId;
        dlog(`enforceSingleDeviceSession: remoteSessionId=${remoteSessionId}`);

        if (remoteSessionId && localSessionId && remoteSessionId !== localSessionId) {
          dlog("⚠️ SESSION MISMATCH DETECTED - logging out this device");
          unsubDoc();
          localStorage.removeItem(SESSION_STORAGE_KEY);
          alert("⚠️ تم تسجيل الدخول إلى هذا الحساب من جهاز آخر.\nسيتم تسجيل خروجك من هذا الجهاز الآن.");
          auth.signOut().then(() => {
            window.location.href = "login.html";
          });
        }
      },
      (err) => {
        dlog(`🔴 enforceSingleDeviceSession onSnapshot ERROR: [${err.code}] ${err.message}`);
      }
    );
  });

  return () => {
    unsubDoc();
    unsubAuth();
  };
}
