"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DSL, ensureScreen, findScreen, stringifyDSL } from "../lib/dsl";
import yaml from "js-yaml";
import { Bot, SendHorizonal } from "lucide-react";

type Action = { label: string; payload?: any; kind: "accept-signin" | "assign-milestone" | "none" };
type Message = { role: "user" | "assistant"; text: string; actions?: Action[] };

type Props = {
  prd: string;
  dsl: DSL;
  dslText: string;
  onApply: (updates: { prd?: string; dsl?: DSL | string }) => void;
};

export function Copilot({ prd, dsl, dslText, onApply }: Props) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    text: "Hi! I can turn your idea into a clickable mock and PRD. Try: ‘make a login flow’ or ‘add a web dashboard’.",
  }]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt) return;
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setInput("");

    // Fake thinking delay
    await new Promise((r) => setTimeout(r, 500));
    // Sign-in CUJ special flow
    if (/sign\s?-?in|login/.test(prompt.toLowerCase()) && /cuj|journey|flow/.test(prompt.toLowerCase())) {
      const proposal = buildSigninProposal();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `Proposal: Add a Sign In CUJ with Requirements and Acceptance Criteria.\n\nCUJ\n- Open app → Login → Email + Password → Continue → Home\n\nRequirements\n- Login screen with Email + Password inputs\n- Continue button validates input\n- Optional: Forgot Password link\n\nAcceptance Criteria\n- Continue navigates to Home on success\n- Invalid credentials show error\n- Login CTA on Home links to Login`,
          actions: [{ label: "Accept", kind: "accept-signin", payload: proposal }],
        },
      ]);
      return;
    }

    const { updatedPRD, updatedDSL, reply } = applyCopilotCommand(prompt, prd, dsl);
    onApply({ prd: updatedPRD, dsl: updatedDSL });
    setMessages((m) => [...m, { role: "assistant", text: reply }]);
  };

  const handleAction = (action: Action) => {
    if (action.kind === "accept-signin") {
      const { prdPatch, dslPatch } = applySigninProposal(prd, dsl);
      onApply({ prd: prdPatch, dsl: dslPatch });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Added Sign In CUJ + requirements + ACs and a Login screen with CTA from Home. Which milestone should I tag this to?",
          actions: [
            { label: "M0", kind: "assign-milestone", payload: { milestone: "M0" } },
            { label: "M1", kind: "assign-milestone", payload: { milestone: "M1" } },
            { label: "M2", kind: "assign-milestone", payload: { milestone: "M2" } },
          ],
        },
      ]);
      return;
    }
    if (action.kind === "assign-milestone") {
      const ms = action.payload?.milestone as "M0" | "M1" | "M2";
      const d: DSL = JSON.parse(JSON.stringify(dsl));
      const login = findScreen(d, "login");
      if (login) {
        (login as any).milestone = ms;
        login.components.forEach((c) => ((c as any).milestone = ms));
      }
      // also tag Home CTA if present
      const home = findScreen(d, "home");
      if (home) {
        home.components.forEach((c) => {
          if (c.type === "button" && (c.props?.text || "").toLowerCase().includes("login")) (c as any).milestone = ms;
        });
      }
      onApply({ dsl: d });
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `Tagged Sign In flow as ${ms}.` },
      ]);
      return;
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-black/60 text-white">
      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
        <Bot className="w-4 h-4" />
        <div className="font-medium">Copilot</div>
      </div>
      <div ref={listRef} className="flex-1 min-h-0 overflow-auto p-3 space-y-2 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={`${m.role === "assistant" ? "bg-white/5 border-white/10" : "bg-black/40 border-white/10"} border rounded-lg px-3 py-2 max-w-[90%] ${m.role === "assistant" ? "mr-8" : "ml-8"}`}>
            <div className="whitespace-pre-wrap">{m.text}</div>
            {m.actions && m.actions.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {m.actions.map((a, idx) => (
                  <button key={idx} onClick={() => handleAction(a)} className="px-2 py-1 rounded border border-white/15 bg-white/10 hover:bg-white/20 text-xs">
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-white/10 flex items-center gap-2 min-w-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), handleSend()) : null}
          placeholder="Ask me to add a flow, tweak UI, or structure the PRD..."
          className="flex-1 min-w-0 rounded-lg border border-white/10 px-3 py-2 bg-black/40 placeholder:text-white/40"
        />
        <button onClick={handleSend} className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm">
          <SendHorizonal className="w-4 h-4" />
          Send
        </button>
      </div>
    </div>
  );
}

