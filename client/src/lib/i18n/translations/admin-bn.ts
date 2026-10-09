import type adminEn from "./admin-en";
const adminBn: typeof adminEn = {
  members: {
    title: "সদস্য", sub: "আপনার শহরের সমস্যা সমাধানে যুক্ত সবাই। খুঁজুন, ফিল্টার করুন বা সদস্য সরিয়ে দিন।", add: "সদস্য যোগ করুন", total: "জন সদস্য",
    search: { name: "নাম দিয়ে খুঁজুন", namePh: "নাম লিখুন…", role: "ভূমিকা", allRoles: "সব ভূমিকা", submit: "খুঁজুন", clear: "মুছে ফেলুন" },
    roles: { moderator: "মডারেটর", "department-officer": "বিভাগীয় কর্মকর্তা", "city-admin": "সিটি অ্যাডমিন", inspector: "পরিদর্শক" },
    joined: "যোগ দিয়েছেন", delete: "মুছুন", retry: "আবার চেষ্টা করুন",
    noMembersTitle: "এখনো কোনো সদস্য নেই", noMembersText: "আপনি সদস্য যোগ করলে এখানে দেখা যাবে।",
    noResultsTitle: "কোনো সদস্য পাওয়া যায়নি", noResultsText: "অন্য নাম বা ভূমিকা দিয়ে চেষ্টা করুন।",
    showing: "{total} জনের মধ্যে {from}–{to} দেখানো হচ্ছে",
    deleteDialog: { title: "এই সদস্যকে মুছে ফেলবেন?", text: "অ্যাকাউন্টটি স্থায়ীভাবে মুছে যাবে। এই কাজ আর ফেরানো যাবে না।", confirm: "হ্যাঁ, মুছে ফেলুন", cancel: "বাতিল", close: "বন্ধ করুন" },
    pagination: { prev: "আগের", next: "পরের", label: "পৃষ্ঠা" },
  },
};
export default adminBn;