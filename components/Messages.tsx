'use client'

import { Message } from "@/types/types"
import { usePathname } from "next/navigation";
import Avatar from "./Avatar";
import { UserCircle } from "lucide-react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm"
import { useEffect, useRef } from "react";


function Messages({
    messages,
    chatbotName,
}: {
    messages: Message[];
    chatbotName: string;
}) {

    const ref = useRef<HTMLDivElement>(null);
    const path = usePathname();
    const isReviewsPage = path.includes("review-sessions");

    useEffect(() => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    return (
        <div className="flex-1 flex flex-col overflow-y-auto space-y-10 py-10 px-5 bg-white rounded-lg">
            {messages.map((message) => {
                const isSender = message.sender !== "user";

                return (
                    <div
                        key={message.id}
                        className={`chat ${isSender ? "chat-start" : "chat-end"} relative`}
                    >
                        {isReviewsPage && (
                            <p className="absolute -bottom-5 text-xs text-gray-300">
                                sent {new Date(message.created_at).toLocaleDateString()}
                            </p>
                        )}

                        <div className={`chat-image avatar w-10 ${!isSender && "-mr-4"}`}>
                            {isSender ? (
                                <Avatar
                                    seed={chatbotName}
                                    className="h-12 w-12 bg-white rounded-full border-2 border-blue-300"
                                />
                            ) : (
                                <UserCircle className="text-blue-500" />
                            )}
                        </div>

                        <div
                            className={`chat-bubble text-white ${isSender
                                ? "chat-bubble-primary bg-violet-400"
                                : "chat-bubble-secondary bg-blue-600 text-gray-400"
                                }`}
                        >
                            <div>
                                {message.content}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={ref}>
            </div>
        </div >
    )
}

export default Messages
