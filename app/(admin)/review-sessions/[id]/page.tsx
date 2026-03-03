import Messages from "@/components/Messages"
import { GET_CHAT_SESSION_MESSAGES } from "@/graphql/queries/queries"
import { serverClient } from "@/lib/server/serverClient"
import { GetChatSessionMessageResponse, GetChatSessionMessageVaraiables } from "@/types/types"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
async function ReviewSession({ params }: { params: Promise<{ id: string }> }) {


    const { id } = await params;
    if (!id) {
        console.error("Id param missing");
        notFound()
    }
    const res = await serverClient.query<GetChatSessionMessageResponse, GetChatSessionMessageVaraiables>({
        query: GET_CHAT_SESSION_MESSAGES,
        variables: { id: parseInt(id) }
    })

    // const session = res.data?.chat_sessions;

    if (!res.data || !res.data.chat_sessions) {
        console.error("Session not found for id:", id);
        notFound();
    }

    const session = res.data.chat_sessions;

    const {
        id: chatSessionId,
        created_at,
        messages,
        chatbots,
        guests,
    } = session;

    const { name } = chatbots;
    const { name: guestName, email } = guests;

    return (
        <div className="flex-1 p-10 pb-24">
            <h1 className="text-xl lg:text-3xl font-semibold">
                Session Review
            </h1>
            <p className="font-light text-xs text-gray-400 mt-2">
                Started ar {new Date(created_at).toLocaleString()}
            </p>
            <h2 className="font-light mt-2">
                Between {name} & {" "}
                <span className="font-extrabold">
                    {guestName} ({email})
                </span>
            </h2>
            <hr className="my-10" />

            <Messages
                messages={messages}
                // chatSessionId={chatSessionId}
                chatbotName={name}
            // guestName={guestName}
            />
        </div>
    )
}

export default ReviewSession
