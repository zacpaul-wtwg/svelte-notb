<script>
	//available props are: fontColor, bgColor, padding

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
	export let string = 'TO BE DETERMINED';
	export let padding = '1.75';
</script>

<div
	style={`
		--font-color: ${getClass(fontColor)};
		--bg-color: ${getClass(bgColor)};
		--r-padding: ${padding}
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
		padding-right: calc($font-size * var(--r-padding));
		padding-left: calc($font-size * var(--r-padding));
	}

	div:before,
	div:after {
		background-color: var(--bg-color);
		filter: brightness(70%);
		width: 50px;
		height: calc($font-size * 0.9);
		content: '';
		display: block;
		transform: skewY(10deg);
		position: absolute;
		z-index: -100;
	}

	div:before {
		top: 5px;
		left: 0;
	}
	div:after {
		top: -5px;
		right: 0;
	}
</style>
