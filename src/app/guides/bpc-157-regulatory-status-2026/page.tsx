import { GuideView, guideMetadata } from "@/components/content/guide-layout";

const PATH = "/guides/bpc-157-regulatory-status-2026";

export const metadata = guideMetadata(PATH);

export default function Page() {
  return <GuideView path={PATH} />;
}
