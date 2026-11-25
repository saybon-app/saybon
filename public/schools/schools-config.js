// C'est bon for Schools: who may open it.
// For now only the SayBon admin. To admit a partner school later, add its login email to SCHOOLS_ALLOWED_EMAILS.
export const SCHOOLS_ADMIN_EMAIL = "saybon.fr@gmail.com";
export const SCHOOLS_ALLOWED_EMAILS = [SCHOOLS_ADMIN_EMAIL];

export const SCHOOLS_LEVELS = [
  { id: "a0", label: "A0", sub: "Absolute Beginner" },
  { id: "a1", label: "A1", sub: "Beginner" },
  { id: "a2", label: "A2", sub: "Elementary" },
  { id: "b1", label: "B1", sub: "Intermediate" },
  { id: "b2", label: "B2", sub: "Upper Intermediate" }
];
export const SCHOOLS_LESSONS = 25;

function norm(u){ return String((u && u.email) || "").trim().toLowerCase(); }
export function isSchoolsAdmin(user){ return norm(user) === SCHOOLS_ADMIN_EMAIL; }
export function isSchoolsAllowed(user){ return SCHOOLS_ALLOWED_EMAILS.indexOf(norm(user)) !== -1; }
