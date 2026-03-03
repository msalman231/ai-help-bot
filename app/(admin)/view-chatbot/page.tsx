import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { GET_CHATBOT_BY_USER } from "@/graphql/queries/queries";
import { serverClient } from "@/lib/server/serverClient";
import { Chatbot, GetChatbotsByUserData, GetChatbotsByUserDataVariables } from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";



export const dynamic = "force-dynamic";

async function ViewChatbots() {

    const { userId } = await auth();

    if (!userId) return;

    // const { data: { chatbotsByUser }, } = await serverClient.query<GetChatbotsByUserData, GetChatbotsByUserDataVariables>({
    //     query: GET_CHATBOT_BY_USER,
    //     variables: {
    //         clerk_user_id: userId
    //     }
    // })

    const res = await serverClient.query<GetChatbotsByUserData, GetChatbotsByUserDataVariables>({
        query: GET_CHATBOT_BY_USER,
        variables: {
            clerk_user_id: userId
        }
    })

    const chatbotsByUser = res.data?.chatbotsByUser ?? [];


    const sortedChatbotsByUser: Chatbot[] = [...chatbotsByUser].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="flex-1 pb-20 p-10">
            <h1 className="text-xl lg:text-3xl font-semibold mb-5">Active Chabots</h1>

            {sortedChatbotsByUser.length === 0 && (
                <div>
                    <p>You have not created any chatbots yet, Click on the button below to create one.</p>
                    <Link href="/create-chatbot">
                        <Button className="bg-blue-700 text-white p-3 rounded-md mt-5">Create Chatbot</Button>
                    </Link>
                </div>
            )}
            <ul>
                {sortedChatbotsByUser.map((chatbot) => (
                    <Link key={chatbot.id} href={`/edit-chatbot/${chatbot.id}`}>
                        <li className="relative p-5 border rounded-md mb-3 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center space-x-4 mb-4">
                                <Avatar seed={chatbot.name} />
                                <h2 className="text-xl font-bold">{chatbot.name}</h2>
                            </div>
                            <hr></hr>
                            <div className="mt-4 flex space-x-4 justify-between">
                                <h3>Characteristics:</h3>
                                <ul>
                                    {chatbot.chatbot_characteristics?.map((characteristic) => (
                                        <li key={characteristic.id}
                                            className="list-disc"
                                        >
                                            {characteristic.content}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex  justify-between mr-72 mt-6 ">
                                <h3>No of Sessions: </h3>
                                {chatbot.chat_sessions?.length === 0 && (
                                    <p className="text-sm text-gray-400">No Session Yet</p>
                                )}
                                <ul>
                                    {chatbot.chat_sessions?.map((session) => (
                                        <li
                                            key={session.id}
                                        >
                                            Session Id: {session.id}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="absolute top-5 right-5 text-xs text-gray-400">
                                Created: {new Date(chatbot.created_at).toLocaleString()}
                            </p>
                        </li>
                    </Link>
                ))}
            </ul>

        </div>
    )
}

export default ViewChatbots
