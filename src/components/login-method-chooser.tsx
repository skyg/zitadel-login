"use client";

import { idpTypeToSlug } from "@/lib/idp";
import { redirectToIdp } from "@/lib/server/idp";
import { IdentityProvider } from "@zitadel/proto/zitadel/settings/v2/login_settings_pb";
import { KeyIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
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
            className="group flex h-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-primary-light-500 bg-primary-light-50 p-8 text-center outline-none transition-all hover:shadow-lg disabled:opacity-50 dark:border-primary-dark-500 dark:bg-primary-dark-900 dark:hover:bg-white/5"
          >
            <Image
              src="/dsi-logo.png"
              alt="DSI Inclusion"
              width={120}
              height={82}
              className="h-12 w-auto"
              priority
            />
            <span className="text-lg font-semibold">
              <Translated i18nKey="dsiEmployee.title" namespace="chooser" />
            </span>
          </button>
        </form>

        <Link
          href={externalHref}
          data-testid="chooser-external"
          className="group flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-divider-light bg-background-light-400 p-8 text-center outline-none transition-all hover:shadow-lg dark:border-divider-dark dark:bg-background-dark-400 dark:hover:bg-white/5"
        >
          <KeyIcon className="h-12 w-12 text-text-light-500 dark:text-text-dark-500" aria-hidden="true" />
          <span className="text-lg font-semibold">
            <Translated i18nKey="external.title" namespace="chooser" />
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
