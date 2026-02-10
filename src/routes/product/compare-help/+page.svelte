<script>
	import Container from '$lib/components/elements/Container.svelte';
</script>

<section class="compare-help-page">
	<Container>
		<div class="help-shell">
			<header class="help-header">
				<p class="eyebrow">Compare Modal Reference</p>
				<h1>Detailed Compare Instructions</h1>
				<p class="intro">
					This page explains every part of the Item Compare screen in plain language, including what each
					button does and how the rankings work.
				</p>
			</header>

			<section class="help-section">
				<h2>What You Can Compare</h2>
				<ul>
					<li><strong>Custom</strong> compares only items you added yourself.</li>
					<li>A department compares all items in that department.</li>
					<li>The table order follows your sort priorities, not item ID.</li>
				</ul>
			</section>

			<section class="help-section">
				<h2>Top Controls (Quick Guide)</h2>
				<ul>
					<li><strong>Scope</strong>: choose Custom or a full department.</li>
					<li><strong>Set Sort Order</strong>: choose what matters most.</li>
					<li><strong>How to Use</strong>: opens quick instructions in the modal.</li>
					<li><strong>Reset</strong>: clears your custom compare list.</li>
				</ul>
			</section>

			<section class="help-section">
				<h2>How Sorting Works</h2>
				<p>
					When you choose priorities, the app gives each item a score. Items with better scores move to the
					top.
				</p>
				<ol>
					<li>Each compared field (price, shots, duration, etc.) is measured for each item.</li>
					<li>Each field is converted to a common score scale so different units can be compared fairly.</li>
					<li><strong>#1 priority</strong> gets the most influence, #2 gets less, and so on.</li>
					<li>For <strong>Single Price</strong>, lower is better.</li>
					<li>For most other fields, higher is better.</li>
					<li>The app combines those scores into one final ranking score per item.</li>
					<li>Items are sorted from highest score to lowest score.</li>
				</ol>
				<p class="note">
					If every item has the same value in one field, that field does not give an advantage to any item.
				</p>
			</section>

			<section class="help-section">
				<h2>Presets And Custom Priorities</h2>
				<ul>
					<li><strong>Balanced</strong>: a middle-ground mix of value and performance.</li>
					<li><strong>Value</strong>: focuses more on cost per item.</li>
					<li><strong>Performance</strong>: focuses more on show strength (shots, duration, height).</li>
					<li><strong>Custom</strong>: build your own order by selecting and ranking fields.</li>
					<li>Click <strong>Apply Priority Sorting</strong> to update the table order.</li>
				</ul>
			</section>

			<section class="help-section">
				<h2>Custom Sorting: Step By Step</h2>
				<ol>
					<li>Click <strong>Set Sort Order</strong>.</li>
					<li>Click <strong>Custom</strong> in the preset row.</li>
					<li>
						In the priority list, click the fields you care about in order:
						<strong>first click = #1 (most important)</strong>, second click = #2, and so on.
					</li>
					<li>
						Check the <strong>Current</strong> row to confirm your order is correct before applying.
					</li>
					<li>Click <strong>Apply Priority Sorting</strong> to reorder the table.</li>
				</ol>
				<p class="note">
					Your changes are only a draft until you click <strong>Apply Priority Sorting</strong>.
				</p>
			</section>

			<section class="help-section">
				<h2>Editing Your Custom Order</h2>
				<ul>
					<li>
						Click any active priority chip again to remove it from the order.
					</li>
					<li>
						After removing one, click it again to add it back at the end of the order.
					</li>
					<li>
						If a field is missing from your order, it does not influence sort ranking.
					</li>
					<li>
						You can start from a preset, then manually adjust to make your own hybrid order.
					</li>
				</ul>
			</section>

			<section class="help-section">
				<h2>How To Build A Good Custom Sort</h2>
				<ul>
					<li>
						Keep it short: 2-4 priorities is usually easier to reason about than all fields at once.
					</li>
					<li>
						Put your deal-breaker first (for example, <strong>Single Price</strong> if budget is strict).
					</li>
					<li>
						Use variety fields (<strong>Colors</strong>, <strong>Effects</strong>) near the top only if
						show style matters more than raw performance.
					</li>
					<li>
						After applying sort, scan top 3-5 items, then tweak one priority at a time.
					</li>
				</ul>
			</section>

			<section class="help-section">
				<h2>Custom Sorting Examples</h2>
				<ul>
					<li>
						<strong>Best value first:</strong> Single Price → Duration → Shots
					</li>
					<li>
						<strong>Loud, high-impact show:</strong> Shots → Height → Duration
					</li>
					<li>
						<strong>Visual variety first:</strong> Color Variety → Effects Variety → Duration
					</li>
					<li>
						<strong>Balanced family pick:</strong> Single Price → Color Variety → Duration → Shots
					</li>
				</ul>
			</section>

			<section class="help-section">
				<h2>What The Delta Indicators Mean</h2>
				<p>
					Under many numbers, you will see a small delta label. It shows how far that item is from the
					<strong>middle</strong> item in the current list.
				</p>
				<ul>
					<li><strong>Median</strong> means the middle value in the current compared set.</li>
					<li><strong>▲</strong> means above the middle value.</li>
					<li><strong>▼</strong> means below the middle value.</li>
					<li><strong>-</strong> means nearly the same as the middle value.</li>
				</ul>
				<p class="note">
					If you change scope (for example Custom to Department), the middle value changes, so deltas can
					change even when product data is the same.
				</p>
			</section>

			<section class="help-section">
				<h2>What Each Column Shows</h2>
				<ul>
					<li><strong>Item</strong>: image, name, department, and deal strip.</li>
					<li><strong>Single Price</strong>: the cost for one item after deal math.</li>
					<li><strong>Colors</strong>: listed colors and color-dot display.</li>
					<li><strong>Effects</strong>: effect tags from product data.</li>
					<li><strong>Shots / Duration / Height</strong>: performance numbers.</li>
				</ul>
			</section>

			<section class="help-section">
				<h2>Image Preview Behavior</h2>
				<ul>
					<li>Hover an item image to preview it larger.</li>
					<li>Click an image to pin/unpin the preview.</li>
					<li>The preview auto-moves so it stays on screen.</li>
				</ul>
			</section>

			<section class="help-section">
				<h2>Troubleshooting</h2>
				<ul>
					<li>If rows do not move, click <strong>Apply Priority Sorting</strong> after choosing priorities.</li>
					<li>If one field seems to have no effect, all compared items may be similar in that field.</li>
					<li>If a department looks empty, that department may not currently have loaded products.</li>
				</ul>
			</section>
		</div>
	</Container>
