export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 3600 * 24));
  const years = Math.floor(diffInDays / 365);
  const months = Math.floor((diffInDays % 365) / 30);
  
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

export function formatNumber(number: number): string {
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
