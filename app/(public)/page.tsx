import { Hero } from "@/components/Hero";
import { SectionTile } from "@/components/SectionTile";

export default function Home() {
  return (
    <main>
      <Hero />
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-2">
        <SectionTile href="/projects" label="Projects" />
        <SectionTile href="/achievements" label="Achievements" />
        <SectionTile href="/about" label="About" />
        <SectionTile href="/experience" label="Experience" />
      </section>
    </main>
  );
}
