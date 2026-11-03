import { GuideView, guideMetadata } from "@/components/content/guide-layout";

const PATH = "/guides/how-to-read-a-peptide-coa";

export const metadata = guideMetadata(PATH);

export default function Page() {
  return <GuideView path={PATH} />;
}
