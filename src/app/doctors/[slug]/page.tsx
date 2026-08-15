"use client";

import { useParams } from "next/navigation";
import DoctorProfile from "@/pages/DoctorProfile";
import { useNavigate } from "@/hooks/useNavigate";
import { doctors } from "@/data";
import NotFound from "./not-found";

/**
 * /doctors/[slug] — صفحه پروفایل اختصاصی هر پزشک
 *
 * slug نام پزشک است (URL-encoded). مثال:
 *   /doctors/دکتر%20سارا%20محمدی
 */
export default function DoctorProfilePage() {
  const params = useParams();
  const navigate = useNavigate();
  const slug = decodeURIComponent(params.slug as string);

  const doctor = doctors.find((d) => d.name === slug);

  if (!doctor) {
    return <NotFound />;
  }

  return <DoctorProfile doctor={doctor} navigate={navigate} />;
}
