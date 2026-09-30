import { LoadingState } from "@/components/ui-states";

export default function Loading() {
  return (
    <main className="auth-page" aria-busy="true">
      <div className="auth-shell">
        <div className="auth-card">
          <LoadingState />
        </div>
      </div>
    </main>
  );
}
