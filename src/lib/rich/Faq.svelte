<script>
	import { stringify } from 'postcss';
</script>

<svelte:head>
	<script type="application/ld+json">
		`{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			"mainEntity": [
				{
					'@type': 'Question',
					"name": 'What is the return policy?',
					"acceptedAnswer": {
						'@type': 'Answer',
						"text": '<p>Most unopened items in new condition and returned within <b>90 days</b> will receive a refund or exchange. Some items have a modified return policy noted on the receipt or packing slip. Items that are opened or damaged or do not have a receipt may be denied a refund or exchange. Items purchased online or in-store may be returned to any store.</p><p>Online purchases may be returned via a major parcel carrier. <a href=http://example.com/returns> Click here </a> to initiate a return.</p>'
					}
				},
				{
					'@type': 'Question',
					"name": 'How long does it take to process a refund?',
					"acceptedAnswer": {
						'@type': 'Answer',
						"text": "We will reimburse you for returned items in the same way you paid for them. For example, any amounts deducted from a gift card will be credited back to a gift card. For returns by mail, once we receive your return, we will process it within 4–5 business days. It may take up to 7 days after we process the return to reflect in your account, depending on your financial institution's processing time."
					}
				},

				}
			]
		};`;
	</script>
</svelte:head>
