import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed script — داده‌های اولیه دیتابیس نوبان
 *
 * این اسکریپت تخصص‌های پزشکی و پزشکان نمونه را در دیتابیس وارد می‌کند.
 * اجرا: bun run db:seed
 */

const SPECIALTIES = [
  { name: "قلب و عروق", icon: "❤️", sortOrder: 0 },
  { name: "مغز و اعصاب", icon: "🧠", sortOrder: 1 },
  { name: "اطفال", icon: "👶", sortOrder: 2 },
  { name: "دندان‌پزشکی", icon: "🦷", sortOrder: 3 },
  { name: "ارتوپدی", icon: "🦴", sortOrder: 4 },
  { name: "چشم‌پزشکی", icon: "👁️", sortOrder: 5 },
  { name: "طب داخلی", icon: "🩺", sortOrder: 6 },
  { name: "زنان و زایمان", icon: "👩‍⚕️", sortOrder: 7 },
  { name: "پوست و مو", icon: "✨", sortOrder: 8 },
  { name: "گوش و حلق و بینی", icon: "👂", sortOrder: 9 },
  { name: "روان‌پزشکی", icon: "🧘", sortOrder: 10 },
  { name: "ارولوژی", icon: "🔬", sortOrder: 11 },
];

const img = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=700`;

type RawDoctor = {
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  photo: number;
  location: string;
  fee: number;
  phone: string;
  address: string;
  about: string;
};

const DOCTORS: RawDoctor[] = [
  {
    name: "دکتر سارا محمدی",
    specialty: "قلب و عروق",
    rating: 4.9,
    experience: 14,
    photo: 17829429,
    location: "مطب ولیعصر",
    fee: 320000,
    phone: "058-32002314",
    address: "درگز، خیابان امام، بالاتر از پارک، پلاک ۱۲۳، طبقه ۳",
    about: "متخصص قلب و عروق با بیش از یک دهه تجربه در تشخیص و درمان بیماری‌های قلبی، فشار خون و آریتمی.",
  },
  {
    name: "دکتر رضا کاظمی",
    specialty: "مغز و اعصاب",
    rating: 4.8,
    experience: 18,
    photo: 32254658,
    location: "مرکز پزشکی سعادت",
    fee: 400000,
    phone: "058-32005678",
    address: "درگز، بلوار معلم، مرکز پزشکی سعادت، طبقه ۲",
    about: "پزشک متخصص مغز و اعصاب، فعال در زمینه میگرن، صرع و اختلالات خواب با رویکرد درمان نوین.",
  },
  {
    name: "دکتر مریم احمدی",
    specialty: "اطفال",
    rating: 5.0,
    experience: 11,
    photo: 18788957,
    location: "مطب میرداماد",
    fee: 260000,
    phone: "058-32004412",
    address: "درگز، خیابان شهید بهشتی، کوچه شقایق، پلاک ۱۵",
    about: "متخصص بیماری‌های کودکان با رویکرد صبورانه و دوستانه؛ تخصص ویژه در تغذیه و رشد نوزادان.",
  },
  {
    name: "دکتر علی رضایی",
    specialty: "ارتوپدی",
    rating: 4.7,
    experience: 20,
    photo: 15962798,
    location: "بیمارستان دی",
    fee: 350000,
    phone: "058-32007755",
    address: "درگز، خیابان امام، روبروی بیمارستان، ساختمان پزشکان، طبقه ۵",
    about: "متخصص ارتوپدی و جراح زانو و لگن؛ تجربه گسترده در درمان شکستگی‌ها و آسیب‌های ورزشی.",
  },
  {
    name: "دکتر نگار یوسفی",
    specialty: "دندان‌پزشکی",
    rating: 4.9,
    experience: 9,
    photo: 6749773,
    location: "کلینیک لبخند",
    fee: 200000,
    phone: "058-32003390",
    address: "درگز، خیابان طالقانی، کلینیک تخصصی لبخند، واحد ۲",
    about: "دندان‌پزشک عمومی و زیبایی؛ متخصص بلیچینگ، کامپوزیت و طراحی لبخند با تکنولوژی روز.",
  },
  {
    name: "دکتر سینا مرادی",
    specialty: "چشم‌پزشکی",
    rating: 4.6,
    experience: 13,
    photo: 32205061,
    location: "مطب مرکز",
    fee: 300000,
    phone: "058-32006623",
    address: "درگز، خیابان امام، بالاتر از میدان، پلاک ۲۱۰",
    about: "متخصص چشم‌پزشکی و جراح آب مروارید و لیزیک؛ ارائه خدمات جامع بینایی‌سنجی.",
  },
  {
    name: "دکتر پریسا کیانی",
    specialty: "زنان و زایمان",
    rating: 4.9,
    experience: 16,
    photo: 32115905,
    location: "مرکز مادر",
    fee: 280000,
    phone: "058-32008844",
    address: "درگز، خیابان فرجام، مرکز تخصصی مادر، طبقه اول",
    about: "متخصص زنان و زایمان و جراح لاپاراسکوپی؛ مشاوره دوران بارداری و سلامت زنان.",
  },
  {
    name: "دکتر بهرام نوری",
    specialty: "طب داخلی",
    rating: 4.5,
    experience: 22,
    photo: 7966285,
    location: "مطب تجریش",
    fee: 240000,
    phone: "058-32001198",
    address: "درگز، میدان اصلی، خیابان شریعتی، پلاک ۳۳",
    about: "متخصص طب داخلی با سابقه طولانی در درمان دیابت، فشار خون و بیماری‌های گوارشی.",
  },
  {
    name: "دکتر الهام صادقی",
    specialty: "پوست و مو",
    rating: 4.8,
    experience: 10,
    photo: 32254667,
    location: "کلینیک زیبایی آرتمیس",
    fee: 360000,
    phone: "058-32002277",
    address: "درگز، خیابان فرشته، کلینیک آرتمیس، طبقه ۴",
    about: "متخصص پوست و مو و زیبایی؛ ارائه خدمات لیزر، مزوتراپی و درمان جوش‌های پوستی.",
  },
  {
    name: "دکتر کامران هدایتی",
    specialty: "گوش و حلق و بینی",
    rating: 4.7,
    experience: 15,
    photo: 37407192,
    location: "مطب قیطریه",
    fee: 290000,
    phone: "058-32009933",
    address: "درگز، خیابان لواسانی، بالاتر از میدان، پلاک ۱۴۴",
    about: "متخصص گوش و حلق و بینی؛ جراحی سینوس و تورم بینی با جدیدترین روش‌ها.",
  },
  {
    name: "دکتر زیبا فرهمند",
    specialty: "روان‌پزشکی",
    rating: 4.9,
    experience: 12,
    photo: 6749778,
    location: "مرکز آرامش",
    fee: 380000,
    phone: "058-32004455",
    address: "درگز، خیابان سمیه، مرکز تخصصی آرامش، واحد ۵",
    about: "روان‌پزشک متخصص اختلالات اضطرابی، افسردگی و استرس با رویکرد درمان شناختی‌رفتاری.",
  },
  {
    name: "دکتر آرش جباری",
    specialty: "ارولوژی",
    rating: 4.6,
    experience: 17,
    photo: 32254655,
    location: "بیمارستان مهر",
    fee: 330000,
    phone: "058-32007766",
    address: "درگز، خیابان هلال احمر، بیمارستان مهر، ساختمان پزشکان",
    about: "متخصص ارولوژی و جراح کلیه و مجاری ادراری؛ تجربه گسترده در درمان سنگ کلیه.",
  },
];

async function main() {
  console.log("🌱 شروع seed...");

  // ۱. پاک کردن داده‌های قبلی
  console.log("🧹 پاک کردن داده‌های قبلی...");
  await prisma.otpCode.deleteMany();
  await prisma.loginEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.user.deleteMany();

  // ۲. ساخت تخصص‌ها
  console.log("🏥 افزودن تخصص‌ها...");
  const specialtyMap = new Map<string, string>();
  for (const spec of SPECIALTIES) {
    const created = await prisma.specialty.create({ data: spec });
    specialtyMap.set(spec.name, created.id);
    console.log(`  ✓ ${spec.name}`);
  }

  // ۳. ساخت پزشکان
  console.log("👨‍⚕️ افزودن پزشکان...");
  for (const doc of DOCTORS) {
    const specialtyId = specialtyMap.get(doc.specialty);
    if (!specialtyId) {
      console.log(`  ✗ تخصص یافت نشد: ${doc.specialty}`);
      continue;
    }

    // ساخت slug از نام
    const slug = doc.name.replace(/\s+/g, "-");

    const created = await prisma.doctor.create({
      data: {
        slug,
        firstName: doc.name.replace("دکتر ", "").split(" ")[0],
        lastName: doc.name.replace("دکتر ", "").split(" ").slice(1).join(" "),
        fullName: doc.name,
        specialtyId,
        photo: img(doc.photo),
        phone: doc.phone,
        address: doc.address,
        location: doc.location,
        lat: 37.44 + Math.random() * 0.02,
        lng: 59.11 + Math.random() * 0.02,
        about: doc.about,
        experience: doc.experience,
        fee: doc.fee,
        rating: doc.rating,
        reviewCount: Math.floor(Math.random() * 200) + 50,
      },
    });

    // افزودن زمان‌بندی هفتگی (شنبه تا پنجشنبه، جمعه تعطیل)
    const days = [0, 1, 2, 3, 4, 5, 6]; // 0=شنبه ... 6=جمعه
    for (const day of days) {
      const isFriday = day === 6;
      const isPartTime = day === 2 || day === 4; // بعضی روزها نیمه‌روز

      await prisma.availability.create({
        data: {
          doctorId: created.id,
          dayOfWeek: day,
          startTime: isFriday ? "00:00" : "09:00",
          endTime: isFriday ? "00:00" : isPartTime ? "13:00" : "18:00",
          slotDuration: 30,
          isClosed: isFriday,
        },
      });
    }

    console.log(`  ✓ ${doc.name}`);
  }

  // ۴. به‌روزرسانی تعداد پزشکان هر تخصص
  console.log("📊 به‌روزرسانی تعداد پزشکان...");
  for (const [specName, specId] of specialtyMap) {
    const count = await prisma.doctor.count({
      where: { specialtyId: specId, isActive: true },
    });
    await prisma.specialty.update({
      where: { id: specId },
      data: { doctorCount: count },
    });
    console.log(`  ✓ ${specName}: ${count} پزشک`);
  }

  // ۵. ساخت یک کاربر نمونه
  console.log("👤 افزودن کاربر نمونه...");
  await prisma.user.create({
    data: {
      phone: "09150000000",
      firstName: "کاربر",
      lastName: "نمونه",
    },
  });
  console.log("  ✓ 09150000000");

  console.log("\n✅ seed کامل شد!");
  console.log(`   - ${SPECIALTIES.length} تخصص`);
  console.log(`   - ${DOCTORS.length} پزشک`);
  console.log(`   - ${DOCTORS.length * 7} زمان‌بندی هفتگی`);
  console.log(`   - 1 کاربر نمونه`);
}

main()
  .catch((e) => {
    console.error("❌ خطا در seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
