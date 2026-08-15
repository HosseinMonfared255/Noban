"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Icon from "./Icon";

/**
 * Avatar upload component with file selection, image preview, and crop.
 * - Click avatar to select a file
 * - Shows preview modal with crop (drag to reposition)
 * - Confirms to save as base64 data URL
 * - Allows removing the avatar
 */
export default function AvatarUpload({
  currentAvatar,
  initials,
  onConfirm,
  onRemove,
  size = "lg",
}: {
  currentAvatar?: string;
  initials: string;
  onConfirm: (dataUrl: string) => void;
  onRemove?: () => void;
  size?: "lg" | "sm";
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const dim = size === "lg" ? "h-24 w-24" : "h-12 w-12";
  const textSize = size === "lg" ? "text-3xl" : "text-lg";

  const onFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم تصویر نباید بیش از ۵ مگابایت باشد");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setCropMode(true);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const maxX = 60;
    const maxY = 60;
    const x = Math.max(-maxX, Math.min(maxX, e.clientX - dragStart.x));
    const y = Math.max(-maxY, Math.min(maxY, e.clientY - dragStart.y));
    setOffset({ x, y });
  };

  const handleMouseUp = () => setDragging(false);

  const confirmCrop = () => {
    if (!preview) return;
    // Create a canvas to crop the image to a square
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = Math.min(img.width, img.height);
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // Calculate source crop area (centered + offset)
      const sx = (img.width - size) / 2 + (offset.x / 60) * (size / 2);
      const sy = (img.height - size) / 2 + (offset.y / 60) * (size / 2);
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      onConfirm(dataUrl);
      setCropMode(false);
      setPreview(null);
      toast.success("تصویر پروفایل به‌روزرسانی شد", { icon: "📸" });
    };
    img.src = preview;
  };

  const cancelCrop = () => {
    setCropMode(false);
    setPreview(null);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <>
      <div className="group relative">
        <button
          onClick={() => fileRef.current?.click()}
          data-cursor="hover"
          className={`relative grid ${dim} shrink-0 place-items-center overflow-hidden rounded-3xl transition`}
          aria-label="تغییر تصویر پروفایل"
        >
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="پروفایل"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={`grid h-full w-full place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 ${textSize} font-black text-white`}>
              {initials}
            </div>
          )}
          {/* hover overlay */}
          <div className="absolute inset-0 grid place-items-center bg-slate-900/50 opacity-0 transition group-hover:opacity-100">
            <Icon name="edit" className="h-6 w-6 text-white" />
          </div>
        </button>
        {currentAvatar && onRemove && (
          <button
            onClick={() => {
              onRemove();
              toast.success("تصویر پروفایل حذف شد", { icon: "🗑️" });
            }}
            data-cursor="hover"
            className="absolute -left-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-white shadow-lg transition hover:scale-110"
            aria-label="حذف تصویر"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      {/* Crop modal */}
      <AnimatePresence>
        {cropMode && preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelCrop}
            className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl"
            >
              {/* header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-700">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  برش تصویر
                </h3>
                <button
                  onClick={cancelCrop}
                  data-cursor="hover"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500 dark:bg-slate-800/70"
                  aria-label="بستن"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>

              {/* crop area */}
              <div className="p-4">
                <div
                  className="relative mx-auto h-48 w-48 cursor-move overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-700"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* The image, larger than the container, draggable */}
                  <img
                    src={preview}
                    alt="پیش‌نمایش"
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[180%] w-[180%] -translate-x-1/2 -translate-y-1/2 object-cover"
                    style={{
                      transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                    }}
                    draggable={false}
                  />
                  {/* Crop overlay — square cutout */}
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg" />
                  </div>
                  {/* Dimming outside the circle */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at center, transparent 66px, rgba(0,0,0,0.5) 67px)",
                    }}
                  />
                </div>
                <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                  برای تنظیم موقعیت، تصویر را بکشید
                </p>

                {/* actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={cancelCrop}
                    data-cursor="hover"
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={confirmCrop}
                    data-cursor="hover"
                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-[1.02]"
                  >
                    تأیید تصویر
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
