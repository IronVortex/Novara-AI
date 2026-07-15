export const PROMPT_LIBRARY = [
  {
    id: "code-review",
    category: "Programming",
    title: "Code Review",
    prompt: "Review the following code for bugs, performance issues, and readability. Suggest concrete improvements:\n\n",
  },
  {
    id: "debug-helper",
    category: "Programming",
    title: "Debug Helper",
    prompt: "I'm hitting a bug. Help me diagnose root cause and propose a fix. Context:\n\n",
  },
  {
    id: "write-blog",
    category: "Writing",
    title: "Blog Outline",
    prompt: "Create a clear, engaging blog outline with H2/H3 structure for:\n\n",
  },
  {
    id: "rewrite-pro",
    category: "Writing",
    title: "Professional Rewrite",
    prompt: "Rewrite the following text to be clearer, more professional, and concise:\n\n",
  },
  {
    id: "research-brief",
    category: "Research",
    title: "Research Brief",
    prompt: "Summarize the key findings, trade-offs, and open questions about:\n\n",
  },
  {
    id: "compare-options",
    category: "Research",
    title: "Compare Options",
    prompt: "Compare the following options with pros, cons, and a recommendation:\n\n",
  },
  {
    id: "resume-bullet",
    category: "Resume",
    title: "Resume Bullets",
    prompt: "Turn this experience into strong resume bullets with metrics where possible:\n\n",
  },
  {
    id: "cover-letter",
    category: "Resume",
    title: "Cover Letter",
    prompt: "Draft a tailored cover letter for this role and background:\n\n",
  },
  {
    id: "product-launch",
    category: "Marketing",
    title: "Launch Copy",
    prompt: "Write homepage hero copy and 3 feature blurbs for:\n\n",
  },
  {
    id: "social-posts",
    category: "Marketing",
    title: "Social Posts",
    prompt: "Create 5 short social posts with varying hooks for:\n\n",
  },
  {
    id: "study-notes",
    category: "Study",
    title: "Study Notes",
    prompt: "Create structured study notes with definitions, examples, and quiz questions for:\n\n",
  },
  {
    id: "explain-simple",
    category: "Study",
    title: "Explain Simply",
    prompt: "Explain this concept as if teaching a beginner, then deepen the explanation:\n\n",
  },
  {
    id: "meeting-agenda",
    category: "Business",
    title: "Meeting Agenda",
    prompt: "Create a focused meeting agenda with goals, topics, and owners for:\n\n",
  },
  {
    id: "swot",
    category: "Business",
    title: "SWOT Analysis",
    prompt: "Produce a SWOT analysis and next actions for:\n\n",
  },
];

export const PROMPT_CATEGORIES = [...new Set(PROMPT_LIBRARY.map((item) => item.category))];
