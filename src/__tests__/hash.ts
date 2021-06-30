import { route } from "../route";
import { path } from "../path";
import { hash } from "../hash";
import { assert, IsExact } from "conditional-type-checks";

it("allows to specify hash", () => {
    const testRoute = route(path("/test"), null, hash());

    assert<IsExact<Parameters<typeof testRoute.buildHash>[0], string>>(true);
    assert<IsExact<ReturnType<typeof testRoute.parseHash>, string>>(true);

    expect(testRoute.build({}, null, "foo")).toBe("/test#foo");
    expect(testRoute.parseHash(testRoute.buildHash("foo"))).toBe("foo");
});

it("allows to restrict hash values", () => {
    const testRoute = route(path("/test"), null, hash("foo", "bar"));

    assert<IsExact<Parameters<typeof testRoute.buildHash>[0], "foo" | "bar">>(true);
    assert<IsExact<ReturnType<typeof testRoute.parseHash>, "" | "foo" | "bar">>(true);

    expect(testRoute.build({}, null, "foo")).toBe("/test#foo");
    expect(testRoute.parseHash(testRoute.buildHash("foo"))).toBe("foo");
});
