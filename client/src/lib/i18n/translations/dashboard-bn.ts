import type dashboardEn from "./dashboard-en";

const dashboardBn: typeof dashboardEn = {
  common: {
    locked: {
      title: "আপনার অ্যাকাউন্টের জন্য নয়",
      text: "এই ড্যাশবোর্ড অন্য ধরনের অ্যাকাউন্টের জন্য।",
    },
    photoAlt: "{title}-এর ছবি",
  },
  citizen: {
    title: "আমার ড্যাশবোর্ড",
    welcome: "আবার স্বাগতম, {name}",
    welcomeAnon: "আবার স্বাগতম",
    subtitle: "আপনার জানানো সমস্যা এবং তার কাজের অগ্রগতি অনুসরণ করুন।",
    report: "সমস্যা জানান",
    myIssues: "আমার অভিযোগ",
    stats: {
      label: "আপনার অভিযোগের সারাংশ",
      total: "মোট অভিযোগ",
      pending: "অপেক্ষমাণ",
      inProgress: "চলমান",
      resolved: "সমাধান হয়েছে",
      rejected: "প্রত্যাখ্যাত",
    },
    resolvedOf: "{total}টির মধ্যে {resolved}টি অভিযোগের সমাধান হয়েছে",
    recent: {
      title: "সাম্প্রতিক অভিযোগ",
      viewAll: "সব দেখুন",
      empty: {
        title: "আপনি এখনও কিছু জানাননি",
        text: "আপনার এলাকার সমস্যা জানান এবং এখান থেকে অনুসরণ করুন।",
      },
      department: "বিভাগ",
      reportedOn: "জানানো হয়েছে {date}",
      noDepartment: "এখনও কোনো বিভাগে বরাদ্দ হয়নি",
    },
    project: {
      title: "কাজের অগ্রগতি",
      status: "প্রকল্পের অবস্থা",
      progress: "{percent}% সম্পন্ন",
      plannedEnd: "পরিকল্পিত শেষ {date}",
      completedOn: "সম্পন্ন হয়েছে {date}",
      updates: "{count}টি হালনাগাদ",
    },
    error: "ড্যাশবোর্ড লোড করা যায়নি",
  },
};

export default dashboardBn;