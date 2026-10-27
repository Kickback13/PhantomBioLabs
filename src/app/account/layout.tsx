import { Suspense } from "react";
import { AccountNav, SignOutButton } from "@/components/account/account-ui";

export const prefetch = "force-disabled";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Account</h1>
        </div>
        <SignOutButton />
      </div>
      <div className="mt-5">
        <Suspense>
          <AccountNav />
        </Suspense>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
