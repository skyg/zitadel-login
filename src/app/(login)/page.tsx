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
  // username form directly.
  if (!primaryIdp) {
    const params = new URLSearchParams();
    if (requestId) params.append("requestId", requestId);
    if (organization) params.append("organization", organization);
    redirect(`/loginname${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const externalParams = new URLSearchParams();
  if (requestId) externalParams.append("requestId", requestId);
  if (organization) externalParams.append("organization", organization);
  externalParams.append("external", "1");
  const externalHref = `/loginname?${externalParams.toString()}`;

  return (
    <DynamicTheme branding={branding}>
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
