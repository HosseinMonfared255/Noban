"use client";

import DoctorsPage from "@/pages/DoctorsPage";
import { useNavigate } from "@/hooks/useNavigate";

/**
 * /doctors — لیست کامل پزشکان
 */
export default function DoctorsListPage() {
  const navigate = useNavigate();
  return <DoctorsPage navigate={navigate} />;
}
