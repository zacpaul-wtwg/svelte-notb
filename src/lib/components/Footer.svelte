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

<footer>
	<div class="message footer-section">
		<img src="/logo_large.png" alt="North of the Border Logo" />
		<div class="md">{@html renderMarkdown(allData.footerDescription.body)}</div>
	</div>
	<div class="hours footer-section">
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
					<td> <strong>{day.label}:</strong></td>
					<td> {formatDayHours(allData.hours?.[day.key])}</td>
				</tr>
			{/each}
			</tbody>
		</table>
	</div>
	<div class="contact footer-section">
		<div class="footer-header">Contact Us</div>
		<Address />
	</div>
</footer>

<style lang="scss">
	.footer-header {
		font-family: langdon;
		font-size: 1.7em;
		text-transform: uppercase;
	}
	img {
		width: 100%;
	}
	th {
		text-align: left;
		font-size: 1.25em;
	}
	footer {
		background-color: var(--grey);
		color: white;
		display: flex;
		justify-content: space-around;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 2em;
	}
	table {
		width: 100%;
	}
	th {
		padding-top: 10px;
	}
	.break {
		padding-left: 20px;
	}
	.thru {
		padding-left: 40px;
	}

	.footer-section {
		width: 300px;
		padding: 20px;
		border-bottom: var(--grey-accent) solid thin;
	}

	@media screen and (max-width: 1475px) {
		.footer-section {
			width: 27%;
		}
	}
	@media screen and (max-width: 986px) {
		.footer-section {
			width: 100%;
		}
	}
</style>
