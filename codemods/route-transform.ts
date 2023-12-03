import { FileInfo, API } from "jscodeshift";

export default function (file: FileInfo, api: API) {
  const j = api.jscodeshift.withParser("ts");
  const root = j(file.source);

  return root
    .find(j.CallExpression, {
      callee: {
        type: "Identifier",
        name: "route",
      },
    })
    .replaceWith((p) => {
      const args = p.value.arguments;

      if (args[0].type !== "SpreadElement") {
        const newObject = j.objectExpression([j.property("init", j.identifier("path"), args[0])]);

        if (args[1] && args[1].type === "ObjectExpression") {
          args[1].properties.forEach((prop) => {
            newObject.properties.push(j.property("init", j.identifier(prop.key.name), prop.value));
          });
        }

        if (args[2] && args[2].type !== "SpreadElement") {
          newObject.properties.push(j.property("init", j.identifier("children"), args[2]));
        }

        return j.callExpression(j.identifier("route"), [newObject]);
      }

      return p;
    })
    .toSource();
}
