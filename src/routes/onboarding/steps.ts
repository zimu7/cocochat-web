// `name` for in-code usage, `labelKey` is i18n key for display
export interface Step {
  name: string;
  labelKey: string;
  canJumpTo?: string[];
}

const steps: Step[] = [
  {
    name: "welcomePage",
    labelKey: "welcome:onboarding.welcome_page"
  },
  {
    name: "serverName",
    labelKey: "welcome:onboarding.set_name"
  },
  {
    name: "adminAccount",
    labelKey: "welcome:onboarding.admin_account"
  },
  {
    name: "whoCanSignUp",
    labelKey: "welcome:onboarding.who_sign_up"
  },
  // {
  //   name: "inviteLink",
  //   labelKey: "welcome:onboarding.invites",
  //   canJumpTo: ["whoCanSignUp"]
  // },
  {
    name: "donePage",
    labelKey: "welcome:onboarding.done",
    canJumpTo: ["whoCanSignUp"]
  }
];

export default steps;
