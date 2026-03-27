import { DynamicTheme } from "@/components/dynamic-theme";
import { SignInWithIdp } from "@/components/sign-in-with-idp";
import { Translated } from "@/components/translated";
import { UsernameForm } from "@/components/username-form";
import { getServiceUrlFromHeaders } from "@/lib/service-url";
import { getActiveIdentityProviders, getBrandingSettings, getDefaultOrg, getLoginSettings } from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loginname");
  return { title: t("title") };
}

export default async function Page(props: { searchParams: Promise<Record<string | number | symbol, string | undefined>> }) {
  const searchParams = await props.searchParams;

  const loginName = searchParams?.loginName;
  const requestId = searchParams?.requestId;
  const organization = searchParams?.organization;
  const suffix = searchParams?.suffix;
  const submit: boolean = searchParams?.submit === "true";

  const _headers = await headers();
  const { serviceUrl } = getServiceUrlFromHeaders(_headers);

  let defaultOrganization;
  if (!organization) {
    const org: Organization | null = await getDefaultOrg({
      serviceUrl,
    });
    if (org) {
      defaultOrganization = org.id;
    }
  }

  const loginSettings = await getLoginSettings({
    serviceUrl,
    organization: organization ?? defaultOrganization,
  });

  const contextLoginSettings = await getLoginSettings({
    serviceUrl,
    organization,
  });

  const identityProviders = await getActiveIdentityProviders({
    serviceUrl,
    orgId: organization ?? defaultOrganization,
  }).then((resp) => {
    return resp.identityProviders;
  });

  const branding = await getBrandingSettings({
    serviceUrl,
    organization: organization ?? defaultOrganization,
  });

  return (
    <DynamicTheme branding={branding}>
      <div className="flex flex-col space-y-4">
        <h1>
          <Translated i18nKey="title" namespace="loginname" />
        </h1>
        <p className="ztdl-p">
          <Translated i18nKey="description" namespace="loginname" />
        </p>
      </div>

      <div className="w-full">
        {loginSettings?.allowExternalIdp && !!identityProviders?.length && (
          <div className="w-full pb-2">
            <SignInWithIdp
              identityProviders={identityProviders}
              requestId={requestId}
              organization={organization}
              postErrorRedirectUrl="/loginname"
              showLabel={false}
            ></SignInWithIdp>
          </div>
        )}

        {loginSettings?.allowExternalIdp && !!identityProviders?.length && (
          <div className="relative my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="mx-4 flex-shrink text-sm text-gray-500 dark:text-gray-400">
              <Translated i18nKey="orSignInWith" namespace="idp" />
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>
        )}

        <UsernameForm
          loginName={loginName}
          requestId={requestId}
          organization={organization}
          loginSettings={contextLoginSettings}
          suffix={suffix}
          submit={submit}
          allowRegister={!!loginSettings?.allowRegister}
        ></UsernameForm>
      </div>
    </DynamicTheme>
  );
}
