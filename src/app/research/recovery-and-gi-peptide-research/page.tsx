import { GuideView, guideMetadata } from "@/components/content/guide-layout";

const PATH = "/research/recovery-and-gi-peptide-research";

export const metadata = guideMetadata(PATH);

export default function Page() {
  return <GuideView path={PATH} />;
}
