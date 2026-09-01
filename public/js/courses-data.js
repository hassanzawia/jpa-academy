// =====================================================================
// بيانات الدورات - منصة الجودة للفارمسي أكاديمي
// مستوحاة من هيكلة منصة إيضاح (Edah): تصنيفات، مدرّسون، شابترات (فصول)
// =====================================================================
//
// 🎥 كل فيديو يُستضاف على Google Drive (وليس مرفوعاً محلياً).
// لإضافة فيديو جديد، اتبع الطريقة الموضحة في GOOGLE_DRIVE_VIDEOS_GUIDE.md
// ثم ضع "driveId" فقط (الجزء بين /d/ و /view في رابط المشاركة).
//
// مثال: الرابط: https://drive.google.com/file/d/1AbCdEfGhIJKLmnop/view
//        driveId: "1AbCdEfGhIJKLmnop"
// =====================================================================

const COURSE_CATEGORIES = [
  { id: "medicine", name: "الطب والصيدلة", icon: "🩺" },
  { id: "languages", name: "اللغات", icon: "🗣️" },
  { id: "curricula", name: "المناهج الثانوية", icon: "📘" },
  { id: "crafts", name: "الحرف المهنية والإبداع", icon: "🎨" }
];

const COURSES = [
  {
    id: "otc-pharmacy-practice",
    category: "medicine",
    title: "دورة صرف الأدوية OTC والممارسة الإكلينيكية",
    instructor: "د. سارة أحمد",
    instructorTitle: "صيدلانية إكلينيكية",
    thumbnail: "assets/course-otc.jpg",
    price: 100,
    currency: "د.ل",
    description: "دورة شاملة في مبادئ الصرف الآمن للأدوية بدون وصفة طبية، والتفاعلات الدوائية الشائعة.",
    chapters: [
      {
        id: "ch1-intro",
        title: "الفصل 1: مقدمة في الصرف الآمن",
        driveId: "YOUR_DRIVE_ID_1",
        durationMinutes: 25,
        summaryPdf: "assets/ch1-summary.pdf"
      },
      {
        id: "ch2-ddi",
        title: "الفصل 2: التفاعلات الدوائية (DDI)",
        driveId: "YOUR_DRIVE_ID_2",
        durationMinutes: 32,
        summaryPdf: "assets/ch2-summary.pdf"
      },
      {
        id: "ch3-cases",
        title: "الفصل 3: حالات سريرية تطبيقية",
        driveId: "YOUR_DRIVE_ID_3",
        durationMinutes: 40,
        summaryPdf: null
      }
    ]
  },
  {
    id: "medical-terminology",
    category: "medicine",
    title: "المصطلحات الطبية للمبتدئين",
    instructor: "د. محمد الدعيكي",
    instructorTitle: "أستاذ علم وظائف الأعضاء",
    thumbnail: "assets/course-terminology.jpg",
    price: 75,
    currency: "د.ل",
    description: "أساسيات المصطلحات الطبية اللاتينية واليونانية المستخدمة في الوصفات والتقارير الطبية.",
    chapters: [
      {
        id: "ch1-roots",
        title: "الفصل 1: الجذور والبادئات",
        driveId: "YOUR_DRIVE_ID_4",
        durationMinutes: 20,
        summaryPdf: "assets/term-ch1.pdf"
      }
    ]
  },
  {
    id: "medical-english",
    category: "languages",
    title: "اللغة الإنجليزية الطبية",
    instructor: "أ. نور الهدى",
    instructorTitle: "مدرّبة لغة إنجليزية متخصصة",
    thumbnail: "assets/course-english.jpg",
    price: 60,
    currency: "د.ل",
    description: "تطوير المصطلحات والمحادثة الطبية بالإنجليزية للتعامل مع المرضى والزملاء الأجانب.",
    chapters: [
      {
        id: "ch1-vocab",
        title: "الفصل 1: المفردات الأساسية",
        driveId: "YOUR_DRIVE_ID_5",
        durationMinutes: 18,
        summaryPdf: null
      }
    ]
  }
];

// ---------------------------------------------------------------------
// دوال مساعدة
// ---------------------------------------------------------------------

function getCourseById(courseId) {
  return COURSES.find((c) => c.id === courseId) || null;
}

function getCoursesByCategory(categoryId) {
  return COURSES.filter((c) => c.category === categoryId);
}

function getChapterById(courseId, chapterId) {
  const course = getCourseById(courseId);
  if (!course) return null;
  return course.chapters.find((ch) => ch.id === chapterId) || null;
}

// يبني رابط تضمين Google Drive الآمن (iframe /preview) من معرّف الملف
function buildDriveEmbedUrl(driveId) {
  return `https://drive.google.com/file/d/${driveId}/preview`;
}
