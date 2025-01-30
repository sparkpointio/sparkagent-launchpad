"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatNumber, getTimeAgo, truncateHash } from "../lib/utils/formatting";
import {
	IconBrandTelegram,
	IconBrandX,
	IconCopy,
	IconWorld,
	IconCircleCheck,
	IconBrandYoutube,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface AgentStatsProps {
	title: string;
	ticker: string;
	image: string;
	imageAlt: string;
	certificate: string;
	description: string;
	createdBy: string;
	marketCap: number;
	datePublished: Date;
	sparkingProgress: number;
	tokenPrice: number;
	website: string;
	twitter: string;
	telegram: string;
	youtube: string;
	pair: string;
}

const socialButtonProperties =
	"w-8 h-8 flex items-center justify-center font-medium border border-black rounded-lg hover:bg-sparkyOrange-200 transition-all dark:border-gray-700";
const socialIconSize = 20;

const AgentStats: React.FC<AgentStatsProps> = ({
	image,
	imageAlt,
	title,
	ticker,
	certificate,
	description,
	createdBy,
	marketCap,
	datePublished,
	tokenPrice,
	website,
	twitter,
	telegram,
	youtube,
}) => {
	const [copied, setCopied] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const darkMode = document.documentElement.classList.contains('dark');
		setIsDarkMode(darkMode);
	}, []);

	const copyToClipboard = (text: string) => {
		if (text) {
			navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 3000);
		}
	};

	return (
		<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group bg-white dark:bg-[#1a1d21] dark:text-white border-2 border-black rounded-2xl shadow-md flex flex-col h-full relative p-5 md:p-6">
			{/* Section 1 */}
			<div className="flex flex-row mb-2">
				<Link href={""}>
					<div className="relative w-32 h-32 rounded-full overflow-hidden mr-4">
						<Image
							src={image}
							alt={imageAlt || "Card image"}
							layout="fill"
							objectFit="cover"
							className="object-cover"
						/>
					</div>
				</Link>
				<div className="flex flex-col flex-grow">
					<div>
						<div className="flex justify-between items-center mb-4">
							<Link href={""}>
								<h2 className="text-2xl font-bold tracking-tight hover:text-sparkyOrange-600">
									{`${title} (${ticker})`}
								</h2>
							</Link>
							<div className="flex space-x-1 items-center">
								<div className="flex items-center space-x-2 mr-8">
									<p>Created by:</p>
									<Link href="">
										<span className="font-bold hover:text-sparkyOrange-600">{`${truncateHash(createdBy)}`}</span>
									</Link>
								</div>
								{website && (
									<button
										className={socialButtonProperties}
										onClick={() => window.open(website, "_blank", "noopener, noreferrer" )}
										title="Website"
									>
										<IconWorld size={socialIconSize} />
									</button>
								)}
								{telegram && (
									<button
										className={socialButtonProperties}
										onClick={() => window.open(telegram, "_blank", "noopener, noreferrer")}
										title="Telegram"
									>
										<IconBrandTelegram size={socialIconSize} />
									</button>
								)}
								{twitter && (
									<button
										className={socialButtonProperties}
										onClick={() => window.open(twitter, "_blank", "noopener, noreferrer")}
										title="X"
									>
										<IconBrandX size={socialIconSize} />
									</button>
								)}
								{youtube && (
									<button
										className={socialButtonProperties}
										onClick={() => window.open(youtube, "_blank", "noopener, noreferrer")}
										title="YouTube"
									>
										<IconBrandYoutube size={socialIconSize} />
									</button>
								)}
							</div>
						</div>

						<div className="mb-2 w-full flex items-center justify-between space-x-4">
							<div className="flex flex-col flex-1">
								<span>Contract Address</span>
								<button
									className="flex items-center space-x-2 truncate px-2 text-sm font-medium text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-sparkyOrange-200 transition-all"
									onClick={() => { copyToClipboard(certificate); }}
								>
									<span>{`${truncateHash(certificate, 12, 6, 6)}`}</span>
									{copied ? (
										<IconCircleCheck size={16} />
									) : (
										<IconCopy size={16} />
									)}
								</button>
							</div>
							<div className="flex flex-col flex-1">
								<span>Market Cap</span>
								<span className="font-bold">
									{formatNumber(marketCap)}
								</span>
							</div>
							<div className="flex flex-col flex-1">
								<span>Price USD</span>
								<span className="font-bold">
									{tokenPrice}
								</span>
							</div>
							<div className="flex flex-col flex-1">
								<span>Price</span>
								<span className="font-bold">
									{tokenPrice + " SRK"}
								</span>
							</div>
						</div>
						<p className="font-normal text-small truncate">{description}</p>
					</div>

					<div className="truncate -mx-5 flex justify-end space-x-2 px-5">
						<p className="font-normal text-gray-400 text-xs text-right mr-2">
							{`Created at`}
						</p>
						<p className="font-bold text-xs text-right">
							{`${getTimeAgo(datePublished)}`}
						</p>
					</div>
				</div>
			</div>
			<iframe
				style={{ height: "60vh" }}
				width="100%"
				id="geckoterminal-embed"
				title="GeckoTerminal Embed"
				src={`https://www.geckoterminal.com/arbitrum/pools/${"0xc6f780497a95e246eb9449f5e4770916dcd6396a"}?embed=1&info=0&swaps=0&grayscale=0&light_chart=${isDarkMode ? '0' : '1'}`}
			></iframe>
		</motion.div>
	);
};

export default AgentStats;
