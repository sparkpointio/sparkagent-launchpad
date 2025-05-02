import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { buttonVariants } from '../components/variants/button-variants';
import React, { useEffect, useRef, useState } from "react";
import { formsDialogBackgroundOverlayProperties, formsDialogContentPropertiesWide, formsTextBoxProperties } from "../lib/utils/style/customStyles";
import { IconChevronDown, IconChevronRight, IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import blockies from "ethereum-blockies";
import { updateImageSrc } from "../lib/utils/utils";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import { signMessage } from "thirdweb/utils";
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

interface AgentConfigurationProps {
    certificate: string;
    agentName: string;
    ticker: string;
    description: string;
    creator: string;
    hasGraduated: boolean;
    image: string;
    isOpen: boolean;
    onClose: () => void;
}

export function AgentConfiguration({
    certificate,
    agentName,
    ticker,
    description,
    creator,
    hasGraduated,
    image,
    isOpen,
    onClose,
}: AgentConfigurationProps) {
    const [imgSrc, setImgSrc] = useState(`https://yellow-patient-hare-489.mypinata.cloud/ipfs/${image}`);
    const blockiesIcon = blockies.create({ seed: certificate, size: 16, scale: 8 });
    const prevImageRef = useRef<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isUpdateLoading, setIsUpdateLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("tokenDetails");
    const [bio, setBio] = useState("");
    const [topics, setTopics] = useState("");
    const [lore, setLore] = useState("");
    const [adjective, setAdjective] = useState("");
    const [knowledge, setKnowledge] = useState("");
    const [firstMessage, setFirstMessage] = useState("");

    const [allStyle, setAllStyle] = useState("");
    const [chatStyle, setChatStyle] = useState("");
    const [postStyle, setPostStyle] = useState("");

    const [isAgentDataComplete, setIsAgentDataComplete] = useState(false);

    const [validationError, setValidationError] = useState("");

    const [twitterUsername, setTwitterUsername] = useState("");
    const [twitterEmail, setTwitterEmail] = useState("");
    const [twitterPassword, setTwitterPassword] = useState("");
    const [twitter2FASecret, setTwitter2FASecret] = useState("");
    const [twitterAgentId, setTwitterAgentId] = useState("");
    const [isProcessingTwitterAIAgent, setIsProcessingTwitterAIAgent] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [show2FASecret, setShow2FASecret] = useState(false);

    const [telegramChatId, setTelegramChatId] = useState("");
    const [telegramBotToken, setTelegramBotToken] = useState("");
    const [telegramAgentId, setTelegramAgentId] = useState("");
    const [isProcessingTelegramAIAgent, setIsProcessingTelegramAIAgent] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    

    const account = useActiveAccount();
    const accountAddress = account?.address;
    const isOwner = accountAddress === creator;

    const updateAgentData = async (signature: string) => {
        try {
            const response = await fetch(`/api/agent-data/update-agent-data?contractAddress=${certificate}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    signature,
                    bio,
                    firstMessage,
                    topics,
                    lore,
                    style: {
                        all: allStyle,
                        chat: chatStyle,
                        post: postStyle,
                    },
                    adjective,
                    knowledge,
                }),
            });
    
            const data = await response.json();

            console.log("Response from updating:", data);

            if (response.ok) {
                toast.success(`${ticker} Agent updated successfully`);
                setIsAgentDataComplete(true);
                handleDialogClose();
            } else {
                toast.error(data.error || 'Failed to update agent. Please try again');
                throw new Error(data.error || 'Failed to update agent.');
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to update agent. ${error.message}`);
                throw new Error(error.message || 'Server error');
            } else {
                toast.error('Failed to update agent. Please try again');
                throw new Error('An unknown error occurred');
            }
        } finally {
            setIsUpdateLoading(false);
        }
    };

    useEffect(() => {
        const fetchAgentData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/agent-data/fetch-agent-data?contractAddress=${certificate}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                const result = await response.json();

                console.log("Response from fetching:", result);

                if (response.ok) {
                    const agentData = result.data;
                    setBio(agentData?.bio || "");
                    setFirstMessage(agentData?.first_message || "");
                    setTopics(agentData?.topics || "");
                    setLore(agentData?.lore || "");
                    setAdjective(agentData?.adjective || "");
                    setKnowledge(agentData?.knowledge || "");

                    const style = agentData?.style ? JSON.parse(agentData.style) : {};
                    setAllStyle(style.all || "");
                    setChatStyle(style.chat || "");
                    setPostStyle(style.post || "");

                    const isComplete = agentData?.bio &&
                        agentData?.first_message &&
                        agentData?.topics &&
                        agentData?.lore &&
                        agentData?.adjective &&
                        agentData?.knowledge &&
                        style.all &&
                        style.chat &&
                        style.post;

                    setIsAgentDataComplete(!!isComplete);

                    setTwitterAgentId(agentData?.eliza_agent_id || "");
                    setTelegramAgentId(agentData?.eliza_agent_id || "");
                } else {
                    throw new Error(result.error || 'Failed to fetch agent data');
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error fetching agent data:', error.message);
                } else {
                    console.error('An unknown error occurred while fetching agent data');
                }
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchAgentData();
    }, [certificate]);

    const signRequest = async () => {
        setIsUpdateLoading(true);
        const message = `SparkAgent Launchpad Agent Data Edit Request | Token Address: ${certificate.toLowerCase()}`;
        try {
            if (!account) {
                console.error('Wallet not connected. Cannot sign the message.');
                return;
            }
    
            const signature = await signMessage({
                message: message,
                account,
            });

            console.log("Signature:", signature);

            await updateAgentData(signature);

        } catch (error: unknown) {
            const errorCode = (error as { code?: number })?.code;
            if (errorCode === 4001) {
                toast.error("You rejected the request. Approve the signature request to proceed.");
            } else {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred. Please try again.";
                toast.error(`Error signing message: ${errorMessage}`);
            }
            setIsUpdateLoading(false);
            return;
        }
    };

    const handleSubmit = async () => {
        if (!bio) {
            setValidationError("Bio cannot be empty.");
            return;
        }

        if (!topics) {
            setValidationError("Topics cannot be empty.");
            return;
        }

        if (!firstMessage) {
            setValidationError("First Message cannot be empty.");
            return;
        }

        if (!lore) {
            setValidationError("Lore cannot be empty.");
            return;
        }

        if (!adjective) {
            setValidationError("Adjective cannot be empty.");
            return;
        }

        if (!knowledge) {
            setValidationError("Knowledge cannot be empty.");
            return;
        }

        if (!topics) {
            setValidationError("Topics cannot be empty.");
            return;
        }

        if (!allStyle) {
            setValidationError("All style cannot be empty.");
            return;
        }

        if (!chatStyle) {
            setValidationError("Chat style cannot be empty.");
            return;
        }

        if (!postStyle) {
            setValidationError("Post style cannot be empty.");
            return;
        }

        setValidationError("");
        await signRequest();
    };

    const handleTwitterTurnOff = async () => {
        setIsProcessingTwitterAIAgent("stop");
        const message = `SparkAgent Launchpad Agent Data Edit Request | Token Address: ${certificate.toLowerCase()}`;
        try {
            if (!account) {
                console.error('Wallet not connected. Cannot sign the message.');
                return;
            }

            const signature = await signMessage({
                message: message,
                account,
            });

            try {
                const response = await fetch(`/api/agent-data/turn-off-twitter-agent?contractAddress=${certificate}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        signature
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success(`${ticker} Twitter/X AI Agent turned off successfully`);
                    handleDialogClose();
                } else {
                    toast.error(data.error || 'Failed to turn off Twitter/X AI Agent. Please try again');
                    throw new Error(data.error || 'Failed to update agent.');
                }
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(`Failed to turn off Twitter/X AI Agent. ${error.message}`);
                    throw new Error(error.message || 'Server error');
                } else {
                    toast.error('Failed to turn off Twitter/X AI Agent. Please try again');
                    throw new Error('An unknown error occurred');
                }
            } finally {
                setIsProcessingTwitterAIAgent("");
                setTwitterAgentId('')
            }
        } catch (error: unknown) {
            const errorCode = (error as { code?: number })?.code;
            if (errorCode === 4001) {
                toast.error("You rejected the request. Approve the signature request to proceed.");
            } else {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred. Please try again.";
                toast.error(`Error signing message: ${errorMessage}`);
            }
            setIsUpdateLoading(false);
            return;
        }
    };

    const handleTelegramTurnOff = async () => {
        setIsProcessingTelegramAIAgent("stop");

        const message = `SparkAgent Launchpad Agent Data Edit Request | Token Address: ${certificate.toLowerCase()}`;
        try {
            if (!account) {
                console.error('Wallet not connected. Cannot sign the message.');
                return;
            }

            const signature = await signMessage({
                message: message,
                account,
            });

            try {
                const response = await fetch(`/api/agent-data/turn-off-telegram-agent?contractAddress=${certificate}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        signature
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success(`${ticker} Telegram AI Agent turned off successfully`);
                    handleDialogClose();
                } else {
                    toast.error(data.error || 'Failed to turn off Telegram AI Agent. Please try again');
                    throw new Error(data.error || 'Failed to update agent.');
                }
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(`Failed to turn off Telegram AI Agent. ${error.message}`);
                    throw new Error(error.message || 'Server error');
                } else {
                    toast.error('Failed to turn off Telegram AI Agent. Please try again');
                    throw new Error('An unknown error occurred');
                }
            } finally {
                setIsProcessingTelegramAIAgent("");
                setTelegramAgentId('')
            }
        } catch (error: unknown) {
            const errorCode = (error as { code?: number })?.code;
            if (errorCode === 4001) {
                toast.error("You rejected the request. Approve the signature request to proceed.");
            } else {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred. Please try again.";
                toast.error(`Error signing message: ${errorMessage}`);
            }
            setIsUpdateLoading(false);
            return;
        }
    }

    const handleTelegramSubmit = async () => {
        if (!isAgentDataComplete) {
            setValidationError("AI Agent Details have not been set. Please set them before proceeding.");
            return;
        }

        if (!telegramChatId) {
            setValidationError("Telegram Chat ID cannot be empty.");
            return;
        }

        if (!telegramBotToken) {
            setValidationError("Telegram Bot Token cannot be empty.");
            return;
        }

        setIsProcessingTelegramAIAgent("start");

        setValidationError("");
        setIsUpdateLoading(true);

        let signature = null;

        try {
            if (!account) {
                console.error('Wallet not connected. Cannot sign the message.');
                return;
            }

            const message = `SparkAgent Launchpad Agent Data Edit Request | Token Address: ${certificate.toLowerCase()}`;
            signature = await signMessage({
                message: message,
                account,
            });
        } catch (error: unknown) {
            const errorCode = (error as { code?: number })?.code;
            if (errorCode === 4001) {
                toast.error("You rejected the request. Approve the signature request to proceed.");
            } else {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred. Please try again.";
                toast.error(`Error signing message: ${errorMessage}`);
            }
            setIsUpdateLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/agent-data/turn-on-telegram-agent?contractAddress=${certificate}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    signature,
                    telegramChatId,
                    telegramBotToken
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${ticker} Telegram AI Agent turned on successfully`);
                handleDialogClose();
            } else {
                toast.error(data.error || 'Failed to turn on Telegram AI Agent. Please try again');
                throw new Error(data.error || 'Failed to update agent.');
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to turn on Telegram AI Agent. ${error.message}`);
                throw new Error(error.message || 'Server error');
            } else {
                toast.error('Failed to turn on Telegram AI Agent. Please try again');
                throw new Error('An unknown error occurred');
            }
        } finally {
            setIsProcessingTwitterAIAgent("");
        }

        setTelegramAgentId('true')
    }

    const handleTwitterSubmit = async () => {
        if (!isAgentDataComplete) {
            setValidationError("AI Agent Details have not been set. Please set them before proceeding.");
            return;
        }

        if (!twitterUsername) {
            setValidationError("Username cannot be empty.");
            return;
        }

        if (!twitterEmail) {
            setValidationError("Email cannot be empty.");
            return;
        }

        if (!twitterPassword) {
            setValidationError("Password cannot be empty.");
            return;
        }

        setIsProcessingTwitterAIAgent("start");

        setValidationError("");
        setIsUpdateLoading(true);

        let signature = null;

        try {
            if (!account) {
                console.error('Wallet not connected. Cannot sign the message.');
                return;
            }

            const message = `SparkAgent Launchpad Agent Data Edit Request | Token Address: ${certificate.toLowerCase()}`;
            signature = await signMessage({
                message: message,
                account,
            });
        } catch (error: unknown) {
            const errorCode = (error as { code?: number })?.code;
            if (errorCode === 4001) {
                toast.error("You rejected the request. Approve the signature request to proceed.");
            } else {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred. Please try again.";
                toast.error(`Error signing message: ${errorMessage}`);
            }
            setIsUpdateLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/agent-data/turn-on-twitter-agent?contractAddress=${certificate}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    signature,
                    twitterUsername,
                    twitterEmail,
                    twitterPassword,
                    twitter2FASecret
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${ticker} Twitter/X AI Agent turned on successfully`);
                handleDialogClose();
            } else {
                toast.error(data.error || 'Failed to turn on Twitter/X AI Agent. Please try again');
                throw new Error(data.error || 'Failed to update agent.');
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to turn on Twitter/X AI Agent. ${error.message}`);
                throw new Error(error.message || 'Server error');
            } else {
                toast.error('Failed to turn on Twitter/X AI Agent. Please try again');
                throw new Error('An unknown error occurred');
            }
        } finally {
            setIsProcessingTwitterAIAgent("");
        }

        setTwitterAgentId('true')
    };

    useEffect(() => {
        if (image) return;
        prevImageRef.current = image;
        updateImageSrc(image, blockiesIcon, setImgSrc, setIsLoading);
    }, [blockiesIcon, image, imgSrc]);

    const handleDialogClose = () => {
        onClose();
    };

    const autoResizeAllTextareas = () => {
        setTimeout(function() {
            const textareas = document.querySelectorAll('textarea');
            textareas.forEach((el) => {
                el.style.height = 'auto';
                el.style.height = `${el.scrollHeight + 2}px`;
            });
        },400)
    };

    const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight + 2}px`;
    };

    useEffect(() => {
        autoResizeAllTextareas();
        setValidationError("");
    }, [activeTab]);

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    handleDialogClose();
                } else {
                    autoResizeAllTextareas();
                }
            }}>
            <Dialog.Portal>
                <Dialog.Overlay className={formsDialogBackgroundOverlayProperties} />
                <Dialog.Content className={formsDialogContentPropertiesWide + " transition-all duration-300"}
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

                    <div className="w-full text-center flex flex-col items-center relative">
                        
                        <Dialog.Title className="text-lg font-bold mb-2 text-custom-1">
                            Agent Configuration
                        </Dialog.Title>
                        <Dialog.Description className="text-center w-full p-0 text-custom-1 text-[0.9em] mb-5">
                            {`Configure the details of ${agentName} Agent`}
                        </Dialog.Description>

                        <div className="relative w-32 h-32 rounded-full overflow-hidden flex justify-center items-center mx-auto mb-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isLoading ? 0 : 1 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full flex justify-center items-center relative"
                            >
                                <Image
                                    src={imgSrc}
                                    alt={'Card image'}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </motion.div>
                        </div>

                        <div className="w-full flex justify-center mb-4">
                            <button
                                className={`hover:text-sparkyOrange transition-all px-4 py-2 ${activeTab === "tokenDetails" ? "border-b-2 border-black dark:border-white hover:dark:border-sparkyOrange hover:border-sparkyOrange" : ""}`}
                                onClick={() => setActiveTab("tokenDetails")}
                            >
                                Token Details
                            </button>
                            <button
                                className={`hover:text-sparkyOrange transition-all px-4 py-2 ${activeTab === "aiAgentDetails" ? "border-b-2 border-black dark:border-white hover:dark:border-sparkyOrange hover:border-sparkyOrange" : ""}`}
                                onClick={() => setActiveTab("aiAgentDetails")}
                            >
                                AI Agent Details
                            </button>
                            {
                                (hasGraduated && isOwner) &&
                                    <button
                                        className={`hover:text-sparkyOrange transition-all px-4 py-2 ${activeTab === "twitterDetails" ? "border-b-2 border-black dark:border-white hover:dark:border-sparkyOrange hover:border-sparkyOrange" : ""}`}
                                        onClick={() => setActiveTab("twitterDetails")}
                                    >
                                        Twitter/X Details
                                    </button>
                            }
                            {
                                (hasGraduated && isOwner) &&
                                    <button
                                        className={`hover:text-sparkyOrange transition-all px-4 py-2 ${activeTab === "telegramDetails" ? "border-b-2 border-black dark:border-white hover:dark:border-sparkyOrange hover:border-sparkyOrange" : ""}`}
                                        onClick={() => setActiveTab("telegramDetails")}
                                    >
                                        Telegram Details
                                    </button>
                            }
                        </div>

                        <Form.Root className="w-full flex flex-col items-center">
                            <AnimatePresence mode="wait">
                                {activeTab === "tokenDetails" && (
                                    <>
                                        <motion.section
                                            key="tokenDetails"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-full"
                                        >
                                            <div className="w-full flex flex-row items-center space-x-4">
                                                <Form.Field className="w-full mb-2" name="agentName">
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
                                                        Agent Name:
                                                    </div>
                                                    <Form.Control asChild>
                                                        <input
                                                            placeholder="Enter agent name"
                                                            className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                            type="text"
                                                            name="agentName"
                                                            defaultValue={agentName}
                                                            readOnly
                                                        />
                                                    </Form.Control>
                                                </Form.Field>
                                                <Form.Field className="w-full mb-2" name="ticker">
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
                                                        Ticker:
                                                    </div>
                                                    <Form.Control asChild>
                                                        <input
                                                            placeholder="Enter ticker"
                                                            className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                            type="text"
                                                            name="ticker"
                                                            defaultValue={ticker}
                                                            readOnly
                                                        />
                                                    </Form.Control>
                                                </Form.Field>
                                            </div>
                                            <Form.Field className="w-full mb-2" name="description">
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
                                                    Description:
                                                </div>
                                                <Form.Control asChild>
                                                    <textarea
                                                        placeholder="Enter description"
                                                        className={`w-full mb-0 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                        name="description"
                                                        defaultValue={description}
                                                        readOnly
                                                    />
                                                </Form.Control>
                                            </Form.Field>
                                        </motion.section>
                                    </>
                                )}

                                {activeTab === "aiAgentDetails" && (
                                    <>
                                    <motion.div
                                        key="aiAgentDetails"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full"
                                    >
                                        <Form.Field className="w-full mb-2" name="bio">
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
                                                Bio:
                                            </div>
                                            <Form.Control asChild>
                                                <textarea
                                                    placeholder="Enter bio"
                                                    className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="bio"
                                                    defaultValue={bio}
                                                    readOnly={!isOwner}
                                                    onChange={(e) => { setBio(e.target.value); handleAutoResize(e) } }
                                                />
                                            </Form.Control>
                                        </Form.Field>

                                        <Form.Field className="w-full mb-2" name="first message">
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
                                                First Message:
                                            </div>
                                            <Form.Control asChild>
                                                <textarea
                                                    placeholder="Enter First Message"
                                                    className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="first message"
                                                    defaultValue={firstMessage}
                                                    readOnly={!isOwner}
                                                    onChange={(e) => { setFirstMessage(e.target.value); handleAutoResize(e) } }
                                                />
                                            </Form.Control>
                                        </Form.Field>

                                        <Form.Field className="w-full mb-2" name="lore">
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
                                                Lore:
                                            </div>
                                            <Form.Control asChild>
                                                <textarea
                                                    placeholder="Enter lore"
                                                    className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="lore"
                                                    defaultValue={lore}
                                                    readOnly={!isOwner}
                                                    onChange={(e) => { setLore(e.target.value); handleAutoResize(e) } }
                                                />
                                            </Form.Control>
                                        </Form.Field>

                                        <Form.Field className="w-full mb-2" name="adjective">
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
                                                Adjective:
                                            </div>
                                            <Form.Control asChild>
                                                <textarea
                                                    placeholder="Enter adjective"
                                                    className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="adjective"
                                                    defaultValue={adjective}
                                                    readOnly={!isOwner}
                                                    onChange={(e) => { setAdjective(e.target.value); handleAutoResize(e) }}
                                                />
                                            </Form.Control>
                                        </Form.Field>

                                        <Form.Field className="w-full mb-2" name="knowledge">
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
                                                Knowledge:
                                            </div>
                                            <Form.Control asChild>
                                                <textarea
                                                    placeholder="Enter knowledge"
                                                    className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="knowledge"
                                                    defaultValue={knowledge}
                                                    readOnly={!isOwner}
                                                    onChange={(e) => { setKnowledge(e.target.value); handleAutoResize(e) }}
                                                />
                                            </Form.Control>
                                        </Form.Field>

                                        <Form.Field className="w-full mb-2" name="knowledge">
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
                                                Topics:
                                            </div>
                                            <Form.Control asChild>
                                                <textarea
                                                    placeholder="Enter knowledge"
                                                    className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="knowledge"
                                                    defaultValue={topics}
                                                    readOnly={!isOwner}
                                                    onChange={(e) => { setTopics(e.target.value); handleAutoResize(e) }}
                                                />
                                            </Form.Control>
                                        </Form.Field>

                                        <div className="w-full mb-2 font-bold text-lg">Style</div>

                                        <Form.Field className="w-full mb-2" name="style">
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
                                                All:
                                            </div>
                                            <Form.Control asChild>
                                                <textarea
                                                    placeholder="Enter style (All)"
                                                    className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="style"
                                                    defaultValue={allStyle}
                                                    readOnly={!isOwner}
                                                    onChange={(e) => { setAllStyle(e.target.value); handleAutoResize(e) }}
                                                />
                                            </Form.Control>
                                        </Form.Field>

                                        <Form.Field className="w-full mb-2" name="style">
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
                                                Chat:
                                            </div>
                                            <Form.Control asChild>
                                                <textarea
                                                    placeholder="Enter style (Chat)"
                                                    className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="style"
                                                    defaultValue={chatStyle}
                                                    readOnly={!isOwner}
                                                    onChange={(e) => { setChatStyle(e.target.value); handleAutoResize(e) }}
                                                />
                                            </Form.Control>
                                        </Form.Field>

                                        <Form.Field className="w-full mb-2" name="style">
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
                                                Post:
                                            </div>
                                            <Form.Control asChild>
                                                <textarea
                                                    placeholder="Enter style (Post)"
                                                    className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="style"
                                                    defaultValue={postStyle}
                                                    readOnly={!isOwner}
                                                    onChange={(e) => { setPostStyle(e.target.value); handleAutoResize(e) }}
                                                />
                                            </Form.Control>
                                        </Form.Field>

                                        {validationError && (
                                <p className="text-center text-red-500 text-[0.9em]">{validationError}</p>
                            )}

                            <button
                                type="button"
                                className={buttonVariants({
                                    variant: "outline",
                                    size: "md",
                                    className: `mt-5 bg-white border w-full border-black active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1 ${isLoading || !isOwner || isUpdateLoading ? 'opacity-50 cursor-not-allowed' : ''}`,
                                })}
                                onClick={handleSubmit}
                                disabled={!isOwner || isLoading || isUpdateLoading}
                            >
                                {isLoading || isUpdateLoading ? <IconLoader2 size={16} className="animate-spin" /> : !isOwner ? "Only the creator can modify agent details" : "Update"}
                            </button>
                                </motion.div>
                                </>
                                )}

                                {activeTab === "twitterDetails" && (
                                    <>
                                        <motion.div
                                            key="twitterDetails"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-full"
                                        >
                                            {twitterAgentId === ""
                                                ?
                                                <>
                                                    <Form.Field className="w-full mb-2" name="bio">
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
                                                            Username: {/*{ isProcessingTwitterAIAgent } { isProcessingTwitterAIAgent != "" ? 'true' : 'false' } { isLoading ? 'true' : 'false' } { !isOwner ? 'true' : 'false' }*/}
                                                        </div>
                                                        <Form.Control asChild>
                                                            <input
                                                                placeholder="Enter username"
                                                                className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                                name="twitter_username"
                                                                readOnly={!isOwner}
                                                                onChange={(e) => {
                                                                    setTwitterUsername(e.target.value)
                                                                }}
                                                            />
                                                        </Form.Control>
                                                    </Form.Field>

                                                    <Form.Field className="w-full mb-2" name="bio">
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
                                                            Email:
                                                        </div>
                                                        <Form.Control asChild>
                                                            <input
                                                                placeholder="Enter email"
                                                                className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                                name="twitter_email"
                                                                readOnly={!isOwner}
                                                                onChange={(e) => {
                                                                    setTwitterEmail(e.target.value)
                                                                }}
                                                            />
                                                        </Form.Control>
                                                    </Form.Field>

                                                    <Form.Field className="w-full mb-2" name="password">
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
                                                            Password:
                                                        </div>
                                                        <div className="relative w-full">
                                                            <Form.Control asChild>
                                                                <input
                                                                    placeholder="Enter password"
                                                                    className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                                    name="twitter_password"
                                                                    type={showPassword ? "text" : "password"} // Toggle between text and password
                                                                    readOnly={!isOwner}
                                                                    onChange={(e) => {
                                                                        setTwitterPassword(e.target.value);
                                                                    }}
                                                                />
                                                            </Form.Control>
                                                            <button
                                                                type="button"
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 flex w-5 h-5"
                                                                onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                                                            >
                                                                {showPassword ? (
                                                                    <FontAwesomeIcon icon={faEyeSlash} />
                                                                ) : (
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </Form.Field>

                                                    <Form.Field className="w-full mb-2" name="2fa_secret">
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
                                                            2FA Secret (optional):
                                                        </div>
                                                        <div className="relative w-full">
                                                            <Form.Control asChild>
                                                                <input
                                                                    placeholder="Enter 2FA secret"
                                                                    className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                                    name="twitter_2fa_secret"
                                                                    type={show2FASecret ? "text" : "password"} // Toggle between text and password
                                                                    readOnly={!isOwner}
                                                                    onChange={(e) => {
                                                                        setTwitter2FASecret(e.target.value);
                                                                    }}
                                                                />
                                                            </Form.Control>
                                                            <button
                                                                type="button"
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 flex w-5 h-5"
                                                                onClick={() => setShow2FASecret(!show2FASecret)} // Toggle password visibility
                                                            >
                                                                {show2FASecret ? (
                                                                    <FontAwesomeIcon icon={faEyeSlash} />
                                                                ) : (
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </Form.Field>

                                                    {validationError && (
                                                        <p className="text-center text-red-500 text-[0.9em]">{validationError}</p>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className={buttonVariants({
                                                            variant: "outline",
                                                            size: "md",
                                                            className: `mt-5 bg-white border w-full border-black active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1 ${isLoading || !isOwner || isProcessingTwitterAIAgent != "" ? 'opacity-50 cursor-not-allowed' : ''}`,
                                                        })}
                                                        onClick={handleTwitterSubmit}
                                                        disabled={!isOwner || isLoading || isProcessingTwitterAIAgent != ""}
                                                    >
                                                        {isLoading || isProcessingTwitterAIAgent != "" ? <><IconLoader2 size={16} className="animate-spin"/> <span>&nbsp;Starting Your Twitter/x AI Agent</span></> : !isOwner ? "Only the creator can modify agent's Twitter/X details" : "Turn On Twitter/X AI Agent"}
                                                    </button>
                                                </>
                                                :
                                                <>
                                                    <div className="pt-4">
                                                        <div className="relative pb-[20px]">
                                                            <div className="text-[1.8em] h-[110px]">
                                                                <div className="absolute left-[calc(50%-60px)] top-[20px]">
                                                                    <FontAwesomeIcon icon={faCog} color='#444444'
                                                                                     className="text-[2em] animate-spin"/>
                                                                </div>
                                                                <div className="absolute left-[calc(50%+5px)] top-[50px]">
                                                                    <FontAwesomeIcon icon={faCog} size='xl' color='#444444'
                                                                                     className="animate-spin"
                                                                                     style={{animationDirection: "reverse"}}/>
                                                                </div>
                                                                <div className="absolute left-[calc(50%+5px)] top-[5px]">
                                                                    <FontAwesomeIcon icon={faCog} color='#444444'
                                                                                     className="text-[1em] animate-spin"
                                                                                     style={{animationDirection: "reverse"}}/>
                                                                </div>
                                                            </div>
                                                            <p className="text-center font-bold text-[1.2em] mt-2">Twitter/X
                                                                AI
                                                                Agent<br/> is online and operational.</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className={buttonVariants({
                                                            variant: "outline",
                                                            size: "md",
                                                            className: `mt-5 bg-white border w-full border-black active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1 ${isLoading || !isOwner || isProcessingTwitterAIAgent != "" ? 'opacity-50 cursor-not-allowed' : ''}`,
                                                        })}
                                                        onClick={handleTwitterTurnOff}
                                                        disabled={!isOwner || isLoading || isProcessingTwitterAIAgent != ""}
                                                    >
                                                        {isLoading || isProcessingTwitterAIAgent != "" ? <><IconLoader2 size={16} className="animate-spin"/> <span>&nbsp;Turning Off Your Twitter/x AI Agent</span></> : !isOwner ? "Only the creator can modify agent details" : "Turn Off Twitter/X AI Agent"}
                                                    </button>
                                                </>
                                            }
                                        </motion.div>
                                    </>
                                )}
                                {activeTab === "telegramDetails" && (
                                    <>
                                        <motion.div
                                            key="telegramDetails"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-full"
                                        >
                                            {telegramAgentId === ""
                                                ?
                                                <>
                                                    <Form.Field className="w-full mb-2" name="bot_token">
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
                                                            Bot Token:
                                                        </div>
                                                        <Form.Control asChild>
                                                            <input
                                                                placeholder="Enter Bot Token"
                                                                className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                                name="bot_token"
                                                                readOnly={!isOwner}
                                                                onChange={(e) => {
                                                                    setTelegramBotToken(e.target.value)
                                                                }}
                                                            />
                                                        </Form.Control>

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
                                                            Telegram Chat ID:
                                                        </div>
                                                        <Form.Control asChild>
                                                            <input
                                                                placeholder="Enter Chat ID"
                                                                className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                                name="telegram_chat_id"
                                                                readOnly={!isOwner}
                                                                onChange={(e) => {
                                                                    setTelegramChatId(e.target.value)
                                                                }}
                                                            />
                                                        </Form.Control>
                                                    </Form.Field>

                                                    <div className="flex flex-col mb-2 w-full">
                                                        <div
                                                            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border-2 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
                                                            <div
                                                                className="cursor-pointer font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-400"
                                                                onClick={() => setIsExpanded(!isExpanded)}
                                                            >
                                                                <span
                                                                    className="flex flex-row w-full h-full items-center justify-center">{isExpanded ?
                                                                    <IconChevronDown/> :
                                                                    <IconChevronRight/>} {`How to get Chat ID`}</span>
                                                            </div>
                                                            <AnimatePresence>
                                                                {isExpanded && (
                                                                    <motion.div
                                                                        initial={{opacity: 0, height: 0}}
                                                                        animate={{opacity: 1, height: "auto"}}
                                                                        exit={{opacity: 0, height: 0}}
                                                                        transition={{duration: 0.3}}
                                                                        className="mt-2 text-left text-gray-600 dark:text-gray-400 space-y-2"
                                                                    >
                                                                        <p>{'1. If you don’t have a bot yet, create one using @BotFather on Telegram:'}</p>
                                                                        <ul className="list-disc list-inside pl-4">
                                                                            <li>{`Open Telegram and search for @BotFather`}</li>
                                                                            <li>{`Send the command: `}<code>{`/newbot`}</code></li>
                                                                            <li>{`Follow the prompts and copy the Bot Token`}</li>
                                                                        </ul>
                                                                        <p>{`2. Add your bot to the Telegram group where you want it to post messages:`}</p>
                                                                        <ul className="list-disc list-inside pl-4">
                                                                            <li>{`Open the group`}</li>
                                                                            <li>{`Tap the group name > Add Members`}</li>
                                                                            <li>{`Search your bot by its username and add it`}</li>
                                                                        </ul>
                                                                        <p>{`3. Disable privacy mode so the bot can read messages:`}</p>
                                                                        <ul className="list-disc list-inside pl-4">
                                                                            <li>{`Go back to @BotFather`}</li>
                                                                            <li>{`Send: `}<code>{`/mybots`}</code></li>
                                                                            <li>{`Select your bot > Bot Settings > Group Privacy`}</li>
                                                                            <li>{`Set it to OFF`}</li>
                                                                        </ul>
                                                                        <p>{`4. Send any message in the group (e.g., "Hello")`}</p>
                                                                        <p>{`5. In your browser, go to the following URL (replace `}<code>{`<YOUR_BOT_TOKEN>`}</code>{`):`}</p>
                                                                        <p className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm font-mono break-words text-[0.8em]">
                                                                            {`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`}
                                                                        </p>
                                                                        <p>{`Example:`}</p>
                                                                        <p className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm font-mono break-words text-[0.8em]">
                                                                            {`https://api.telegram.org/bot123456789:ABCdefGhIJKlmNoPQRstuVwXyZ1234567890/getUpdates`}
                                                                        </p>
                                                                        <p>{`6. Look for a line like this in the result:`}</p>
                                                                        <p className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm font-mono break-words text-[0.8em]">
                                                                            {`"id": -1001234567890`}
                                                                        </p>
                                                                        <p>{`That number is your Group Chat ID. Copy it and paste it into the form.`}</p>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>

                                                    {validationError && (
                                                        <p className="text-center text-red-500 text-[0.9em]">{validationError}</p>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className={buttonVariants({
                                                            variant: "outline",
                                                            size: "md",
                                                            className: `mt-5 bg-white border w-full border-black active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1 ${isLoading || !isOwner || isProcessingTwitterAIAgent != "" ? 'opacity-50 cursor-not-allowed' : ''}`,
                                                        })}
                                                        onClick={handleTelegramSubmit}
                                                        disabled={!isOwner || isLoading || isProcessingTelegramAIAgent != ""}
                                                    >
                                                        {isLoading || isProcessingTelegramAIAgent != "" ? <><IconLoader2 size={16} className="animate-spin"/> <span>&nbsp;Starting Your Telegram AI Agent</span></> : !isOwner ? "Only the creator can modify agent's Telegram details" : "Turn On Telegram AI Agent"}
                                                    </button>
                                                </>
                                                :
                                                <>
                                                    <div className="pt-4">
                                                        <div className="relative pb-[20px]">
                                                            <div className="text-[1.8em] h-[110px]">
                                                                <div className="absolute left-[calc(50%-60px)] top-[20px]">
                                                                    <FontAwesomeIcon icon={faCog} color='#444444'
                                                                                     className="text-[2em] animate-spin"/>
                                                                </div>
                                                                <div className="absolute left-[calc(50%+5px)] top-[50px]">
                                                                    <FontAwesomeIcon icon={faCog} size='xl' color='#444444'
                                                                                     className="animate-spin"
                                                                                     style={{animationDirection: "reverse"}}/>
                                                                </div>
                                                                <div className="absolute left-[calc(50%+5px)] top-[5px]">
                                                                    <FontAwesomeIcon icon={faCog} color='#444444'
                                                                                     className="text-[1em] animate-spin"
                                                                                     style={{animationDirection: "reverse"}}/>
                                                                </div>
                                                            </div>
                                                            <p className="text-center font-bold text-[1.2em] mt-2">
                                                                Telegram/X AI Agent<br/> is online and operational.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className={buttonVariants({
                                                            variant: "outline",
                                                            size: "md",
                                                            className: `mt-5 bg-white border w-full border-black active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1 ${isLoading || !isOwner || isProcessingTwitterAIAgent != "" ? 'opacity-50 cursor-not-allowed' : ''}`,
                                                        })}
                                                        onClick={handleTelegramTurnOff}
                                                        disabled={!isOwner || isLoading || isProcessingTelegramAIAgent != ""}
                                                    >
                                                        {isLoading || isProcessingTelegramAIAgent != "" ? <><IconLoader2 size={16} className="animate-spin"/> <span>&nbsp;Turning Off Your Twitter/x AI Agent</span></> : !isOwner ? "Only the creator can modify agent details" : "Turn Off Twitter/X AI Agent"}
                                                    </button>
                                                </>
                                            }
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </Form.Root>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}