module.exports = (file, api) => {
    const j = api.jscodeshift.withParser("ts");
    const root = j(file.source);

    return root.find(j.CallExpression, {
        callee: {
            type: "Identifier",
            name: "route",
        },
    })
        .replaceWith(p => {
            const args = p.value.arguments;

            let newObject = j.objectExpression([
                j.property("init", j.identifier("path"), args[0]),
            ]);

            if (args[1] && args[1].type === 'ObjectExpression') {
                args[1].properties.forEach((prop) => {
                    newObject.properties.push(j.property("init", j.identifier(prop.key.name), prop.value));
                });
            }

            if (args[2]) {
                newObject.properties.push(
                    j.property("init", j.identifier("children"), args[2])
                );
            }

            return j.callExpression(
                j.identifier("route"),
                [newObject]
            );
        })
        .toSource();
};
