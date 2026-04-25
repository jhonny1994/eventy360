import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: [
    "ar"
  ],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "messages/{{language}}/{{namespace}}.json"
  }
});