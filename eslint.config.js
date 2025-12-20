export default [
    {
        files: ["docs/js/**/*.js"],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "script",
            globals: {
                document: "readonly",
                fetch: "readonly",
                console: "readonly"
            }
        },
        rules: {}
    }
];
