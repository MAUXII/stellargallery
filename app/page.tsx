"use client"

import Image from "next/image";
import { NasaCalendar } from "@/components/nasa-calendar";
import { SleekLineCursor } from "@/components/sleeklinecursor";
import { Signature } from "@/components/ui/signature";
import { RevealLinks } from "@/components/reveallink";

export default function Home() {
  return (
    <section className="flex flex-col items-center ">
      <SleekLineCursor />
      <Signature />
     
      
          
      
      <RevealLinks />
      
      <NasaCalendar />
    </section>
  );
}
