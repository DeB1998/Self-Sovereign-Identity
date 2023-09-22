import "colors";

export class Logger {
    public static info(message: string): void {
        Logger.log(message.green);
    }

    public static warn(message: string): void {
        Logger.log(message.yellow);
    }

    public static error(message: string): void {
        Logger.log(message.red);
    }

    public static log(message: string): void {
        const currentDate = new Date();
        console.log(
            `[${Logger.formatNumber(currentDate.getHours(), 2)}:${Logger.formatNumber(
                currentDate.getMinutes(),
                2
            )}:${Logger.formatNumber(currentDate.getSeconds(), 2)}.${Logger.formatNumber(
                currentDate.getMilliseconds(),
                3
            )}]`,
            message
        );
    }

    private static formatNumber(numberToFormat: number, digits: number): string {
        let scale = 10 ** (digits - 1);
        let padding = "";
        let iteration = 0;
        while (numberToFormat < scale && iteration < digits - 1) {
            padding += "0";
            scale /= 10;
            iteration++;
        }

        return `${padding}${numberToFormat}`;
    }
}
