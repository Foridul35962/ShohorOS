import type auctionListEn from "./auctionList-en";

const auctionListBn: typeof auctionListEn = {
  title: "সব নিলাম",
  sub: "আপনার জেলার সব নিলাম দেখুন এবং সমস্যা বা দরপ্রস্তাব খুলুন।",
  count: "মোট {count}টি",
  listLabel: "নিলামের তালিকা",
  filters: {
    label: "নিলাম ফিল্টার করুন",
    category: "ধরন",
    allCategories: "সব ধরন",
    status: "অবস্থা",
    allStatuses: "সব অবস্থা",
    deadline: "শেষ সময় অনুযায়ী সাজান",
    search: "খুঁজুন",
    clear: "ফিল্টার মুছুন",
  },
  startsAt: "শুরু: {date}",
  deadline: "শেষ সময়: {date}",
  deadlineValue: {
    all: "সবগুলো",
    active: "চলমান",
    expired: "সময়োত্তীর্ণ"
  },
  viewIssue: "সমস্যা দেখুন",
  viewAuction: "নিলাম দেখুন",
  showing: "{total}টির মধ্যে {from}-{to} দেখানো হচ্ছে",
  pagination: { prev: "আগের", next: "পরের", label: "নিলামের পৃষ্ঠা" },
  empty: {
    title: "কোনো নিলাম পাওয়া যায়নি",
    textFiltered: "ফিল্টার বদলে বা মুছে আবার দেখুন।",
    textNone: "এখনও কোনো নিলাম শুরু হয়নি।",
    clear: "ফিল্টার মুছুন",
  },
  loadFailed: { title: "নিলামের তালিকা লোড করা যায়নি", retry: "আবার চেষ্টা করুন" },
};

export default auctionListBn;