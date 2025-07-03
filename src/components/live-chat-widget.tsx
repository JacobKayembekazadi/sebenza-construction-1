
"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";

type Message = {
  id: number;
  sender: "You" | "Support";
  avatar: string;
  text: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "Support",
    avatar: "https://placehold.co/40x40.png",
    text: "Hello! How can I help you today?",
  },
  {
    id: 2,
    sender: "You",
    avatar: "https://placehold.co/40x40.png",
    text: "I have a question about my last invoice.",
  },
];

export function LiveChatWidget() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "You",
        avatar: "https://placehold.co/40x40.png",
        text: input.trim(),
      };
      setMessages([...messages, newMessage]);
      setInput("");
      
      // Simulate a support reply
      setTimeout(() => {
          setMessages(prev => [...prev, {
              id: prev.length + 1,
              sender: "Support",
              avatar: "https://placehold.co/40x40.png",
              text: "Thanks for reaching out. Let me check on that for you."
          }])
      }, 1500)
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
          <MessageSquare className="h-6 w-6" />
          <span className="sr-only">Open Live Chat</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 md:w-96 p-0 border-none shadow-2xl rounded-2xl">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Live Chat</CardTitle>
            <CardDescription>Chat with team members or support.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 w-full pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender === "You" ? "justify-end" : ""
                    }`}
                  >
                    {message.sender !== "You" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar} alt="Support" data-ai-hint="support avatar" />
                        <AvatarFallback>S</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                        message.sender === "You"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.text}
                    </div>
                     {message.sender === "You" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar} alt="You" data-ai-hint="user avatar" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex w-full items-center space-x-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
