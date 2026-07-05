import SidebarClient from "./SidebarClient";
import type { Profile } from "@/lib/types";

interface Props {
  profile: Profile | null;
  onClose?: () => void;
}

export default function SidebarServer({ profile, onClose }: Props) {
  return <SidebarClient profile={profile} onClose={onClose} />;
}
