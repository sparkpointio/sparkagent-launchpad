"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { formatNumber, getTimeAgo, truncateHash } from "../lib/utils/formatting";
import {
	IconBrandTelegram,
	IconBrandX,
	IconCopy,
	IconWorld,
	IconCircleCheck,
	IconBrandYoutube,
	IconLoader3,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import blockies from "ethereum-blockies";
import { convertCryptoToFiat, updateImageSrc } from "../lib/utils/utils";
import { toast } from "sonner";
import { cardProperties } from "../lib/utils/style/customStyles";
import { socialButtonProperties } from "../lib/utils/style/customStyles";
import { getContract, getContractEvents } from "thirdweb";
import { arbitrumSepolia } from "thirdweb/chains";
import {client} from "@/app/client";
import { Hex } from "viem";
import { createChart, AreaSeries, IChartApi, Time } from "lightweight-charts";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia as arbitrumSepoliaFromViem } from "viem/chains";
import axios from "axios";
import { toTokens, toWei } from "thirdweb";

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
	tokenPrice: number;
	website: string;
	twitter: string;
	telegram: string;
	youtube: string;
	pair: string;
}

const client2 = createPublicClient({
	chain: arbitrumSepoliaFromViem,
	transport: http(),
});

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
	pair,
}) => {
	const [copied, setCopied] = useState(false);
	//const [isDarkMode, setIsDarkMode] = useState(false);
	const [convertedMarketCap, setConvertedMarketCap] = useState<number | null>(null);
	const [convertedTokenPrice, setConvertedTokenPrice] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [imgSrc, setImgSrc] = useState(`https://yellow-patient-hare-489.mypinata.cloud/ipfs/${image}`);
	const [isLoading, setIsLoading] = useState(true);
	const blockiesIcon = blockies.create({ seed: certificate, size: 16, scale: 8 });
	const prevImageRef = useRef<string | null>(null);

    useEffect(() => {
		if (prevImageRef.current === image) return;
		prevImageRef.current = image;
		updateImageSrc(image, blockiesIcon, setImgSrc, setIsLoading);
	}, [image, blockiesIcon, imgSrc]);

	useEffect(() => {
		const convertMarketCap = async () => {
			try {
				console.log("Certificate for Market Cap:", certificate); // Add this line
				const result = await convertCryptoToFiat(marketCap, "SRK", "USD", certificate);
				setConvertedMarketCap(result.toFixed(2));
			} catch (err) {
				setError("Error converting market cap to USD: " + err);
				console.log(error);
			}
		};
	
		if (marketCap > 0) {
			convertMarketCap();
		}
	}, [certificate, error, marketCap]);
	
	useEffect(() => {
		const convertTokenPrice = async () => {
			try {
				console.log("Certificate for Token Price:", certificate); // Add this line
				const result = await convertCryptoToFiat(tokenPrice, "SRK", "USD", certificate);
				setConvertedTokenPrice(result.toFixed(2));
			} catch (err) {
				setError("Error converting token price to USD: " + err);
				console.log(error);
			}
		};
	
		if (tokenPrice > 0) {
			convertTokenPrice();
		}
	}, [certificate, error, tokenPrice]);

	/*useEffect(() => {
		const darkMode = document.documentElement.classList.contains('dark');
		setIsDarkMode(darkMode);
	}, []);*/

	const copyToClipboard = (text: string) => {
		if (text) {
			navigator.clipboard.writeText(text);
			setCopied(true);
			toast.success("Copied to clipboard!");
			setTimeout(() => setCopied(false), 3000);
		}
	};

	const chartContainerRef = useRef<HTMLDivElement | null>(null);
	const chartInstanceRef = useRef<IChartApi>(null); // Store chart instance
	const [chartData, setChartData] = useState<{ blockNumber: bigint; value: number; timestamp: number }[]>([]);

	const fetchStoredEvents = useCallback(async () => {
		try {
			const response = await axios.get(`https://laravel-boilerplate.kinameansbusiness.com/api/storage/get/swap_events_${pair}`);

			console.log("fetchStoredEvents");
			console.log(response.data);

			return (response.data.data ?? []).map((event: { blockNumber: bigint; timestamp: number; }) => ({
				...event,
				blockNumber: BigInt(event.blockNumber), // Convert string back to BigInt
				timestamp: Number(event.timestamp), // Convert back to number
			}));
		} catch (error) {
			console.error("Error fetching stored events:", error);
			return [];
		}
	}, [pair]);

	const saveSwapEvents = useCallback(async (events: { blockNumber: bigint; value: bigint; timestamp: bigint }[]) => {
		try {
			// Convert BigInt values to string
			const sanitizedEvents = events.map(event => ({
				...event,
				blockNumber: event.blockNumber.toString(), // Convert BigInt to string
				timestamp: event.timestamp.toString(), // Just in case
			}));

			await axios.post("https://laravel-boilerplate.kinameansbusiness.com/api/storage/set", {
				key: "swap_events_" + pair,
				value: sanitizedEvents,
			});
		} catch (error) {
			console.error("Error saving swap events:", error);
		}
	}, [pair]);

	const fetchNewSwapEvents = useCallback(async (latestBlockStored: bigint | null) => {
		try {
			const fromBlock = latestBlockStored ? latestBlockStored + BigInt("1") : BigInt("118602497");

			const contract = getContract({ client, address: pair, chain: arbitrumSepolia });
			const swapEventTopic: Hex =
				"0x298c349c742327269dc8de6ad66687767310c948ea309df826f5bd103e19d207";

			const swapEventAbi = {
				anonymous: false,
				name: "Swap",
				type: "event",
				inputs: [
					{ indexed: false, internalType: "uint256", name: "amount0In", type: "uint256" },
					{ indexed: false, internalType: "uint256", name: "amount0Out", type: "uint256" },
					{ indexed: false, internalType: "uint256", name: "amount1In", type: "uint256" },
					{ indexed: false, internalType: "uint256", name: "amount1Out", type: "uint256" },
				],
			} as const;

			const preparedEvent = { abiEvent: swapEventAbi, hash: swapEventTopic, topics: [] as Hex[] };

			const events = await getContractEvents({
				contract,
				fromBlock,
				toBlock: "latest",
				events: [preparedEvent],
			});

			console.log("Raw Fetched Events")
			console.log(events)

			const formattedData = events.map((event) => {
				const { amount0In, amount0Out, amount1In, amount1Out } = event.args;
				let price = 0;

				if (Number(amount0Out) > 0 && Number(amount1In) > 0) {
					// Buy Agent Token (SRK → Agent Token)
					price = Number(amount1In) / Number(amount0Out);
				} else if (Number(amount1Out) > 0 && Number(amount0In) > 0) {
					// Sell Agent Token (Agent Token → SRK)
					price = Number(amount1Out) / Number(amount0In);
				}

				return {
					blockNumber: event.blockNumber,
					value: price,
				};
			});

			return await getEventTimestamps(formattedData);
		} catch (error) {
			console.error("Error fetching new swap events:", error);
			return [];
		}
	}, [pair]);

	const initializeSwapEvents = useCallback(async () => {
		const storedEvents = await fetchStoredEvents();
		const latestBlockStored = storedEvents.length ? storedEvents[storedEvents.length - 1].blockNumber : null;

		console.log("latestBlockStored: " + latestBlockStored);

		const newEvents = await fetchNewSwapEvents(latestBlockStored);

		console.log("newEvents");
		console.log(newEvents);

		// Merge and remove duplicates
		const mergedEvents = [...storedEvents, ...newEvents]
			.sort((a, b) => a.timestamp - b.timestamp)
			.filter((event, index, self) => index === self.findIndex((e) => e.timestamp === event.timestamp));

		await saveSwapEvents(mergedEvents); // Save merged data to API
		setChartData(mergedEvents); // Update UI with stored data
	}, [fetchNewSwapEvents, fetchStoredEvents, saveSwapEvents]);

	const getEventTimestamps = async (events: { blockNumber: bigint; value: number }[]) =>{
		return await Promise.all(
			events.map(async (event: { blockNumber: bigint; value: number }) => {
				const block = await client2.getBlock({ blockNumber: event.blockNumber });
				return {
					...event,
					timestamp: Number(block.timestamp), // Convert BigInt to number
				};
			})
		);
	}

	const groupDataByTime = (data: { timestamp: number; value: number }[]) => {
		const groupedData: Record<number, number> = {};

		for (const event of data) {
			const timestamp = Number(event.timestamp); // Ensure timestamp is a number
			const roundedTime = Math.floor(timestamp / 600) * 600; // Round to the nearest 10-minute mark

			// Always take the latest price for the given time slot
			groupedData[roundedTime] = event.value;
		}

		// Convert grouped data to an array and sort by time
		return Object.entries(groupedData)
			.map(([time, value]) => ({
				time: Number(time) as Time,
				value: Number(toTokens(toWei(value.toString()), 9)),
			}))
			.sort((a, b) => Number(a.time) - Number(b.time));
	};

	useEffect(() => {
		initializeSwapEvents();
	}, [initializeSwapEvents]);

	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		if (!chartInstanceRef.current && chartContainerRef.current && chartData.length > 0) {
			// Initialize chart
			const chart = createChart(chartContainerRef.current, {
				autoSize: true,
				height: 300,
				timeScale: {
					timeVisible: true,
					secondsVisible: false,
				},
				layout: {
					background: { color: isDarkMode ? '#1a1d21' : '#ffffff' },
					textColor: isDarkMode ? '#ffffff' : '#000000', // Set label color
				},
				grid: {
					vertLines: {
						color: isDarkMode ? '#2B2B43' : '#E6E6E6',
					},
					horzLines: {
						color: isDarkMode ? '#2B2B43' : '#E6E6E6',
					},
				},
			});

			chartInstanceRef.current = chart;

			const areaSeries = chart.addSeries(AreaSeries, {
				lineColor: '#00d7b2',
				topColor: '#00d7b2',
				bottomColor: 'rgba(0, 215, 178, 0.28)'
			});

			const formattedChartData = groupDataByTime(chartData);

			console.log("formattedChartData", formattedChartData);
			areaSeries.setData(formattedChartData);

			chart.timeScale().fitContent();
			chart.timeScale().applyOptions({ rightOffset: 0 });
		}

		// Apply background and label color updates when isDarkMode changes
		if (chartInstanceRef.current) {
			chartInstanceRef.current.applyOptions({
				layout: {
					background: { color: isDarkMode ? '#1a1d21' : '#ffffff' },
					textColor: isDarkMode ? '#ffffff' : '#000000', // Update label color dynamically
				},
				grid: {
					vertLines: {
						color: isDarkMode ? '#2B2B43' : '#E6E6E6',
					},
					horzLines: {
						color: isDarkMode ? '#2B2B43' : '#E6E6E6',
					},
				},
			});
		}
	}, [chartData, isDarkMode]);

	useEffect(() => {
		const htmlElement = document.documentElement;

		// Function to check if the .dark class is present
		const checkDarkMode = () => {
			setIsDarkMode(htmlElement.classList.contains("dark"));
		};

		// Initial check
		checkDarkMode();

		// Create a MutationObserver to watch for class changes
		const observer = new MutationObserver(() => {
			checkDarkMode(); // Update state when class changes
		});

		// Observe attribute changes in the `class` attribute
		observer.observe(htmlElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => {
			observer.disconnect(); // Cleanup observer on unmount
		};
	}, []);

	return (
		<motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}}
					className={ cardProperties }>
			{/* Section 1 */}
			<div className="flex flex-row mb-2">
				<div className="relative w-32 h-32 flex-shrink-0 rounded-full overflow-hidden mr-4 hidden md:block">
					{isLoading && (
						<motion.div
							className="absolute inset-0 flex items-center justify-center"
							animate={{rotate: 360}}
							transition={{repeat: Infinity, duration: 1, ease: "linear"}}
						>
							<IconLoader3 size={32}/>
						</motion.div>
					)}
					<motion.div
						initial={{opacity: 0}}
						animate={{opacity: isLoading ? 0 : 1}}
						transition={{duration: 0.5}}
						className="w-full h-full"
					>
						<Image
							src={imgSrc}
							alt={imageAlt || "Card image"}
							layout="fill"
							objectFit="cover"
							className="object-cover"
							sizes="(max-width: 768px) 100vw, 33vw"
							onLoad={() => setIsLoading(false)}
						/>
					</motion.div>
				</div>

				<div className="flex flex-col flex-grow md:hidden">
					<div className="relative w-32 h-32 rounded-full overflow-hidden flex justify-center items-center mx-auto">
						{isLoading && (
							<motion.div
								className="flex items-center justify-center absolute inset-0"
								animate={{ rotate: 360 }}
								transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
							>
								<IconLoader3 size={64} />
							</motion.div>
						)}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: isLoading ? 0 : 1 }}
							transition={{ duration: 0.5 }}
							className="w-full h-full flex justify-center items-center"
						>
							<Image
								src={imgSrc}
								alt={imageAlt || "Card image"}
								layout="fill"
								objectFit="cover"
								className="object-cover"
								sizes="(max-width: 768px) 100vw, 33vw"
								onLoad={() => setIsLoading(false)}
							/>
						</motion.div>
					</div>
					<div className="p-2 flex flex-col flex-grow md:hidden">
						<div>
							<div className="flex flex-col justify-between items-center">
								<div className="flex-1 min-w-0 mb-2">
									<Link href={{
										pathname: "/agent",
										query: {
											certificate,
										}
									}}>
										<h2 className="text-2xl font-bold tracking-tight hover:text-sparkyOrange-600 truncate whitespace-pre-line">
											{title + " (" + ticker + ")"}
										</h2>
									</Link>
								</div>
								<div className="flex space-x-1 mb-4">
									{website && (
										<button
											onClick={() => window.open(website, "_blank", "noopener, noreferrer")}
											className={socialButtonProperties}
											title="Website"
											type="button"
										>
											<IconWorld size={socialIconSize} />
										</button>
									)}
									{telegram && (
										<button
											onClick={() => window.open(telegram, "_blank", "noopener, noreferrer")}
											className={socialButtonProperties}
											title="Telegram"
											type="button"
										>
											<IconBrandTelegram size={socialIconSize} />
										</button>
									)}
									{twitter && (
										<button
											onClick={() => window.open(twitter, "_blank", "noopener, noreferrer")}
											className={socialButtonProperties}
											title="X"
											type="button"
										>
											<IconBrandX size={socialIconSize} />
										</button>
									)}
									{youtube && (
										<button
											onClick={() => window.open(youtube, "_blank", "noopener, noreferrer")}
											className={socialButtonProperties}
											title="YouTube"
											type="button"
										>
											<IconBrandYoutube size={socialIconSize} />
										</button>
									)}
								</div>
							</div>

							<h3 className="mb-2 text-xl tracking-tight truncate w-full flex items-center">
								<span className="pr-2">CA:</span>
								<button
									className="flex items-center space-x-2 truncate px-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-sparkyOrange-200 transition-all"
									onClick={() => { copyToClipboard(certificate); }}
									type="button"
								>
									<span>{`${truncateHash(certificate, 12, 6, 6)}`}</span>
									{copied ? (
										<IconCircleCheck size={16} />
									) : (
										<IconCopy size={16} />
									)}
								</button>
							</h3>
						</div>

						<div className="truncate mt-auto -mx-5">
							<p className="px-5 mb-2 font-normal flex justify-between">
								<span>{"Created by:"}</span>
								<Link
									href={`https://sepolia.arbiscan.io/address/${createdBy}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="hover:text-sparkyOrange-600">{truncateHash(createdBy)}</span>
								</Link>
							</p>
							<p className="px-5 mb-2 font-normal flex justify-between">
								<span>{"Market Cap:"}</span>
								<span className="font-bold">
									{convertedMarketCap ? `$${formatNumber(convertedMarketCap)}` : "Fetching..."}
								</span>
							</p>
							<p className="px-5 mb-2 font-normal flex justify-between">
								<span>{"Price USD:"}</span>
								<span className="font-bold">
									{convertedTokenPrice ? `$${formatNumber(convertedTokenPrice)}` : "Fetching..."}
								</span>
							</p>
							<p className="px-5 mb-2 font-normal flex justify-between">
								<span>{"Price:"}</span>
								<span className="font-bold">
									{formatNumber(tokenPrice) + " SRK"}
								</span>
							</p>
							<p className="px-5 font-normal whitespace-pre-line">{description}</p>
							<p className="font-normal text-gray-400 text-xs px-5 text-right">
								{`${getTimeAgo(datePublished)}`}
							</p>
						</div>
					</div>
				</div>

				<div className="flex flex-col flex-grow hidden md:flex">
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
										<span
											className="font-bold hover:text-sparkyOrange-600">{`${truncateHash(createdBy)}`}</span>
									</Link>
								</div>
								{website && (
									<button
										className={socialButtonProperties}
										onClick={() => window.open(website, "_blank", "noopener, noreferrer")}
										title="Website"
									>
										<IconWorld size={socialIconSize} className="dark:group-hover:stroke-black"/>
									</button>
								)}
								{telegram && (
									<button
										className={socialButtonProperties}
										onClick={() => window.open(telegram, "_blank", "noopener, noreferrer")}
										title="Telegram"
									>
										<IconBrandTelegram size={socialIconSize}
														   className="dark:group-hover:stroke-black"/>
									</button>
								)}
								{twitter && (
									<button
										className={socialButtonProperties}
										onClick={() => window.open(twitter, "_blank", "noopener, noreferrer")}
										title="X"
									>
										<IconBrandX size={socialIconSize} className="dark:group-hover:stroke-black"/>
									</button>
								)}
								{youtube && (
									<button
										className={socialButtonProperties}
										onClick={() => window.open(youtube, "_blank", "noopener, noreferrer")}
										title="YouTube"
									>
										<IconBrandYoutube size={socialIconSize}
														  className="dark:group-hover:stroke-black"/>
									</button>
								)}
							</div>
						</div>

						<div className="mb-2 flex flex-wrap items-center justify-between space-x-4">
							<div className="flex flex-col w-full sm:w-auto">
								<span>Contract Address</span>
								<button
									className="flex group items-center space-x-2 truncate px-2 text-sm text-black font-medium dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-sparkyOrange-200 transition-all"
									onClick={() => {
										copyToClipboard(certificate);
									}}
								>
									<span
										className="dark:group-hover:text-black">{`${truncateHash(certificate, 12, 6, 6)}`}</span>
									{copied ? (
										<IconCircleCheck size={16} className="dark:group-hover:stroke-black "/>
									) : (
										<IconCopy size={16} className="dark:group-hover:stroke-black "/>
									)}
								</button>
							</div>
							<div className="flex flex-col w-full sm:w-auto">
								<span>Market Cap USD</span>
								<span className="font-bold">
									{convertedMarketCap ? `$${formatNumber(convertedMarketCap)}` : "Fetching..."}
								</span>
							</div>
							<div className="flex flex-col w-full sm:w-auto">
								<span>Price USD</span>
								<span className="font-bold">
									{convertedTokenPrice ? `$${formatNumber(convertedTokenPrice)}` : "Fetching..."}
								</span>
							</div>
							<div className="flex flex-col w-full sm:w-auto">
								<span>Price</span>
								<span className="font-bold">
									{formatNumber(tokenPrice) + " SRK"}
								</span>
							</div>
						</div>
						<p className="font-normal text-sm my-2">{description}</p>
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
			{/*<iframe
				style={{ height: "60vh" }}
				width="100%"
				id="geckoterminal-embed"
				title="GeckoTerminal Embed"
				src={`https://www.geckoterminal.com/sepolia-testnet/pools/${certificate}?embed=1&info=0&swaps=0&grayscale=0&light_chart=${isDarkMode ? '0' : '1'}`}
			></iframe>*/}
			{/*<div*/}
			{/*	id="chart-container"*/}
			{/*	style={{height: "60vh", width: "100%"}}*/}
			{/*	className="bg-[radial-gradient(theme(colors.gray.300)_10%,transparent_10%)] bg-[length:16px_16px] flex border border-gray-300 justify-center items-center"*/}
			{/*>*/}
			{/*	<p className="text-center">Charts are not available as of the moment.</p>*/}
			{/*</div>*/}

			{chartData.length > 0 ? (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ position: "relative" }}>
					<div ref={chartContainerRef} className="h-[30vh] sm:h-[60vh]" style={{ width: "100%", paddingRight: "20px" }} />

					<div
						className="text-[#000000] dark:text-[#ffffff]"
						style={{
							position: "absolute",
							top: "50%",
							right: "-50px", // Align to the right side
							transform: "translateY(-50%) rotate(90deg)", // Rotate text vertically
							padding: "2px 4px",
							fontSize: "12px",
							zIndex: 99,
						}}
					>
						Price in SRK (Gwei)
					</div>
				</motion.div>
			) : (
				<div className="flex items-center justify-center h-[30vh] sm:h-[60vh]">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
					>
						<motion.div
							className="flex items-center justify-center mr-2"
							animate={{ rotate: 360 }}
							transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
						>
							<IconLoader3 size={64} />
						</motion.div>
						<motion.span
							className="text-lg"
							animate={{ y: [0, -5, 0] }}
							transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
						>
							Loading Chart Data...
						</motion.span>
					</motion.div>
				</div>
			)}
		</motion.div>
	);
};

export default AgentStats;
