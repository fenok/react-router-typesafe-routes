import { assert, IsExact } from "conditional-type-checks";
import { hash } from "./hash";

it("allows to specify hash", () => {
    const processor = hash();

    assert<IsExact<Parameters<typeof processor.build>[0], string>>(true);
    assert<IsExact<ReturnType<typeof processor.parse>, string>>(true);

    expect(processor.build("foo")).toBe("#foo");
    expect(processor.parse(processor.build("foo"))).toBe("foo");
});

it("allows to restrict hash values", () => {
    const processor = hash("foo", "bar");

    assert<IsExact<Parameters<typeof processor.build>[0], "foo" | "bar">>(true);
    assert<IsExact<ReturnType<typeof processor.parse>, "" | "foo" | "bar">>(true);

    expect(processor.build("foo")).toBe("#foo");
    expect(processor.parse(processor.build("foo"))).toBe("foo");
});
