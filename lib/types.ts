export type EbookInput = {
  topic: string;
  audience: "Beginner" | "Intermediate" | "Advanced" | "General";
  tone: "Inspirational" | "Educational" | "Business" | "Friendly" | "Authoritative" | "Custom";
  customTone?: string;
  length: "10k" | "25k" | "50k+";
  language: string;
  format: "PDF" | "Word" | "Both";
};

export type Chapter = { title: string; content: string; order: number };

export type Ebook = {
  id: string;
  title: string;
  subtitle: string;
  input: EbookInput;
  marketResearch: string;
  titles: { title: string; subtitle: string }[];
  outline: { title: string; sections: string[] }[];
  chapters: Chapter[];
  frontMatter: string;
  backMatter: string;
  manuscript: string;
  status: "draft" | "generating" | "completed" | "failed";
  createdAt: string;
};

export type User = { id: string; email: string; name: string; plan: "FREE" | "STARTER" | "PRO" | "AGENCY" };
