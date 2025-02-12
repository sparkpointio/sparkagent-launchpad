"use client";
import { buttonVariants } from "./variants/button-variants";
import ForumEntry from "./ForumEntry";
import { useState } from "react";
import { CommentForm } from "./CommentForm";

interface ForumsProps {
    agentCertificate: string;
    agentName: string;
    agentImage: string;
}

const Forums: React.FC<ForumsProps> = ({
    agentCertificate,
    agentName,
    agentImage,
}) => {
    const [visibleEntries, setVisibleEntries] = useState(5);
    const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);

    const numberOfForumEntries = 20;

    const handleShowMore = () => {
        setVisibleEntries((prev) => Math.min(prev + 5, numberOfForumEntries));
    };

    const handleCommentButtonClick = () => {
        setIsCommentFormOpen(true);
    };

    return (
        <div className="flex flex-col space-y-4 justify-center items-center">
            <button
                onClick={handleCommentButtonClick}
                className={buttonVariants({
                    variant: "outline",
                    size: "xl",
                    className: 'w-full sm:w-60 active:drop-shadow-none py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] text-white bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none button-2'
                })}
            >
                <span>Comment <br />(Burn 10,000 SRK)</span>
            </button>
            {Array.from({ length: visibleEntries }).map((_, index) => (
                <ForumEntry
                    key={index}
                    id={String(index + 1)}
                    user="0x73C0BE869A2f057939d3484E2Ca98C6cbECE4405"
                    message="Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                    timestamp={new Date()}
                    agentCertificate={agentCertificate}
                    agentName={agentName}
                    agentImage={agentImage}
                />
            ))}
            {visibleEntries < numberOfForumEntries && (
                <button onClick={handleShowMore} className={buttonVariants({ variant: "outline", size: "lg", className: 'w-full sm:w-60 active:drop-shadow-none py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] text-white bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none button-2' })}>
                    <span>Show More</span>
                </button>
            )}
            <CommentForm isOpen={isCommentFormOpen} onClose={() => setIsCommentFormOpen(false)} />
        </div>
    );
};

export default Forums;