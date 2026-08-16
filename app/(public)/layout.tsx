import { Nav } from "@/components/Nav";
import { PageEnter } from "@/components/PageEnter";
import { TileTransitionProvider } from "@/components/TileTransition";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <TileTransitionProvider>
      <Nav />
      <PageEnter>{children}</PageEnter>
    </TileTransitionProvider>
  );
}
