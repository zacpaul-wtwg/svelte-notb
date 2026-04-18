<script>
	export let showHours = false;
	export let hours = {};
	import { formatDayHours } from '$lib/utility/time';
	const days = [
		{ key: 'sunday', label: 'Sun' },
		{ key: 'monday', label: 'Mon' },
		{ key: 'tuesday', label: 'Tue' },
		{ key: 'wednesday', label: 'Wed' },
		{ key: 'thursday', label: 'Thu' },
		{ key: 'friday', label: 'Fri' },
		{ key: 'saturday', label: 'Sat' }
	];
	$: hasHours = Object.keys(hours || {}).length > 0;
</script>

<address>
	<div class="aside-object">
		<h2>Phone:</h2>
		<a href="tel: 5702265111">(570) 226-5111</a>
	</div>
	<div class="aside-object">
		<h3>Address:</h3>
		<div>125 Welwood Ave</div>
		<div>Hawley, PA 18428</div>
	</div>
	{#if showHours}
		<div class="aside-object hours">
			<h3>Hours:</h3>
			<ul>
				{#each days as day}
					<li>
						<span class="day">{day.label}</span>
						<span class="time">{hasHours ? formatDayHours(hours?.[day.key]) : 'Unavailable'}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</address>

<style lang="scss">
	address {
		display: flex;
		flex-direction: column;
		padding-right: 2em;
		padding-top: 1em;
	}
	.aside-object {
		margin-bottom: 1em;
		div {
			display: block;
		}
	}
	.hours ul {
		list-style: none;
		padding: 0;
		margin: 0.5em 0 0;
		display: grid;
		gap: 0.25em;
	}
	.hours li {
		display: flex;
		justify-content: space-between;
		gap: 0.75em;
		padding: 0.2em 0.4em;
		border-radius: 4px;
	}
	.hours li:nth-child(even) {
		background: var(--off-white);
	}
	.hours .day {
		font-family: Langdon, Arial, sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--grey);
	}
</style>
