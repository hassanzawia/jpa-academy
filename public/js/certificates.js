// =====================================================================
// نظام شهادات إتمام الدورات - منصة الجودة للفارمسي أكاديمي
// 🔧 نسخة v2: تحميل كسول (Lazy Load) لمكتبات html2canvas و jsPDF
// =====================================================================
//
// 🐛 إصلاح مشكلة الصفحة البيضاء على الهواتف:
// كانت مكتبتا html2canvas و jsPDF تُحمَّلان عبر <script> ثابت في
// <head>/<body> مباشرة من cdnjs.cloudflare.com. بعض شبكات الجوّال تحظر
// أو تُبطئ الوصول لهذا الـ CDN تحديداً، مما كان يُسبب تعطّل تحميل
// courses.html بالكامل (صفحة بيضاء) حتى قبل ظهور أي محتوى.
//
// الحل: لم نعد نُحمّل هاتين المكتبتين في HTML إطلاقاً. بدلاً من ذلك،
// تُحمَّلان ديناميكياً (lazy) فقط عند الضغط الفعلي على زر "🎓 الشهادة"،
// مع معالجة صريحة للفشل (رسالة خطأ واضحة بدل تعطّل الصفحة).
// =====================================================================

const CERT_PASS_SCORE = 70;

const CERT_LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

let certLibsLoadedPromise = null;

// تحميل مكتبة واحدة عبر <script> ديناميكي مع مهلة زمنية (timeout) وقائية
function loadScriptWithTimeout(src, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        reject(new Error("انتهت مهلة تحميل: " + src));
      }
    }, timeoutMs);

    script.onload = () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve();
      }
    };
    script.onerror = () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        reject(new Error("فشل تحميل: " + src));
      }
    };
    document.body.appendChild(script);
  });
}

// تحميل مكتبات الشهادة عند الحاجة فقط (مرة واحدة، يُعاد استخدام نفس الوعد لاحقاً)
function ensureCertificateLibsLoaded() {
  if (certLibsLoadedPromise) return certLibsLoadedPromise;

  certLibsLoadedPromise = (async () => {
    // إن كانت المكتبتان محمّلتين بالفعل (نادراً، لكن للأمان)
    if (typeof html2canvas !== "undefined" && typeof window.jspdf !== "undefined") {
      return;
    }
    for (const src of CERT_LIBS) {
      await loadScriptWithTimeout(src);
    }
  })();

  return certLibsLoadedPromise;
}

// ---------------------------------------------------------------------
// التحقق من أهلية الحصول على الشهادة (لا يحتاج المكتبات الثقيلة)
// ---------------------------------------------------------------------

function isCourseFullyWatched(course, completedChapters) {
  return course.chapters.every(
    (ch) => completedChapters[`${course.id}__${ch.id}`] === true
  );
}

function getCourseCaseScore(course, myClinicalCases) {
  if (!course.certificateCaseId) return null;
  const found = myClinicalCases.find((c) => c.id === course.certificateCaseId);
  return found ? (found.score || 0) : null;
}

function isCourseCertificateEligible(course, completedChapters, myClinicalCases) {
  if (!isCourseFullyWatched(course, completedChapters)) return false;
  if (course.certificateCaseId) {
    const score = getCourseCaseScore(course, myClinicalCases);
    if (score === null || score < CERT_PASS_SCORE) return false;
  }
  return true;
}

// ---------------------------------------------------------------------
// توليد معرّف شهادة فريد
// ---------------------------------------------------------------------

function generateCertificateId() {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let rand = "";
  for (let i = 0; i < 8; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `JPA-${year}-${rand}`;
}

// ---------------------------------------------------------------------
// حفظ سجل الشهادة في Firestore
// ---------------------------------------------------------------------

function saveCertificateRecord(course, certificateId, studentName, score) {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("المستخدم غير مسجل الدخول"));

  const batch = db.batch();

  const userRef = db.collection("users").doc(user.uid);
  batch.set(
    userRef,
    {
      certificates: {
        [course.id]: {
          certificateId,
          issuedAt: firebase.firestore.FieldValue.serverTimestamp(),
          score: score ?? null
        }
      }
    },
    { merge: true }
  );

  const certRef = db.collection("issuedCertificates").doc(certificateId);
  batch.set(certRef, {
    uid: user.uid,
    studentName,
    courseId: course.id,
    courseTitle: course.title,
    instructor: course.instructor,
    score: score ?? null,
    issuedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  return batch.commit();
}

// ---------------------------------------------------------------------
// توليد وتنزيل ملف PDF للشهادة (مع تحميل كسول للمكتبات + معالجة فشل واضحة)
// ---------------------------------------------------------------------

async function downloadCertificate(course, studentName, score) {
  // 🆕 مؤشر تحميل بسيط أثناء جلب المكتبات (قد يستغرق ثوانٍ على شبكات بطيئة)
  const loadingToast = document.createElement("div");
  loadingToast.className = "admin-toast";
  loadingToast.style.display = "block";
  loadingToast.textContent = "⏳ جارٍ تجهيز الشهادة...";
  document.body.appendChild(loadingToast);

  try {
    await ensureCertificateLibsLoaded();
  } catch (err) {
    loadingToast.remove();
    alert(
      "⚠️ تعذّر تحميل أدوات إنشاء الشهادة (قد تكون شبكة الإنترنت الحالية تحظر الوصول لخدمة cdnjs.cloudflare.com).\n\n" +
      "الرجاء المحاولة عبر شبكة WiFi، أو التحقق من اتصالك بالإنترنت، ثم إعادة المحاولة.\n\n" +
      "تفاصيل تقنية: " + err.message
    );
    return;
  }

  document.getElementById("cert-student-name").textContent = studentName;
  document.getElementById("cert-course-title").textContent = course.title;
  document.getElementById("cert-instructor").textContent = course.instructor;
  document.getElementById("cert-date").textContent = new Date().toLocaleDateString("ar-LY", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const user = auth.currentUser;
  let certificateId;
  try {
    const userDoc = await db.collection("users").doc(user.uid).get();
    const existing = userDoc.data()?.certificates?.[course.id];
    if (existing && existing.certificateId) {
      certificateId = existing.certificateId;
    } else {
      certificateId = generateCertificateId();
      await saveCertificateRecord(course, certificateId, studentName, score);
    }
  } catch (err) {
    loadingToast.remove();
    console.error("خطأ في حفظ سجل الشهادة:", err);
    alert("حدث خطأ أثناء إصدار الشهادة: " + err.message);
    return;
  }
  document.getElementById("cert-id").textContent = certificateId;

  const certEl = document.getElementById("certificate-template");
  let canvas;
  try {
    canvas = await html2canvas(certEl, { scale: 2, backgroundColor: "#ffffff" });
  } catch (err) {
    loadingToast.remove();
    console.error("خطأ في التقاط الشهادة:", err);
    alert("تعذّر إنشاء ملف الشهادة. الرجاء المحاولة مرة أخرى.");
    return;
  }

  loadingToast.remove();

  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height]
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`${course.id}-certificate.pdf`);
}
