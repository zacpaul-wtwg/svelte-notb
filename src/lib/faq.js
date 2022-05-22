import { sentenceify } from './utility/slugify';
export const loadFaq = function (faqs) {
	const newLocal = '<script type="application/ld+json">';
	let faqsString = '';
	let i = '0';
	faqs.map((element) => {
		faqsString =
			faqsString +
			`${i === '0' ? '' : ','}{
                "@type":"Question", 
                "name":"${element.title}",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "${sentenceify(element.answer)}"
                    }
            }
        `;
		i = i + 1;
	});

	faqsString.slice(0, -1);
	const content = `
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [${faqsString}]
    `;
	const newLocal2 = '</script>';

	return `${newLocal} {${content}} ${newLocal2}`;
};
