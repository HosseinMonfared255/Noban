"use client";

import ProfilePage from "@/pages/ProfilePage";
import { useNavigate } from "@/hooks/useNavigate";

/**
 * /profile — صفحه پروفایل کاربر معمولی
 */
export default function ProfileRoutePage() {
  const navigate = useNavigate();
  return <ProfilePage navigate={navigate} />;
}
