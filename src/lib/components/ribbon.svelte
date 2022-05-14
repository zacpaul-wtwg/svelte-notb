<script>
	export const getClass = function (color) {
		return (
			{
				red: 'var(--red)',
				yellow: 'var(--yellow)',
				white: 'var(--white)'
			}[color] ?? 'var(--grey)'
		);
	};

	export let fontColor = 'white';
	export let bgColor = 'grey';
	export let string = 'to be determined';
</script>

<div
	style={`
		--font-color: ${getClass(fontColor)};
		--bg-color: ${getClass(bgColor)};
	`}
>
	{string}
</div>

<style lang="scss">
	$font-size: 1.25em;

	div {
		display: inline-block;
		background-color: var(--bg-color);
		color: var(--font-color);
		height: calc($font-size * 0.9);
		line-height: calc($font-size + 5%);
		font-size: $font-size;
		text-align: center;
		position: relative;
		font-family: Langdon;
		padding-right: calc($font-size * 1.75);
		padding-left: calc($font-size * 1.75);
	}

	div:before,
	div:after {
		background-color: var(--bg-color);
		filter: brightness(70%);
		width: 50px;
		height: calc($font-size * 0.9);
		content: '';
		display: block;
		transform: skewY(20deg);
		position: absolute;
		z-index: -1;
	}

	div:before {
		top: 10px;
		left: 0;
	}
	div:after {
		top: -10px;
		right: 0;
	}
</style>
