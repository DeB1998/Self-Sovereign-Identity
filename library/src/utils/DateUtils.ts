/**
 * Class containing utility static methods dealing with dates.
 *
 * @author Alessio De Biasi
 * @version 1.0 2023-07-26
 * @since 1.0
 */
export class DateUtils {
    /**
     * The constructor is private so to avoid creating objects of this class, which offers only
     * static methods.
     */
    private constructor() {}

    /**
     * Converts a JavaScript <code>Date</code> object into a string conforming to the extended ISO
     * format, without the milliseconds. The resulting string, therefore, conforms to the
     * following format:
     * <pre>
     * YYYY-MM-DDTHH:mm:ssZ
     * </pre>
     *
     * @param date The JavaScript <code>Date</code> object to convert.
     * @return The specified <code>date</code> but converted into a string conforming to the
     *     extended ISO format, without the milliseconds.
     */
    public static toIsoDate(date: Date): string {
        // Remove the milliseconds from the ISO date string
        return `${date.toISOString().split(".")[0]}Z`;
    }
}
