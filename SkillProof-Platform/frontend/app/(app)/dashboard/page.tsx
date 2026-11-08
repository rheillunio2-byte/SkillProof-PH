"use client";
import { EmployerDashboard, InstitutionDashboard, LearnerDashboard } from "@/components/dashboards";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === "employer") return <EmployerDashboard />;
  if (user?.role === "institution") return <InstitutionDashboard />;
  return <LearnerDashboard />;
}
