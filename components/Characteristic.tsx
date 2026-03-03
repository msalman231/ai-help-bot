'use client'
import { REMOVE_CHARACTRISTIC } from "@/graphql/mutations/mutations";
import { ChatbotCharacteristic } from "@/types/types"
import { useMutation } from "@apollo/client/react";
import { Delete } from "lucide-react";
import { toast } from "sonner";

function Characteristic(
    { characteristic }: {
        characteristic: ChatbotCharacteristic;
    }) {

    const [removeCharacteristic] = useMutation(REMOVE_CHARACTRISTIC, {
        refetchQueries: ["GetChatbotById"],
    })

    const handleRemoveCharacteristic = async (characteristicId: number) => {
        try {
            await removeCharacteristic({
                variables: {
                    characteristicId,
                },
            });
        } catch (error) {
            console.error("Error Removing Characteristic: ", error)
        }
    }

    return (

        <li className="relative p-4 bg-white border rounded-md m-4">
            {characteristic.content}
            <Delete
                className="w-6 h-6 text-white fill-red-500 absolute top-1 right-1 cursor-pointer hover:opacity-50 "
                onClick={() => {
                    const promise = handleRemoveCharacteristic(characteristic.id);
                    toast.promise(promise, {
                        loading: "Removing...",
                        success: "Characteristic removed",
                        error: "Failed to remove characteristic",
                    })
                }}
            />
        </li>
    )
}

export default Characteristic
