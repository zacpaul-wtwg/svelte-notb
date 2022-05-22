export const loadFaq = function (faqs) {
	const newLocal = '<script type="application/ld+json">';
	let faqsString = '';
	faqs.map((element) => {
		faqsString = `
            ${faqsString}
            "@type":"FAQPage", 
            "name":"${element.title}",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "${element.answer}"
            },
        `;
	});

	const content = `
        "@context": "https://schema.org",
        "@type": "Question",
        "mainEntity": [${faqsString}]
    `;
	const newLocal2 = '</script>';

	return `${newLocal} {${content}} ${newLocal2}`;
};
