<script>
	export const isTrue = function (ligature) {
		if (ligature === true) {
			return "isn't that easier to read than three equals signs?";
		}

		if (ligature !== true) {
			return 'not true, in love';
		}
	};

	export const array = ['the', 'arrow', 'functions', 'are', 'nice', 'to', 'look', 'at'];

	//arrow functions are especially pretty.
	export let i = 0;
	export const falseyVar = undefined;
	array.map((x) => (x.split('').length >= 3 ? i++ : 'wait, ++ gets a ligature too? '));

	if (falseyVar == null && i <= 1) {
		console.log(`there are ${i} words that have 3 or more letters.\n Isn't it great.`);
	}
</script>

<div>
	<main class="why">
		<h1>Some random things I don't use too often or ever:</h1>
		<h2>operators:</h2>
		<ul>
			<li>x /= y</li>
			<li>x *= y</li>
		</ul>

		<h2>Markdown</h2>
		<ul>
			<li>---</li>
			<li>|--|-----|-------|-----|</li>
			<li>## ### #### ##### ######</li>
		</ul>

		<p>Notice how the arrow brackets and slashes are connected?</p>
		<p>It happens on void elements like <br /> as well.</p>
		<!-- <p>even the comments for html elements get an upgrade. 
            I think jsx uses </> this all the time, look how pretty it is. </p> -->
	</main>
	<a href="https://www.cuteanimals.com" id="Best link">
		This is a totally fake website, but www gets a ligature too.
	</a>
</div>

<style>
	/*  
        I spent way too much time writing this 
        to show you how awesome I think it is. 
        But look at the fancy styling comments 
    */

	a {
		color: blue;
	}
</style>
