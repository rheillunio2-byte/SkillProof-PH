export type Role = "learner" | "employer" | "institution";
export type User = { id: number; name: string; email: string; role: Role; headline: string; location: string };
export type Challenge = {
  id: number; title: string; category: string; difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number; description: string; skills: string[]; question_count: number;
  questions?: { prompt: string; options: string[] }[];
};
export type Skill = { name: string; level: number; level_name: string; cluster: string; evidence: string; assessments_available: number };
export type Breakdown = { assessments: number; projects: number; credentials: number };
export type SkillsResponse = { proof_score: number; breakdown: Breakdown; weights: Breakdown; skills: Skill[] };
export type Credential = {
  credential_id: string; recipient: string; skill: string; level: number; level_name: string;
  issuer: string; status: string; source: "live" | "seed"; issued_at: string;
};
export type Attempt = {
  id: number; challenge_id: number; title: string; category: string; score: number; correct: number;
  total: number; seconds: number; source: "live" | "seed"; created_at: string;
};
export type Project = {
  id: number; title: string; description: string; technologies: string[]; repository_url: string;
  verified: boolean; source: "live" | "seed"; created_at: string;
};
export type DashboardEvent = { type: "assessment" | "credential" | "project"; title: string; detail: string; source: string; at: string };
export type Achievement = { id: string; title: string; description: string; progress: number; target: number; earned: boolean };
export type Dashboard = {
  user: User; proof_score: number; proof_label: string; breakdown: Breakdown;
  stats: { assessments: number; skills: number; credentials: number; projects: number; verified_projects: number; average_score: number };
  has_sample_data: boolean; trend: { label: string; score: number }[]; skills: Skill[]; credentials: Credential[];
  events: DashboardEvent[]; recommended: Challenge[]; achievements: Achievement[];
};
export type QuestionResult = { index: number; prompt: string; options: string[]; selected: number | null; correct_index: number; is_correct: boolean };
export type AttemptResult = {
  attempt_id: number; score: number; correct: number; total: number; passed: boolean; pass_mark: number;
  seconds: number; breakdown: QuestionResult[]; credential: Credential | null; notice: string;
};
export type LeaderRow = { rank: number; user_id: number; name: string; points: number; assessments: number; badge: string };
export type Candidate = {
  id: number; name: string; headline: string; location: string; proof_score: number; level: string;
  assessments: number; credentials: number; skills: string[]; sample: boolean;
};
export type Student = {
  id: number; name: string; email: string; assessments: number; average_score: number; competencies: number;
  credentials: number; last_active: string | null; status: string;
};
export type StudentsResponse = {
  summary: { learners: number; active: number; assessments: number; average_score: number; credentials: number };
  students: Student[];
};
export type VerifyResult = Credential & { valid: boolean; demo: boolean; message: string };
