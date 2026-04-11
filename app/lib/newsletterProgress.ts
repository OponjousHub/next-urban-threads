// lib/newsletterProgress.ts

type Progress = {
  total: number;
  sent: number;
  status: "idle" | "sending" | "done";
};

let progress: Progress = {
  total: 0,
  sent: 0,
  status: "idle",
};

// update progress
export function setProgress(data: Partial<Progress>) {
  progress = { ...progress, ...data };
}

// get progress
export function getProgress() {
  return progress;
}
