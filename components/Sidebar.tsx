import { BotMessageSquare, PencilLine, SearchIcon } from "lucide-react"
import Link from "next/link"

function Sidebar() {
    return (
        <div className="bg-white text-white p-5">
            <ul className="gap-5 flex lg:flex-col ">
                <li className="flex-1">
                    <Link
                        className="hover:opacity-50 flex flex-col text-center lg:text-left lg:flex-row items-center gap-2 p-5 rounded-md bg-blue-600"
                        href='/create-chatbot'>
                        <BotMessageSquare className="h-4 w-4 lg:h-6 lg:w-6" />
                        Create Chatbot</Link>
                </li>
                <li className="flex-1">
                    <Link
                        className="hover:opacity-50 flex flex-col text-center lg:text-left lg:flex-row items-center gap-2 p-5 rounded-md bg-blue-600"
                        href='/view-chatbot'>
                        <PencilLine className="h-4 w-4 lg:h-6 lg:w-6" />
                        <div className=" md:inline hidden ">
                            <p className="text-lg">Edit Chatbots</p>
                        </div>
                    </Link>
                </li>
                <li className="flex-1">
                    <Link
                        className="hover:opacity-50 flex flex-col text-center lg:text-left lg:flex-row items-center gap-2 p-5 rounded-md bg-blue-600"
                        href='/review-sessions'>
                        <SearchIcon className="h-4 w-4 lg:h-6 lg:w-6" />
                        <div className="hidden md:inline">
                            <p className="text-lg">View Session</p>
                        </div>
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default Sidebar
