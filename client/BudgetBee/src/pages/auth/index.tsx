import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";

export const Auth = () => {
  return (
    <div className="sign-in-container">

      <Show when="signed-out">
        <SignUpButton mode="modal"/>
        <SignInButton mode ="modal"/>
      </Show>

      <Show when="signed-in">
        <UserButton />
      </Show>

    </div>
  );
};