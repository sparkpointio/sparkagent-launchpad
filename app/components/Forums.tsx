"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { buttonVariants } from "./variants/button-variants";
import ForumEntry from "./ForumEntry";
import { CommentForm } from "./CommentForm";
import { motion } from "framer-motion";
import { IconLoader3 } from "@tabler/icons-react";
import { useCallback } from "react";

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
    const [forumMessagesCount, setForumMessagesCount] = useState<number>(0);
    const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isShowMoreLoading, setIsShowMoreLoading] = useState(false);
    const [startingIndex, setStartingIndex] = useState(0);
    
    const hasFetchedInitialMessages = useRef(false);
    const forumToken = agentCertificate;
    const numberOfMessages = 5;
    const direction = "up";

    const fetchForumMessages = useCallback(async (startIndex: number) => {
        try {
            const response = await axios.get(`/api/forums/fetch-forum-messages-via-starting-index-number-of-messages-and-direction`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    forumToken,
                    startingIndex: startIndex,
                    numberOfMessages,
                    direction,
                },
            });
            setForumMessages(prevMessages => [...prevMessages, ...response.data]);
        } catch (error) {
            console.error("Error fetching forum messages:", error);
        } finally {
            setIsLoading(false);
            setIsShowMoreLoading(false);
        }
    }, [forumToken]);

    useEffect(() => {
        if (!hasFetchedInitialMessages.current) {
            fetchForumMessages(0);
            hasFetchedInitialMessages.current = true;
        }
    }, [fetchForumMessages]);

    useEffect(() => {
        const fetchForumMessagesCount = async () => {
            try {
                const response = await axios.get(`/api/forums/fetch-forum-messages-count`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: {
                        forumToken,
                    },
                });
                console.log('Forum messages count:', response.data.messagesCount);
                setForumMessagesCount(response.data.messagesCount);
            } catch (error) {
                console.error("Error fetching forum messages:", error);
            }
        };

        fetchForumMessagesCount();
    }, [forumToken]);

    const handleShowMore = () => {
        const newIndex = startingIndex + numberOfMessages;
        setStartingIndex(newIndex);
        setIsShowMoreLoading(true);
        fetchForumMessages(newIndex);
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
                    {forumMessages.map((message) => (
                        <ForumEntry
                            key={`${message.id}`}
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

                    {forumMessages.length < forumMessagesCount && (
                        <button
                            type="button"
                            onClick={handleShowMore}
                            className={buttonVariants({
                                variant: "outline",
                                size: "lg",
                                className: "w-full sm:w-60 active:drop-shadow-none py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] text-white bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none button-2",
                            })}
                        >
                            {isShowMoreLoading ? (
                                <IconLoader3 className="animate-spin" />
                            ) : (
                                <span>Show More</span>
                            )}
                        </button>
                    )}
                </>
            )}
            <CommentForm isOpen={isCommentFormOpen} onClose={() => setIsCommentFormOpen(false)} />
        </div>
    );
};

export default Forums;