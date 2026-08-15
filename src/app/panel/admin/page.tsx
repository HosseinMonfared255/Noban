"use client";

import AdminPanel from "@/pages/AdminPanel";
import { useNavigate } from "@/hooks/useNavigate";

/**
 * /panel/admin — پنل مدیر سیستم
 */
export default function AdminPanelPage() {
  const navigate = useNavigate();
  return <AdminPanel navigate={navigate} />;
}
