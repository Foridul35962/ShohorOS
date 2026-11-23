import type officerProjectEn from "./officerProject-en";

const officerProjectBn: typeof officerProjectEn = {
  back: "প্রকল্প",
  photoAlt: "{total}টির মধ্যে ছবি {n}",
  durationDays: "{count} দিন",
  createdAt: "তৈরি হয়েছে",
  locked: {
    title: "শুধু বিভাগীয় কর্মকর্তাদের জন্য",
    text: "এই পৃষ্ঠা শুধু বিভাগীয় কর্মকর্তার অ্যাকাউন্টে দেখা যায়।",
  },
  issue: { section: "সমস্যার বিবরণ", description: "বিবরণ" },
  schedule: {
    section: "সময়সূচি",
    start: "পরিকল্পিত শুরু",
    end: "পরিকল্পিত শেষ",
    duration: "পরিকল্পিত সময়কাল",
    completedAt: "সম্পন্ন হয়েছে",
  },
  progress: {
    section: "অগ্রগতির হালনাগাদ",
    empty: "এখনও কোনো অগ্রগতির হালনাগাদ নেই।",
    value: "{percent}% সম্পন্ন",
    workDate: "কাজের তারিখ: {date}",
  },
  completion: { section: "জমা দেওয়া কাজ", submittedAt: "জমা দেওয়া হয়েছে {date}" },
  inspections: {
    section: "পরিদর্শন",
    empty: "এখনও কোনো পরিদর্শক নিযুক্ত করা হয়নি।",
    visit: "পরিদর্শনের তারিখ: {date}",
    findings: "পর্যবেক্ষণ",
    correction: "সংশোধনের নির্দেশ",
    reinspection: "পুনরায় পরিদর্শন প্রয়োজন",
    photoAlt: "{total}টির মধ্যে পরিদর্শনের ছবি {n}",
  },
  allocate: {
    title: "পরিদর্শক নিযুক্ত করুন",
    text: "কাজ জমা হয়েছে। একজন ফাঁকা পরিদর্শক ও পরিদর্শনের তারিখ বেছে নিন।",
    searchLabel: "নাম দিয়ে পরিদর্শক খুঁজুন",
    searchPlaceholder: "নাম লিখুন",
    searching: "পরিদর্শক খোঁজা হচ্ছে",
    resultsLabel: "ফাঁকা পরিদর্শক",
    noResults: "কোনো ফাঁকা পরিদর্শক পাওয়া যায়নি।",
    photoAlt: "{name}-এর ছবি",
    selected: "নির্বাচিত পরিদর্শক",
    change: "বদলান",
    dateLabel: "পরিদর্শনের তারিখ ও সময়",
    dateHint: "এখন থেকে পরের কোনো সময় বেছে নিন।",
    submit: "পরিদর্শক নিযুক্ত করুন",
    success: "পরিদর্শক নিযুক্ত করা হয়েছে।",
  },
  errors: {
    inspectorRequired: "একজন পরিদর্শক নির্বাচন করুন",
    dateRequired: "পরিদর্শনের তারিখ দিতে হবে",
    datePast: "পরিদর্শনের তারিখ অতীতে হতে পারবে না",
  },
};

export default officerProjectBn;