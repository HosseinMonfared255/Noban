export type PageName = "home" | "doctors" | "doctor" | "login" | "panel" | "admin" | "secretary" | "favorites" | "article" | "appointments" | "profile" | "help";
export type Nav = (
  page: PageName,
  section?: string,
  doctorName?: string
) => void;
