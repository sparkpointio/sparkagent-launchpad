"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { buttonVariants } from "./variants/button-variants";
import ForumEntry from "./ForumEntry";
import { CommentForm } from "./CommentForm";
import { motion } from "framer-motion";
import { IconLoader2 } from "@tabler/icons-react";
import { useCallback } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, readContract, toEther } from "thirdweb";
import { client } from '../client';
import { selectedChain } from "../lib/chain-thirdweb";

interface ForumsProps {
    agentCertificate: string;
    agentName: string;
    agentImage: string;
}

export interface ForumMessage {
    id: string;
    sender: string;
    token: string;
    content: string;
    created_at: string;
    updated_at: string;
    response: string;
}

const forumContract = getContract({
    client,
    chain: selectedChain,
    address: process.env.NEXT_PUBLIC_FORUM_CONTRACT as string,
});

const burnAmount = readContract({
    contract: forumContract,
    method: "function defaultBurnAmount() returns (uint256)",
});

const Forums: React.FC<ForumsProps> = ({ agentCertificate, agentName, agentImage }) => {
    const [forumMessages, setForumMessages] = useState<ForumMessage[]>([]);
    const [forumMessagesCount, setForumMessagesCount] = useState<number>(0);
    const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isShowMoreLoading, setIsShowMoreLoading] = useState(false);
    const [startingIndex, setStartingIndex] = useState(0);
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [fetchedBurnAmount, setFetchedBurnAmount] = useState(BigInt(0));
    
    const hasFetchedMessagesCount = useRef(false);

    const forumToken = agentCertificate;
    const numberOfMessages = 5;
    const direction = "down";

    const account = useActiveAccount();

    useEffect(() => {
        if (account) {
            setIsWalletConnected(true);
        }
    } , [account]);

    useEffect(() => {
        async function fetchBurnAmount() {
            const burnAmountValue = await burnAmount;
            setFetchedBurnAmount(burnAmountValue);
        }
        fetchBurnAmount();
    }, []);

    const insertNewComment = (newMessage: ForumMessage) => {
        setForumMessagesCount(prevCount => prevCount + 1);
        setForumMessages(prevMessages => [newMessage, ...prevMessages]);
    };

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
            console.log('Forum messages:', response.data);
            setForumMessages(prevMessages => [...prevMessages, ...response.data]);
        } catch (error) {
            console.error("Error fetching forum messages:", error);
        } finally {
            setIsShowMoreLoading(false);
        }
    }, [forumToken]);

    const fetchForumMessagesCount = useCallback(async () => {
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
            setStartingIndex(response.data.messagesCount);
            if (response.data.messagesCount > 0) {
                await fetchForumMessages(response.data.messagesCount);
            }
        } catch (error) {
            console.error("Error fetching forum messages:", error);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }, [forumToken, fetchForumMessages]);

    useEffect(() => {
        if (!hasFetchedMessagesCount.current) {
            fetchForumMessagesCount();
            hasFetchedMessagesCount.current = true;
        }
    }, [fetchForumMessagesCount]);

    const handleShowMore = () => {
        const newIndex = startingIndex - numberOfMessages;
        setStartingIndex(newIndex);
        setIsShowMoreLoading(true);
        fetchForumMessages(newIndex);
    };

    return (
        <div className="flex flex-col space-y-4 justify-center items-center">
            <button
                type="button"
                onClick={() => setIsCommentFormOpen(true)}
                disabled={!isWalletConnected}
                className={buttonVariants({
                    variant: "outline",
                    size: "xl",
                    className: `w-full sm:w-60 active:drop-shadow-none py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] text-white bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none button-2 ${!isWalletConnected ? 'opacity-50 cursor-not-allowed' : ''}`,
                })}
            >
                {
                    isWalletConnected ? (
                        <span>Comment <br />(Burn {BigInt(toEther(fetchedBurnAmount))} SRK)</span>
                    ) : (
                        <span>Connect Wallet to Comment</span>
                    )
                }
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
                            messageTimestamp={new Date(message.created_at)}
                            agentCertificate={agentCertificate}
                            agentName={agentName}
                            agentImage={agentImage}
                            agentMessage={message.response}
                            agentTimestamp={message.updated_at ? new Date(message.updated_at) : undefined}
                        />
                    ))}

                    {forumMessages.length < forumMessagesCount && (
                        <button
                            type="button"
                            onClick={handleShowMore}
                            disabled={isShowMoreLoading}
                            className={buttonVariants({
                                variant: "outline",
                                size: "lg",
                                className: `w-full sm:w-60 active:drop-shadow-none py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] text-white bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none button-2 ${isShowMoreLoading ? 'opacity-50 cursor-not-allowed' : ''}`,
                            })}
                        >
                            {isShowMoreLoading ? (
                                <IconLoader2 className="animate-spin" />
                            ) : (
                                <span>Show More</span>
                            )}
                        </button>
                    )}
                </>
            )}
            <CommentForm forumToken={agentCertificate} isOpen={isCommentFormOpen} onClose={() => setIsCommentFormOpen(false)} onCommentSubmitted={insertNewComment} />
        </div>
    );
};

export default Forums;