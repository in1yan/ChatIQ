import { AuthCard } from "../../components/auth/AuthCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account - ChatIQ",
  description: "Sign up and create your ChatIQ account",
};

export default function SignupPage() {
  return <AuthCard mode="signup" />;
}
