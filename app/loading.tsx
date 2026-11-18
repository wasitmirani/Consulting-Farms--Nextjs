import Loader from "@/components/Loader";

/** Shown while a route segment streams in. */
export default function Loading() {
  return (
    <div className="relative min-h-dvh bg-paper">
      <Loader label="Loading" tone="light" />
    </div>
  );
}
