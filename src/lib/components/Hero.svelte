<script>
	import ButtonLink from '$lib/components/elements/ButtonLink.svelte';
	import { dataset_dev } from 'svelte/internal';
	import Ribbon from './ribbon.svelte';
	export let allData;

	// Get the current day name in the required format
	const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
	const today = new Date();
	const dayName = daysOfWeek[today.getDay()]; // This will be 'sunday', 'monday', etc.
	const hoursKey = dayName + 'Hours'; // Construct the key to access the hours

	// Now you can use hoursKey to dynamically access the hours for the current day
	// e.g., allData.regularHoursStrict[hoursKey]
</script>

<div class="hero">
	<div class="message">
		<img src="logo_tall.png" alt="tall notb fireworks logo" />
		<div>
			<h1 class="title">
				north of the border<br /><span class="fireworks">fireworks</span>
			</h1>
			<div class="deals everything">all items</div>
			<div class="deals rotate">
				<Ribbon bgColor={'red'} fontColor={'white'} string={'2 for 1'} />
				<div class="or">
					<span>or</span>
				</div>
				<Ribbon bgColor={'yellow'} fontColor={'grey'} string={'3 for 1'} />
			</div>
		</div>
	</div>
	<ButtonLink destination={'product'} label={'Go to Products'} />
	<span class="hours">{dayName.toUpperCase()} HOURS: {allData.regularHoursStrict[hoursKey]}</span>
</div>

<style>
	.hours {
		color: white;
		font-size: 1.25em;
		font-weight: 600;
		padding: 15px;
		background-color: black;
		margin: 10px;
	}
	h1 {
		margin-bottom: 0;
	}
	img {
		height: 20rem;
	}
	.fireworks {
		font-size: 2.5em;
		text-transform: lowercase;
	}
	.hero {
		width: 100%;
		height: calc(100vh - 60px);
		background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/hero-bg.jpg');
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.message {
		color: white;
		display: flex;
	}
	.deals {
		font-size: 2.5em;
		font-family: langdon;
		text-transform: uppercase;
	}
	.rotate {
		transform: rotate(-7deg) translateY(-25px);
	}

	.everything {
		transform: translateY(-10px);
		position: relative;
		z-index: 1;
	}
	.or {
		transform: translateX(3em);
		display: flex;
		font-weight: bolder;
		font-size: 1em;
		width: 1.5em;
		height: 1.5em;
		background: var(--grey);
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		margin: -0.2em;
		position: relative;
		z-index: 3;
		line-height: 0px;
	}
	.or span {
		position: relative;
		top: 2px;
		left: 0px;
	}

	@media only screen and (max-width: 768px) {
		img {
			display: none;
		}
	}
</style>
