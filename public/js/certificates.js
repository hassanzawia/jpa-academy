// =====================================================================
// نظام شهادات إتمام الدورات - منصة الجودة للفارمسي أكاديمي
// =====================================================================
//
// يعتمد على مكتبتين خارجيتين محمَّلتين عبر CDN في courses.html:
//   - html2canvas: لالتقاط قالب الشهادة (HTML/CSS عربي) كصورة
//   - jsPDF: لتحويل الصورة الملتقطة إلى ملف PDF قابل للتنزيل
// (هذه الطريقة تضمن عرض النص العربي بشكل صحيح تماماً، بخلاف الكتابة
//  المباشرة بـ jsPDF التي لا تدعم تشكيل الحروف العربية بشكل موثوق)
// =====================================================================

const CERT_PASS_SCORE = 70; // الحد الأدنى لدرجة الحالة السريرية لإصدار الشهادة

// ---------------------------------------------------------------------
// التحقق من أهلية الحصول على الشهادة
// ---------------------------------------------------------------------

// هل شاهد الطالب كل فصول الدورة (ضغط زر "أنهيت هذا الفصل" على كل فصل)؟
function isCourseFullyWatched(course, completedChapters) {
  return course.chapters.every(
    (ch) => completedChapters[`${course.id}__${ch.id}`] === true
  );
}

// جلب درجة الحالة السريرية المرتبطة بالدورة (أو null إن لم تكن موجودة/غير مطلوبة)
function getCourseCaseScore(course, myClinicalCases) {
  if (!course.certificateCaseId) return null;
  const found = myClinicalCases.find((c) => c.id === course.certificateCaseId);
  return found ? (found.score || 0) : null;
}

// الدالة الرئيسية: هل الطالب مؤهل فعلياً للحصول على شهادة هذه الدورة؟
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
// حفظ سجل الشهادة في Firestore (في ملف المستخدم + مجموعة عامة للتحقق)
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
// توليد وتنزيل ملف PDF للشهادة
// ---------------------------------------------------------------------

async function downloadCertificate(course, studentName, score) {
  // 1) تعبئة قالب الشهادة المخفي بالبيانات
  document.getElementById("cert-student-name").textContent = studentName;
  document.getElementById("cert-course-title").textContent = course.title;
  document.getElementById("cert-instructor").textContent = course.instructor;
  document.getElementById("cert-date").textContent = new Date().toLocaleDateString("ar-LY", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // 2) التحقق: هل توجد شهادة سابقة لنفس الدورة؟ (لإعادة استخدام نفس رقم التحقق)
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
    console.error("خطأ في حفظ سجل الشهادة:", err);
    alert("حدث خطأ أثناء إصدار الشهادة: " + err.message);
    return;
  }
  document.getElementById("cert-id").textContent = certificateId;

  // 3) التقاط قالب الشهادة كصورة عبر html2canvas
  const certEl = document.getElementById("certificate-template");
  let canvas;
  try {
    canvas = await html2canvas(certEl, { scale: 2, backgroundColor: "#ffffff" });
  } catch (err) {
    console.error("خطأ في التقاط الشهادة:", err);
    alert("تعذّر إنشاء ملف الشهادة. الرجاء المحاولة مرة أخرى.");
    return;
  }

  // 4) تحويل الصورة إلى PDF وتنزيله
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
