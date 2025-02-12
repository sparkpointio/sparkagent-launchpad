"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { buttonVariants } from "./variants/button-variants";
import ForumEntry from "./ForumEntry";
import { CommentForm } from "./CommentForm";
import { motion } from "framer-motion";

interface ForumsProps {
    agentCertificate: string;
    agentName: string;
    agentImage: string;
}

interface ForumMessage {
    id: string;
    sender: string;
    forumToken: string;
    content: string;
    timestamp: string;
    llmresponse?: {
        message: string;
        timestamp: string;
    };
}

const Forums: React.FC<ForumsProps> = ({ agentCertificate, agentName, agentImage }) => {
    const [forumMessages, setForumMessages] = useState<ForumMessage[]>([]);
    const [visibleEntries, setVisibleEntries] = useState(5);
    const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const forumToken = agentCertificate;
    const numberOfMessages = 5;
    const direction = "up";

    useEffect(() => {
        const fetchForumMessages = async () => {
            try {
                const response = await axios.get(`/api/forums/fetch-forum-messages-via-starting-index-number-of-messages-and-direction`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: {
                        forumToken,
                        startingIndex: 0,
                        numberOfMessages,
                        direction,
                    },
                });
        
                setForumMessages(response.data);
            } catch (error) {
                console.error("Error fetching forum messages:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchForumMessages();
    }, [forumToken]);

    const handleShowMore = () => {
        setVisibleEntries((prev) => Math.min(prev + 5, forumMessages.length));
    };

    return (
        <div className="flex flex-col space-y-4 justify-center items-center">
            <button
                onClick={() => setIsCommentFormOpen(true)}
                className={buttonVariants({
                    variant: "outline",
                    size: "xl",
                    className: 'w-full sm:w-60 active:drop-shadow-none py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] text-white bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none button-2'
                })}
            >
                <span>Comment <br />(Burn 10,000 SRK)</span>
            </button>

            {isLoading ? (
                <motion.span
                    className="text-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                >
                    <div className="text-center text-lg text-gray-500 dark:text-gray-400">
                        Loading comments...
                    </div>
                </motion.span>
            ) : forumMessages.length === 0 ? (
                <div className="text-center text-lg text-gray-500 dark:text-gray-400">
                    No comments available. Be the first to comment!
                </div>
            ) : (
                <>
                    {forumMessages.slice(0, visibleEntries).map((message, index) => (
                        <ForumEntry
                            key={message.id || index}
                            id={message.id}
                            sender={message.sender}
                            content={message.content}
                            messageTimestamp={new Date(Number(message.timestamp))}
                            agentCertificate={agentCertificate}
                            agentName={agentName}
                            agentImage={agentImage}
                            agentMessage={message.llmresponse?.message}
                            agentTimestamp={message.llmresponse ? new Date(Number(message.llmresponse.timestamp)) : undefined}
                        />
                    ))}

                    {visibleEntries < forumMessages.length && (
                        <button
                            onClick={handleShowMore}
                            className={buttonVariants({
                                variant: "outline",
                                size: "lg",
                                className: "w-full sm:w-60 active:drop-shadow-none py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] text-white bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none button-2",
                            })}
                        >
                            <span>Show More</span>
                        </button>
                    )}
                </>
            )}
            <CommentForm isOpen={isCommentFormOpen} onClose={() => setIsCommentFormOpen(false)} />
        </div>
    );
};

export default Forums;