// Heuristic copilot that tweaks PRD and DSL for common intents
function applyCopilotCommand(prompt: string, prd: string, dsl: DSL) {
  const p = prompt.toLowerCase();
  let updatedPRD = prd;
  const d: DSL = JSON.parse(JSON.stringify(dsl));
  const responses: string[] = [];

  if (/(login|sign\s?in|auth)/.test(p)) {
    // add login screen and link from home
    ensureScreen(d, {
      id: "login",
      name: "Login",
      device: "mobile",
      components: [
        { type: "navbar", frame: { x: 0, y: 0, w: 390, h: 56 }, props: { title: "Login" } },
        { type: "text", frame: { x: 16, y: 72, w: 300, h: 24 }, props: { text: "Welcome back", weight: 600, size: 20 } },
        { type: "input", frame: { x: 16, y: 112, w: 358, h: 44 }, props: { placeholder: "Email" } },
        { type: "input", frame: { x: 16, y: 164, w: 358, h: 44 }, props: { placeholder: "Password" } },
        { type: "button", frame: { x: 16, y: 216, w: 358, h: 48 }, props: { text: "Continue", variant: "primary" }, linkTo: d.screens[0]?.id || "home" },
      ],
    });

    // Link a CTA from home to login if possible
    const home = d.screens[0];
    if (home) {
      home.components.unshift({
        type: "button",
        frame: { x: 16, y: 24 + 56, w: 358, h: 40 },
        props: { text: "Login", variant: "secondary" },
        linkTo: "login",
      });
    }

    updatedPRD = appendSection(updatedPRD, "Authentication", `As a user I can sign in with email to access saved orders.\n\nAcceptance Criteria\n- Email + password fields are required\n- Continue button proceeds on success`);
    responses.push("Added a mobile Login screen and linked it from Home. Updated PRD with an Authentication section and acceptance criteria.");
  }

  if (/dark\s?mode/.test(p)) {
    d.theme = "dark";
    updatedPRD = appendSection(updatedPRD, "Theming", `Support light and dark themes with accessible contrast.`);
    responses.push("Switched theme to dark and noted theming in PRD.");
  }

  if (/(dashboard|web\s?app)/.test(p)) {
    ensureScreen(d, {
      id: "dashboard",
      name: "Dashboard",
      device: "web",
      size: { width: 1280, height: 800 },
      components: [
        { type: "navbar-web", frame: { x: 0, y: 0, w: 1280, h: 64 }, props: { title: "Coffee Admin" } },
        { type: "text", frame: { x: 24, y: 80, w: 400, h: 28 }, props: { text: "Orders Overview", weight: 700, size: 24 } },
        { type: "list", frame: { x: 24, y: 120, w: 600, h: 260 } },
      ],
    });
    responses.push("Added a web Dashboard screen with navbar and list.");
  }

  if (/(search)/.test(p)) {
    const home = findScreen(d, "home");
    if (home) {
      home.components.unshift({ type: "input", frame: { x: 16, y: 72, w: 358, h: 40 }, props: { placeholder: "Search coffee..." } });
      responses.push("Inserted a search field on Home.");
    }
  }

  if (/(checkout|cart)/.test(p)) {
    const details = findScreen(d, "details");
    if (details) {
      details.components.push({ type: "button", frame: { x: 16, y: 176, w: 358, h: 48 }, props: { text: "Go to Checkout", variant: "primary" }, linkTo: "checkout" });
      responses.push("Ensured Details links to Checkout with a CTA.");
    }
  }

  if (responses.length === 0) {
    // default: add a generic screen from the noun
    const nameMatch = p.match(/app that (does|is|for) (.+)/);
    const title = nameMatch ? titleCase(nameMatch[2].slice(0, 24)) : titleCase(prompt);
    const id = slug(title);
    ensureScreen(d, {
      id,
      name: title,
      device: "mobile",
      components: [
        { type: "navbar", frame: { x: 0, y: 0, w: 390, h: 56 }, props: { title } },
        { type: "text", frame: { x: 16, y: 72, w: 320, h: 24 }, props: { text: `This is the ${title} screen`, weight: 600, size: 18 } },
        { type: "button", frame: { x: 16, y: 112, w: 358, h: 48 }, props: { text: "Continue", variant: "primary" }, linkTo: d.screens[0]?.id || "home" },
      ],
    });
    updatedPRD = appendSection(updatedPRD, title, `Introduce a flow for ${title.toLowerCase()}.`);
    responses.push(`Created a new '${title}' screen and linked it into the flow.`);
  }

  return { updatedPRD, updatedDSL: d, reply: responses.join(" ") };
}

