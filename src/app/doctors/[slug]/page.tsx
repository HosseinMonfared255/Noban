"use client";

import { useParams } from "next/navigation";
import DoctorProfile from "@/pages/DoctorProfile";
import { useNavigate } from "@/hooks/useNavigate";
import { useEffect, useState } from "react";
import { getDoctorBySlug } from "@/lib/api";
import type { Doctor } from "@prisma/client";
import NotFound from "./not-found";
import Loading from "./loading";

/**
 * /doctors/[slug] — صفحه پروفایل اختصاصی هر پزشک
 *
 * slug نام پزشک است (URL-encoded). مثال:
 *   /doctors/دکتر%20سارا%20محمدی
 */
export default function DoctorProfilePage() {
  const params = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Handle potential null/undefined params
  if (!params || typeof params.slug !== 'string') {
    return <NotFound />;
  }
  
  const slug = decodeURIComponent(params.slug);

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const data = await getDoctorBySlug(slug);
        setDoctor(data);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDoctor();
  }, [slug]);

  if (loading) {
    return <Loading />;
  }

  if (!doctor) {
    return <NotFound />;
  }

  return <DoctorProfile doctor={doctor} navigate={navigate} />;
}
