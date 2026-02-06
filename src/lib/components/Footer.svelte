<script>
	import { renderMarkdown } from '$lib/markdown';
	import Address from './Address.svelte';
	export let allData;
	import { date } from '$lib/utility/date';
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
			{#each allData.closedRange as breakItem}
				{#if breakItem.isActive}
					{#if breakItem.occasion}
						<tr>
							<th colspan="2"> {breakItem.occasion}:</th>
						</tr>
						<tr>
							<td colspan="2" class="break">
								<strong>{new Date(date(breakItem.startOfBreak)).toDateString()}</strong></td
							>
						</tr>
						<tr>
							<td colspan="2" class="break thru"> - thru - </td>
						</tr>
						<tr>
							<td colspan="2" class="break">
								<strong>{new Date(date(breakItem.endOfBreak)).toDateString()}</strong></td
							>
						</tr>
						<tr>
							<td colspan="2" class="break"><small>{breakItem.moreInfo}</small></td>
						</tr>
						<tr><td colspan="2"><hr /></td></tr>
					{/if}
				{/if}
			{/each}
			{#each allData.specialHours as occasion}
				{#if occasion.isActive}
					{#if occasion.dayOneDate}
						<tr>
							<th colspan="2">{occasion.occasion}</th>
						</tr>
					{/if}
					{#if occasion.dayOneDate}
						<tr>
							<td> <strong>{new Date(date(occasion.dayOneDate)).toDateString()}</strong></td>
							<td>{occasion.dayOneHours}</td>
						</tr>
					{/if}
					{#if occasion.dayTwoDate}
						<tr>
							<td> <strong>{new Date(date(occasion.dayTwoDate)).toDateString()}</strong></td>
							<td>{occasion.dayTwoHours}</td>
						</tr>
					{/if}
					{#if occasion.dayThreeDate}
						<tr>
							<td> <strong>{new Date(date(occasion.dayThreeDate)).toDateString()}</strong></td>
							<td>{occasion.dayThreeHours}</td>
						</tr>
					{/if}
					{#if occasion.dayFourDate}
						<tr>
							<td> <strong>{new Date(date(occasion.dayFourDate)).toDateString()}</strong></td>
							<td>{occasion.dayFourHours}</td>
						</tr>
					{/if}
					{#if occasion.dayFiveDate}
						<tr>
							<td> <strong>{new Date(date(occasion.dayFiveDate)).toDateString()}</strong></td>
							<td>{occasion.dayFiveHours}</td>
						</tr>
					{/if}
				{/if}
			{/each}
			<tr>
				<th colspan="2"><em>Regular Hours:</em></th>
			</tr>
			<tr>
				<td> <strong>Sunday:</strong></td>
				<td> {allData.regularHoursStrict.sundayHours}</td>
			</tr>
			<tr>
				<td> <strong>Monday:</strong></td>
				<td> {allData.regularHoursStrict.mondayHours}</td>
			</tr>
			<tr>
				<td> <strong>Tuesday:</strong></td>
				<td> {allData.regularHoursStrict.tuesdayHours}</td>
			</tr>
			<tr>
				<td> <strong>Wednesday:</strong></td>
				<td> {allData.regularHoursStrict.wednesdayHours}</td>
			</tr>
			<tr>
				<td> <strong>Thursday:</strong></td>
				<td> {allData.regularHoursStrict.thursdayHours}</td>
			</tr>
			<tr>
				<td> <strong>Friday:</strong></td>
				<td> {allData.regularHoursStrict.fridayHours}</td>
			</tr>
			<tr>
				<td> <strong>Saturday:</strong></td>
				<td> {allData.regularHoursStrict.saturdayHours}</td>
			</tr>
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
