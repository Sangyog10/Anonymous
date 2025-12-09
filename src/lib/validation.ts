import DOMPurify from 'isomorphic-dompurify';

export const CHAT_MESSAGE_MAX_LENGTH = 1000;
export const CHAT_MESSAGE_MIN_LENGTH = 1;

/**
 * Sanitize chat message by removing all HTML tags and dangerous content
 */
export function sanitizeChatMessage(message: string): string {
    // Remove HTML tags and sanitize
    const cleaned = DOMPurify.sanitize(message, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    });

    // Trim whitespace
    return cleaned.trim();
}

/**
 * Validate and sanitize a chat message
 */
export function validateChatMessage(message: string): {
    valid: boolean;
    error?: string;
    sanitized?: string;
} {
    if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Message must be a string' };
    }

    const sanitized = sanitizeChatMessage(message);

    if (sanitized.length < CHAT_MESSAGE_MIN_LENGTH) {
        return { valid: false, error: 'Message cannot be empty' };
    }

    if (sanitized.length > CHAT_MESSAGE_MAX_LENGTH) {
        return {
            valid: false,
            error: `Message too long (max ${CHAT_MESSAGE_MAX_LENGTH} characters)`
        };
    }

    return { valid: true, sanitized };
}
