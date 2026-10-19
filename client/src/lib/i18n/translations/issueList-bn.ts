import type issueListEn from "./issueList-en";

const issueListBn: typeof issueListEn = {
  title: "সব সমস্যা",
  sub: "জানানো সমস্যাগুলো দেখুন এবং অগ্রগতি অনুসরণ করুন।",
  count: "মোট {count}টি",
  report: "সমস্যা জানান",
  listLabel: "সমস্যার তালিকা",
  filters: {
    label: "সমস্যা ফিল্টার করুন",
    category: "ধরন",
    allCategories: "সব ধরন",
    status: "অবস্থা",
    allStatuses: "সব অবস্থা",
    priority: "অগ্রাধিকার",
    allPriorities: "সব অগ্রাধিকার",
    priorityOption: "অগ্রাধিকার {n}",
    myIssue: "আমার সমস্যা",
    search: "খুঁজুন",
    clear: "ফিল্টার মুছুন",
  },
  showing: "{total}টির মধ্যে {from}-{to} দেখানো হচ্ছে",
  pagination: { prev: "আগের", next: "পরের", label: "সমস্যার পৃষ্ঠা" },
  empty: {
    title: "কোনো সমস্যা পাওয়া যায়নি",
    textFiltered: "ফিল্টার বদলে বা মুছে আবার দেখুন।",
    textNone: "এখনও কোনো সমস্যা জানানো হয়নি।",
    clear: "ফিল্টার মুছুন",
  },
  loadFailed: {
    title: "সমস্যার তালিকা লোড করা যায়নি",
    retry: "আবার চেষ্টা করুন",
  },
};

export default issueListBn;