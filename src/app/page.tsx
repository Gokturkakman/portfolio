import Nav from "@/components/Nav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Work from "@/components/sections/Work";
import Path from "@/components/sections/Path";
import Play from "@/components/sections/Play";
import Contact from "@/components/sections/Contact";
import ChatDock from "@/components/ChatDock";
import CommandPalette from "@/components/CommandPalette";
import OdysseyRail from "@/components/OdysseyRail";
import { Cursor, ScrollProgress } from "@/components/motion-primitives";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Cursor />
      <Nav />
      <OdysseyRail />

      <main className="lg:pr-[150px]">
        <Hero />
        <About />
        <Work />
        <Path />
        <Play />
        <Contact />
      </main>

      <ChatDock />
      <CommandPalette />
    </>
  );
}
