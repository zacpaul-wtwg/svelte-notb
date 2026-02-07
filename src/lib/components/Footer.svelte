<script>
	import { renderMarkdown } from '$lib/markdown';
	import Address from './Address.svelte';
	export let allData;
	import { formatDateLong } from '$lib/utility/date';
	import { formatDayHours } from '$lib/utility/time';

	const days = [
		{ key: 'sunday', label: 'Sunday' },
		{ key: 'monday', label: 'Monday' },
		{ key: 'tuesday', label: 'Tuesday' },
		{ key: 'wednesday', label: 'Wednesday' },
		{ key: 'thursday', label: 'Thursday' },
		{ key: 'friday', label: 'Friday' },
		{ key: 'saturday', label: 'Saturday' }
	];
</script>

<footer class="site-footer">
	<div class="footer-inner">
		<section class="message footer-section poster-card">
			<img src="/logo_large.png" alt="North of the Border Logo" />
			<div class="md">{@html renderMarkdown(allData.footerDescription.body)}</div>
		</section>

		<section class="hours footer-section poster-card">
			<div class="footer-header">Hours of Operation</div>
			<table>
				<tbody>
					{#each allData.specialHours as occasion}
						{#if occasion.title}
							<tr>
								<th colspan="2">{occasion.title}</th>
							</tr>
						{/if}
						{#each occasion.days || [] as day}
							<tr>
								<td><strong>{formatDateLong(day.date)}</strong></td>
								<td>{day.closed ? 'CLOSED' : formatDayHours(day)}</td>
							</tr>
						{/each}
					{/each}
					<tr>
						<th colspan="2"><em>Regular Hours:</em></th>
					</tr>
					{#each days as day}
						<tr>
							<td><strong>{day.label}:</strong></td>
							<td>{formatDayHours(allData.hours?.[day.key])}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>

		<section class="contact footer-section poster-card">
			<div class="footer-header">Contact Us</div>
			<Address />
		</section>
	</div>
</footer>

<style lang="scss">
	.site-footer {
		position: relative;
		overflow: hidden;
		background:
			radial-gradient(circle at 12% -15%, rgba(145, 25, 0, 0.45) 0 35%, transparent 60%),
			radial-gradient(circle at 84% 120%, rgba(220, 237, 34, 0.3) 0 28%, transparent 56%),
			repeating-linear-gradient(
				125deg,
				rgba(255, 255, 255, 0.04) 0 3px,
				rgba(255, 255, 255, 0) 3px 10px
			),
			var(--grey);
		color: var(--white);
		padding: 2.5rem 1rem 2rem;
		border-top: 2px solid var(--yellow-accent);
	}

	.footer-inner {
		position: relative;
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.25fr 1fr 1fr;
		gap: 1rem;
	}

	.poster-card {
		position: relative;
		background: linear-gradient(165deg, rgba(255, 255, 255, 0.96), rgba(223, 216, 210, 0.95));
		color: var(--grey);
		border: 2px solid var(--grey);
		box-shadow: 6px 6px 0 var(--yellow-accent);
		padding: 1rem;
		min-height: 100%;
		box-sizing: border-box;
	}

	.footer-header {
		font-family: Langdon, Arial, sans-serif;
		font-size: clamp(1.2rem, 2.1vw, 1.9rem);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: var(--grey);
		color: var(--white);
		padding: 0.2rem 0.6rem;
		display: inline-block;
		margin-bottom: 0.7rem;
		box-shadow: 3px 3px 0 var(--yellow-accent);
	}

	.message img {
		width: min(100%, 260px);
		display: block;
	}

	.message .md {
		margin-top: 0.7rem;
		line-height: 1.5;
		font-size: 0.96rem;
	}

	.message .md :global(p) {
		margin: 0;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.92rem;
	}

	th {
		text-align: left;
		font-size: 1rem;
		padding-top: 0.55rem;
	}

	td {
		padding: 0.18rem 0;
		vertical-align: top;
	}

	tbody tr:nth-child(even) td {
		background: rgba(17, 17, 17, 0.04);
	}

	.contact :global(address) {
		padding: 0.2rem 0 0;
	}

	.contact :global(h2),
	.contact :global(h3) {
		margin: 0;
		font-family: Langdon, Arial, sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--grey);
		font-size: 1rem;
	}

	.contact :global(a) {
		color: var(--red);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	@media (max-width: 1100px) {
		.footer-inner {
			grid-template-columns: 1fr;
		}

		.poster-card {
			max-width: 760px;
			width: 100%;
			margin: 0 auto;
		}
	}

	@media (max-width: 680px) {
		.site-footer {
			padding: 1.8rem 0.7rem 1.6rem;
		}

		.poster-card {
			padding: 0.75rem;
			box-shadow: 4px 4px 0 var(--yellow-accent);
		}
	}
</style>
