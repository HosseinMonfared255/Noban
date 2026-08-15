"use client";

import DoctorPanel from "@/pages/DoctorPanel";
import { useNavigate } from "@/hooks/useNavigate";

/**
 * /panel/doctor — پنل پزشک
 */
export default function DoctorPanelPage() {
  const navigate = useNavigate();
  return <DoctorPanel navigate={navigate} />;
}
