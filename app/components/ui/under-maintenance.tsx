"use client"

import Image from "next/image"
import { HammerIcon, PlusIcon, WrenchIcon, CogIcon} from "lucide-react"
import { new_sparkpoint_logo } from "@/app/lib/assets"
import { buttonVariants } from "../variants/button-variants"

interface UnderMaintenanceProps {
  onClick?: () => void
  isModal?: boolean
}

export default function UnderMaintenance({ onClick, isModal = false }: UnderMaintenanceProps) {
  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1a1d21] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto relative">

          {onClick && (
            <button
              onClick={onClick}
              className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: 'absolute z-[99] top-4 right-4 w-8 active:drop-shadow-none py-3 border border-black dark:bg-white transition-all duration-200 cursor-pointer hover:-translate-y-[0.25rem] hover:translate-x-[-0.25rem] hover:text-white hover:shadow-[0.25rem_0.25rem_#000] dark:hover:bg-red-500 hover:bg-red-500 active:translate-x-0 active:translate-y-0 active:shadow-none button-2',
                  })}
              >
                  <span>&times;</span>
            </button>
          )}
          
          <div className="bg-gradient-to-br from-orange-50 to-blue-50 dark:from-[#1a1d21] relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-200/10 dark:bg-orange-500/5 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-200/10 dark:bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
            </div>

            <div className="absolute inset-0 pointer-events-none">
              <CogIcon className="absolute top-8 left-8 w-6 h-6 text-orange-300/40 dark:text-orange-400/30 animate-spin" style={{ animationDuration: '8s' }} />
              <WrenchIcon className="absolute top-12 right-16 w-4 h-4 text-blue-300/40 dark:text-blue-400/30 animate-pulse delay-700" />
              <CogIcon className="absolute bottom-8 right-8 w-7 h-7 text-yellow-300/40 dark:text-yellow-400/30 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
              <WrenchIcon className="absolute bottom-12 left-16 w-5 h-5 text-blue-300/40 dark:text-blue-400/30 animate-bounce delay-300" />
            </div>

            <div className="relative z-5 p-8 text-center">
              <div className="space-y-8">
                {/* Logo and hammer */}
                <div className="flex flex-row items-center justify-center gap-3 mx-auto">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-400/20 dark:bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
                    <Image
                      src={new_sparkpoint_logo}
                      alt="SparkAgent Logo"
                      width={60}
                      height={60}
                      priority
                      className="relative z-10 hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <PlusIcon className="w-6 h-6" />
                  <div className="relative">
                    <HammerIcon 
                      width={60} 
                      height={60} 
                      className="text-[#ff7c33] animate-bounce transition-all duration-300" 
                      style={{ animationDuration: '2s' }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold">
                    Feature Under Maintenance
                  </h1>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This feature is disabled and is undergoing maintenance to bring you better performance and new features.
                    Our team is working hard to ensure everything runs smoothly. Thank you for your patience!
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                      #SparkAgent
                    </span>
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                      #AI
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      #Arbitrum
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Original full-screen version
  return (
    <div className="bg-gradient-to-br from-orange-50 to-blue-50 dark:from-[#1a1d21] w-full min-h-screen relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/10 dark:bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <CogIcon className="absolute top-20 left-20 w-8 h-8 text-orange-300/40 dark:text-orange-400/30 animate-spin" style={{ animationDuration: '8s' }} />
        <WrenchIcon className="absolute top-32 right-32 w-6 h-6 text-blue-300/40 dark:text-blue-400/30 animate-pulse delay-700" />
        <CogIcon className="absolute bottom-20 right-20 w-10 h-10 text-yellow-300/40 dark:text-yellow-400/30 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
        <WrenchIcon className="absolute bottom-32 left-32 w-7 h-7 text-blue-300/40 dark:text-blue-400/30 animate-bounce delay-300" />
      </div>

      <div className="relative z-5 flex flex-col items-center justify-center p-8 sm:p-16 min-h-screen">
        <div className={`w-full space-y-12 text-center transition-all duration-1000 ${true ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          <div className="flex flex-row items-center justify-center gap-4 mx-auto mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-400/20 dark:bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
              <Image
                src={new_sparkpoint_logo}
                alt="SparkAgent Logo"
                width={80}
                height={80}
                priority
                className="relative z-10 hover:scale-110 transition-transform duration-300"
              />
            </div>
            <PlusIcon className="w-8 h-8" />
            <div className="relative">
              <HammerIcon 
                width={80} 
                height={80} 
                className="text-[#ff7c33] animate-bounce transition-all duration-300" 
                style={{ animationDuration: '2s' }}
              />
            </div>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">
                Under Maintenance
              </h1>
            </div>

            <div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                The SparkAgent Launchpad is currently undergoing exciting improvements. 
                Our team is working around the clock to bring you amazing new features and better performance.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span>Systems: Updating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>Database: Optimizing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Agents: Enhancing 🤖</span>
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                  #SparkAgent
                </span>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                  #AI
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                  #Arbitrum
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}