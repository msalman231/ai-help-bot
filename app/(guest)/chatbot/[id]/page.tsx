'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { use, useEffect, useState } from "react";
import { GetChatbotByIdResponse, Message, MessageByChatSessionIdResponse, MessageByChatSessionIdVariables } from "@/types/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import startNewChat from "@/lib/startNewChat";
import Avatar from "@/components/Avatar";
import { useQuery } from "@apollo/client/react";
import { GET_CHATBOT_BY_ID, GET_MESSAGES_BY_CHAT_SESSION_ID } from "@/graphql/queries/queries";
import Messages from "@/components/Messages";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form"
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";

const formSchema = z.object({
    message: z.string().min(2, "Your Message is too short!"),
})


function ChatbotPage({ params, }: { params: Promise<{ id: string }> }) {

    const { id } = use(params)
    const chatbotId = Number(id)

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isOpen, setIsOpen] = useState(true);
    const [chatId, setChatId] = useState(0);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const { data: chatBotData } = useQuery<GetChatbotByIdResponse, MessageByChatSessionIdVariables>(
        GET_CHATBOT_BY_ID,
        {
            variables: { id: chatbotId },
            skip: !chatbotId
        }
    )

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        }
    })

    const {
        data,
        refetch
    } = useQuery<MessageByChatSessionIdResponse>(
        GET_MESSAGES_BY_CHAT_SESSION_ID,
        {
            variables: { id: chatId },
            skip: !chatId,
        }
    );


    useEffect(() => {
        if (data) {
            setMessages(data.chat_sessions.messages);
        }
    }, [data])

    const handleInformationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true)
        const newChatId = await startNewChat(name, email, chatbotId);
        setChatId(newChatId)

        if (newChatId) {
            await refetch({ id: newChatId })
        }

        setLoading(false)
        setIsOpen(false)
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const { message: formMessage } = values;

        const message = formMessage;
        form.reset();

        if (!name || !email) {
            setIsOpen(true);
            setLoading(false);
            return
        }

        if (!message.trim()) {
            return
        }

        const userMessage: Message = {
            id: crypto.randomUUID(),
            content: message,
            created_at: new Date().toISOString(),
            chat_session_id: chatId,
            sender: "user",
        }

        const loadingMessage: Message = {
            id: crypto.randomUUID(),
            content: "Thinking...",
            created_at: new Date().toISOString(),
            chat_session_id: chatId,
            sender: "ai",
        }

        setMessages((prevMessages) => [
            ...prevMessages,
            userMessage,
            loadingMessage
        ])

        try {
            const response = await fetch("/api/send-message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    chat_session_id: chatId,
                    chatbot_id: chatbotId,
                    content: message,
                })
            });
            const result = await response.json();

            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === loadingMessage.id
                        ? { ...msg, content: result.content, id: result.id }
                        : msg
                )
            );

        } catch (error) {
            console.error("Error Sending Message: ", error)
        }
    }

    return (
        <div className="w-full flex bg-gray-100">
            <Dialog
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <DialogContent className="sm:max-w-106.25">Guest Id: {id}
                    <form onSubmit={handleInformationSubmit}>
                        <DialogHeader>
                            <DialogTitle>Lets help you out!</DialogTitle>
                            <DialogDescription>I just need a few details to get started.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="username"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="John@example.com"
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={!name || !email || loading}>
                                {!loading ? "Continue" : "Loading..."}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col w-full max-w-3xl mx-auto bg-white md: rounded-t-lg shadow-2xl md:mt-10">
                <div className="pb-4 border-b sticky top-0 z-50 bg-blue-400 py-5 px-10 text-white md:rounded-t-lg flex items-center space-x-4">
                    <Avatar
                        seed={chatBotData?.chatbots.name!}
                        className="h-12 w-12 bg-white rounded-full border-2 border-white"
                    />
                    <div>
                        <h1 className="truncate text-lg">
                            {chatBotData?.chatbots.name}
                        </h1>
                        <p className="text-sm text-gray-300">
                            Typically replies Instantly
                        </p>
                    </div>
                </div>
                <Messages
                    messages={messages}
                    chatbotName={chatBotData?.chatbots.name!}
                />
                <Field>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex items-start sticky bottom-0 z-50 space-x-4 drop-shadow-lg p-4 bg-gray-100 rounded-md"
                    >
                        <Controller
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FieldGroup className="flex-1">
                                    <FieldLabel hidden>Message</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            placeholder="Type a message..."
                                            {...field}
                                            className="p-8"
                                        />
                                    </FieldContent>
                                </FieldGroup>
                            )}
                        />

                        <Button
                            type="submit"
                            className="h-full"
                            disabled={form.formState.isSubmitting || !form.formState.isValid}
                        >
                            Send
                        </Button>
                    </form>
                </Field>
            </div>
        </div>
    )
}

export default ChatbotPage 
