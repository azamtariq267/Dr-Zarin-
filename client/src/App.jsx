import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { CalendarDays, CreditCard, FileText, FlaskConical, LayoutDashboard, Bell, Pill, Settings as Cog, MessageSquare, Clock, User, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Gallery from "./pages/public/Gallery";
import Testimonials from "./pages/public/Testimonials";
import Availability from "./pages/public/Availability";
import Contact from "./pages/public/Contact";
import Auth from "./pages/auth/Auth";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import DoctorRegister, { DoctorPending } from "./pages/auth/DoctorRegister";
import AdminApprovals from "./pages/admin/AdminApprovals";
import PortalLayout from "./layouts/PortalLayout";
import { useAuth } from "./context/AuthContext";
import { Spinner } from "./components/ui";
import POverview from "./pages/patient/Overview";
import PAppointments from "./pages/patient/Appointments";
import MedicalLog from "./pages/patient/MedicalLog";
import Prescriptions from "./pages/patient/Prescriptions";
import TestResults from "./pages/patient/TestResults";
import PPayments from "./pages/patient/Payments";
import PProfile from "./pages/patient/Profile";
import DDashboard from "./pages/doctor/Dashboard";
import DPatients from "./pages/doctor/Patients";
import DAppointments from "./pages/doctor/Appointments";
import Schedule from "./pages/doctor/Schedule";
import DTestimonials from "./pages/doctor/Testimonials";
import DPayments from "./pages/doctor/Payments";
import DProfile from "./pages/doctor/Profile";
import Notifications from "./pages/doctor/Notifications";
import DSettings from "./pages/doctor/Settings";

const PATIENT_LINKS = [
  { to: "/patient", label: "Overview", icon: LayoutDashboard, end: true }, { to: "/patient/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/patient/medical-log", label: "Medical Log", icon: FileText }, { to: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
  { to: "/patient/test-results", label: "Test Results", icon: FlaskConical }, { to: "/patient/payments", label: "Payments", icon: CreditCard },
];
const PATIENT_BOTTOM = [{ to: "/patient/profile", label: "Profile", icon: User }];
const DOCTOR_LINKS = [
  { to: "/doctor", label: "Dashboard", icon: LayoutDashboard, end: true }, { to: "/doctor/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/doctor/patients", label: "Patients", icon: Users }, { to: "/doctor/schedule", label: "Schedule", icon: Clock },
  { to: "/doctor/testimonials", label: "Testimonials", icon: MessageSquare }, { to: "/doctor/payments", label: "Payments", icon: CreditCard },
  { to: "/doctor/profile", label: "Profile", icon: User }, { to: "/doctor/notifications", label: "Notifications", icon: Bell }, { to: "/doctor/settings", label: "Settings", icon: Cog },
];

function Guard({ role, children }) {
  const { user, ready } = useAuth();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to={role === "doctor" ? "/doctor-login" : "/login"} replace />;
  if (user.role !== role) return <Navigate to={user.role === "doctor" ? "/doctor" : "/patient"} replace />;
  return children;
}

const BARE = ["/login", "/register", "/doctor-login", "/doctor-register", "/doctor-pending", "/forgot-password", "/reset-password", "/admin"];

export default function App() {
  const { pathname } = useLocation();
  const bare = BARE.includes(pathname) || pathname.startsWith("/patient") || pathname.startsWith("/doctor");
  return (
    <div className="min-h-screen bg-white text-slate-800 transition-colors dark:bg-gray-950 dark:text-white">
      {!bare && <Navbar />}
      <Routes>
        <Route path="/login" element={<Auth />} /><Route path="/register" element={<Auth />} /><Route path="/doctor-login" element={<Auth />} />
        <Route path="/doctor-register" element={<DoctorRegister />} /><Route path="/doctor-pending" element={<DoctorPending />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminApprovals />} />
        <Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/gallery" element={<Gallery />} />
        <Route path="/testimonials" element={<Testimonials />} /><Route path="/availability" element={<Availability />} /><Route path="/contact" element={<Contact />} />

        <Route path="/patient" element={<Guard role="patient"><PortalLayout role="patient" links={PATIENT_LINKS} bottom={PATIENT_BOTTOM} /></Guard>}>
          <Route index element={<POverview />} /><Route path="appointments" element={<PAppointments />} /><Route path="medical-log" element={<MedicalLog />} />
          <Route path="prescriptions" element={<Prescriptions />} /><Route path="test-results" element={<TestResults />} /><Route path="payments" element={<PPayments />} /><Route path="profile" element={<PProfile />} />
        </Route>
        <Route path="/doctor" element={<Guard role="doctor"><PortalLayout role="doctor" links={DOCTOR_LINKS} /></Guard>}>
          <Route index element={<DDashboard />} /><Route path="appointments" element={<DAppointments />} /><Route path="patients" element={<DPatients />} /><Route path="schedule" element={<Schedule />} />
          <Route path="testimonials" element={<DTestimonials />} /><Route path="payments" element={<DPayments />} /><Route path="profile" element={<DProfile />} /><Route path="notifications" element={<Notifications />} /><Route path="settings" element={<DSettings />} />
        </Route>
        <Route path="*" element={<div className="flex min-h-[60vh] items-center justify-center text-center"><div><h1 className="text-3xl font-semibold">Page not found</h1></div></div>} />
      </Routes>
      {!bare && <Footer />}
    </div>
  );
}
