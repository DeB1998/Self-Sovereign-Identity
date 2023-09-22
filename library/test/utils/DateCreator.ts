export enum TimeUnit {
    SECOND,
    DAY
}

export class DateCreator {
    public static generate(amount: number, unit: TimeUnit): Date {
        const now = Date.now();
        let milliseconds = amount * 1000;
        if (unit === TimeUnit.DAY) {
            milliseconds *= 3600 * 24;
        }

        return new Date(now + milliseconds);
    }
}
