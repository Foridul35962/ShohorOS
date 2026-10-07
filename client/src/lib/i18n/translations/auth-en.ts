const authEn = {
  fields: {
    email: "Email", emailPh: "you@example.com", password: "Password", passwordPh: "At least 8 characters", confirmPassword: "Confirm password",
    newPassword: "New password", name: "Full name", namePh: "Your full name", phone: "Phone number", phonePh: "01XXXXXXXXX", district: "District", districtPh: "Select a district",
    companyName: "Company name", registrationNumber: "Registration number", description: "About the company", optional: "(optional)",
    house: "House / building", street: "Street", postalCode: "Postal code", contactName: "Contact person name", otp: "Verification code",
  },
  actions: { show: "Show password", hide: "Hide password", loading: "Please wait…" },
  errors: {
    emailRequired: "Email is required", emailInvalid: "Email is invalid", passwordRequired: "Password is required", passwordMismatch: "Password does not match",
    passwordMin: "Password must be at least 8 characters", passwordLetter: "Password must contain a letter", passwordNumber: "Password must contain a number",
    confirmRequired: "Please re-enter your password", confirmMismatch: "Passwords do not match", nameRequired: "Name is required", phoneInvalid: "Phone number is invalid",
    districtRequired: "District is required", districtInvalid: "Invalid district", otpRequired: "Code is required", otpInvalid: "Enter the 6-digit code",
    companyRequired: "Company name is required", regNoRequired: "Registration number is required", houseRequired: "House name is required",
    streetRequired: "Street name is required", postalRequired: "Postal code is required",
  },
  shell: { side: "Secure, transparent and built for Bangladesh." },
  login: { title: "Welcome back", sub: "Log in to report problems and follow their progress.", submit: "Log in", forgot: "Forgot password?", noAccount: "New to ShohorOS?", register: "Create an account" },
  register: {
    title: "Create your account", sub: "Choose how you will use ShohorOS.",
    citizen: { t: "I'm a citizen", d: "Report problems in your area and follow every step until they are fixed." },
    contractor: { t: "I'm a contractor", d: "Register your company, bid on verified projects and post progress from the field." },
    have: "Already have an account?", login: "Log in",
  },
  citizen: { title: "Citizen registration", sub: "Create an account to report and track city problems.", steps: ["Your details", "Verify email"], submit: "Continue" },
  contractor: {
    title: "Contractor registration", sub: "Register your company to bid on public projects.", steps: ["Your details", "Verify email"], submit: "Continue",
    sections: { company: "Company", address: "Address", account: "Contact person & account" },
  },
  otp: {
    title: "Verify your email", sub: "We sent a 6-digit code to", submit: "Verify and finish", back: "Change details", resend: "Resend code",
    doneTitle: "You're all set", doneText: "Your account is verified. You can log in now.", toLogin: "Go to log in",
  },
  forgot: {
    title: "Forgot password", sub: "We'll help you get back in.", steps: ["Email", "Code", "New password"],
    s1: { title: "Enter your email", sub: "We'll send a 6-digit code to this email if an account exists.", submit: "Send code" },
    s2: { title: "Enter the code", sub: "We sent a 6-digit code to", submit: "Verify code" },
    s3: { title: "Set a new password", sub: "Choose a strong password you haven't used before.", submit: "Reset password" },
    doneTitle: "Password updated", doneText: "You can now log in with your new password.", back: "Back to log in", change: "Use a different email",
  },
};
export default authEn;
