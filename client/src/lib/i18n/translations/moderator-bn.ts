import type moderatorEn from "./moderator-en";
const moderatorBn: typeof moderatorEn = {
  tabs: { citizen: "নাগরিকের অনুরোধ", contractor: "ঠিকাদারের অনুরোধ" },
  citizen: { title: "নাগরিক নিবন্ধনের অনুরোধ", sub: "নতুন নাগরিকদের নিবন্ধন যাচাই করে অনুমোদন বা প্রত্যাখ্যান করুন।", emptyTitle: "কোনো অপেক্ষমাণ নাগরিক অনুরোধ নেই", emptyText: "সব অনুরোধ নিষ্পত্তি হয়েছে। নতুন অনুরোধ এলে এখানে দেখা যাবে।" },
  contractor: { title: "ঠিকাদার নিবন্ধনের অনুরোধ", sub: "অনুমোদনের আগে প্রতিষ্ঠানের তথ্য ভালোভাবে যাচাই করুন।", emptyTitle: "কোনো অপেক্ষমাণ ঠিকাদার অনুরোধ নেই", emptyText: "সব অনুরোধ নিষ্পত্তি হয়েছে। নতুন অনুরোধ এলে এখানে দেখা যাবে।" },
  pending: "অপেক্ষমাণ", requestedOn: "অনুরোধের তারিখ", accept: "অনুমোদন", reject: "প্রত্যাখ্যান", retry: "আবার চেষ্টা করুন",
  fields: { phone: "মোবাইল", email: "ইমেইল", district: "জেলা", contact: "যোগাযোগকারী", regNo: "নিবন্ধন নম্বর", address: "ঠিকানা", about: "প্রতিষ্ঠান সম্পর্কে" },
  rejectDialog: {
    title: "অনুরোধ প্রত্যাখ্যান করুন", sub: "কেন এই অনুরোধ প্রত্যাখ্যান করা হচ্ছে তার কারণ লিখুন।", label: "কারণ",
    placeholder: "যেমন: নিবন্ধন নম্বরটি যাচাই করা যায়নি।", required: "কারণ লেখা আবশ্যক", confirm: "প্রত্যাখ্যান করুন", cancel: "বাতিল", close: "বন্ধ করুন",
  },
  pagination: { prev: "আগের", next: "পরের", label: "পৃষ্ঠা" },
};
export default moderatorBn;