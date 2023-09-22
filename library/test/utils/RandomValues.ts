export class RandomValues {
    public static readonly VOID_VALUES = [null, undefined];
    public static readonly NUMBER_VALUES = [1, 50, 3.4, 35, 55.87];
    public static readonly BOOLEAN_VALUES = [true, false];
    public static readonly OBJECT_VALUES: object[] = [
        {},
        {eee: 123},
        {aaa: "bcd"},
        {fgh: 3, abc: "eeee"},
        {abc: [123, "aaaa"]},
        {efg: {abc: [1, 4, 7, 9], efg: false}}
    ];
    public static readonly ARRAY_VALUES: any[] = [
        ["abc", "eee"],
        [1, 3],
        ["abc", 123, null, true],
        [],
        [{a: 56}, {}]
    ];
    public static readonly STRING_VALUES = Array.from(["sddsds", "fffff", "eee"]).concat(
        Array.from<any>(RandomValues.VOID_VALUES)
            .concat(
                RandomValues.NUMBER_VALUES,
                RandomValues.BOOLEAN_VALUES,
                RandomValues.OBJECT_VALUES,
                RandomValues.ARRAY_VALUES
            )
            .map((value) => JSON.stringify(value))
    );
}
