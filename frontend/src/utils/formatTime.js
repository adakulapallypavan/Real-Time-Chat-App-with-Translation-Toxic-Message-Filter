import { formatDistanceToNow, format } from 'date-fns';

export const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    return format(date, 'MMM d, yyyy h:mm a');
  }
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  return format(new Date(timestamp), 'h:mm a');
};

