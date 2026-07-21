"use client";

import { useTranslations } from "next-intl";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { AccountNav } from "@/components/account/AccountNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProfileForm } from "@/components/account/ProfileForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { useAuthStore } from "@/store/auth";

export default function AccountPage() {
  const t = useTranslations("account");
  const user = useAuthStore((s) => s.user);

  return (
    <RequireAuth>
      <Container className="py-10">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
        <div className="flex flex-col gap-8 lg:flex-row">
          <AccountNav />
          <div className="flex flex-1 flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile")}</CardTitle>
                <CardDescription>{t("profileDesc")}</CardDescription>
              </CardHeader>
              <CardContent>{user && <ProfileForm user={user} />}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("security")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
