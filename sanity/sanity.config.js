import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes/index.js';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'notbfireworks';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
const apiVersion = process.env.SANITY_STUDIO_API_VERSION || '2024-01-01';

export default defineConfig({
	name: 'default',
	title: 'NOTB CMS',
	projectId,
	dataset,
	apiVersion,
	plugins: [deskTool(), visionTool()],
	schema: {
		types: schemaTypes
	}
});
