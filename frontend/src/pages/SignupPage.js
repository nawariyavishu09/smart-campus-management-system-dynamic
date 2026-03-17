import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { toast } from "sonner";
import {
  GraduationCap, ArrowLeft, Camera, Upload, CheckCircle2, Loader2,
  User, Mail, Phone, Building2, X, RefreshCw, CalendarDays, MapPin
} from "lucide-react";

const STEPS = ["Your Details", "College ID", "Review & Submit"];

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [departments, setDepartments] = useState([]);
  const role = "student";

  // Form state
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    department: "", department_id: "",
    // student fields
    roll_number: "", semester: "1", date_of_birth: "", address: "",
  });

  // Camera state
  const [cameraMode, setCameraMode] = useState(false); // webcam open?
  const [capturedImage, setCapturedImage] = useState(null); // base64 string
  const [cameraError, setCameraError] = useState("");
  const fileInputRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get("/public/departments").then((res) => setDepartments(res.data.departments || [])).catch(() => {});
  }, []);

  // ── Camera helpers ──────────────────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraMode(true);
    } catch (err) {
      setCameraError("Camera access denied. Please allow camera permission or upload an image instead.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraMode(false);
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image too large. Max 5MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setCapturedImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCameraMode(false);
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep0 = () => {
    if (!form.full_name.trim()) { toast.error("Full name is required"); return false; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error("Valid email is required"); return false; }
    if (!form.department_id.trim()) { toast.error("Department is required"); return false; }
    if (!form.date_of_birth) { toast.error("Date of birth is required"); return false; }
    if (!form.address.trim()) { toast.error("Address is required"); return false; }
    if (!form.roll_number.trim()) { toast.error("Roll number is required"); return false; }
    return true;
  };

  const validateStep1 = () => {
    if (!capturedImage) { toast.error("Please capture or upload your College ID"); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const selectedDepartment = departments.find((dept) => dept.id === form.department_id);
      await api.post("/signup-requests", {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role,
        department: selectedDepartment?.name || form.department || "",
        department_id: form.department_id,
        roll_number: form.roll_number.trim(),
        semester: parseInt(form.semester, 10) || 1,
        date_of_birth: form.date_of_birth,
        address: form.address.trim(),
        id_image_base64: capturedImage || "",
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 text-center space-y-5">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-black">Request Submitted!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your student signup request has been sent to the admin. They will review your details and College ID, then approve your account. Once approved, your login credentials will be sent to your registered email address.
          </p>
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Submitted as</p>
            <p className="text-sm font-black mt-1">{form.full_name}</p>
            <p className="text-xs text-muted-foreground">{form.email} · student</p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:opacity-90 transition-all"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-4 py-10">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg">
        {/* Logo + back */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black text-sm">SmartCampus</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-6">
            <h1 className="text-xl font-black text-white">Create Account</h1>
            <p className="text-indigo-200 text-xs mt-1">Student accounts are reviewed by admin before activation</p>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mt-5">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${i < step ? "bg-emerald-400 text-white" : i === step ? "bg-white text-indigo-700" : "bg-white/20 text-white/60"}`}>
                    {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-semibold hidden sm:block ${i === step ? "text-white" : "text-white/50"}`}>{s}</span>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < step ? "bg-emerald-400" : "bg-white/20"}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-7">
            <AnimatePresence mode="wait">
            {/* ── Step 0: Details ── */}
            {step === 0 && (
              <motion.div key="step0" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">Student Signup Only</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Faculty credentials are created and shared separately by admin.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Field icon={User} label="Full Name *" value={form.full_name} onChange={(v) => set("full_name", v)} placeholder="e.g. Rahul Sharma" />
                  <Field icon={Mail} label="Email Address *" value={form.email} onChange={(v) => set("email", v)} placeholder="your@email.com" type="email" />
                  <Field icon={Phone} label="Phone Number" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+91 98765 43210" />
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1.5">Department *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                      <select
                        value={form.department_id}
                        onChange={(e) => {
                          const dept = departments.find((item) => item.id === e.target.value);
                          setForm((prev) => ({ ...prev, department_id: e.target.value, department: dept?.name || "" }));
                        }}
                        className="w-full h-10 rounded-xl border border-border/60 bg-background text-sm pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                      >
                        <option value="">Select department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Field icon={CalendarDays} label="Date of Birth *" value={form.date_of_birth} onChange={(v) => set("date_of_birth", v)} type="date" />
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1.5">Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                      <textarea
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                        placeholder="Enter your complete address"
                        rows={3}
                        className="w-full rounded-xl border border-border/60 bg-background text-sm pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-muted-foreground/60 resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Roll Number *" value={form.roll_number} onChange={(v) => set("roll_number", v)} placeholder="e.g. CS21001" />
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1.5">Semester *</label>
                      <select value={form.semester} onChange={(e) => set("semester", e.target.value)} className="w-full h-10 rounded-xl border border-border/60 bg-background text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500">
                        {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 1: College ID ── */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Please capture or upload a clear photo of your College ID card. Admin will use this to verify your identity.
                  </p>
                </div>

                {/* Camera view */}
                {cameraMode && (
                  <div className="relative rounded-2xl overflow-hidden bg-black">
                    <video ref={videoRef} className="w-full rounded-2xl" autoPlay playsInline muted />
                    <div className="absolute inset-0 pointer-events-none border-4 border-white/20 rounded-2xl m-4" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                      <button onClick={stopCamera} className="px-4 py-2 rounded-xl bg-black/70 text-white text-xs font-bold flex items-center gap-2 hover:bg-black/90 transition-colors">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button onClick={capturePhoto} className="px-5 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors">
                        <Camera className="w-3.5 h-3.5" /> Capture
                      </button>
                    </div>
                  </div>
                )}

                {/* Captured preview */}
                {capturedImage && !cameraMode && (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500">
                      <img src={capturedImage} alt="College ID" className="w-full object-cover max-h-64 rounded-2xl" />
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> ID Captured
                      </div>
                    </div>
                    <button onClick={retakePhoto} className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold flex items-center justify-center gap-2 hover:bg-muted transition-colors">
                      <RefreshCw className="w-4 h-4" /> Retake / Change
                    </button>
                  </div>
                )}

                {/* Buttons to capture/upload */}
                {!capturedImage && !cameraMode && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={startCamera}
                      className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 hover:border-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-sm">Scan ID</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Use camera</p>
                      </div>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/30 hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-sm">Upload</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">From gallery</p>
                      </div>
                    </button>

                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </div>
                )}

                {cameraError && (
                  <p className="text-xs text-red-600 font-semibold mt-2">{cameraError}</p>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </motion.div>
            )}

            {/* ── Step 2: Review ── */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/50 space-y-3">
                  <Row label="Name" value={form.full_name} />
                  <Row label="Email" value={form.email} />
                  {form.phone && <Row label="Phone" value={form.phone} />}
                  <Row label="Role" value="Student" />
                  <Row label="Department" value={form.department} />
                  <Row label="Date of Birth" value={form.date_of_birth} />
                  <Row label="Address" value={form.address} />
                  <><Row label="Roll Number" value={form.roll_number} /><Row label="Semester" value={`Semester ${form.semester}`} /></>
                </div>

                {capturedImage && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">College ID</p>
                    <img src={capturedImage} alt="College ID" className="w-full max-h-40 object-cover rounded-xl border-2 border-emerald-500" />
                  </div>
                )}

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                    By submitting, you confirm that all details are accurate. Admin will review your College ID and activate your student account. You'll receive your login credentials on your registered email after approval.
                  </p>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 h-11 rounded-xl border border-border font-semibold text-sm hover:bg-muted transition-all"
                >
                  Back
                </button>
              )}
              {step < 2 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm hover:opacity-90 transition-all"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : "Submit Request"}
                </button>
              )}
            </div>

            {step === 0 && (
              <p className="text-center text-xs text-muted-foreground mt-4">
                Already have an account?{" "}
                <button onClick={() => navigate("/login")} className="text-indigo-600 font-bold hover:underline">
                  Login here
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-10 rounded-xl border border-border/60 bg-background text-sm ${Icon ? "pl-9 pr-3" : "px-3"} focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-muted-foreground/60`}
        />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}
