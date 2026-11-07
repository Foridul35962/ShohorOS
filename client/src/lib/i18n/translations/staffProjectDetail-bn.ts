import type staffProjectDetailEn from "./staffProjectDetail-en";

const staffProjectDetailBn: typeof staffProjectDetailEn = {
  back: "আমার প্রকল্প",
  photoAlt: "{total}টির মধ্যে ছবি {n}",
  durationDays: "{count} দিন",
  createdAt: "তৈরি হয়েছে",
  accessDenied: {
    title: "শুধু প্রকল্প স্টাফদের জন্য",
    text: "এই পৃষ্ঠা শুধু প্রকল্প স্টাফ অ্যাকাউন্টে দেখা যায়।",
  },
  issue: { section: "সমস্যার বিবরণ", description: "বিবরণ" },
  schedule: {
    section: "সময়সূচি",
    plannedStart: "পরিকল্পিত শুরু",
    plannedEnd: "পরিকল্পিত শেষ",
    duration: "পরিকল্পিত সময়কাল",
    completedAt: "সম্পন্ন হয়েছে",
  },
  contractor: { section: "ঠিকাদার ও প্রতিষ্ঠান", company: "প্রতিষ্ঠান" },
  department: { section: "বিভাগ", name: "বিভাগ", code: "কোড" },
  progress: {
    section: "অগ্রগতির হালনাগাদ",
    empty: "এখনও কোনো অগ্রগতির হালনাগাদ নেই।",
    value: "{percent}% সম্পন্ন",
    workDate: "কাজের তারিখ: {date}",
  },
  completion: { section: "জমা দেওয়া কাজ", submittedAt: "জমা দেওয়া হয়েছে {date}" },
  actions: {
    title: "আপনার কাজ",
    current: "বর্তমান অগ্রগতি",
    update: "অগ্রগতি হালনাগাদ করুন",
    complete: "প্রকল্প সম্পন্ন করুন",
  },
  lockedReason: {
    planned: "ঠিকাদার প্রকল্প শুরু করার পর আপনি কাজ হালনাগাদ করতে পারবেন।",
    submitted: "কাজ জমা দেওয়া হয়েছে, পরিদর্শনের অপেক্ষায় আছে।",
    completed: "প্রকল্পটি সম্পন্ন হয়েছে।",
    cancelled: "প্রকল্পটি বাতিল হয়েছে।",
    other: "বর্তমান অবস্থায় কাজ হালনাগাদ করা যায় না।",
  },
  notice: {
    progress: "অগ্রগতির হালনাগাদ সংরক্ষিত হয়েছে।",
    complete: "প্রকল্প সম্পন্ন করার তথ্য জমা হয়েছে।",
  },
  dialog: {
    progress: {
      title: "অগ্রগতি হালনাগাদ করুন",
      text: "কী কাজ হলো লিখুন, অগ্রগতির শতাংশ এবং ১ থেকে ৫টি ছবি দিন।",
      submit: "হালনাগাদ সংরক্ষণ করুন",
    },
    complete: {
      title: "প্রকল্প সম্পন্ন করুন",
      text: "কাজ শেষ হয়েছে নিশ্চিত করুন। চূড়ান্ত বিবরণ, অগ্রগতির শতাংশ এবং ১ থেকে ৫টি ছবি দিন।",
      submit: "সম্পন্ন করার তথ্য জমা দিন",
    },
  },
  fields: {
    description: "কাজের বিবরণ",
    descriptionPlaceholder: "কী কাজ করা হয়েছে লিখুন",
    count: "{count}/{max}",
    progress: "অগ্রগতির শতাংশ (০-১০০)",
    progressPlaceholder: "যেমন: ৪০",
    photos: "ছবি",
    photosHint: "{min} থেকে {max}টি ছবি, প্রতিটি সর্বোচ্চ {size} MB।",
    addPhotos: "ছবি যোগ করুন",
    removePhoto: "ছবি {n} সরান",
    previewAlt: "নির্বাচিত ছবি {n}",
    photoCount: "{count}/{max}টি ছবি",
  },
  errors: {
    descriptionRequired: "বিবরণ দিতে হবে",
    descriptionMax: "বিবরণ {max} অক্ষরের বেশি হতে পারবে না",
    progressRequired: "অগ্রগতির শতাংশ দিতে হবে",
    progressRange: "অগ্রগতি ০ থেকে ১০০ এর মধ্যে একটি সংখ্যা হতে হবে",
    imagesMin: "কমপক্ষে ১টি ছবি দিন",
    imagesMax: "সর্বোচ্চ {max}টি ছবি দেওয়া যাবে",
    imageSize: "{name} {size} MB এর চেয়ে বড়",
    imageType: "{name} একটি ছবি নয়",
  },
};

export default staffProjectDetailBn;