import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { buttonVariants } from '../components/variants/button-variants';
import { useState } from "react";

interface CommentFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CommentForm({ isOpen, onClose }: CommentFormProps) {
    const [comment, setComment] = useState("");
    const [validationError, setValidationError] = useState("");

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

        // Handle comment submission logic here
        console.log("Comment submitted:", comment);
        handleDialogClose();
    };

    const textBoxStyling = "bg-gray-200 dark:bg-gray-700 rounded-xl border border-black dark:border-transparent bg-white dark:text-white";

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
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-[100]" />
                <Dialog.Content className={'fixed bg-white dark:bg-[#1a1d21] dark:text-white left-[50%] top-[50%] z-[101] grid w-[90%] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-black border-2 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl sm:rounded-2xl sm:px-6 sm:py-10 p-4 max-h-[calc(100vh-40px)] overflow-auto'}
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
                                        className={`w-full h-[5.7rem] mb-0 px-5 py-3 text-[0.9em] ${textBoxStyling}`}
                                        name="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                        placeholder='Write your comment here...'
                                    />
                                </Form.Control>
                            </Form.Field>

                            {validationError && (
                                <p className="mt-2 text-center text-red-500 text-[0.9em]">{validationError}</p>
                            )}

                            <button
                                type="button"
                                className={buttonVariants({
                                    variant: "outline",
                                    size: "md",
                                    className: "mt-5 bg-white border w-full border-black active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1",
                                })}
                                onClick={handleSubmit}
                            >
                                Post Comment
                            </button>
                        </Form.Root>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}