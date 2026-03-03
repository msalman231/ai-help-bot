'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { toast } from "sonner";
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { Copy, PlusCircleIcon } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_CHATBOT_BY_ID } from "@/graphql/queries/queries";
import { GetChatbotByIdResponse, GetChatbotByIdVariables } from "@/types/types";
import Characteristic from "@/components/Characteristic";
import { ADD_CHARACTERISTIC, DELETE_CHATBOT, UPDATE_CHATBOT } from "@/graphql/mutations/mutations";
import { redirect } from "next/navigation";

function EditChatbot({ params }: { params: Promise<{ id: string }> }) {

    const { id } = use(params);
    const [url, setUrl] = useState("");
    const [newCharacteristic, setNewCharacteristic] = useState("");

    const [chatbotName, setChatbotName] = useState("");

    const [deleteChatbot] = useMutation(DELETE_CHATBOT, {
        refetchQueries: ["GetChatbotById"],
        awaitRefetchQueries: true,
    })

    const [updateChatbot] = useMutation(UPDATE_CHATBOT, {
        refetchQueries: ["GetChatbotById"],
        awaitRefetchQueries: true,
    })

    const [addCharacteristic] = useMutation(ADD_CHARACTERISTIC, {
        refetchQueries: ["GetChatbotById"],
    })


    const { data, loading, error } = useQuery<GetChatbotByIdResponse, GetChatbotByIdVariables>(GET_CHATBOT_BY_ID, { variables: { id } })


    useEffect(() => {
        if (data) {
            setChatbotName(data.chatbots?.name || "Chatbot Name not found");
        }
    }, [data])

    useEffect(() => {
        const origin = window.location.origin;
        setUrl(`${origin}/chatbot/${id}`);
    }, [id]);


    const handleAddCharacteristic = async (content: string) => {
        try {
            const promise = addCharacteristic({
                variables: {
                    chatbotId: Number(id),
                    content,
                    created_at: new Date().toISOString(),
                },
            });
            toast.promise(promise, {
                loading: "Adding...",
                success: "Information added",
                error: "Failed to add Information",
            });
        } catch (error) {
            console.error("Failed to add characteristic: ", error);
        }
    }


    const handleDelete = async (id: string) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this Chatbot?");
        if (!isConfirmed) return;

        try {
            const promise = deleteChatbot({ variables: { id } });
            toast.promise(promise, {
                loading: "Deleting...",
                success: "Chatbot Successfully deleted",
                error: "Failed to delete chatbot",
            });
        } catch (error) {
            console.error("Error Deleting chatbot: ", error);
            toast.error("Failed to delete chatbot.");
        }
    }

    const handleUpdateChatbot = async (id: string, name: string) => {
        const isConfirmed = window.confirm("Are you sure you want to update the bot name");

        if (!isConfirmed) return;

        try {
            const promise = updateChatbot({ variables: { id: Number(id), name } });
            toast.promise(promise, {
                loading: "Updating...",
                success: "Chatbot Updated sucessfully",
                error: "Failed to update chatbot",
            });
        } catch (error) {
            console.error("Error updating chatbot name: ", error);
            toast.error("Failed to update chatbot name.");
        }
    }

    if (loading)
        return (
            <div className="mx-auto animate-spin p-10">
                <Avatar seed="Supprt Agent" />
            </div>
        );

    if (error) return <p>Error: {error.message}</p>

    if (!data?.chatbots) return redirect("/view-chatbots");


    return (
        <div className="px-0 md:p-10">
            <div className="md:sticky md:top-0 z-50 sm:max-w-sm ml-auto space-y-2 md:border p-5 rounded-b-lg md:rounded-lg bg-blue-600">
                <h2 className="text-white text-sm font-bold">Link to Chat</h2>
                <p className="text-sm italic text-white">
                    Share this link with your customers to start conversations with your chatbot
                </p>
                <div className="flex items-center space-x-2">
                    <Link href={url} className="w-full cursor-pointer hover:opacity-50">
                        <Input value={url} readOnly className="cursor-pointer bg-white" />
                    </Link>
                    <Button className="px-3 cursor-pointer" size={"sm"}
                        onClick={() => {
                            navigator.clipboard.writeText(url);
                            toast.success("Copied to Clipboard");
                        }}>
                        <span className="sr-only">Copy</span>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <section className="relative mt-5 bg-white p-5 md:p-10 rounded-lg">
                <Button variant="destructive" className="absolute top-2 right-2 h-8 w-2"
                    onClick={() => handleDelete(id)}
                    title="Delete Bot"
                >
                    X
                </Button>
                <div className="flex space-x-4">
                    <Avatar seed={chatbotName} />
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateChatbot(id, chatbotName);
                        }}
                        className="flex flex-1 space-x-2 items-center"
                    >
                        <Input
                            value={chatbotName}
                            onChange={(e) => setChatbotName(e.target.value)}
                            placeholder={chatbotName}
                            className="w-full border-none bg-transparent text-xl font-bold"
                            required
                        />
                        <Button type="submit" disabled={!chatbotName}>Update</Button>
                    </form>
                </div>
                <h2 className="text-xl font-bold mt-10">Hers what your Ai Knows...</h2>
                <p>
                    Your chatbot is equipped with the following information to assist you in your conversations with your customers & users
                </p>
                <div className="relative mt-6">
                    <form
                        className="flex gap-12 mb-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAddCharacteristic(newCharacteristic);
                            setNewCharacteristic("");
                        }}
                    >
                        <Input
                            type="text"
                            placeholder="Example: If customer asks for prices, provide pricing page: www.example.com/pricing"
                            value={newCharacteristic}
                            onChange={(e) => setNewCharacteristic(e.target.value)}
                        />
                        <Button type="submit" disabled={!newCharacteristic}>
                            <PlusCircleIcon className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
                <div className="bg-gray-400 flex p-2.5">
                    <ul className="flex flex-wrap">
                        {data?.chatbots?.chatbot_characteristics?.map((characteristic) => (
                            <Characteristic
                                key={characteristic.id}
                                characteristic={characteristic}
                            />
                        ))}
                    </ul>
                </div>
            </section>
        </div >
    )
}

export default EditChatbot
