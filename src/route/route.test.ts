import { route } from "./route";

it("works", () => {
    const rt = route("path", { par1: 1 }, { foo: route("me", { par2: "w" }, undefined) });

    expect(rt({ par1: 2 }).foo({ par2: "3" })).toBe("nope");
});
