import * as Dialog from "@radix-ui/react-dialog";
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { buttonVariants } from "@/app/components/variants/button-variants";

interface WalletConfirmationStatusProps {
  walletConfirmationStatus: number;
  setWalletConfirmationStatus: React.Dispatch<React.SetStateAction<number>>;
  swapType: string;
  ticker: string;
}

const WalletConfirmationStatus: React.FC<WalletConfirmationStatusProps> = ({ walletConfirmationStatus, swapType, ticker, setWalletConfirmationStatus }) => {
  return (
    <Dialog.Root
      open={walletConfirmationStatus > 0}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-[100]" />
        <Dialog.Content className={'fixed bg-white left-[50%] top-[50%] z-[101] grid w-[90%] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg sm:rounded-lg sm:px-6 sm:py-10 p-4 max-h-[calc(100vh-40px)] overflow-auto'}
          onInteractOutside={(event) => {
            event.preventDefault();
          }}>

          <div className={'max-w-md text-center flex flex-col items-center relative pt-4 pb-4'}>
            <Dialog.Title className="text-lg font-bold mb-4 text-custom-1">
              {walletConfirmationStatus < 5
                ? swapType === "buy"
                  ? "Buying Your Tokens"
                  : "Selling Your Tokens"
                : "Congratulations!"
              }

            </Dialog.Title>
            <Dialog.Description className={'text-center w-full p-0 text-custom-1 text-[0.9em]' + (walletConfirmationStatus < 5 ? 'mb-5' : '')}>
              {walletConfirmationStatus < 5
                ? swapType === "buy"
                  ? <>
                    <FontAwesomeIcon icon={walletConfirmationStatus > 1 ? faCircleCheck : faCircle}
                      className={walletConfirmationStatus > 1 ? 'text-[#00d7b2]' : ''} /> Approve
                    SRK to be spent by UnSparking AI Contract.<br />
                    <FontAwesomeIcon icon={walletConfirmationStatus > 2 ? faCircleCheck : faCircle}
                      className={walletConfirmationStatus > 2 ? 'text-[#00d7b2]' : ''} /> Approve
                    SRK to be spent by Factory Contract.<br />
                    <FontAwesomeIcon icon={walletConfirmationStatus > 3 ? faCircleCheck : faCircle}
                      className={walletConfirmationStatus > 3 ? 'text-[#00d7b2]' : ''} /> Approve
                    SRK to be spent by Pair AI Contract.<br />
                    <FontAwesomeIcon icon={walletConfirmationStatus > 4 ? faCircleCheck : faCircle}
                      className={walletConfirmationStatus > 4 ? 'text-[#00d7b2]' : ''} /> Confirm
                    your purchase of {ticker}.

                    <span className="block progress-bar mt-8">
                      <span className="block progress-bar-value"></span>
                    </span>
                  </>
                  : <>
                    <FontAwesomeIcon icon={walletConfirmationStatus > 1 ? faCircleCheck : faCircle}
                      className={walletConfirmationStatus > 1 ? 'text-[#00d7b2]' : ''} /> Approve {ticker} to
                    be spent by UnSparking AI Contract.<br />
                    <FontAwesomeIcon icon={walletConfirmationStatus > 2 ? faCircleCheck : faCircle}
                      className={walletConfirmationStatus > 2 ? 'text-[#00d7b2]' : ''} /> Approve {ticker} to
                    be spent by Factory Contract.<br />
                    <FontAwesomeIcon icon={walletConfirmationStatus > 3 ? faCircleCheck : faCircle}
                      className={walletConfirmationStatus > 3 ? 'text-[#00d7b2]' : ''} /> Approve {ticker} to
                    be spent by Pair AI Contract.<br />
                    <FontAwesomeIcon icon={walletConfirmationStatus > 4 ? faCircleCheck : faCircle}
                      className={walletConfirmationStatus > 4 ? 'text-[#00d7b2]' : ''} /> Confirm
                    your sale of {ticker}.

                    <span className="block progress-bar mt-8">
                      <span className="block progress-bar-value"></span>
                    </span>
                  </>
                : swapType === "buy"
                  ? "You have successfully purchased your " + ticker + ". Your new balance should reflect shortly."
                  : "You have successfully sold your " + ticker + ". Your proceeds will be available soon."
              }

              {walletConfirmationStatus === 5 && (
                <>
                  <br />
                  <button
                    className={buttonVariants({
                      variant: "outline",
                      size: "md",
                      className: "mt-6 mb-2 bg-white border w-[70%] border-black active:drop-shadow-none px-8 py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-[#000] hover:bg-[#D6F2FE] active:translate-x-0 active:translate-y-0 active:shadow-none shrink-0 button-1",
                    })}
                    onClick={() => setWalletConfirmationStatus(0)}
                  >
                    Done
                  </button>
                </>
              )}
            </Dialog.Description>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default WalletConfirmationStatus;