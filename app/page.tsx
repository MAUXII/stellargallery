import Image from "next/image";
import { NasaCalendar } from "@/components/nasa-calendar";
import { SleekLineCursor } from "@/components/sleeklinecursor";

export default function Home() {
  return (
    <>
      <SleekLineCursor />
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
    </>
  );
}
