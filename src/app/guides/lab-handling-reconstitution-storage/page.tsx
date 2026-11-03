import { GuideView, guideMetadata } from "@/components/content/guide-layout";

const PATH = "/guides/lab-handling-reconstitution-storage";

export const metadata = guideMetadata(PATH);

export default function Page() {
  return <GuideView path={PATH} />;
}
