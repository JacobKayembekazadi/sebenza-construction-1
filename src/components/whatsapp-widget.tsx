
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const WhatsAppIcon = () => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="h-7 w-7 text-white"
    >
      <path
        fill="currentColor"
        d="M18.23 13.248c-.225-.113-1.33-.655-1.534-.728-.207-.075-.356-.113-.508.113-.15.225-.58.728-.713.878-.134.15-.268.17-.508.058-.238-.113-.998-.368-1.9-1.173-.71-.62-1.19-1.383-1.33-1.623-.14-.24-.014-.368.1-.48.102-.1.225-.268.338-.4.112-.133.15-.225.225-.375.074-.15.037-.282-.018-.393-.058-.113-.508-1.218-.698-1.67-.188-.44-.38-.38-.508-.385-.12-.008-.268-.008-.418-.008-.15 0-.393.058-.6.3-.206.24-.787.765-.787 1.875s.812 2.175.925 2.325c.112.15 1.58 2.416 3.825 3.375.54.225.96.36 1.29.462.59.175 1.13.15 1.55.093.47-.062 1.33-.542 1.518-1.063.188-.52.188-.96.13-.1062-.058-.112-.207-.17-.433-.28zM12.002 2.016c-5.524 0-10 4.478-10 10 0 1.75.45 3.42 1.253 4.89L2 22l5.25-1.373A9.95 9.95 0 0 0 12.003 22c5.524 0 10-4.477 10-10s-4.477-10-10-10zm0 18.25c-1.61 0-3.174-.41-4.57-1.178l-.325-.194-3.398.892.91-3.313-.213-.336a8.216 8.216 0 0 1-1.254-4.516c0-4.544 3.694-8.24 8.24-8.24 4.543 0 8.238 3.695 8.238 8.24 0 4.543-3.695 8.24-8.238 8.24z"
      />
    </svg>
);


export function WhatsAppWidget() {
  // Replace with your actual phone number in international format without '+' or '00'
  const phoneNumber = "15551234567";
  const message = "Hello! I have a question about Sebenza Construction PM.";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
       <Button size="icon" className="rounded-full h-14 w-14 shadow-lg bg-[#25D366] hover:bg-[#128C7E]">
            <WhatsAppIcon />
            <span className="sr-only">Chat on WhatsApp</span>
        </Button>
    </Link>
  );
}
