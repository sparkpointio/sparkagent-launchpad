import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { buttonVariants } from '../components/variants/button-variants';
import { useState, useEffect } from "react";
import { formsDialogBackgroundOverlayProperties, formsDialogContentProperties, formsTextBoxProperties } from "../lib/utils/style/customStyles";
import { getContract, prepareContractCall, readContract } from "thirdweb";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { client } from '../client';
import { arbitrum } from "thirdweb/chains";
import { IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { ForumMessage } from "./Forums";

interface CommentFormProps {
    isOpen: boolean;
    onClose: () => void;
    forumToken: string;
    onCommentSubmitted: (newMessage: ForumMessage) => void;
}

const forumContract = getContract({
    client,
    chain: arbitrum,
    address: process.env.NEXT_PUBLIC_FORUM_CONTRACT as string,
});

const srkContract = getContract({
    client,
    chain: arbitrum,
    address: process.env.NEXT_PUBLIC_SRK_TOKEN as string,
});

const burnAmount = readContract({
    contract: forumContract,
    method: "function defaultBurnAmount() returns (uint256)",
});

export function CommentForm({ isOpen, onClose, forumToken, onCommentSubmitted }: CommentFormProps) {
    const [comment, setComment] = useState("");
    const [validationError, setValidationError] = useState("");
    const [maxMessageLength, setMaxMessageLength] = useState(10);
    const [minMessageLength, setMinMessageLength] = useState(0);
    const { mutate: sendTransaction } = useSendTransaction();
    const [isLoading, setIsLoading] = useState(false);
    const [fetchedBurnAmount, setFetchedBurnAmount] = useState(BigInt(0));

    useEffect(() => {
        async function fetchBurnAmount() {
            const burnAmountValue = await burnAmount;
            setFetchedBurnAmount(burnAmountValue);
        }
        fetchBurnAmount();
    }, []);

    const account = useActiveAccount();

    useEffect(() => {
        const fetchMaxMessageLength = async () => {
            const maxLength = await readContract({
                contract: forumContract,
                method: "function maxMessageLength() returns (uint256)",
            });
            setMaxMessageLength(Number(maxLength));
        };

        const fetchMinMessageLength = async () => {
            const minLength = await readContract({
                contract: forumContract,
                method: "function minMessageLength() returns (uint256)",
            });
            setMinMessageLength(Number(minLength));
        }

        fetchMaxMessageLength();
        fetchMinMessageLength();
    }, []);

    if (!account) {
        return null;
    }

    const approveSRK = async () => {
        setIsLoading(true);
        const approveSrk = prepareContractCall({
            contract: srkContract,
            method: "function approve(address spender, uint256 value)",
            params: [
                process.env.NEXT_PUBLIC_FORUM_CONTRACT as string,
                fetchedBurnAmount
            ],
        });

        const approveSRKReceipt = sendTransaction(approveSrk, {
            onError: (error) => {
                console.error(error);
                setIsLoading(false);
            },
            onSuccess: () => {
                console.log("Transaction successfully executed!");
                submitComment();
            },
        });
        console.log("Approval transaction receipt:", approveSRKReceipt);
    }

    const submitComment = async () => {      
        const approveTx = prepareContractCall({
            contract: forumContract,
            method: "function sendForumMessage(address forumToken, string message)",
            params: [
                forumToken,
                comment
            ],
        });
    
        console.log("Prepared approval transaction:", approveTx);

        const approveReceipt = sendTransaction(approveTx, {
            onError: (error) => {
                console.error(error);
                setIsLoading(false);
            },
            onSuccess: (response) => {
                console.log("Transaction successfully executed!");
                setIsLoading(false);
                handleDialogClose();
                toast.success("Comment posted successfully!");
                const newMessage: ForumMessage = {
                    id: response.transactionHash,
                    sender: account.address,
                    forumToken,
                    content: comment,
                    timestamp: Date.now().toString(),
                };
                onCommentSubmitted(newMessage);
            },
        });

        console.log("Approval transaction receipt:", approveReceipt);
    };

    const handleDialogClose = () => {
        onClose();
        setComment("");
        setValidationError("");
    };

    const handleSubmit = () => {
        if (!comment) {
            setValidationError("Comment cannot be empty.");
            return;
        }

        if (comment.length > maxMessageLength) {
            setValidationError("Comment is too long.");
            return;
        }

        if (comment.length < minMessageLength) {
            setValidationError("Comment is too short.");
            return;
        }

        approveSRK();

        console.log("Comment submitted:", comment);
    };

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    handleDialogClose();
                }
            }}>
            <Dialog.Trigger asChild>
                <div />
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className={ formsDialogBackgroundOverlayProperties } />
                <Dialog.Content className={ formsDialogContentProperties }
                    onInteractOutside={(event) => {
                        event.preventDefault();
                    }}>
                    <Dialog.Close
                        onClick={handleDialogClose}
                        className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: 'absolute z-[99] top-4 right-4 w-8 active:drop-shadow-none py-3 border border-black dark:bg-white transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-white hover:shadow-[0.25rem_0.25rem_#000] dark:hover:bg-red-500 hover:bg-red-500 active:translate-x-0 active:translate-y-0 active:shadow-none button-2',
                        })}
                    >
                        <span>&times;</span>
                    </Dialog.Close>

                    <div className="max-w-md text-center flex flex-col items-center relative">
                        <Dialog.Title className="text-lg font-bold mb-2 text-custom-1">
                            Post a Comment
                        </Dialog.Title>
                        <Dialog.Description className="text-center w-full p-0 text-custom-1 text-[0.9em] mb-5">
                            Share your thoughts with us.
                        </Dialog.Description>

                        <Form.Root className="w-full flex flex-col items-center">
                            <Form.Field className="w-full mb-2" name="comment">
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        fontSize: "0.8em",
                                        paddingLeft: "6px",
                                        marginBottom: "2px",
                                    }}
                                >
                                    Comment:
                                </div>
                                <Form.Control asChild>
                                    <textarea
                                        className={`w-full h-[5.7rem] px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                        name="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                        placeholder='Write your comment here...'
                                    />
                                </Form.Control>
                                <p className={`text-right text-sm ${comment.length > maxMessageLength ? 'text-red-500' : 'text-gray-500'}`} >
                                    {comment.length}/{maxMessageLength}
                                </p>
                            </Form.Field>

                            {validationError && (
                                <p className="text-center text-red-500 text-[0.9em]">{validationError}</p>
                            )}

                            <button
                                type="button"
                                className={buttonVariants({
                                    variant: "outline",
                                    size: "md",
                                    className: `mt-5 bg-white border w-full border-black active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`,
                                })}
                                onClick={handleSubmit}
                            >
                                {!isLoading ? "Post Comment" : <IconLoader2 size={16} className="animate-spin" />}
                            </button>
                        </Form.Root>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}