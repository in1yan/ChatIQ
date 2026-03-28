import { AuthCard } from "../../components/auth/AuthCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - ChatIQ",
  description: "Sign in to your ChatIQ command center",
};

export default function LoginPage() {
  return <AuthCard mode="login" />;
}
