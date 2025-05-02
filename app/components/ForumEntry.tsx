"use client";

import { motion } from "framer-motion";
import { formatTimestamp, truncateHash } from "../lib/utils/formatting";
import Image from "next/image";
import blockies from "ethereum-blockies";
import { useEffect, useRef, useState } from "react";
import { updateImageSrc } from "../lib/utils/utils";
import { IconCircleCheck, IconCopy, IconLoader3 } from "@tabler/icons-react";
import { cardProperties } from "../lib/utils/style/customStyles";
import {
    CensorContext,
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

interface ForumEntryProps {
    id: string;
    agentCertificate: string;
    sender: string;
    content: string;
    messageTimestamp: Date;
    agentName: string;
    agentImage: string;
    agentMessage?: string;
    agentTimestamp?: Date;
};

const ForumEntry: React.FC<ForumEntryProps> = ({
    sender,
    content,
    messageTimestamp,
    agentCertificate,
    agentName,
    agentImage,
    agentMessage,
    agentTimestamp,
}) => {
    const blockiesIcon = blockies.create({
        seed: agentCertificate,
        size: 16,
        scale: 8,
    });
    const prevImageRef = useRef<string | null>(null);
    const [imgSrc, setImgSrc] = useState(
        `https://yellow-patient-hare-489.mypinata.cloud/ipfs/${agentImage}`
    );
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (prevImageRef.current === agentImage) return;
        prevImageRef.current = agentImage;
        updateImageSrc(agentImage, blockiesIcon, setImgSrc, setIsLoading);
    }, [agentImage, blockiesIcon, imgSrc]);

    const matcher = new RegExpMatcher({
        ...englishDataset.build(),
        ...englishRecommendedTransformers,
    });

    const copyToClipboard = (text: string) => {
        if (text) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const asteriskStrategy = (ctx: CensorContext) => '*'.repeat(ctx.matchLength);
    const censor = new TextCensor().setStrategy(asteriskStrategy);
    const matches = matcher.getAllMatches(content);

    const headerProperties = "font-bold text-sparkyOrange-600 mx-1";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cardProperties + " space-y-4 w-full"}>
            {/* User Reply Area */}
            <div className="flex items-center">
                <div className="font-bold border-2 border-sparkyOrange-600 p-1 rounded-lg truncate">
                    <h2 className={`${headerProperties} hidden md:block`}>{sender}</h2>
                    <h2 className={`${headerProperties} md:hidden`}>{truncateHash(sender, 6)}</h2>
                </div>
                <span className="ml-auto">{formatTimestamp(messageTimestamp)}</span>
            </div>
            <p>{censor.applyTo(content, matches)}</p>

            {/* Agent Reply Area */}
            {agentMessage && (
                <div className="flex flex-col gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border-2 dark:border-gray-600 ">
                        <div className="flex items-center mb-2 justify-between">
                            <div className="flex items-center">
                                <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden mr-4 md:block">
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <IconLoader3 size={24} className="animate-spin"/>
                                        </div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: isLoading ? 0 : 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full relative"
                                    >
                                        <Image
                                            src={imgSrc}
                                            alt={"Card image"}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            onLoad={() => setIsLoading(false)}
                                        />
                                    </motion.div>
                                </div>
                                <div className="mr-2 font-bold border-2 border-sparkyOrange-600 p-1 rounded-lg">
                                    <h2 className={headerProperties}>
                                        {agentName + " Agent"}
                                    </h2>
                                </div>
                            </div>
                            <span className="ml-auto">{agentTimestamp ? formatTimestamp(agentTimestamp) : "N/A"}</span>
                        </div>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode }) => {
                                    const language = className?.match(/language-(\w+)/)?.[1]; // Extract language from className
                                    const isInline = typeof children === "string" && !children.includes("\n"); // Check if it's inline code

                                    if (isInline) {
                                        return (
                                            <code
                                                className="bg-gray-200 dark:bg-gray-900 dark:bg-opacity-30 px-1 py-0.5 rounded text-sm"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    }

                                    return (
                                        <p
                                            className="bg-gray-200 dark:bg-gray-900 dark:bg-opacity-30 p-4 rounded-lg overflow-auto text-sm my-2 relative"
                                            {...props}
                                        >
                                            <button
                                                className="hidden md:block flex absolute top-2 right-2 group p-2 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-sparkyOrange-200 transition-all ml-auto"
                                                onClick={() => {
                                                    copyToClipboard(typeof children === "string" ? children : "")
                                                }}
                                            >
                                                {copied ? (
                                                    <IconCircleCheck className="dark:group-hover:stroke-black " />
                                                ) : (
                                                    <IconCopy className="dark:group-hover:stroke-black " />
                                                )}
                                            </button>
                                            <code className={`language-${language || "plaintext"}`}>{children}</code>
                                        </p>
                                    );
                                },
                            } as Partial<Components>}
                        >
                            {agentMessage}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ForumEntry;