"use client";

import HelpPage from "@/pages/HelpPage";
import { useNavigate } from "@/hooks/useNavigate";

/**
 * /contact — صفحه تماس با پشتیبانی (مرکز پشتیبانی)
 */
export default function ContactPage() {
  const navigate = useNavigate();
  return <HelpPage navigate={navigate} />;
}
