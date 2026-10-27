import { Children, Fragment, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Adapted from 21st.dev "Text Reveal" (kuratlielia): each word rises out of its own clip while it
// sharpens from a blur. Pure CSS (.tr-clip/.tr-word in globals.css), so it runs on first paint and
// never leaves text hidden if scripts are slow. Accepts plain text plus <span className> and <br />,
// which keeps gradient words styled; anything else renders as-is without the effect.

type Part = { text: string; className?: string } | "br";

function toParts(node: ReactNode, className?: string): Part[] | null {
  const out: Part[] = [];
  for (const child of Children.toArray(node)) {
    if (typeof child === "string" || typeof child === "number") {
      out.push({ text: String(child), className });
      continue;
    }
    if (!isValidElement(child)) return null;
    const el = child as ReactElement<{ children?: ReactNode; className?: string }>;
    if (el.type === "br") {
      out.push("br");
      continue;
    }
    if (el.type === Fragment || el.type === "span") {
      const inner = toParts(el.props.children, cn(className, el.type === "span" && el.props.className) || undefined);
      if (!inner) return null;
      out.push(...inner);
      continue;
    }
    return null;
  }
  return out;
}

export function TextReveal({
  children,
  as: Tag = "h1",
  className,
  delay = 0,
  step = 0.06,
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  step?: number;
}) {
  const parts = toParts(children);
  if (!parts) return <Tag className={className}>{children}</Tag>;

  const label = parts.map((p) => (p === "br" ? " " : p.text)).join("").replace(/\s+/g, " ").trim();
  let index = 0;
  return (
    <Tag className={className} aria-label={label}>
      {parts.map((part, i) =>
        part === "br" ? (
          <br key={i} />
        ) : (
          <Fragment key={i}>
            {part.text.split(/(\s+)/).map((token, j) => {
              if (!token) return null;
              if (/^\s+$/.test(token)) return " ";
              const position = index++;
              return (
                <span key={j} aria-hidden="true" className="tr-clip">
                  <span className={cn("tr-word", part.className)} style={{ "--tr-delay": `${delay + position * step}s` } as CSSProperties}>
                    {token}
                  </span>
                </span>
              );
            })}
          </Fragment>
        ),
      )}
    </Tag>
  );
}
