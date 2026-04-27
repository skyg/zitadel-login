import { DynamicTheme } from "@/components/dynamic-theme";
import { LoginMethodChooser } from "@/components/login-method-chooser";
import { Translated } from "@/components/translated";
import { getServiceUrlFromHeaders } from "@/lib/service-url";
import { getActiveIdentityProviders, getBrandingSettings, getDefaultOrg, getLoginSettings } from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { IdentityProviderType } from "@zitadel/proto/zitadel/settings/v2/login_settings_pb";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Same reason as /loginname: the no-IdP fallback uses redirect(), which would
// be swallowed by PPR's static shell otherwise.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("chooser");
  return { title: t("title") };
}

export default async function Page(props: {
  searchParams: Promise<Record<string | number | symbol, string | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const requestId = searchParams?.requestId;
  const organization = searchParams?.organization;

  const _headers = await headers();
  const { serviceUrl } = getServiceUrlFromHeaders(_headers);

  let defaultOrganization: string | undefined;
  if (!organization) {
    const org: Organization | null = await getDefaultOrg({ serviceUrl });
    if (org) defaultOrganization = org.id;
  }

  const orgId = organization ?? defaultOrganization;

  const [loginSettings, branding] = await Promise.all([
    getLoginSettings({ serviceUrl, organization: orgId }),
    getBrandingSettings({ serviceUrl, organization: orgId }),
  ]);

  const identityProviders = loginSettings?.allowExternalIdp
    ? await getActiveIdentityProviders({ serviceUrl, orgId }).then((r) => r.identityProviders)
    : [];

  // Prefer Microsoft 365 (Azure AD) when present — that's the org's SSO standard.
  const primaryIdp = identityProviders.find((p) => p.type === IdentityProviderType.AZURE_AD) ?? identityProviders[0];

  // No IdP configured → chooser has nothing to choose. Fall back to the
  // username form directly. external=1 so /loginname doesn't bounce us back.
  if (!primaryIdp) {
    const params = new URLSearchParams();
    if (requestId) params.append("requestId", requestId);
    if (organization) params.append("organization", organization);
    params.append("external", "1");
    redirect(`/loginname?${params.toString()}`);
  }

  // Forward everything the app or Zitadel passed through (loginName hint,
  // suffix, submit, …) plus external=1 so /loginname doesn't bounce back here.
  const externalParams = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string" && v && k !== "external") {
      externalParams.append(k, v);
    }
  }
  externalParams.append("external", "1");
  const externalHref = `/loginname?${externalParams.toString()}`;

  return (
    <DynamicTheme branding={branding} variant="wide">
      <div className="flex flex-col space-y-4">
        <h1>
          <Translated i18nKey="title" namespace="chooser" />
        </h1>
        <p className="ztdl-p">
          <Translated i18nKey="subtitle" namespace="chooser" />
        </p>
      </div>

      <LoginMethodChooser
        primaryIdp={primaryIdp}
        externalHref={externalHref}
        requestId={requestId}
        organization={organization}
      />
    </DynamicTheme>
  );
}
