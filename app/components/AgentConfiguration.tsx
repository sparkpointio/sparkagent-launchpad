import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { buttonVariants } from '../components/variants/button-variants';
import { useEffect, useRef, useState } from "react";
import { formsDialogBackgroundOverlayProperties, formsDialogContentPropertiesWide, formsTextBoxProperties } from "../lib/utils/style/customStyles";
import { IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import blockies from "ethereum-blockies";
import { updateImageSrc } from "../lib/utils/utils";
import { AccountAddress, useActiveAccount } from "thirdweb/react";

interface AgentConfigurationProps {
    certificate: string;
    agentName: string;
    ticker: string;
    description: string;
    creator: string;
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
    image,
    isOpen,
    onClose,
}: AgentConfigurationProps) {
    const [imgSrc, setImgSrc] = useState(`https://yellow-patient-hare-489.mypinata.cloud/ipfs/${image}`);
    const blockiesIcon = blockies.create({ seed: certificate, size: 16, scale: 8 });
    const prevImageRef = useRef<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("tokenDetails");
    const [personality, setPersonality] = useState("");
    const [firstMessage, setFirstMessage] = useState("");
    const [lore, setLore] = useState("");
    const [style, setStyle] = useState("");
    const [adjective, setAdjective] = useState("");
    const [knowledge, setKnowledge] = useState("");

    const account = useActiveAccount();
    const accountAddress = account?.address;
    const isOwner = accountAddress === creator;


    useEffect(() => {
        if (image) return;
        prevImageRef.current = image;
        updateImageSrc(image, blockiesIcon, setImgSrc, setIsLoading);
    }, [blockiesIcon, image, imgSrc]);

    const handleDialogClose = () => {
        onClose();
    };

    const handleSubmit = () => {
        setIsLoading(true);

        console.log("Updated");
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

                        <div className="w-full flex justify-center mb-4 space-x-4">
                            <button
                                className={`px-4 py-2 ${activeTab === "tokenDetails" ? "border-b-2 border-black dark:border-white" : ""}`}
                                onClick={() => setActiveTab("tokenDetails")}
                            >
                                Token Details
                            </button>
                            <button
                                className={`px-4 py-2 ${activeTab === "aiAgentDetails" ? "border-b-2 border-black dark:border-white" : ""}`}
                                onClick={() => setActiveTab("aiAgentDetails")}
                            >
                                AI Agent Details
                            </button>
                        </div>

                        <Form.Root className="w-full flex flex-col items-center">
                            <AnimatePresence mode="wait">
                                {activeTab === "tokenDetails" && (
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
                                                        value={agentName}
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
                                                        value={ticker}
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
                                                    className={`w-full h-[10.14rem] mb-0 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="description"
                                                    value={description}
                                                    readOnly
                                                />
                                            </Form.Control>
                                        </Form.Field>
                                    </motion.section>
                                )}

                                {activeTab === "aiAgentDetails" && (
                                    <motion.div
                                        key="agentDetails"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full"
                                    >
                                        <Form.Field className="w-full mb-2" name="personality">
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
                                                Personality:
                                            </div>
                                            <Form.Control asChild>
                                                <textarea
                                                    placeholder="Enter personality"
                                                    className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="personality"
                                                    value={personality}
                                                    readOnly
                                                />
                                            </Form.Control>
                                        </Form.Field>

                                        <Form.Field className="w-full mb-2" name="first_message">
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
                                                    placeholder="Enter first message"
                                                    className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="first_message"
                                                    value={firstMessage}
                                                    readOnly
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
                                                    className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="lore"
                                                    value={lore}
                                                    readOnly
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
                                                Style:
                                            </div>
                                            <Form.Control asChild>
                                                <textarea
                                                    placeholder="Enter style"
                                                    className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="style"
                                                    value={style}
                                                    readOnly
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
                                                    className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="adjective"
                                                    value={adjective}
                                                    readOnly
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
                                                    className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                                    name="knowledge"
                                                    value={knowledge}
                                                    readOnly
                                                />
                                            </Form.Control>
                                        </Form.Field>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="button"
                                className={buttonVariants({
                                    variant: "outline",
                                    size: "md",
                                    className: `mt-5 bg-white border w-full border-black active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1 ${isLoading || !isOwner ? 'opacity-50 cursor-not-allowed' : ''}`,
                                })}
                                onClick={handleSubmit}
                                disabled={!isOwner || isLoading}
                            >
                                {!isLoading ? "Update" : <IconLoader2 size={16} className="animate-spin" />}
                            </button>
                        </Form.Root>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}