import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

/** Opens a WhatsApp chat with support. There is no contact form; WhatsApp is the support channel. */
export function WhatsAppCta({
  label = "Message us on WhatsApp",
  message,
  variant = "primary",
  size = "lg",
  className,
}: {
  label?: string;
  message?: string;
  variant?: "primary" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const href = message ? `${site.contact.whatsappHref}?text=${encodeURIComponent(message)}` : site.contact.whatsappHref;
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle /> {label}
      </a>
    </Button>
  );
}
