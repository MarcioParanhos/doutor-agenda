"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const SignOutButton = () => {
  return <Button onClick={() => authClient.signOut()}>Sair</Button>;
};

export default SignOutButton;
