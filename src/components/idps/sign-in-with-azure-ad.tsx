"use client";

import { clsx } from "clsx";
import { Loader2Icon } from "lucide-react";
import { forwardRef } from "react";
import { useFormStatus } from "react-dom";
import { SignInWithIdentityProviderProps } from "./base-button";
import { getComponentRoundness } from "@/lib/theme";

export const SignInWithAzureAd = forwardRef<
  HTMLButtonElement,
  SignInWithIdentityProviderProps
>(function SignInWithAzureAd(props, ref) {
  const { children, name, ...restProps } = props;
  const formStatus = useFormStatus();
  const buttonRoundness = getComponentRoundness("button");

  return (
    <button
      {...restProps}
      type="submit"
      ref={ref}
      disabled={formStatus.pending}
      className={clsx(
        "flex w-full cursor-pointer items-center justify-center gap-3 px-6 py-4 text-base font-semibold text-white outline-none transition-all",
        "bg-[#16417b] hover:bg-[#102f64] active:bg-[#091b42]",
        "shadow-md hover:shadow-lg",
        "disabled:cursor-not-allowed disabled:opacity-60",
        buttonRoundness,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 21 21"
        className="flex-shrink-0"
      >
        <path fill="#f25022" d="M1 1H10V10H1z"></path>
        <path fill="#00a4ef" d="M1 11H10V20H1z"></path>
        <path fill="#7fba00" d="M11 1H20V10H11z"></path>
        <path fill="#ffb900" d="M11 11H20V20H11z"></path>
      </svg>
      {formStatus.pending ? (
        <Loader2Icon className="h-5 w-5 animate-spin" />
      ) : (
        <span>{children || "Connexion SSO"}</span>
      )}
    </button>
  );
});
