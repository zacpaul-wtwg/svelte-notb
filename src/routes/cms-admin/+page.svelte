<script>
	import { onMount } from 'svelte';

	export async function load({ fetch }) {
		return {
			props: {
				initial: ''
			}
		};
	}

	export let initial = '';

	let password = '';
	let message = '';
	let content = initial;
	let status = '';
	let busy = false;
	let unlocked = false;
	let lastLoaded = '';

	let fileInput;

	onMount(() => {
		// Give the editor a sane default message
		message = `Update cms.json (${new Date().toISOString().slice(0, 10)})`;
	});

	async function unlock() {
		status = '';
		busy = true;
		try {
			const res = await fetch('/.netlify/functions/get-cms-json', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ password })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				status = `Error (${res.status}): ${data?.error || 'Request failed'}`;
				return;
			}
			lastLoaded = String(data?.content || '');
			content = lastLoaded;
			unlocked = true;
			status = 'Unlocked.';
		} catch (e) {
			status = `Network error: ${e?.message || e}`;
		} finally {
			busy = false;
		}
	}

	function onFileChange() {
		const file = fileInput?.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			content = String(reader.result || '');
			status = `Loaded ${file.name}`;
		};
		reader.readAsText(file);
	}

	async function submit() {
		status = '';
		busy = true;
		try {
			const res = await fetch('/.netlify/functions/update-cms-json', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ password, message, content })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				status = `Error (${res.status}): ${data?.error || 'Request failed'}`;
				return;
			}
			status = `Updated. Commit: ${data?.commit || '(unknown)'}`;
		} catch (e) {
			status = `Network error: ${e?.message || e}`;
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>CMS Admin</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="wrap">
	<header class="header">
		<h1>CMS Admin</h1>
		<p>
			This updates <code>static/cms.json</code> by committing to GitHub via a Netlify Function.
		</p>
	</header>

	<section class="panel">
		{#if !unlocked}
			<label class="label">
				<span>Password</span>
				<input
					class="input"
					type="password"
					bind:value={password}
					autocomplete="current-password"
					on:keydown={(e) => e.key === 'Enter' && password && !busy && unlock()}
				/>
			</label>

			<div class="row">
				<button class="btn primary" type="button" on:click={unlock} disabled={busy || !password}>
					{busy ? 'Unlocking…' : 'Unlock Editor'}
				</button>
			</div>
		{:else}
			<label class="label">
				<span>Password</span>
				<input class="input" type="password" bind:value={password} autocomplete="current-password" />
			</label>

			<label class="label">
				<span>Commit Message</span>
				<input class="input" type="text" bind:value={message} />
			</label>

			<div class="row">
				<label class="label">
					<span>Load JSON File</span>
					<input
						class="input"
						type="file"
						accept="application/json"
						bind:this={fileInput}
						on:change={onFileChange}
					/>
				</label>
				<button class="btn" type="button" on:click={() => (content = lastLoaded)} disabled={busy}>
					Reset To Loaded
				</button>
			</div>

			<label class="label">
				<span>cms.json</span>
				<textarea class="textarea" bind:value={content} spellcheck="false"></textarea>
			</label>

			<div class="row">
				<button
					class="btn primary"
					type="button"
					on:click={submit}
					disabled={busy || !password || !content.trim()}
				>
					{busy ? 'Updating…' : 'Update Site Content'}
				</button>
				<button class="btn" type="button" on:click={() => (unlocked = false)} disabled={busy}>
					Lock
				</button>
				<a class="btn" href="/cms.json" target="_blank" rel="noreferrer">View Live cms.json</a>
			</div>
		{/if}

		{#if status}
			<p class="status">{status}</p>
		{/if}
	</section>
</main>

<style>
	.wrap {
		min-height: 100vh;
		padding: 24px 16px;
		background: radial-gradient(900px 500px at 20% 10%, rgba(255, 199, 0, 0.12), transparent 55%),
			radial-gradient(900px 500px at 80% 0%, rgba(0, 184, 255, 0.12), transparent 55%),
			linear-gradient(180deg, #08080b, #0b0b10);
		color: #eef0f6;
	}

	.header {
		max-width: 1000px;
		margin: 0 auto 16px;
	}
	h1 {
		margin: 0 0 6px;
		font-family: var(--headline-font, system-ui);
		letter-spacing: 0.02em;
		font-size: 20px;
	}
	p {
		margin: 0;
		opacity: 0.85;
	}

	.panel {
		max-width: 1000px;
		margin: 0 auto;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 14px;
		padding: 14px;
		background: rgba(255, 255, 255, 0.04);
	}

	.label {
		display: grid;
		gap: 6px;
		margin: 0 0 12px;
	}
	.label > span {
		font-size: 13px;
		opacity: 0.9;
	}

	.input,
	.textarea {
		width: 100%;
		box-sizing: border-box;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.16);
		background: rgba(0, 0, 0, 0.22);
		color: #eef0f6;
		padding: 10px 12px;
		font-size: 14px;
	}
	.textarea {
		min-height: 50vh;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;
		line-height: 1.35;
	}

	.row {
		display: flex;
		gap: 10px;
		align-items: flex-end;
		margin: 0 0 12px;
		flex-wrap: wrap;
	}
	.row .label {
		margin: 0;
		flex: 1 1 340px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 12px;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.06);
		color: #eef0f6;
		text-decoration: none;
		cursor: pointer;
		font-size: 14px;
	}
	.btn.primary {
		border-color: rgba(255, 199, 0, 0.42);
		background: linear-gradient(180deg, rgba(255, 199, 0, 0.25), rgba(255, 199, 0, 0.12));
	}
	.btn[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.status {
		margin: 10px 2px 2px;
		opacity: 0.9;
		font-size: 13px;
	}
	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;
	}
</style>
