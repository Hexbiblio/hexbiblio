import ReactMarkdown, { Components } from "react-markdown";

interface BotMessageProps {
  content: string;
}

// Map known section headers (with their emoji) to a color accent.
// Keys are the lowercased text following the emoji.
const SECTION_ACCENTS: { match: RegExp; accent: string; bar: string }[] = [
  { match: /discipline/i, accent: "bg-primary/5 border-primary/30", bar: "bg-primary" },
  { match: /th[èe]me|theme/i, accent: "bg-accent/5 border-accent/30", bar: "bg-accent" },
  { match: /assess|évaluation|evaluation/i, accent: "bg-muted/60 border-border", bar: "bg-muted-foreground/40" },
  { match: /source|database|hexbiblio|base de donn/i, accent: "bg-primary/[0.06] border-primary/40", bar: "bg-primary" },
  { match: /suggest/i, accent: "bg-accent/[0.07] border-accent/40", bar: "bg-accent" },
  { match: /method|méthod/i, accent: "bg-muted/60 border-border", bar: "bg-muted-foreground/40" },
  { match: /next|prochaine|étape|etape/i, accent: "bg-primary/[0.06] border-primary/30", bar: "bg-primary" },
];

const accentFor = (text: string) => {
  const found = SECTION_ACCENTS.find((s) => s.match.test(text));
  return found ?? { accent: "bg-card border-border", bar: "bg-muted-foreground/30" };
};

const components: Components = {
  h1: ({ children }) => {
    const text = String(children);
    const { accent, bar } = accentFor(text);
    return (
      <div className={`relative mt-4 mb-2 rounded-lg border ${accent} pl-4 pr-3 py-2`}>
        <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${bar}`} />
        <h3 className="text-base font-bold leading-tight">{children}</h3>
      </div>
    );
  },
  h2: ({ children }) => {
    const text = String(children);
    const { accent, bar } = accentFor(text);
    return (
      <div className={`relative mt-4 mb-2 rounded-lg border ${accent} pl-4 pr-3 py-2`}>
        <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${bar}`} />
        <h3 className="text-sm font-bold leading-tight">{children}</h3>
      </div>
    );
  },
  h3: ({ children }) => (
    <h4 className="mt-3 mb-1.5 text-sm font-semibold text-foreground">{children}</h4>
  ),
  p: ({ children }) => <p className="text-sm leading-relaxed mb-2">{children}</p>,
  ul: ({ children }) => <ul className="my-2 space-y-1 pl-1">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 space-y-1 pl-5 list-decimal marker:text-primary marker:font-semibold">{children}</ol>,
  li: ({ children }) => (
    <li className="relative pl-5 text-sm leading-relaxed before:content-[''] before:absolute before:left-1 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/60">
      {children}
    </li>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="text-foreground/90">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 rounded-md border-l-4 border-primary/50 bg-primary/5 px-3 py-2 text-sm italic text-foreground/90">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="my-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
          <code>{children}</code>
        </pre>
      );
    }
    return <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{children}</code>;
  },
  hr: () => <hr className="my-3 border-border/60" />,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
      {children}
    </a>
  ),
};

const BotMessage = ({ content }: BotMessageProps) => {
  return (
    <div className="text-sm">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
};

export default BotMessage;
