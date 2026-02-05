/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: 'npm run dev -- --port 5174',
		port: 5174,
		reuseExistingServer: true
	}
};

export default config;
