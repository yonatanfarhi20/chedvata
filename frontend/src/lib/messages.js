export const MESSAGE_TYPE = Object.freeze({
  PERSONAL: 'personal',
  CLASS: 'class',
  ALL: 'all',
});

export const MESSAGE_TYPE_LABELS = Object.freeze({
  [MESSAGE_TYPE.PERSONAL]: 'הודעה אישית',
  [MESSAGE_TYPE.CLASS]: 'הודעה לשיעור',
  [MESSAGE_TYPE.ALL]: 'הודעת מערכת (כולם)',
});

export const MESSAGE_TYPE_BADGE_STYLES = Object.freeze({
  [MESSAGE_TYPE.PERSONAL]: 'bg-green-100 text-green-800',
  [MESSAGE_TYPE.CLASS]: 'bg-blue-100 text-blue-800',
  [MESSAGE_TYPE.ALL]: 'bg-red-100 text-red-800',
});

export function getMessageId(message) {
  return message?._id ? String(message._id) : '';
}

export function getMessageType(message) {
  const type = message?.messageType;

  if (type && MESSAGE_TYPE_LABELS[type]) {
    return type;
  }

  if (message?.recipientId) {
    return MESSAGE_TYPE.PERSONAL;
  }

  if (message?.classId) {
    return MESSAGE_TYPE.CLASS;
  }

  return MESSAGE_TYPE.ALL;
}

export function getMessageTypeLabel(message) {
  return MESSAGE_TYPE_LABELS[getMessageType(message)];
}

export function getMessageTypeBadgeClassName(message) {
  return MESSAGE_TYPE_BADGE_STYLES[getMessageType(message)];
}

export function formatMessageDate(dateValue) {
  if (!dateValue) {
    return '';
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleString('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
