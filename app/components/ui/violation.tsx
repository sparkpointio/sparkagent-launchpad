import Image from "next/image"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { new_sparkpoint_logo } from "@/app/lib/assets"

export default function Violation() {
  return (
    <div className="bg-white w-full dark:bg-[#1a1d21] dark:text-white border-2 border-black rounded-2xl shadow-md flex flex-col items-center justify-center p-16">
      <div className="w-full space-y-8 text-center">
        <div className="mx-auto w-16 h-16 relative mb-8">
          <Image
            src={new_sparkpoint_logo}
            alt="SparkAgent Logo"
            width={64}
            height={64}
            priority
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-black dark:text-white">Agent Violation Notice</h1>
          <p className="text-gray-600 dark:text-gray-400">
            This agent has been restricted due to a violation of our <Link href={'http://localhost:3000/aup'} className="underline" target="_blank" rel="noreferrer">Acceptable Use Policy</Link>.
          </p>
        </div>

        <div className="pt-6">
          <Link href="/" className="inline-block">
            <Button
              variant="outline"
              className="sm:w-48 active:drop-shadow-none py-3 transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] text-white bg-black hover:bg-black hover:shadow-[0.25rem_0.25rem_#E5E7EB] active:translate-x-0 active:translate-y-0 active:shadow-none button-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-8">If you believe this is an error, please contact our support team.</p>
      </div>
    </div>
  )
}

