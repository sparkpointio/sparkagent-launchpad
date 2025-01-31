import Image from "next/image";
import { new_sparkpoint_logo } from "../lib/assets";

interface SparkAgentLogoProps {
  size?: number;
}

const SparkAgentLogo: React.FC<SparkAgentLogoProps> = ({ size = 56 }) => {
  return (
    <div className="flex items-center gap-1">
      <Image
        src={new_sparkpoint_logo}
        alt="SparkPoint Logo"
        className="w-fit"
        style={{ height: `${size}px` }}
        unselectable="on"
      />
      <h1
        className="font-righteous"
        style={{ fontSize: `${size * 0.70}px` }}
      >
        SparkAgent
      </h1>
    </div>
  );
};

export default SparkAgentLogo;