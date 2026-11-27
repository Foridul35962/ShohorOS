const dashboardEn = {
  common: {
    locked: {
      title: "Not available for your account",
      text: "This dashboard is for a different type of account.",
    },
    photoAlt: "Photo of {title}",
  },
  citizen: {
    title: "My dashboard",
    welcome: "Welcome back, {name}",
    welcomeAnon: "Welcome back",
    subtitle: "Follow the problems you reported and the work done on them.",
    report: "Report an Issue",
    myIssues: "My issues",
    stats: {
      label: "Summary of your issues",
      total: "Total issues",
      pending: "Pending",
      inProgress: "In progress",
      resolved: "Resolved",
      rejected: "Rejected",
    },
    resolvedOf: "{resolved} of {total} issues resolved",
    recent: {
      title: "Recent issues",
      viewAll: "View all",
      empty: {
        title: "You have not reported anything yet",
        text: "Report a problem in your area and follow it from here.",
      },
      department: "Department",
      reportedOn: "Reported {date}",
      noDepartment: "Not assigned to a department yet",
    },
    project: {
      title: "Work progress",
      status: "Project status",
      progress: "{percent}% complete",
      plannedEnd: "Planned end {date}",
      completedOn: "Completed {date}",
      updates: "{count} updates",
    },
    error: "Couldn't load your dashboard",
  },
};

export default dashboardEn;