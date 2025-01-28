"use client";

"use client";
import React from "react";
import { AGENTS } from "../lib/utils/agents-sample-data";
import AgentStats from "../components/AgentStats";
import SwapCard from "../components/SwapCard";
import SparkingProgressCard from "../components/SparkingProgressCard";

export default function Agent() {
	return (
		<div className="items-center justify-center min-h-screen m-6 lg:mx-2 xl:mx-10 2xl:mx-24 mt-16 md:mt-28">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
				
				{/* First Column */}
				<div className="lg:col-span-2 w-full">
          <AgentStats
            title={AGENTS[1].title}
            image={AGENTS[1].image}
            imageAlt={AGENTS[1].title}
            certificate={AGENTS[1].certificate}
            description={AGENTS[1].description}
            createdBy={AGENTS[1].createdBy}
            marketCap={AGENTS[1].marketCap}
            datePublished={AGENTS[1].datePublished}
            sparkingProgress={AGENTS[1].sparkingProgress}
          />
				</div>

        {/* Second Column */}
				<div className="flex flex-col gap-4">
					<SwapCard />
          <SparkingProgressCard sparkingProgress={AGENTS[1].sparkingProgress} />
				</div>
			</div>
		</div>
	);
}
