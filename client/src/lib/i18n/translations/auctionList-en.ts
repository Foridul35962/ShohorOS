const auctionListEn = {
  title: "All auctions",
  sub: "See every auction in your district and open its issue or bids.",
  count: "{count} total",
  listLabel: "Auctions",
  filters: {
    label: "Filter auctions",
    category: "Category",
    allCategories: "All categories",
    status: "Status",
    allStatuses: "All statuses",
    deadline: "Sort by deadline",
    search: "Search",
    clear: "Clear filters",
  },
  startsAt: "Started: {date}",
  deadline: "Deadline: {date}",
  deadlineValue: {
    all: "All Deadlines",
    active: "Active (Not Passed)",
    expired: "Expired (Passed)"
  },
  viewIssue: "View issue",
  viewAuction: "View auction",
  showing: "Showing {from}-{to} of {total}",
  pagination: { prev: "Previous", next: "Next", label: "Auction pages" },
  empty: {
    title: "No auctions found",
    textFiltered: "Try changing or clearing the filters.",
    textNone: "No auction has been started yet.",
    clear: "Clear filters",
  },
  loadFailed: { title: "Could not load auctions", retry: "Try again" },
};

export default auctionListEn;