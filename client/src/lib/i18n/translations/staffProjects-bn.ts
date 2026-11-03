import type staffProjectsEn from "./staffProjects-en";

const staffProjectsBn: typeof staffProjectsEn = {
  title: "আমার প্রকল্প",
  subtitle: "আপনাকে বরাদ্দ করা প্রকল্পগুলো দেখুন।",
  count: "{count}টি প্রকল্প",
  loading: "প্রকল্প লোড হচ্ছে",
  durationDays: "{count} দিন",
  startsOn: "শুরু {date}",
  notStarted: "এখনও শুরু হয়নি",
  filters: {
    label: "প্রকল্প ফিল্টার",
    category: "ক্যাটাগরি",
    allCategories: "সব ক্যাটাগরি",
    search: "খুঁজুন",
    clear: "ফিল্টার মুছুন",
  },
  showing: "{total}টির মধ্যে {from}-{to} দেখানো হচ্ছে",
  pagination: { prev: "আগের", next: "পরের", label: "পৃষ্ঠা" },
  empty: {
    title: "এখনও কোনো প্রকল্প বরাদ্দ হয়নি",
    text: "ঠিকাদার আপনাকে যে প্রকল্প দেবেন তা এখানে দেখা যাবে।",
    filteredTitle: "কোনো প্রকল্প পাওয়া যায়নি",
    filteredText: "অন্য ক্যাটাগরি দিয়ে চেষ্টা করুন।",
  },
  error: { title: "প্রকল্প লোড করা যায়নি", retry: "আবার চেষ্টা করুন" },
  locked: {
    title: "শুধু প্রকল্প স্টাফদের জন্য",
    text: "এই পৃষ্ঠা শুধু প্রকল্প স্টাফ অ্যাকাউন্টে দেখা যায়।",
  },
};

export default staffProjectsBn;