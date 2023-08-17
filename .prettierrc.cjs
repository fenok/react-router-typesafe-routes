module.exports = {
  printWidth: 120,
  overrides: [
    {
      files: "*.md",
      options: {
        printWidth: 100,
      },
    },
  ],
  plugins: [import("prettier-plugin-jsdoc")],
};
