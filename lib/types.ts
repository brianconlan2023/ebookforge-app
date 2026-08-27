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

export type CoverText = {
  title: string;
  subtitle: string;
  author: string;
  blurb: string;
  titleX: number;
  titleY: number;
  subtitleX: number;
  subtitleY: number;
  authorX: number;
  authorY: number;
};

export type Design = {
  themeId: string;
  showBorder: boolean;
  dropCap: boolean;
  justify: boolean;
  cover: CoverText;
};

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
  design?: Design;
};

export type User = { id: string; email: string; name: string; plan: "FREE" | "STARTER" | "PRO" | "AGENCY" };

export function defaultDesign(title = "", subtitle = ""): Design {
  return {
    themeId: "kc-modern",
    showBorder: true,
    dropCap: true,
    justify: true,
    cover: {
      title: title || "Untitled",
      subtitle: subtitle || "",
      author: "Author",
      blurb: "",
      titleX: 50,
      titleY: 28,
      subtitleX: 50,
      subtitleY: 48,
      authorX: 50,
      authorY: 86,
    },
  };
}
