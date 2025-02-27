import { toEther } from "thirdweb";

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 3600 * 24));

  console.log("diffInDays");
  console.log(now.getTime());
  console.log(date.getTime());
  console.log(date);

  const years = Math.floor(diffInDays / 365);
  const months = Math.floor((diffInDays % 365) / 30);
  
  if (diffInDays === 0) {
    return "Today";
  }
  if (years > 0 && months > 0) {
    return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''} ago`;
  }
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

export function formatTimestamp(formatTimestamp: Date): string {
  const hours = formatTimestamp.getHours();
  const minutes = formatTimestamp.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formatTimestamp.getDate()}/${formatTimestamp.getMonth() + 1}/${formatTimestamp.getFullYear()}, ${formattedHours}:${formattedMinutes} ${ampm}`;
}

export function formatNumber(number: number): string {
  if (number >= 1_000_000_000_000_000_000) {
    return (number / 1_000_000_000_000_000_000).toFixed(1) + ' Qi';
  }
  if (number >= 1_000_000_000_000_000) {
    return (number / 1_000_000_000_000_000).toFixed(1) + ' Q';
  }
  if (number >= 1_000_000_000_000) {
    return (number / 1_000_000_000_000).toFixed(1) + ' T';
  }
  if (number >= 1_000_000_000) {
    return (number / 1_000_000_000).toFixed(1) + ' B';
  }
  if (number >= 1_000_000) {
    return (number / 1_000_000).toFixed(1) + ' M';
  }
  if (number >= 1_000) {
    return (number / 1_000).toFixed(1) + ' K';
  }
  return number.toString();
}

export function truncateHash(hash: string, maxLength: number = 10, left?: number, right?: number): string {
  const defaultLeft = Math.floor(maxLength / 2) + 1;
  const defaultRight = Math.floor(maxLength / 2) + 1;

  const leftLength = left ?? defaultLeft;
  const rightLength = right ?? defaultRight;

  if (hash.length > leftLength + rightLength) {
    const front = hash.slice(0, leftLength);
    const back = hash.slice(-rightLength);
    return `${front} . . . ${back}`;
  }

  return hash;
}

import { Decimal } from "decimal.js";

export function getSparkingProgress(reserveB: bigint, gradThreshold: bigint, initialLiquidity: bigint): number {
  const sparkingProgress = ((Number(toEther(reserveB)) - Number(toEther(initialLiquidity))) / (Number(toEther(gradThreshold)))) * 100;

  return Decimal.min(sparkingProgress, 100).toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber();
}

export function getFormattedEther(balance: string, maxDecimal: number) {
  const factor = 10 ** maxDecimal;
  const flooredBalance = Math.floor(Number(balance) * factor) / factor; // Floor instead of rounding

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimal,
  }).format(flooredBalance);
}