export class ObjectUtils {
    public static copyObject<T extends object>(object: T): T {
        if (Array.isArray(object)) {
            return Array.from(object) as T;
        }
        return Object.assign({}, object);
    }

    public static assignRandomValues<T extends object, K extends keyof T>(
        object: T,
        key: K,
        randomValues: T[K][]
    ) {
        const result = [];
        for (const randomValue of randomValues) {
            const newObject = ObjectUtils.copyObject(object);
            newObject[key] = randomValue;
            result.push(newObject);
        }

        return result;
    }

    public static addNewProperties(
        object: {[key: string]: any},
        newKeys: string[]
    ): {[key: string]: any}[] {
        const newKeysCopy = ObjectUtils.copyObject(newKeys);
        let result: {[key: string]: any}[] = [];

        while (newKeysCopy.length > 0) {
            const key = newKeysCopy.pop() || "";
            const objectCopy = ObjectUtils.copyObject(object);
            objectCopy[key] = "Invalid string";
            result.push(objectCopy);
            result = result.concat(ObjectUtils.addNewProperties(objectCopy, newKeysCopy));
        }
        return result;
    }

    public static deleteAddProperties<T extends {[key: string]: any}>(
        object: T,
        newKeys: string[]
    ): {[key: string]: any}[] {
        const keys = Object.keys(object);
        let result: {[key: string]: any}[] = [];

        if (keys.length > 1) {
            for (const key of keys) {
                const objectCopy = ObjectUtils.copyObject(object);
                delete objectCopy[key];
                result.push(objectCopy);
                result = result.concat(ObjectUtils.deleteAddProperties(objectCopy, newKeys));
            }
        }
        result = result.concat(ObjectUtils.addNewProperties(object, newKeys));
        return result;
    }
}
