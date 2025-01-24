"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatNumber, getTimeAgo, truncateHash } from "../lib/utils/formatting";
import {
	IconBrandTelegram,
	IconBrandX,
	IconCopy,
	IconWorld,
	IconCircleCheck,
} from "@tabler/icons-react";
import Link from "next/link";

interface AgentCardProps {
	title: string;
	image: string;
	imageAlt: string;
	certificate: string;
	description: string;
	createdBy: string;
	marketCap: number;
	datePublished: Date;
	sparkingProgress: number;
}

const socialButtonProperties =
	"w-8 h-8 flex items-center justify-center font-medium border border-black rounded-lg hover:bg-sparkyOrange-200 transition-all";
const socialIconSize = 20;

const AgentCard: React.FC<AgentCardProps> = ({
	image,
	imageAlt,
	title,
	certificate,
	description,
	createdBy,
	marketCap,
	datePublished,
	sparkingProgress,
}) => {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = (text: string) => {
		if (text) {
			navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 3000);
		}
	};

	return (
		<div className="group bg-white border-2 border-black rounded-2xl shadow-md hover:shadow-sparkyOrange hover:border-sparkyOrange-500 transition-all duration-200 flex flex-col justify-between h-full relative">
			<Link href={""}>
				<div className="relative w-full h-64 rounded-t-2xl overflow-hidden">
					<Image
						src={image}
						alt={imageAlt || "Card image"}
						layout="fill"
						objectFit="cover"
						className="object-cover"
					/>
				</div>
			</Link>
			<div className="p-5 flex flex-col flex-grow">
				<div>
					<div className="flex justify-between items-center">
						<Link href={""}>
							<h2 className="text-2xl font-bold tracking-tight hover:text-sparkyOrange-600">
								{title}
							</h2>
						</Link>
						<div className="flex space-x-1">
							<button
								className={socialButtonProperties}
								onClick={() => console.log(`Website`)}
								title="Website"
							>
								<IconWorld size={socialIconSize} />
							</button>

							<button
								className={socialButtonProperties}
								onClick={() => console.log(`Telegram`)}
								title="Telegram"
							>
								<IconBrandTelegram size={socialIconSize} />
							</button>
							<button
								className={socialButtonProperties}
								onClick={() => console.log(`X`)}
								title="X"
							>
								<IconBrandX size={socialIconSize} />
							</button>
						</div>
					</div>

					<h3 className="mb-2 text-xl tracking-tight truncate w-full flex items-center">
						<span className="pr-2">CA:</span>
						<button
							className="flex items-center space-x-2 truncate px-2 text-sm font-medium text-black border border-gray-300 rounded-lg hover:bg-sparkyOrange-200 transition-all"
							onClick={() => {
								copyToClipboard(certificate);
							}}
						>
							<span>{`${truncateHash(certificate, 12, 6, 6)}`}</span>
							{copied ? (
								<IconCircleCheck size={16} />
							) : (
								<IconCopy size={16} />
							)}
						</button>
					</h3>
					<p className="mb-3 font-normal text-small line-clamp-3">{description}</p>
				</div>

				<div className="truncate mt-auto -mx-5">
					<p className="px-5 mb-2 font-normal flex justify-between">
						<span>{"Created by:"}</span>
						<Link href=""><span className="hover:text-sparkyOrange-600">{`${truncateHash(createdBy)}`}</span></Link>
					</p>
					<p className="px-5 font-normal flex justify-between">
						<span>{"Market Cap:"}</span>
						<span className="font-bold">
							{formatNumber(marketCap)}
						</span>
					</p>
					<p className="font-normal text-gray-400 text-xs px-5 text-right mb-1">
						{`${getTimeAgo(datePublished)}`}
					</p>
					<hr className="border-black border-2 group-hover:border-sparkyOrange transition-all duration-200" />
					<div className="px-5">
						<p className="font-normal text-sm">{`Sparking Progress: ${sparkingProgress}%`}</p>
						<div className="w-full h-3 rounded-full border border-black overflow-hidden">
							{/* To fix: avoid using CSS inline styles. */}
							<div
								className={`h-full rounded-full ${
									sparkingProgress === 100
										? "bg-sparkyOrange"
										: "bg-sparkyGreen-200"
								}`}
								style={{
									width: `${Math.min(
										sparkingProgress,
										100
									)}%`,
								}}
							></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AgentCard;
