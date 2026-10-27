import type issueDetailEn from "./issueDetail-en";

const issueDetailBn: typeof issueDetailEn = {
  back: "হোমে ফিরুন",
  loadFailed: {
    title: "সমস্যাটি লোড করা যায়নি",
    retry: "আবার চেষ্টা করুন",
  },
  duplicate: {
    title: "এই সমস্যাটি আগেই জানানো হয়েছে",
    text: "এই সমস্যার একটি রিপোর্ট আগে থেকেই আছে, তাই নতুন রিপোর্ট তৈরি করা হয়নি। এটিই আগের রিপোর্ট।",
  },
  status: {
    REPORTED: "জমা হয়েছে",
    UNDER_REVIEW: "পর্যালোচনাধীন",
    REJECTED: "প্রত্যাখ্যাত",
    APPROVED: "অনুমোদিত",
    PROJECT_CREATED: "প্রকল্প তৈরি হয়েছে",
    IN_PROGRESS: "কাজ চলছে",
    AWAITING_INSPECTION: "পরিদর্শনের অপেক্ষায়",
    REVISION_REQUIRED: "সংশোধন প্রয়োজন",
    RESOLVED: "সমাধান হয়েছে",
    CANCELLED: "বাতিল",
  },
  priority: "অগ্রাধিকার {n}",
  reportedOn: "{date} তারিখে জানানো হয়েছে",
  sections: {
    before: "কাজের আগে",
    beforeSub: "মূল রিপোর্টের সঙ্গে জমা দেওয়া ছবি।",
    after: "কাজের পরে",
    afterSub: "কাজ শেষ হওয়ার পর জমা দেওয়া ছবি।",
    afterPending: "ঠিকাদার কাজ শেষের ছবি জমা দিলে এখানে কাজের পরের ছবি দেখা যাবে।",
    description: "বিস্তারিত বিবরণ",
    location: "অবস্থান",
  },
  details: {
    district: "জেলা",
    street: "রাস্তা",
    city: "শহর",
    postalCode: "পোস্টাল কোড",
    coordinates: "স্থানাঙ্ক",
    openMap: "গুগল ম্যাপে খুলুন",
    mapLabel: "সমস্যার অবস্থান দেখানো মানচিত্র",
  },
  gallery: {
    before: {
      badge: "কাজের আগে",
      label: "কাজের আগের ছবি",
      show: "{total}টির মধ্যে কাজের আগের ছবি {n} দেখুন",
      alt: "কাজের আগের ছবি {n} ({total}টির মধ্যে)",
    },
    after: {
      badge: "কাজের পরে",
      label: "কাজের পরের ছবি",
      show: "{total}টির মধ্যে কাজের পরের ছবি {n} দেখুন",
      alt: "কাজের পরের ছবি {n} ({total}টির মধ্যে)",
    },
  },
  moderation: {
    title: "মডারেটর পর্যালোচনা",
    sub: "এই সমস্যাটি আপনার সিদ্ধান্তের অপেক্ষায় আছে।",
    accept: "সমস্যা গ্রহণ করুন",
    reject: "সমস্যা প্রত্যাখ্যান করুন",
    accepted: "সমস্যাটি গ্রহণ করা হয়েছে এবং অগ্রাধিকার ঠিক হয়েছে।",
    rejected: "সমস্যাটি প্রত্যাখ্যান করা হয়েছে।",
  },
  accept: {
    title: "এই সমস্যাটি গ্রহণ করুন",
    text: "১ থেকে ৫ এর মধ্যে একটি অগ্রাধিকার বেছে নিয়ে নিশ্চিত করুন।",
    priorityLabel: "অগ্রাধিকার",
    low: "সবচেয়ে কম",
    high: "সবচেয়ে বেশি",
    option: "অগ্রাধিকার {n}",
    required: "একটি অগ্রাধিকার বেছে নিন",
    confirm: "গ্রহণ করুন",
    confirming: "গ্রহণ করা হচ্ছে...",
  },
  reject: {
    title: "সমস্যাটি প্রত্যাখ্যান করবেন?",
    text: "এই রিপোর্টটি প্রত্যাখ্যাত হিসেবে চিহ্নিত হবে এবং আর এগোবে না।",
    confirm: "প্রত্যাখ্যান করুন",
    confirming: "প্রত্যাখ্যান করা হচ্ছে...",
  },
  cancel: "বাতিল",
  close: "বন্ধ করুন",
};

export default issueDetailBn;