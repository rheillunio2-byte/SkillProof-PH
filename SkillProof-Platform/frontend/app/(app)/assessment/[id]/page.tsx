"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Award, CheckCircle2, Clock3, Info, ListChecks, Send, Target, XCircle } from "lucide-react";
import { Badge, ErrorState, ProgressBar, ScoreRing, Skeleton, Spinner, difficultyTone } from "@/components/ui";
import { ApiError, api } from "@/lib/api";
import { formatDuration, useApi } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import type { AttemptResult, Challenge } from "@/lib/types";

type Phase = "intro" | "quiz" | "result";

export default function AssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: challenge, error, loading, reload } = useApi<Challenge>(`/api/challenges/${id}`);
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const startRef = useRef(0);

  const questions = challenge?.questions ?? [];
  const canSubmit = user?.role === "learner";

  useEffect(() => {
    if (phase !== "quiz") return;
    const t = setInterval(() => setSeconds(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const start = () => {
    setAnswers(questions.map(() => null)); setIdx(0); setDir(1); setWarn(null); setSubmitError(null);
    startRef.current = Date.now(); setSeconds(0); setPhase("quiz");
  };
  const go = useCallback((n: number) => { setDir(n > idx ? 1 : -1); setIdx(n); setWarn(null); }, [idx]);
  const choose = useCallback((o: number) => setAnswers((a) => a.map((v, i) => (i === idx ? o : v))), [idx]);

  useEffect(() => {
    if (phase !== "quiz") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= (questions[idx]?.options.length ?? 0)) choose(n - 1);
      if (e.key === "ArrowRight" && idx < questions.length - 1) go(idx + 1);
      if (e.key === "ArrowLeft" && idx > 0) go(idx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, idx, questions, choose, go]);

  async function submit() {
    const missing = answers.findIndex((a) => a === null);
    if (missing !== -1) { setWarn(`Question ${missing + 1} is unanswered. Answer every question before submitting.`); go(missing); return; }
    setBusy(true); setSubmitError(null);
    try {
      const r = await api<AttemptResult>("/api/attempts", { method: "POST", body: { challenge_id: Number(id), answers, seconds: Math.floor((Date.now() - startRef.current) / 1000) } });
      setResult(r); setPhase("result");
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : "Submission failed. Your answers are still here. Try again.");
    } finally { setBusy(false); }
  }

  if (loading) return <div className="stack"><Skeleton h={30} w="50%" /><Skeleton h={300} /></div>;
  if (error || !challenge) return <ErrorState message={error ?? "Challenge not found."} onRetry={reload} />;
  const q = questions[idx];
  const answered = answers.filter((a) => a !== null).length;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <Link href="/challenges" className="row small muted" style={{ marginBottom: 18 }}><ArrowLeft size={15} aria-hidden /> All challenges</Link>
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="card" style={{ padding: 30 }}>
              <div className="row wrap"><Badge>{challenge.category}</Badge><Badge tone={difficultyTone(challenge.difficulty)}>{challenge.difficulty}</Badge><Badge tone="warn">Prototype scoring</Badge></div>
              <h1 className="h2" style={{ marginTop: 16 }}>{challenge.title}</h1>
              <p className="muted" style={{ lineHeight: 1.7 }}>{challenge.description}</p>
              <div className="grid-3" style={{ margin: "22px 0" }}>
                {([[ListChecks, `${questions.length} questions`, "Multiple choice"], [Clock3, `${challenge.duration} min guide`, "Not enforced"], [Target, "70% to pass", "Earns a credential"]] as const).map(([I, a, b]) => (
                  <div className="card-flat row" key={a}><I size={18} color="#a5b9ff" aria-hidden /><div><b className="small">{a}</b><div className="tiny muted">{b}</div></div></div>
                ))}
              </div>
              <div className="tiny muted" style={{ marginBottom: 6 }}>SKILLS ASSESSED</div>
              <div className="row wrap" style={{ gap: 6 }}>{challenge.skills.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
              <div className="notice" style={{ margin: "22px 0" }}><Info size={14} style={{ display: "inline", marginRight: 6 }} aria-hidden />Objective questions only, graded by the server. There is no proctoring or code execution, so this is a demo and not a secure certification.</div>
              {canSubmit ? <button className="btn btn-primary btn-lg" onClick={start} disabled={!questions.length}>Start assessment <ArrowRight size={17} aria-hidden /></button>
                : <div className="notice notice-info">You are signed in as {user?.role}. Only learner accounts can take assessments.</div>}
            </div>
          </motion.div>
        )}

        {phase === "quiz" && q && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="card" style={{ padding: 28 }}>
              <div className="between wrap" style={{ marginBottom: 12 }}>
                <span className="eyebrow">Question {idx + 1} of {questions.length}</span>
                <span className="row tiny muted" style={{ gap: 14 }}><span>{answered}/{questions.length} answered</span><span className="row" style={{ gap: 5 }}><Clock3 size={13} aria-hidden />{formatDuration(seconds)}</span></span>
              </div>
              <ProgressBar value={idx + 1} max={questions.length} label="Assessment progress" />
              <div className="row" style={{ gap: 8, margin: "14px 0 0" }} role="group" aria-label="Jump to question">
                {questions.map((_, i) => (
                  <button key={i} className="btn btn-sm" aria-label={`Question ${i + 1}${answers[i] !== null ? ", answered" : ", unanswered"}`} aria-current={i === idx} onClick={() => go(i)}
                    style={{ width: 34, padding: 0, height: 32, borderColor: i === idx ? "var(--blue)" : undefined, background: answers[i] !== null ? "rgba(91,140,255,.22)" : undefined }}>{i + 1}</button>
                ))}
              </div>
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div key={idx} custom={dir} initial={{ opacity: 0, x: 28 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 * dir }} transition={{ duration: 0.22 }}>
                  <h2 style={{ fontSize: 21, lineHeight: 1.45, margin: "26px 0 18px", fontWeight: 650 }} id="q-title">{q.prompt}</h2>
                  <div role="radiogroup" aria-labelledby="q-title" className="stack" style={{ gap: 10 }}>
                    {q.options.map((o, i) => (
                      <button key={o} role="radio" aria-checked={answers[idx] === i} className="option-card" onClick={() => choose(i)}>
                        <span className="option-key">{i + 1}</span><span>{o}</span>
                        {answers[idx] === i && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginLeft: "auto" }}><CheckCircle2 size={18} color="#8fb0ff" aria-hidden /></motion.span>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="tiny dim" style={{ marginTop: 14 }}>Tip: press 1–4 to choose, ← → to move between questions.</div>
              {warn && <div className="notice" role="alert" style={{ marginTop: 14 }}>{warn}</div>}
              {submitError && <div className="notice notice-bad" role="alert" style={{ marginTop: 14 }}>{submitError}</div>}
              <div className="between" style={{ marginTop: 24 }}>
                <button className="btn" onClick={() => go(idx - 1)} disabled={idx === 0 || busy}><ArrowLeft size={16} aria-hidden /> Previous</button>
                {idx < questions.length - 1 ? <button className="btn btn-primary" onClick={() => go(idx + 1)}>Next <ArrowRight size={16} aria-hidden /></button>
                  : <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? <><Spinner /> Grading…</> : <>Submit assessment <Send size={15} aria-hidden /></>}</button>}
              </div>
            </div>
          </motion.div>
        )}

        {phase === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="stack" style={{ gap: 18 }}>
            <div className="card" style={{ padding: 30, textAlign: "center" }}>
              <div style={{ display: "grid", placeItems: "center" }}><ScoreRing value={result.score} size={170} label="Your score" /></div>
              <h1 className="h2" style={{ marginTop: 18 }}>{result.passed ? "Assessment passed" : "Not quite there yet"}</h1>
              <p className="muted" style={{ maxWidth: 480, margin: "0 auto" }}>{result.passed ? `You answered ${result.correct} of ${result.total} correctly and cleared the ${result.pass_mark}% pass mark.` : `You answered ${result.correct} of ${result.total} correctly. The pass mark is ${result.pass_mark}%. Review the answers below and try again.`}</p>
              <div className="grid-3" style={{ margin: "24px 0 8px" }}>
                <div className="card-flat"><b style={{ fontSize: 22 }}>{result.correct}/{result.total}</b><div className="tiny muted">Correct</div></div>
                <div className="card-flat"><b style={{ fontSize: 22 }}>{formatDuration(result.seconds)}</b><div className="tiny muted">Time taken</div></div>
                <div className="card-flat"><b style={{ fontSize: 22 }}>{result.pass_mark}%</b><div className="tiny muted">Pass mark</div></div>
              </div>
            </div>
            {result.credential && (
              <motion.div className="certificate" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                <div className="row"><Award size={20} color="#5a6ccf" aria-hidden /><b style={{ letterSpacing: ".1em", fontSize: 12, color: "#5a6ccf" }}>CREDENTIAL ISSUED · DEMO</b></div>
                <h2 style={{ fontSize: 22, margin: "10px 0 2px" }}>{result.credential.skill}</h2>
                <div style={{ fontSize: 13, color: "#44527a" }}>Level {result.credential.level} · {result.credential.credential_id}</div>
                <Link href={`/verify/${result.credential.credential_id}`} className="btn btn-sm" style={{ marginTop: 14, color: "#1a2340", background: "#fff", borderColor: "#c9d3f5" }}>View verification page</Link>
                <img className="seal" src="/assets/seal.svg" alt="" />
              </motion.div>
            )}
            <div className="card">
              <h2 className="h3">Performance breakdown</h2>
              <div className="stack" style={{ gap: 12, marginTop: 14 }}>
                {result.breakdown.map((b) => (
                  <details key={b.index} className="card-flat" open={!b.is_correct}>
                    <summary className="between" style={{ cursor: "pointer", listStyle: "none" }}>
                      <span className="row" style={{ alignItems: "flex-start" }}>{b.is_correct ? <CheckCircle2 size={18} color="#34d399" aria-label="Correct" /> : <XCircle size={18} color="#f87171" aria-label="Incorrect" />}<span className="small"><b>Q{b.index + 1}.</b> {b.prompt}</span></span>
                    </summary>
                    <div className="stack" style={{ gap: 8, marginTop: 12 }}>
                      {b.options.map((o, i) => (
                        <div key={o} className={`option-card ${i === b.correct_index ? "right" : i === b.selected ? "wrong" : ""}`} style={{ cursor: "default", transform: "none" }}>
                          <span className="option-key">{i + 1}</span><span className="small">{o}</span>
                          <span className="tiny" style={{ marginLeft: "auto" }}>{i === b.correct_index ? "Correct answer" : i === b.selected ? "Your answer" : ""}</span>
                        </div>
                      ))}
                      {b.selected === null && <div className="tiny muted">You left this question unanswered.</div>}
                    </div>
                  </details>
                ))}
              </div>
            </div>
            <div className="notice">{result.notice}</div>
            <div className="row wrap">
              <button className="btn btn-primary" onClick={() => { setPhase("intro"); setResult(null); }}>Retake assessment</button>
              <Link href="/challenges" className="btn">More challenges</Link>
              <Link href="/results" className="btn btn-ghost">View history</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
