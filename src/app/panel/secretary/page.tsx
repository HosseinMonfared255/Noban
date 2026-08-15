"use client";

import SecretaryPanel from "@/pages/SecretaryPanel";
import { useNavigate } from "@/hooks/useNavigate";

/**
 * /panel/secretary — پنل منشی
 */
export default function SecretaryPanelPage() {
  const navigate = useNavigate();
  return <SecretaryPanel navigate={navigate} />;
}