function appendSection(prd: string, heading: string, body: string) {
  if (prd.includes(`# ${heading}`) || prd.includes(`## ${heading}`)) return prd;
  return prd.trimEnd() + `\n\n## ${heading}\n${body}\n`;
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Sign-in CUJ helpers
function buildSigninProposal() {
  return {
    cuj: "Home → Login → Enter credentials → Continue → Home",
    reqs: [
      "Login screen with Email + Password inputs",
      "Continue button validates input",
      "Optional: Forgot Password link",
    ],
    acs: [
      "Continue navigates to Home on success",
      "Invalid credentials show error",
      "Login CTA on Home links to Login",
    ],
  };
}

function applySigninProposal(prd: string, dsl: DSL) {
  let updatedPRD = prd;
  const d: DSL = JSON.parse(JSON.stringify(dsl));
  // Ensure sections
  if (!updatedPRD.toLowerCase().includes("## requirements")) updatedPRD += `\n\n## Requirements\n`;
  if (!updatedPRD.toLowerCase().includes("## acceptance criteria")) updatedPRD += `\n\n## Acceptance Criteria\n`;
  if (!updatedPRD.toLowerCase().includes("## user journeys")) updatedPRD += `\n\n## User Journeys\n`;
  // Append bullets
  updatedPRD += `\n- [ ] Login screen with Email + Password inputs\n- [ ] Continue button validates input\n- [ ] Optional: Forgot Password link\n`;
  updatedPRD += `\n## Acceptance Criteria\n- Continue navigates to Home on success\n- Invalid credentials show error\n- Login CTA on Home links to Login\n`;
  updatedPRD += `\n## User Journeys\n- Home → Login → Enter credentials → Continue → Home\n`;

  // Add DSL Login screen + Home CTA
  ensureScreen(d, {
    id: "login",
    name: "Login",
    device: "mobile",
    components: [
      { type: "navbar", frame: { x: 0, y: 0, w: 390, h: 56 }, props: { title: "Login" } },
      { type: "input", frame: { x: 16, y: 112, w: 358, h: 44 }, props: { placeholder: "Email" } },
      { type: "input", frame: { x: 16, y: 164, w: 358, h: 44 }, props: { placeholder: "Password" } },
      { type: "button", frame: { x: 16, y: 216, w: 358, h: 48 }, props: { text: "Continue" }, linkTo: d.screens[0]?.id || "home" },
    ],
  });
  const home = d.screens[0];
  if (home) {
    home.components.unshift({ type: "button", frame: { x: 16, y: 80, w: 160, h: 40 }, props: { text: "Login" }, linkTo: "login" } as any);
  }
  return { prdPatch: updatedPRD, dslPatch: d };
}