</section>

<style>
	.compare-help-page {
		padding: calc(var(--nav-height) + 1.2rem) 0 2.5rem;
	}
	.help-shell {
		background: var(--white);
		border: 2px solid var(--grey);
		box-shadow: 8px 8px 0 var(--yellow-accent);
		padding: 1rem 1rem 1.2rem;
	}
	.help-header {
		border-bottom: 1px solid var(--grey-light);
		padding-bottom: 0.7rem;
		margin-bottom: 0.7rem;
	}
	.eyebrow {
		margin: 0;
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--grey-accent);
	}
	h1 {
		margin: 0.2rem 0 0.35rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 1.25rem;
	}
	.intro {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.4;
		color: var(--grey-accent);
	}
	.help-section {
		padding: 0.55rem 0;
		border-top: 1px solid var(--grey-light);
	}
	.help-section h2 {
		margin: 0 0 0.35rem;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.help-section p,
	.help-section li {
		font-size: 0.84rem;
		line-height: 1.4;
	}
	.help-section p {
		margin: 0.15rem 0 0.4rem;
	}
	.help-section ul,
	.help-section ol {
		margin: 0;
		padding-left: 1rem;
	}
	.note {
		padding: 0.4rem 0.55rem;
		border: 1px solid var(--grey-light);
		background: var(--off-white);
	}
</style>
