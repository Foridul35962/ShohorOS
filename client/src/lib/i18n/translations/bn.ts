import authBn from "./auth-bn";
import type { AppTranslations } from "../types";
import moderatorBn from "./moderator-bn";
import adminBn from "./admin-bn";
import issuesBn from "./issues-bn";
import issueDetailBn from "./issueDetail-bn";
import issueListBn from "./issueList-bn";
import adminOpsBn from "./adminOps-bn";
import contractorBn from "./contractor-bn";
import auctionListBn from "./auctionList-bn";
import notificationBn from "./notification-bn";
import staffBn from "./staff-bn";
import contractorProjectsBn from "./contractorProjects-bn";
import staffProjectsBn from "./staffProjects-bn";
import staffProjectDetailBn from "./staffProjectDetail-bn";
import officerProjectBn from "./officerProject-bn";
import inspectionsPanelBn from "./inspectionsPanel-bn";
import inspectorBn from "./inspector-bn";
import cityHomeBn from "./cityHome-bn";

const bn: AppTranslations = {
  meta: { title: "ShohorOS — শহরের প্রতিটি সমস্যা সমাধান পর্যন্ত নজরে রাখুন", description: "বাংলাদেশের জন্য নাগরিক প্রযুক্তি: নাগরিকের অভিযোগ থেকে পরিদর্শক-যাচাইকৃত সমাধান পর্যন্ত।" },
  nav: { register: "অ্যাকাউন্ট খুলুন", features: "বৈশিষ্ট্য", board: "অভিযোগ বোর্ড", faq: "প্রশ্নোত্তর", menu: "মেনু", how: "কীভাবে কাজ করে", ecosystem: "কারা যুক্ত", outcome: "ফলাফল", login: "লগইন", report: "সমস্যা জানান", theme: "থিম পরিবর্তন", language: "ভাষা", skip: "মূল অংশে যান" },
  problem: {
    title: "শহরে সমস্যার শেষ নেই, কিন্তু সমাধানের পথ ছড়িয়ে-ছিটিয়ে।",
    body: "নাগরিকেরা প্রতিদিনই এসব দেখেন। কোথায় জানাবেন স্পষ্ট নয়, দায়িত্ব কার বোঝা যায় না, অগ্রগতি চোখে পড়ে না, আর কাজ ঠিকমতো হলো কি না তা যাচাই করার উপায়ও নেই।",
    items: ["ভাঙা সড়ক", "জলাবদ্ধতা", "নালা-নর্দমা", "ময়লা-আবর্জনা", "নষ্ট সড়কবাতি", "বিদ্যুৎ সমস্যা"],
  },
  board: {
    title: "প্রতিটি অভিযোগ, এক নজরে।",
    sub: "লাইভ বোর্ডে দেখা যায় ওয়ার্ড, বিভাগ ও ঠিকাদার জুড়ে প্রতিটি অভিযোগ এখন কোথায় আছে।",
    window: "ShohorOS · অভিযোগ বোর্ড", note: "উদাহরণস্বরূপ নমুনা তথ্য।", progress: "অগ্রগতি",
    status: { all: "সব", review: "যাচাই চলছে", building: "কাজ চলছে", inspect: "পরিদর্শন", resolved: "সমাধান হয়েছে" },
    tickets: [
      { id: "SH-২০৪১", title: "ভাঙা সড়ক, মিরপুর ১০", area: "মিরপুর", s: "review", p: 15 },
      { id: "SH-২০৩৮", title: "জলাবদ্ধতা, মোহাম্মদপুর বাসস্ট্যান্ড", area: "মোহাম্মদপুর", s: "building", p: 55 },
      { id: "SH-২০৩৩", title: "সড়কবাতি নষ্ট, ধানমন্ডি ২৭", area: "ধানমন্ডি", s: "inspect", p: 85 },
      { id: "SH-২০২৯", title: "উপচে পড়া নর্দমা, উত্তরা সেক্টর ৭", area: "উত্তরা", s: "building", p: 60 },
      { id: "SH-২০২৪", title: "ময়লার স্তূপ, কারওয়ান বাজার", area: "তেজগাঁও", s: "resolved", p: 100 },
      { id: "SH-২০১৯", title: "ভাঙা ফুটপাত, গুলশান ১", area: "গুলশান", s: "resolved", p: 100 },
    ],
  },
  faq: {
    title: "আপনার প্রশ্ন, আমাদের উত্তর।",
    sub: "নাগরিক এবং শহর ঠিক করা মানুষদের জন্য ShohorOS কীভাবে কাজ করে, সংক্ষেপে।",
    items: [
      { q: "কে সমস্যা জানাতে পারবেন?", a: "যেকোনো নাগরিক। একটি ছবি যোগ করুন, জায়গা চিহ্নিত করুন আর সমস্যাটি লিখুন।" },
      { q: "অভিযোগ জানানোর পর কী হয়?", a: "প্রথমে মডারেটর যাচাই করেন, তারপর সংশ্লিষ্ট বিভাগ দায়িত্ব নিয়ে একটি প্রকল্প খোলে। প্রতিটি ধাপ আপনি অনুসরণ করতে পারবেন।" },
      { q: "ঠিকাদার কীভাবে বাছাই হয়?", a: "যাচাইকৃত ঠিকাদাররা কাজের পরিধি, খরচ ও সময় উল্লেখ করে দর দেন, আর বিভাগ স্বচ্ছ প্রক্রিয়ায় একজনকে নির্বাচন করে।" },
      { q: "কাজ সত্যিই শেষ হয়েছে কে নিশ্চিত করেন?", a: "অভিযোগ বন্ধ হওয়ার আগে একজন পরিদর্শক সম্মত পরিধির সঙ্গে মিলিয়ে সম্পন্ন কাজ যাচাই করেন।" },
      { q: "যেকোনো অভিযোগের ইতিহাস কি দেখা যায়?", a: "হ্যাঁ। প্রতিটি সমস্যার একটি প্রকাশ্য ইতিহাস থাকে, কে কখন কী করেছে তার।" },
      { q: "এটি কি বাংলায় পাওয়া যায়?", a: "হ্যাঁ। ShohorOS বাংলা ও ইংরেজি দুই ভাষাতেই চলে, সঙ্গে আছে লাইট ও ডার্ক থিম।" },
    ],
  },
  auth: authBn,
  moderator: moderatorBn,
  admin: adminBn,
  issues: issuesBn,
  issueDetail: issueDetailBn,
  issueList: issueListBn,
  adminOps: adminOpsBn,
  contractor: contractorBn,
  auctionList: auctionListBn,
  notifications: notificationBn,
  staff: staffBn,
  contractorProjects: contractorProjectsBn,
  staffProjects: staffProjectsBn,
  staffProjectDetail: staffProjectDetailBn,
  officerProject: officerProjectBn,
  inspectionsPanel: inspectionsPanelBn,
  inspector: inspectorBn,
  cityHome: cityHomeBn,
  footer: { blurb: "শহরের প্রতিটি সমস্যা প্রথম অভিযোগ থেকে যাচাইকৃত সমাধান পর্যন্ত নজরে রাখুন।", tagline: "বাংলাদেশের জন্য নাগরিক প্রযুক্তি।", cols: [{ h: "প্ল্যাটফর্ম", links: [{ l: "কীভাবে কাজ করে", h: "/#how" }, { l: "বৈশিষ্ট্য", h: "/#features" }, { l: "অভিযোগ বোর্ড", h: "/#board" }] }, { h: "কমিউনিটি", links: [{ l: "কারা যুক্ত", h: "/#who" }, { l: "প্রশ্নোত্তর", h: "/#faq" }, { l: "সমস্যা জানান", h: "/registration/citizen" }] }], rights: "© ২০২৬ ShohorOS। সর্বস্বত্ব সংরক্ষিত।" },
};
export default bn;
