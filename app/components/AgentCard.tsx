"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { formatNumber, getSparkingProgress, /*getTimeAgo,*/ truncateHash } from "../lib/utils/formatting";
import {
	IconBrandTelegram,
	IconBrandX,
	IconCopy,
	IconWorld,
	IconCircleCheck,
	IconBrandYoutube,
	IconLoader3
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import blockies from "ethereum-blockies";
import { ConversionType, convertCryptoToFiat, updateImageSrc } from "../lib/utils/utils";
import { socialButtonProperties } from "../lib/utils/style/customStyles";

interface AgentCardProps {
	title: string;
	image: string;
	imageAlt: string;
	certificate: string;
	description: string;
	createdBy: string;
	marketCap: number;
	datePublished: Date;
	website: string;
	twitter: string;
	telegram: string;
	youtube: string;
	trading: boolean;
	gradThreshold: bigint;
	reserveB: bigint;
	initialLiquidity: bigint;
}

const socialIconSize = 20;

const AgentCard: React.FC<AgentCardProps> = ({
	image,
	imageAlt,
	title,
	certificate,
	description,
	createdBy,
	marketCap,
	// datePublished,
	website,
	twitter,
	telegram,
	youtube,
	trading,
	gradThreshold,
	reserveB,
	initialLiquidity,
}) => {
	const [copied, setCopied] = useState(false);
	const [convertedMarketCap, setConvertedMarketCap] = useState<number | null>(null);
	const [imgSrc, setImgSrc] = useState(`https://yellow-patient-hare-489.mypinata.cloud/ipfs/${image}`);
	const [isLoading, setIsLoading] = useState(true);
	const blockiesIcon = blockies.create({ seed: certificate, size: 16, scale: 8 });
	const prevImageRef = useRef<string | null>(null);
	const hasFetchedMarketCap = useRef(false);

    useEffect(() => {
		if (prevImageRef.current === image) return;
		prevImageRef.current = image;
		updateImageSrc(image, blockiesIcon, setImgSrc, setIsLoading);
	}, [image, blockiesIcon, imgSrc]);

	useEffect(() => {
        const convertMarketCap = async () => {
            try {
                const result = await convertCryptoToFiat(marketCap, "SRK", "USD", certificate, ConversionType.MarketCap);
                setConvertedMarketCap(result.toFixed(2));
            } catch (err) {
                console.error("Error converting market cap to USD: " + err);
            }
        };
    
        if (marketCap > 0 && !hasFetchedMarketCap.current) {
            convertMarketCap();
            hasFetchedMarketCap.current = true;
        }
    }, [certificate, marketCap]);

	const copyToClipboard = (text: string) => {
		if (text) {
			navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 3000);
		}
	};

	return (
		<motion.div whileHover={{ scale: 1.02 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
			whileTap={{ scale: 0.9 }} className="group dark:bg-[#1a1d21] dark:text-white bg-white border-2 border-black rounded-2xl shadow-md hover:shadow-sparkyOrange hover:border-sparkyOrange-500 duration-200 flex flex-col justify-between h-full relative">
			<Link href={{
				pathname: "/agent",
				query: {
					certificate,
				}
			}}>
				<div className="relative w-full h-64 rounded-t-2xl overflow-hidden flex items-center justify-center">
					{isLoading && (
						<div className="flex items-center justify-center absolute inset-0">
							<IconLoader3 size={64} className="animate-spin"/>
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
							alt={imageAlt || "Card image"}
							fill
							className="object-cover"
							sizes="(max-width: 768px) 100vw, 33vw"
							onLoad={() => setIsLoading(false)}
						/>
					</motion.div>
				</div>
			</Link>
			<div className="p-5 flex flex-col flex-grow">
				<div>
					<div className="flex justify-between items-center">
						<div className="flex-1 min-w-0">
							<Link href={{
								pathname: "/agent",
								query: {
									certificate,
								}
							}}>
							<h2 className="text-2xl font-bold tracking-tight hover:text-sparkyOrange-600 truncate">
								{title}
							</h2>
						</Link>
					</div>
					<div className="flex space-x-1">
						{website && (
							<button
								onClick={() => window.open(website, "_blank", "noopener, noreferrer")}
								className={socialButtonProperties}
								title="Website"
							>
								<IconWorld size={socialIconSize} />
							</button>
						)}
						{telegram && (
							<button
								onClick={() => window.open(telegram, "_blank", "noopener, noreferrer")}
								className={socialButtonProperties}
								title="Telegram"
							>
								<IconBrandTelegram size={socialIconSize} />
							</button>
						)}
						{twitter && (
							<button
								onClick={() => window.open(twitter, "_blank", "noopener, noreferrer")}
								className={socialButtonProperties}
								title="X"
							>
								<IconBrandX size={socialIconSize} />
							</button>
						)}
						{youtube && (
							<button
								onClick={() => window.open(youtube, "_blank", "noopener, noreferrer")}
								className={socialButtonProperties}
								title="YouTube"
							>
								<IconBrandYoutube size={socialIconSize} />
							</button>
						)}
					</div>
				</div>

					<h3 className="mt-2 mb-2 text-xl tracking-tight truncate w-full flex items-center">
						<span className="pr-2">CA:</span>
						<button
							className="flex items-center space-x-2 truncate px-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-sparkyOrange-200 transition-all group/button"
							onClick={() => { copyToClipboard(certificate); }}
						>
							<span
								className="group-hover/button:dark:text-black">{`${truncateHash(certificate, 12, 6, 6)}`}</span>
							{copied ? (
								<IconCircleCheck size={16} className="group-hover/button:dark:stroke-black" />
							) : (
								<IconCopy size={16} className="group-hover/button:dark:stroke-black" />
							)}
						</button>
					</h3>
					<p className="mb-3 font-normal text-small line-clamp-3">{description}</p>
				</div>

				<div className="truncate mt-auto -mx-5">
					<p className="px-5 mb-2 font-normal flex justify-between">
						<span>{"Created by:"}</span>
						<Link
							href={`${process.env.NEXT_PUBLIC_ARBISCAN}address/${createdBy}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<span className="hover:text-sparkyOrange-600">{truncateHash(createdBy)}</span>
						</Link>
					</p>
					<p className="px-5 font-normal flex justify-between mb-4">
						<span>{"Market Cap:"}</span>
						<span className="font-bold">
							{convertedMarketCap ? `$${formatNumber(convertedMarketCap)}` : "Fetching..."}
						</span>
					</p>
					{/*<p className="font-normal text-gray-600 dark:text-gray-300 text-xs px-5 text-right mb-1">*/}
					{/*	{`${getTimeAgo(datePublished)}`}*/}
					{/*</p>*/}
					<hr className="border-black border-2 group-hover:border-sparkyOrange transition-all duration-200" />
					<div className="px-5">
						<p className="font-normal text-[0.8em] mt-3 mb-1">{`Sparking Progress: ${!trading ? 100 : reserveB ? getSparkingProgress(reserveB, gradThreshold, initialLiquidity) : 0}%`}</p>
						<div className="w-full h-3 rounded-full border border-black overflow-hidden">
							{/* To fix: avoid using CSS inline styles. */}
							<div
								className={`h-full rounded-full transition-all duration-1000 ease-in-out
									${
										(!trading)
											? "bg-sparkyOrange"
											: reserveB
												? (getSparkingProgress(reserveB, gradThreshold, initialLiquidity) >= 100 || !trading
													? "bg-sparkyOrange"
													: "bg-sparkyGreen-200")
												: 0 
									}`}
								style={{
									width: `${Math.min(
										(!trading)
											? 100
											: reserveB
												? getSparkingProgress(reserveB, gradThreshold, initialLiquidity)
												: 0,
										100
									)}%`,
								}}
							></div>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default AgentCard;
