import Image from "next/image";
import { NasaCalendar } from "@/components/nasa-calendar";
import { SleekLineCursor } from "@/components/sleeklinecursor";
import { Signature } from "@/components/ui/signature";

export default function Home() {
  return (
    <section className="flex flex-col items-center ">
      <SleekLineCursor />
      <Signature />
      <header>
        <ul className="t font-bold">
          <li>Launch.</li>
          <li>Explore.</li>
          <li>Discover.</li>
          <li>Observe.</li>
          <li>Dream.</li>
        </ul>
      </header>
      <NasaCalendar />
    </section>
  );
}
