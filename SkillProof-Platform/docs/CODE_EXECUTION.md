# Isolated code execution integration

The MVP intentionally does **not** execute submitted code. Do not add `exec`, `eval`, shell interpolation, or subprocess execution to the FastAPI web process.

Recommended separate runner contract:
1. API stores a submission and enqueues an opaque job ID.
2. Worker provisions a short-lived rootless container from an allowlisted language image.
3. Disable network; mount a per-job temporary directory; drop all Linux capabilities; enable seccomp/AppArmor.
4. Apply strict CPU, memory, process-count, disk and wall-clock limits.
5. Pass source via a mounted file, never through shell command concatenation.
6. Capture bounded stdout/stderr and structured test results.
7. Destroy the container and temporary files after completion.
8. Return only a structured result to the API; persist audit metadata.

A future runner can expose an internal authenticated endpoint such as `POST /jobs` and `GET /jobs/{id}`. Restrict access to the private service network.
