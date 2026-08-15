"use client";

import AuthPage from "@/pages/AuthPage";
import { useNavigate } from "@/hooks/useNavigate";

/**
 * /login — صفحه ورود و ثبت‌نام
 */
export default function LoginPage() {
  const navigate = useNavigate();
  return <AuthPage navigate={navigate} />;
}
