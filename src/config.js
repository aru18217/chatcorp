export const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001").replace(/\/$/, "");

export const profileUrl = (picture) => (picture ? `${API_URL}/uploads/profiles/${encodeURIComponent(picture)}` : null);
export const documentUrl = (file) => `${API_URL}/uploads/documents/${encodeURIComponent(file)}`;

// Attachments are stored as "<random>-<original name>"; show only the original name.
export const displayFileName = (file) => String(file || "").replace(/^[0-9a-f]{24}-/, "");

export const initials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("") || "?";
