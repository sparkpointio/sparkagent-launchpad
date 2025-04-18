import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import Link from 'next/link'
import { buttonVariants } from '../components/variants/button-variants';
import { useState, useEffect } from "react";
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { prepareContractCall, getContract, waitForReceipt, readContract, toEther } from "thirdweb";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { useReadContract } from "thirdweb/react";
import { client } from '../client';
import { selectedChain } from "../lib/chain-thirdweb";
import { formsTextBoxProperties, formsDialogContentProperties, formsDialogBackgroundOverlayProperties } from "../lib/utils/style/customStyles";
import axios from "axios";
import { getFormattedEther } from "../lib/utils/formatting";
import { signMessage } from "thirdweb/utils";
import { toast } from "sonner";

const unsparkingAIContract = getContract({
    client,
    chain: selectedChain,
    address: process.env.NEXT_PUBLIC_UNSPARKINGAI_PROXY as string,
});

const srkContract = getContract({
    client,
    chain: selectedChain,
    address: process.env.NEXT_PUBLIC_SRK_TOKEN as string,
});

export function CreateAgentForm({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [validationError, setValidationError] = useState("");
    const { mutate: sendTransaction } = useSendTransaction();
    const [transactionPhase, setTransactionPhase] = useState(1);

    // Token fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [ticker, setTicker] = useState("");
    const [icon, setIcon] = useState("");
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [websiteLink, setWebsiteLink] = useState("");
    const [xLink, setXLink] = useState("");
    const [telegramLink, setTelegramLink] = useState("");
    const [youtubeLink, setYoutubeLink] = useState("");

    // AI Agent fields
    const [bio, setBio] = useState("supports SparkPoint and SparkAgent Launchpad in driving the blockchain revolution");
    const [firstMessage, setFirstMessage] = useState("Hello! How can I assist you today?");
    const [lore, setLore] = useState("An AI trained in financial forecasting with access to market trends.");
    const [adjective, setAdjective] = useState("precise, engaging, adaptive");
    const [knowledge, setKnowledge] = useState("cryptocurrency, legal consulting, cybersecurity, medical diagnostics");
    const [topics, setTopics] = useState("JavaScript frameworks, blockchain development, smart contracts");

    const [allStyle, setAllStyle] = useState("uses clear and concise explanations\nprovides actionable insights for developers");
    const [chatStyle, setChatStyle] = useState("answers questions with detailed explanations\nengages in technical discussions with clarity");
    const [postStyle, setPostStyle] = useState("shares code snippets with explanations\nprovides blockchain and AI insights for the community");

    //Others
    const [SRKBalance, setSRKBalance] = useState("");

    const [launchedContractAddress, setLaunchedContractAddress] = useState("");

    const [signatureResponse, setSignatureResponse] = useState("");

    const account = useActiveAccount();

    if (!account) {
        alert("Please connect your wallet first.");
        return;
    }

    // const fee = BigInt("10000000000000000000");

    /* eslint-disable react-hooks/rules-of-hooks */
    const { data: fee } = useReadContract({
        contract: unsparkingAIContract,
        method: "function fee() returns (uint256)",
    });

    const currentFee = fee ?? BigInt(0);
    const purchaseAmountInitial = (currentFee / BigInt("1000000000000000000")).toString();
    const [purchaseAmount, setPurchaseAmount] = useState("0");

    const [paymentTotal, setPaymentTotal] = useState(0);
    useEffect(() => {
        setPaymentTotal(parseInt(purchaseAmountInitial) + parseInt(purchaseAmount));
    } , [purchaseAmount, purchaseAmountInitial]);

    const { data: currentAllowanceTemp } = useReadContract({
        contract: srkContract,
        method: "function allowance(address owner, address spender) returns (uint256)",
        params: [account.address, unsparkingAIContract.address],
    });
    /* eslint-enable react-hooks/rules-of-hooks */

    const currentAllowance = BigInt(currentAllowanceTemp ?? "0");

    const uploadToIPFS = async () => {
        if (!iconFile) {
            console.error("No file selected");
            return "bafkreibxhlnihc5vy7trt6t4k2cdwpsjzelzv2lv4q2kmvhwcml2kf4pyu";
        }

        const formData = new FormData();
        formData.append("file", iconFile);

        try {
            const response = await axios.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
                        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET!,
                    },
                }
            );

            console.log("CID:", response.data.IpfsHash);
            console.log("URL:", `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);

            return response.data.IpfsHash;
        } catch (error) {
            if (error instanceof Error) {
                console.error("Pinata Upload Error:", error.message);
            } else {
                console.error("Unknown error occurred", error);
            }
        }
    };

    const approveTransaction = async () => {
        const approveTx = prepareContractCall({
            contract: srkContract,
            method: "function approve(address spender, uint256 value)",
            params: [
                unsparkingAIContract.address,
                BigInt(paymentTotal) * BigInt("1000000000000000000")
            ],
            value: BigInt(0),
        });

        console.log("Prepared approval transaction:", approveTx);

        const approveReceipt = sendTransaction(approveTx, {
            onError: (error) => {
                handleDialogClose();
                console.error(error);
            },
            onSuccess: () => {
                console.log("Transaction successfully executed!");
                proceedWithLaunch();
            },
        });

        console.log("Approval transaction receipt:", approveReceipt);
    };

    const signRequest = async (certificate: string) => {
        const message = `SparkAgent Launchpad Agent Data Edit Request | Token Address: ${certificate}`;
        try {
            if (!account) {
                console.error('Wallet not connected. Cannot sign the message.');
                return;
            }
    
            const signature = await signMessage({
                message: message,
                account,
            });

            await setAgentData(certificate, signature);

        } catch (error: unknown) {
            const errorCode = (error as { code?: number })?.code;
            if (errorCode === 4001) {
                toast.error("Signature request rejected. AI Agent details not saved.");
                setSignatureResponse("The signature request was rejected. Although the Agent Token has been deployed, the details of the agent are not saved. You may edit them on your agent's page.");
            } else {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred. Try again on your agent's page.";
                toast.error(`Error signing message: ${errorMessage}.`);
                setSignatureResponse(`There was an error saving your agent's details. Although the Agent Token has been deployed, the details of the agent are not saved. You may edit them on your agent's page.`);
            }
            return;
        }
    };

    const setAgentData = async (certificate: string, signature: string) => {
        if (!bio || !firstMessage || !lore || !adjective || !knowledge || !topics || !allStyle || !chatStyle || !postStyle) {
            console.error("One or more required fields are missing.");
            return;
        }
    
        console.log("Setting agent data with certificate:", certificate);
        console.log("Request body:", {
            signature,
            bio,
            firstMessage,
            lore,
            style: {
                all: allStyle,
                chat: chatStyle,
                post: postStyle,
            },
            adjective,
            knowledge,
            topics,
        });
    
        const maxRetries = 3;
        let attempt = 0;
    
        while (attempt < maxRetries) {
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
                        lore,
                        style: {
                            all: allStyle,
                            chat: chatStyle,
                            post: postStyle,
                        },
                        adjective,
                        knowledge,
                        topics,
                    }),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    console.log("Agent data updated successfully:", data);
                    return;
                } else {
                    console.error("Server responded with an error:", data);
                    throw new Error(data.error || 'Failed to update agent.');
                }
            } catch (error) {
                attempt++;
                console.error(`Attempt ${attempt} failed:`, error);
    
                if (attempt >= maxRetries) {
                    throw error;
                }
    
                console.log(`Retrying in 5 seconds... (${attempt}/${maxRetries})`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    };

    const proceedWithLaunch = async () => {
        const ipfsUrl = await uploadToIPFS();

        if (ipfsUrl) {
            setValidationError("");
        } else {
            setValidationError("Failed to upload image.");
        }

        setTransactionPhase(2);

        console.log({
            contract: unsparkingAIContract,
            method: "function launch(string _name, string _ticker, string desc, string img, string[4] urls, uint256 purchaseAmount)",
            params: [
                name,
                ticker,
                description,
                ipfsUrl,
                [websiteLink ?? "", xLink ?? "", telegramLink ?? "", youtubeLink ?? ""],
                (BigInt(paymentTotal) * BigInt("1000000000000000000")).toString(),
            ],
            value: BigInt(0),
        })

        const launchTx = prepareContractCall({
            contract: unsparkingAIContract,
            method: "function launch(string _name, string _ticker, string desc, string img, string[4] urls, uint256 purchaseAmount)",
            params: [
                name,
                ticker,
                description,
                ipfsUrl,
                [websiteLink ?? "", xLink ?? "", telegramLink ?? "", youtubeLink ?? ""],
                BigInt(paymentTotal) * BigInt("1000000000000000000"),
                //heree parseInt(purchaseAmountInitial) + parseInt(purchaseAmount)

            ],
            value: BigInt(0),
        });

        console.log("Prepared launch transaction:", launchTx);

        const launchReceipt = sendTransaction(launchTx, {
            onError: (error) => {
                handleDialogClose();
                console.error(error);
            },
            onSuccess: async (tx) => {
                console.log("Transaction sent! Hash:", tx.transactionHash);

                const receipt = await waitForReceipt({
                    client,
                    chain: selectedChain,
                    transactionHash: tx.transactionHash,
                });

                console.log(receipt)

                const contractAddress = receipt?.logs[2].address;

                if (contractAddress) {
                    console.log("Deployed Contract Address:", contractAddress);
                    
                    /*
                    await fetch('/api/tokens/' + contractAddress + '/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            personality: personality,
                            first_message: firstMessage,
                            lore: lore,
                            style: style,
                            adjective: adjective,
                            knowledge: knowledge
                        })
                    }).catch(err => console.error(err));
                    */

                    setLaunchedContractAddress(contractAddress);

                    await signRequest(contractAddress);
                    
                    setCurrentPage(4);
                } else {
                    console.log("Contract address not found in receipt.");
                }
            },
        });

        console.log("Launch transaction receipt:", launchReceipt);
    };

    function validatePage1Fields(): boolean {
        if (!name || !description || !ticker || !icon || !purchaseAmount) {
            setValidationError("Please fill in all required fields, including a valid image for the icon.");
            return false;
        }

        /*
        if ((BigInt(purchaseAmount) * BigInt("1000000000000000000")) <= currentFee) {
            setValidationError("Purchase Amount must be greater than the fee.");
            return false;
        }
        */

        if (parseInt(toEther(BigInt(SRKBalance) ?? BigInt(0))) < paymentTotal) {
            setValidationError("Not enough SRK Balance. Please check payment summary.");
            return false;
        }

        if (parseInt(purchaseAmount) <= 0) {
            setValidationError("Initial Buy should be greater than 0.");
            return false;
        }

        if (typeof icon !== "string" || !icon.startsWith("data:image")) {
            setValidationError("Please select a valid image file for the icon.");
            return false;
        }

        setValidationError("");
        return true;
    }

    function validatePage2Fields(): boolean {
        if (!bio || !firstMessage || !lore || !adjective || !knowledge || !topics || !allStyle || !chatStyle || !postStyle) {
            setValidationError("Please fill in all required fields.");
            return false;
        }

        setValidationError("");
        return true;
    }

    async function launchAIAgent(): Promise<boolean> {
        if(!validatePage2Fields()) {
            console.log("sdf");
            return true;
        }

        setCurrentPage(3);

        if (currentAllowance > BigInt(0) && currentAllowance >= BigInt(paymentTotal) * BigInt("1000000000000000000")) {
            console.log("Sufficient allowance already granted.");
            await proceedWithLaunch();
        } else {
            console.log("Insufficient allowance, proceeding with approval.");
            await approveTransaction();
        }

        return true;
    }

    const getSRKBalance = async () => {
        const accountSRKBalance = await readContract({
            contract: srkContract,
            method: "function balanceOf(address account) returns (uint256)",
            params: [account.address],
        });

        setSRKBalance(BigInt(accountSRKBalance ?? "0").toString());
    };

  const handleDialogClose = () => {
      setIsOpen(false)
      setCurrentPage(1)
  };

  getSRKBalance();

  return (
    <Dialog.Root
        open={isOpen}
        onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                setCurrentPage(1);
            }
        }}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
      <Dialog.Overlay className={formsDialogBackgroundOverlayProperties} />
        <Dialog.Content className={formsDialogContentProperties}
            onInteractOutside={(event) => {
                event.preventDefault();
            }}>
            {currentPage !== 3 && (
                <Dialog.Close
                    onClick={handleDialogClose} // Reset email and status message when dialog closes
                    className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: 'absolute z-[99] top-4 right-4 w-8 active:drop-shadow-none py-3 border border-black dark:bg-white transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-white hover:shadow-[0.25rem_0.25rem_#000] dark:hover:bg-red-500 hover:bg-red-500 active:translate-x-0 active:translate-y-0 active:shadow-none button-2',
                    })}
                >
                    <FontAwesomeIcon icon={faTimes} size='sm' />
                </Dialog.Close>
            )}

          <div className={'max-w-md text-center flex flex-col items-center relative ' + (currentPage === 3 ? 'pt-4 pb-6' : '')}>
              {currentPage === 2 && (
                <div className="absolute top-[2px] left-[0px]" style={{cursor:"pointer"}}
                     onClick={() => {
                         setValidationError("");
                        setCurrentPage(1);
                    }}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </div>
              )}
            <Dialog.Title className="text-lg font-bold mb-2 text-custom-1">
                {currentPage === 1
                    ? "Step 1: Token Details"
                    : (currentPage === 2
                        ? "Step 2: AI Agent Details"
                        : (currentPage === 3
                            ? "Deploying your agent token..."
                            : "Congratulations!"
                        )
                    )}
            </Dialog.Title>
              <Dialog.Description className="text-center w-full p-0 text-custom-1 text-[0.9em] mb-5">
                  {currentPage === 1
                      ? "Define your token's essential details and add any optional links to your social platforms."
                      : (currentPage === 2 ?
                          "Craft your AI Agent's bio, behavior, and initial message to define how it interacts with users."
                          : (currentPage === 3
                            ? (transactionPhase == 1
                              ? "Please confirm the approval transaction in your wallet..."
                              : "Please confirm the token launch transaction in your wallet..."
                            )
                            : <>
                                  Your agent token has been successfully deployed.
                                  <br/>
                                  Time to make it shine!

                                  {signatureResponse && (
                                    <>
                                        <br/>
                                        <span className="mt-2 text-center text-sparkyOrange text-[0.9em]">{`Note: ${signatureResponse}`}</span>
                                    </>
                                  )}
                              </>
                          )
                      )
                  }
              </Dialog.Description>

              {currentPage === 3 && (
                  <div className="progress-bar mt-2">
                      <div className="progress-bar-value"></div>
                  </div>
              )}

              <Form.Root className="w-full flex flex-col items-center">
              {currentPage === 1 && (
                      <>
                          <Form.Field className="w-full mb-2" name="name">
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
                                  Name: *
                              </div>
                              <Form.Control asChild>
                                  <input
                                      className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      type="text"
                                      name="name"
                                      value={name}
                                      onChange={(e) => setName(e.target.value)} // Handle email change
                                      required
                                      placeholder='Name'
                                  />
                              </Form.Control>
                          </Form.Field>

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
                                  Description: *
                              </div>
                              <Form.Control asChild>
                                  <textarea
                                      className={`w-full h-[5.7rem] mb-0 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      name="description"
                                      value={description}
                                      onChange={(e) => setDescription(e.target.value)} // Handle email change
                                      required
                                      placeholder='Description'
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
                                  Ticker: *
                              </div>
                              <Form.Control asChild>
                                  <input
                                      className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      type="text"
                                      name="ticker"
                                      value={ticker}
                                      onChange={(e) => setTicker(e.target.value)} // Handle email change
                                      required
                                      placeholder='Ticker'
                                  />
                              </Form.Control>
                          </Form.Field>

                          <Form.Field className="w-full mb-2" name="icon">
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
                                  Icon: *
                              </div>
                              <div className="flex items-center gap-4 mb-2">
                                  <button
                                      type="button"
                                      onClick={() => document.getElementById("iconInput")?.click()}
                                      className={`text-start px-5 py-3 text-[0.9em] transition w-full ${formsTextBoxProperties}`}
                                  >
                                      Select Image
                                  </button>
                                  <input
                                      id="iconInput"
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                          const file = e.target.files?.[0];

                                          if (!file) return;

                                          if (file.size > 1024 * 1024) { // 1MB limit
                                              setValidationError("File size must be 1MB or less.");
                                              return;
                                          }

                                          setIconFile(file);

                                          const reader = new FileReader();
                                          reader.onload = () => {
                                              setIcon(reader.result as string);
                                              setValidationError(""); // Clear any previous errors
                                          };
                                          reader.readAsDataURL(file);
                                      }}
                                      style={{ display: "none" }}
                                  />
                                  {icon && (
                                      <Image
                                          src={icon}
                                          alt="Selected Icon"
                                          className="min-w-[47px] max-h-[47px] w-[47px] h-[47px] rounded-full border border-black object-cover"
                                          width={47} // Set the width of the image
                                          height={47} // Set the height of the image
                                      />
                                  )}
                              </div>
                          </Form.Field>

                          <Form.Field className="w-full mb-2" name="purchase_amount">
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
                                  <div className="flex items-center justify-between w-full">
                                      <div>{`Buy ${ticker === "" ? "" : `$${ticker}`} Token in $SRK`}</div>
                                      <div>{`SRK Balance: ${getFormattedEther(toEther(BigInt(SRKBalance)), 2)}`}</div>
                                  </div>
                              </div>
                              <Form.Control asChild>
                                  <input
                                      className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      type="number"
                                      name="purchase_amount"
                                      value={purchaseAmount}
                                      onChange={(e) => setPurchaseAmount(e.target.value)}
                                      placeholder='Purchase Amount'
                                  />
                              </Form.Control>
                              {/*<p className="text-xs text-gray-500"><b className="text-sparkyRed-500">NOTE:</b> The amount will be deducted by <b>{(currentFee / BigInt("1000000000000000000")).toString()} SRK</b> (creation fee).</p>*/}
                          </Form.Field>

                          <div className="flex flex-col mb-2 w-full">
                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border-2 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
                                <p className="text-bold text-xs text-gray-700 dark:text-gray-200">{`Payment Summary`}</p>
                                <div className="flex items-center justify-between w-full mb-1">
                                    <div>{`Creation Fee`}</div>
                                    <div>{purchaseAmountInitial}</div>
                                </div>
                                <div className="flex items-center justify-between w-full mb-1">
                                    <div>{`Initial Buy`}</div>
                                    <div>{purchaseAmount}</div>
                                </div>
                                <div className="flex items-center justify-between w-full mb-1">
                                    <div className="text-bold text-sm"><b>{`Total`}</b></div>
                                    <div className="text-bold text-sm"><b>{isNaN(parseInt(purchaseAmountInitial)) || isNaN(parseInt(purchaseAmount)) ? "" : paymentTotal} SRK</b></div>
                                </div>
                            </div>
                          </div>

                          <Form.Field className="w-full mb-2" name="website_link">
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
                                  Website Link (Optional):
                              </div>
                              <Form.Control asChild>
                                  <input
                                      className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      type="text"
                                      name="website_link"
                                      value={websiteLink}
                                      onChange={(e) => setWebsiteLink(e.target.value)}
                                      placeholder='Website Link'
                                  />
                              </Form.Control>
                          </Form.Field>

                          <Form.Field className="w-full mb-2" name="x_link">
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
                                  X Link (Optional):
                              </div>
                              <Form.Control asChild>
                                  <input
                                      className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      type="text"
                                      name="x_link"
                                      value={xLink}
                                      onChange={(e) => setXLink(e.target.value)} // Handle email change
                                      required
                                      placeholder='X Link'
                                  />
                              </Form.Control>
                          </Form.Field>

                          <Form.Field className="w-full mb-2" name="telegram_link">
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
                                  Telegram Link (Optional):
                              </div>
                              <Form.Control asChild>
                                  <input
                                      className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      type="text"
                                      name="telegram_link"
                                      value={telegramLink}
                                      onChange={(e) => setTelegramLink(e.target.value)} // Handle email change
                                      required
                                      placeholder='Telegram Link'
                                  />
                              </Form.Control>
                          </Form.Field>

                          <Form.Field className="w-full mb-2" name="youtube_link">
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
                                  Youtube Link (Optional):
                              </div>
                              <Form.Control asChild>
                                  <input
                                      className={`w-full h-12 mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      type="text"
                                      name="youtube_link"
                                      value={youtubeLink}
                                      onChange={(e) => setYoutubeLink(e.target.value)} // Handle email change
                                      required
                                      placeholder='Youtube Link'
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
                              onClick={() => {
                                  if (validatePage1Fields()) setCurrentPage(2);
                              }}
                          >
                              Next
                          </button>
                      </>
                  )}

                  {currentPage === 2 && (
                      <>
                          <Form.Field className="w-full mb-2" name="bio">
                            <p className="text-xs text-gray-500 mb-2"><b className="text-sparkyRed-500">NOTE:</b> Separate each words by a comma.</p>
                              <div
                                  style={{
                                      display: "flex",
                                      alignItems: "baseline",
                                      justifyContent: "space-between",
                                      width: "100%",
                                      fontSize: "0.8em",
                                      marginBottom: "2px",
                                  }}
                              >
                                  Bio:
                              </div>
                              <Form.Control asChild>
                                  <textarea
                                      className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      name="bio"
                                      value={bio}
                                      onChange={(e) => setBio(e.target.value)}
                                      required
                                      placeholder='Define the agent’s bio'
                                  ></textarea>
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
                                      marginBottom: "2px",
                                  }}
                              >
                                  First Message:
                              </div>
                              <Form.Control asChild>
                                  <textarea
                                      className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      name="first_message"
                                      value={firstMessage}
                                      onChange={(e) => setFirstMessage(e.target.value)} // Handle email change
                                      required
                                      placeholder='Specify the agent’s initial greeting or response'
                                  ></textarea>
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
                                      marginBottom: "2px",
                                  }}
                              >
                                  Lore:
                              </div>
                              <Form.Control asChild>
                                  <textarea
                                      className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      name="lore"
                                      value={lore}
                                      onChange={(e) => setLore(e.target.value)} // Handle email change
                                      required
                                      placeholder='Provide background or context for the agent'
                                  ></textarea>
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
                                      marginBottom: "2px",
                                  }}
                              >
                                  Adjective:
                              </div>
                              <Form.Control asChild>
                                  <textarea
                                      className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      name="adjective"
                                      value={adjective}
                                      onChange={(e) => setAdjective(e.target.value)} // Handle email change
                                      required
                                      placeholder='List adjectives that define the agent'
                                  ></textarea>
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
                                      marginBottom: "2px",
                                  }}
                              >
                                  Knowledge:
                              </div>
                              <Form.Control asChild>
                                  <textarea
                                      className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      name="knowledge"
                                      value={knowledge}
                                      onChange={(e) => setKnowledge(e.target.value)} // Handle email change
                                      required
                                      placeholder='Define the agent’s expertise, separated by commas'
                                  ></textarea>
                              </Form.Control>
                          </Form.Field>

                          <Form.Field className="w-full mb-2" name="topics">
                              <div
                                  style={{
                                      display: "flex",
                                      alignItems: "baseline",
                                      justifyContent: "space-between",
                                      width: "100%",
                                      fontSize: "0.8em",
                                      marginBottom: "2px",
                                  }}
                              >
                                  Topics:
                              </div>
                              <Form.Control asChild>
                                  <textarea
                                      className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                      name="knowledge"
                                      value={topics}
                                      onChange={(e) => setTopics(e.target.value)}
                                      required
                                      placeholder='Define the agent’s topics'
                                  ></textarea>
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
                                        marginBottom: "2px",
                                    }}
                                >
                                    All:
                                </div>
                                <Form.Control asChild>
                                    <textarea
                                        placeholder="Enter style"
                                        className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                        name="style"
                                        defaultValue={allStyle}
                                        onChange={(e) => setAllStyle(e.target.value)}
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
                                        marginBottom: "2px",
                                    }}
                                >
                                    Chat:
                                </div>
                                <Form.Control asChild>
                                    <textarea
                                        placeholder="Enter style"
                                        className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                        name="style"
                                        defaultValue={chatStyle}
                                        onChange={(e) => setChatStyle(e.target.value)}
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
                                        marginBottom: "2px",
                                    }}
                                >
                                    Post:
                                </div>
                                <Form.Control asChild>
                                    <textarea
                                        placeholder="Enter style"
                                        className={`w-full h-[90px] mb-1 px-5 py-3 text-[0.9em] ${formsTextBoxProperties}`}
                                        name="style"
                                        defaultValue={postStyle}
                                        onChange={(e) => setPostStyle(e.target.value)}
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
                              onClick={launchAIAgent}
                          >
                              Launch Now
                          </button>
                      </>
                  )}

                  {currentPage === 4 && (
                      <Link
                          href={"/agent?certificate=" + launchedContractAddress}
                          className={buttonVariants({
                              variant: "outline",
                              size: "md",
                              className: "mt-1 bg-white border w-[70%] border-black active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1",
                          })}
                      >
                          View Agent Page
                      </Link>
                  )}
              </Form.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}