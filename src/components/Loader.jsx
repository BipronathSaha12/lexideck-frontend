import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="loader animate-fade-in">
      <Loader2 size={40} className="animate-spin" />
    </div>
  );
}
