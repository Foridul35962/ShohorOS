const moderatorEn = {
  tabs: { citizen: "Citizen requests", contractor: "Contractor requests" },
  citizen: { title: "Citizen requests", sub: "Review new citizen sign-ups, then approve or reject them.", emptyTitle: "No pending citizen requests", emptyText: "You're all caught up. New requests will appear here." },
  contractor: { title: "Contractor requests", sub: "Check the company details carefully before approving a contractor.", emptyTitle: "No pending contractor requests", emptyText: "You're all caught up. New requests will appear here." },
  pending: "pending", requestedOn: "Requested on", accept: "Accept", reject: "Reject", retry: "Try again",
  fields: { phone: "Phone", email: "Email", district: "District", contact: "Contact person", regNo: "Registration no.", address: "Address", about: "About the company" },
  rejectDialog: {
    title: "Reject request", sub: "Write the reason for rejecting this request.", label: "Reason",
    placeholder: "e.g. The registration number could not be verified.", required: "Reason is required", confirm: "Reject request", cancel: "Cancel", close: "Close",
  },
  pagination: { prev: "Previous", next: "Next", label: "Pagination" },
};
export default moderatorEn;