// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'CRAI Documentation',
			description: 'Complete documentation for CRAI - Car Registration AI System',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/IbaiZJ/CRAI',
				},
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'index' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
						{ label: 'Configuration', slug: 'getting-started/configuration' },
					],
				},
				{
					label: 'Architecture',
					items: [
						{ label: 'Overview', slug: 'architecture/overview' },
						{ label: 'Backend (FastAPI)', slug: 'architecture/backend' },
						{ label: 'Frontend (React)', slug: 'architecture/frontend' },
						{ label: 'Docker Setup', slug: 'architecture/docker' },
					],
				},
				{
					label: 'Backend API',
					items: [
						{ label: 'API Overview', slug: 'api/overview' },
						{ label: 'Endpoints', slug: 'api/endpoints' },
						{ label: 'Models', slug: 'api/models' },
						{ label: 'Authentication', slug: 'api/authentication' },
					],
				},
				{
					label: 'Frontend',
					items: [
						{ label: 'Components', slug: 'frontend/components' },
						{ label: 'Routing', slug: 'frontend/routing' },
						{ label: 'State Management', slug: 'frontend/state-management' },
						{ label: 'Styling', slug: 'frontend/styling' },
					],
				},
				{
					label: 'Testing',
					items: [
						{ label: 'Testing Guide', slug: 'testing/overview' },
						{ label: 'Backend Tests', slug: 'testing/backend' },
						{ label: 'Frontend Tests', slug: 'testing/frontend' },
						{ label: 'CI/CD', slug: 'testing/ci-cd' },
					],
				},
				{
					label: 'Deployment',
					items: [
						{ label: 'Production Setup', slug: 'deployment/production' },
						{ label: 'Docker Deployment', slug: 'deployment/docker' },
						{ label: 'Environment Variables', slug: 'deployment/environment' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Contributing', slug: 'guides/contributing' },
						{ label: 'Code Style', slug: 'guides/code-style' },
						{ label: 'Troubleshooting', slug: 'guides/troubleshooting' },
					],
				},
			],
		}),
	],
});
