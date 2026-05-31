export default function EmailNextTip() {
  return (
    <div className="flex flex-col items-center">
      <div className="font-bold text-3xl text-foreground dark:text-white mt-3">Magic link Sent</div>
      <p className="text-center text-muted-foreground dark:text-muted-foreground mb-6">
        Login to your email client, and continue next step
      </p>
      <p className="text-center text-muted-foreground dark:text-muted-foreground">You can close this window now.</p>
    </div>
  );
}
