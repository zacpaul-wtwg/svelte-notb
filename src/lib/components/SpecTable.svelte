<script>
	export let height = '';
	export let duration = '';
	export let shots = '';
	export let type = '';
</script>

<div class="tg-wrap">
	<table class="tg">
		<thead>
			<tr>
				<th class="tg-0lax">Attribute</th>
				<th class="tg-0lax">Specification</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="tg-0pky">Height</td>
				<td class="tg-0pky">{height} feet</td>
			</tr>
			<tr>
				<td class="tg-0pky">Duration</td>
				<td class="tg-0pky">{duration} seconds</td>
			</tr>
			<tr>
				<td class="tg-0pky">Shot Count</td>
				<td class="tg-0pky">{shots}</td>
			</tr>
			<tr>
				<td class="tg-0pky">Cake Type</td>
				<td class="tg-0pky">{type}</td>
			</tr>
		</tbody>
	</table>
</div>

<style type="text/css">
	.tg {
		border-collapse: collapse;
		border-spacing: 0;
	}
	.tg td {
		border-color: black;
		border-style: solid;
		border-width: 1px;
		font-family: Arial, sans-serif;
		font-size: 14px;
		overflow: hidden;
		padding: 10px 5px;
		word-break: normal;
	}
	.tg th {
		border-color: black;
		border-style: solid;
		border-width: 1px;
		font-family: Arial, sans-serif;
		font-size: 14px;
		font-weight: normal;
		overflow: hidden;
		padding: 10px 5px;
		word-break: normal;
	}
	.tg .tg-0lax {
		text-align: left;
		vertical-align: top;
		font-weight: 600;
	}
	.tg .tg-0pky {
		border-color: inherit;
		text-align: left;
		vertical-align: top;
	}
	@media screen and (max-width: 767px) {
		.tg {
			width: auto !important;
		}
		.tg-wrap {
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}
	}
</style>
