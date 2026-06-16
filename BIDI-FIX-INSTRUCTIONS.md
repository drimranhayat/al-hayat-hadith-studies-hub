# Bilingual Direction Fix — Al-Hayat Hadith Studies Hub

## مسئلہ
Urdu pages کا main direction RTL ہے، لیکن English words/phrases جیسے:
- Al-Hayat Hadith Studies Hub
- Research Toolkit
- GitHub Pages
- MCQs
- Source Review
- WhatsApp / Email

ان کو LTR isolate ہونا چاہیے تاکہ English text الٹا یا غیر فطری محسوس نہ ہو۔

## اس ZIP میں کیا ہے؟

1. Revised root HTML pages:
- index.html
- academic-policy.html
- search.html
- templates.html
- faq.html
- contact.html
- privacy.html
- terms.html
- roadmap.html
- 404.html

2. Reusable future files:
- assets/css/bidi-fix.css
- assets/js/bidi-fix.js

## Upload instructions

### Option A — Best for current pages
ZIP سے root HTML pages نکال کر repository root میں replace کریں.

### Option B — Future pages
ہر future root page کے head میں:
<link rel="stylesheet" href="assets/css/bidi-fix.css">

اور body کے آخر میں:
<script src="assets/js/bidi-fix.js"></script>

Folder pages میں path یہ ہوگا:
<link rel="stylesheet" href="../assets/css/bidi-fix.css">
<script src="../assets/js/bidi-fix.js"></script>

## Future writing rule
Pure English text کے لیے:
<span class="en" dir="ltr" lang="en">Research Toolkit</span>

Mixed Urdu text میں English phrase کے لیے:
اردو عبارت <bdi class="en-inline" dir="ltr">GitHub Pages</bdi> کے ساتھ۔
