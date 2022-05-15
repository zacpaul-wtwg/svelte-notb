<script>
	import SvelteMarkdown from 'svelte-markdown';
	import Address from '../Address.svelte';
	export let allData;
</script>

<footer>
	<div class="message footer-section">
		<img src="/logo_large.png" alt="North of the Border Logo" />
		<SvelteMarkdown source={allData.footerDescription.body} />
	</div>
	<div class="hours footer-section">
		<div class="footer-header">Hours of Operation</div>
		<table>
			{#if allData.hours.areSpecialHoursActive}
				<tr>
					<th colspan="2"><em>Special & Holiday Hours:</em></th>
				</tr>
				<tr>
					<td colspan="2"><SvelteMarkdown source={allData.hours.specialHours} /></td>
				</tr>
			{/if}
			<tr>
				<th colspan="2"><em>Regular Hours:</em></th>
			</tr>
			<tr>
				<td> <strong>Sunday:</strong></td>
				<td> {allData.hours.sunday}</td>
			</tr>
			<tr>
				<td> <strong>Monday:</strong></td>
				<td> {allData.hours.monday}</td>
			</tr>
			<tr>
				<td> <strong>Tuesday:</strong></td>
				<td> {allData.hours.tuesday}</td>
			</tr>
			<tr>
				<td> <strong>Wednesday:</strong></td>
				<td> {allData.hours.wednesday}</td>
			</tr>
			<tr>
				<td> <strong>Thursday:</strong></td>
				<td> {allData.hours.thursday}</td>
			</tr>
			<tr>
				<td> <strong>Friday:</strong></td>
				<td> {allData.hours.friday}</td>
			</tr>
			<tr>
				<td> <strong>Saturday:</strong></td>
				<td> {allData.hours.saturday}</td>
			</tr>
		</table>
	</div>
	<div class="contact footer-section">
		<div class="footer-header">Contact Us</div>
		<Address />
	</div>
</footer>

<style>
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
