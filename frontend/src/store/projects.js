// src/store/projects.js
export function getProjects() {
  try {
    return JSON.parse(localStorage.getItem("bcr-projects")) || [];
  } catch {
    return [];
  }
}

export function saveProjects(projects) {
  localStorage.setItem("bcr-projects", JSON.stringify(projects));
}

export function addProject(project) {
  const all = getProjects();
  all.unshift(project); // newest first
  saveProjects(all);
}

export function getProjectById(id) {
  const all = getProjects();
  return all.find((p) => String(p.id) === String(id));
}

export function updateProject(updated) {
  const all = getProjects();
  const next = all.map((p) => (String(p.id) === String(updated.id) ? updated : p));
  saveProjects(next);
  return updated;
}

export function updateProjectStatus(id, newStatus) {
  const p = getProjectById(id);
  if (!p) return null;
  p.status = newStatus;
  updateProject(p);
  return p;
}

export function anchorProject(id) {
  const p = getProjectById(id);
  if (!p) return null;
  // generate mock TxID
  const randomHex = () =>
    Array.from({ length: 64 }).map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
  const txId = "0x" + randomHex();
  p.txId = txId;
  p.status = "Blockchain Anchored";
  updateProject(p);
  return p;
}

export function issueCertificate(id) {
  const p = getProjectById(id);
  if (!p) return null;
  p.status = "Certificate Issued";
  p.certificateIssued = true;
  p.certificateAt = new Date().toISOString();
  updateProject(p);
  return p;
}
