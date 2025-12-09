/**
 * Check if message contains repeated characters (spam pattern)
 */
function hasRepeatedCharacters(text: string): boolean {
    return /(.)\1{10,}/.test(text);
}

/**
 * Check for excessive caps
 */
function hasExcessiveCaps(text: string): boolean {
    if (text.length < 10) return false;
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    return capsRatio > 0.7;
}

/**
 * Filter message for spam and abuse patterns
 */
export function filterMessage(message: string): {
    allowed: boolean;
    reason?: string;
} {
    // Check for repeated characters (spam pattern)
    if (hasRepeatedCharacters(message)) {
        return {
            allowed: false,
            reason: "Message appears to be spam (repeated characters)"
        };
    }

    // Check for excessive caps
    if (hasExcessiveCaps(message)) {
        return {
            allowed: false,
            reason: "Please don't use excessive caps"
        };
    }

    return { allowed: true };
}
