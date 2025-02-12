"use client";

import { motion } from "framer-motion";
import { formatTimestamp, truncateHash } from "../lib/utils/formatting";
import Image from "next/image";
import blockies from "ethereum-blockies";
import { useEffect, useRef, useState } from "react";
import { updateImageSrc } from "../lib/utils/utils";
import { IconLoader3 } from "@tabler/icons-react";
import { cardProperties } from "../lib/utils/style/customStyles";

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

    useEffect(() => {
        if (prevImageRef.current === agentImage) return;
        prevImageRef.current = agentImage;
        updateImageSrc(agentImage, blockiesIcon, setImgSrc, setIsLoading);
    }, [agentImage, blockiesIcon, imgSrc]);

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
            <p>{content}</p>

            {/* Agent Reply Area */}
            {agentMessage && (
                <div className="flex flex-col gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border-2 dark:border-gray-600 ">
                        <div className="flex items-center mb-2 justify-between">
                            <div className="flex items-center">
                                <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden mr-4 md:block">
                                    {isLoading && (
                                        <motion.div
                                            className="absolute inset-0 flex items-center justify-center"
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1,
                                                ease: "linear",
                                            }}
                                        >
                                            <IconLoader3 size={24} />
                                        </motion.div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: isLoading ? 0 : 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full"
                                    >
                                        <Image
                                            src={imgSrc}
                                            alt={"Card image"}
                                            layout="fill"
                                            objectFit="cover"
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
                        <p>{agentMessage}</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ForumEntry;