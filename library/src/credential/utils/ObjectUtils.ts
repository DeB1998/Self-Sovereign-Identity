export class ObjectUtils {
    public static checkObjectKeys(
        objectToCheck: object,
        requiredKeys: Set<string>
    ): Set<String> {
        // Check for possible duplicated keys
        const keys = Object.keys(objectToCheck);
        const remainingKeys = new Set(requiredKeys);

        for (const key of keys) {
            if (requiredKeys.has(key)) {
                remainingKeys.delete(key);
            }
        }
        return remainingKeys;
    }
}
