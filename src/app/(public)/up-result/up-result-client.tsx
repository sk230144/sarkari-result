"use client";

import { useState } from "react";
import { Trophy, Send, CheckCircle2, AlertCircle, Zap } from "lucide-react";

const WHATSAPP_NUMBER = "916392891566";

export function UpResultClient() {
  const [board, setBoard] = useState<"10th" | "12th">("10th");
  const [rollNumber, setRollNumber] = useState("");
  const [dob, setDob] = useState("");
  const [errors, setErrors] = useState<{ roll?: string; dob?: string }>({});

  function validate() {
    const e: { roll?: string; dob?: string } = {};
    if (!rollNumber.trim()) e.roll = "Roll number is required";
    else if (!/^\d{6,10}$/.test(rollNumber.trim()))
      e.roll = "Enter a valid roll number (6–10 digits)";
    if (!dob) e.dob = "Date of birth is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleWhatsApp() {
    if (!validate()) return;
    const dobFormatted = dob
      ? new Date(dob).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";
    const text = encodeURIComponent(
      `📋 UP Board Result Request\n\n🎓 Class: ${board}\n🔢 Roll Number: ${rollNumber.trim()}\n📅 Date of Birth: ${dobFormatted}\n\nPlease send my UP Board result ASAP! 🙏`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero */}
      <div className="bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 text-white">
        <div className="container mx-auto px-4 py-10 sm:py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-black mb-4">
            <Zap className="h-3.5 w-3.5" />
            50% Faster Than Other Platforms
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 drop-shadow-sm">
            UP Board Result 2025
          </h1>
          <p className="text-sm sm:text-base font-bold text-white/85 max-w-md mx-auto">
            Check your 10th &amp; 12th result instantly — faster than any other website
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* LEFT — Online Checker (disabled) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">Check Result Online</p>
                  <p className="text-[11px] text-slate-400 font-medium">UPMSP — Class 10th &amp; 12th</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Board selector */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-2">
                  Select Class
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["10th", "12th"] as const).map((b) => (
                    <button
                      key={b}
                      disabled
                      className={`py-2.5 rounded-xl text-sm font-black border-2 transition-all cursor-not-allowed opacity-60 ${
                        board === b
                          ? "border-amber-400 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      Class {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1.5">
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your roll number"
                  disabled
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 placeholder:text-slate-300 bg-slate-50 cursor-not-allowed"
                />
              </div>

              {/* DOB */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  disabled
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 bg-slate-50 cursor-not-allowed"
                />
              </div>

              {/* Disabled button */}
              <button
                disabled
                className="w-full py-3 rounded-xl bg-slate-200 text-slate-400 text-sm font-black cursor-not-allowed flex items-center justify-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Result Not Declared Yet
              </button>

              {/* Notice */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
                  Online checker will be enabled as soon as UP Board declares results. You&apos;ll be able to check here before most other sites.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — WhatsApp (live) */}
          <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="bg-green-50 border-b border-green-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Send className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Get Result on WhatsApp</p>
                    <p className="text-[11px] text-slate-400 font-medium">Faster than any website</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Info */}
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Send your details on WhatsApp and get your result faster than anyone — even before most websites load!
              </p>

              {/* Board selector */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-2">
                  Select Class <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["10th", "12th"] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setBoard(b)}
                      className={`py-2.5 rounded-xl text-sm font-black border-2 transition-all ${
                        board === b
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-slate-200 bg-white text-slate-500 hover:border-green-300"
                      }`}
                    >
                      {board === b && <CheckCircle2 className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
                      Class {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1.5">
                  Roll Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 1234567"
                  value={rollNumber}
                  onChange={(e) => {
                    setRollNumber(e.target.value.replace(/\D/g, ""));
                    setErrors((prev) => ({ ...prev, roll: undefined }));
                  }}
                  maxLength={10}
                  className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none transition-colors ${
                    errors.roll
                      ? "border-red-400 bg-red-50 focus:border-red-500"
                      : "border-slate-200 focus:border-green-500 bg-white"
                  }`}
                />
                {errors.roll && (
                  <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.roll}
                  </p>
                )}
              </div>

              {/* DOB */}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1.5">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    setErrors((prev) => ({ ...prev, dob: undefined }));
                  }}
                  className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none transition-colors ${
                    errors.dob
                      ? "border-red-400 bg-red-50 focus:border-red-500"
                      : "border-slate-200 focus:border-green-500 bg-white"
                  }`}
                />
                {errors.dob && (
                  <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.dob}
                  </p>
                )}
              </div>

              {/* What will be sent preview */}
              {(rollNumber || dob) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Message Preview</p>
                  <p className="text-xs text-slate-600 font-medium">🎓 Class: <span className="font-black text-slate-800">{board}</span></p>
                  {rollNumber && <p className="text-xs text-slate-600 font-medium">🔢 Roll No: <span className="font-black text-slate-800">{rollNumber}</span></p>}
                  {dob && <p className="text-xs text-slate-600 font-medium">📅 DOB: <span className="font-black text-slate-800">{new Date(dob).toLocaleDateString("en-IN")}</span></p>}
                </div>
              )}

              {/* WhatsApp button */}
              <button
                onClick={handleWhatsApp}
                className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white text-sm font-black transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2.5"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Send on WhatsApp &amp; Get Result
              </button>

              <p className="text-center text-[11px] text-green-600 font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                WhatsApp service is live — reply within minutes
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto mt-8">
          <p className="text-center text-xs font-black text-slate-400 uppercase tracking-wider mb-4">How It Works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step: "1", title: "Enter Your Details", desc: "Select class, enter roll number and date of birth in the form above" },
              { step: "2", title: "Send on WhatsApp", desc: "Click the button — your details are pre-filled in the WhatsApp message" },
              { step: "3", title: "Get Result Instantly", desc: "We reply with your full result marksheet faster than any website" },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 items-start">
                <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-black text-amber-600 shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
