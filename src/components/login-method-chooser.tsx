"use client";

import { idpTypeToSlug } from "@/lib/idp";
import { redirectToIdp } from "@/lib/server/idp";
import { IdentityProvider } from "@zitadel/proto/zitadel/settings/v2/login_settings_pb";
import { ArrowRightIcon, KeyIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "./alert";
import { Translated } from "./translated";

export function LoginMethodChooser({
  primaryIdp,
  externalHref,
  requestId,
  organization,
}: {
  primaryIdp: IdentityProvider;
  externalHref: string;
  requestId?: string;
  organization?: string;
}) {
  const [state, action, isPending] = useActionState(redirectToIdp, {});

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <form action={action} className="contents">
          <input type="hidden" name="id" value={primaryIdp.id} />
          <input type="hidden" name="provider" value={idpTypeToSlug(primaryIdp.type)} />
          {requestId && <input type="hidden" name="requestId" value={requestId} />}
          {organization && <input type="hidden" name="organization" value={organization} />}
          <input type="hidden" name="linkOnly" value="false" />
          <input type="hidden" name="postErrorRedirectUrl" value="/loginname" />
          <button
            type="submit"
            disabled={isPending}
            data-testid="chooser-dsi-employee"
            className="group flex h-full flex-col items-start rounded-xl border-2 border-primary-light-500 bg-primary-light-50 p-6 text-left outline-none transition-all hover:shadow-lg disabled:opacity-50 dark:border-primary-dark-500 dark:bg-primary-dark-900 dark:hover:bg-white/5"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center">
              <svg viewBox="0 0 21 21" className="h-8 w-8" aria-hidden="true">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
            </div>
            <span className="text-lg font-semibold">
              <Translated i18nKey="dsiEmployee.title" namespace="chooser" />
            </span>
            <span className="mt-1 text-sm opacity-80">
              <Translated i18nKey="dsiEmployee.subtitle" namespace="chooser" />
            </span>
            <span className="mt-4 inline-flex items-center text-sm font-medium opacity-80 transition-opacity group-hover:opacity-100">
              <Translated i18nKey="dsiEmployee.cta" namespace="chooser" />
              <ArrowRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        </form>

        <Link
          href={externalHref}
          data-testid="chooser-external"
          className="group flex h-full flex-col items-start rounded-xl border border-divider-light bg-background-light-400 p-6 text-left outline-none transition-all hover:shadow-lg dark:border-divider-dark dark:bg-background-dark-400 dark:hover:bg-white/5"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center text-text-light-500 dark:text-text-dark-500">
            <KeyIcon className="h-7 w-7" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold">
            <Translated i18nKey="external.title" namespace="chooser" />
          </span>
          <span className="mt-1 text-sm opacity-80">
            <Translated i18nKey="external.subtitle" namespace="chooser" />
          </span>
          <span className="mt-4 inline-flex items-center text-sm font-medium opacity-80 transition-opacity group-hover:opacity-100">
            <Translated i18nKey="external.cta" namespace="chooser" />
            <ArrowRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      {state?.error && (
        <div className="py-4">
          <Alert>{state.error}</Alert>
        </div>
      )}
    </div>
  );
}
