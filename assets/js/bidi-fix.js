/* === Al-Hayat automatic bilingual text direction fix === */
(function(){
  const arabicRange = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const latinRange = /[A-Za-z]/;
  const skipTags = new Set(["SCRIPT","STYLE","SVG","PATH","NOSCRIPT","CODE","PRE","TEXTAREA","INPUT"]);
  const latinPhrase = /[A-Za-z][A-Za-z0-9&+().,:'’\/#-]*(?:\s+[A-Za-z0-9&+().,:'’\/#-]+)*/g;

  function isLatinOnly(text){
    const t = (text || "").trim();
    return latinRange.test(t) && !arabicRange.test(t);
  }

  function shouldSkipTextNode(node){
    if(!node || !node.parentElement) return true;
    const parent = node.parentElement;
    if(skipTags.has(parent.tagName)) return true;
    if(parent.closest("script,style,svg,code,pre,textarea,input,.en-inline,[dir='ltr']")) return true;
    return !latinRange.test(node.nodeValue || "");
  }

  document.querySelectorAll(".brand-en,.eyebrow,.ltr,[lang='en'],.email,.phone,.url").forEach(el=>{
    el.setAttribute("dir","ltr");
    el.classList.add("english-block");
  });

  document.querySelectorAll("main h1,main h2,main h3,main p,main li,main a,main span,main small,main strong,main button,.tag,.see,.contact-link").forEach(el=>{
    const text = el.textContent || "";
    if(isLatinOnly(text)){
      el.setAttribute("dir","ltr");
      el.classList.add("english-block");
    }else if(latinRange.test(text) && arabicRange.test(text)){
      el.classList.add("mixed-text");
    }
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      return shouldSkipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while(walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node=>{
    const text = node.nodeValue;
    if(!text || !latinRange.test(text)) return;
    const frag = document.createDocumentFragment();
    let last = 0;
    text.replace(latinPhrase, (match, offset)=>{
      if(offset > last) frag.appendChild(document.createTextNode(text.slice(last, offset)));
      const bdi = document.createElement("bdi");
      bdi.className = "en-inline";
      bdi.setAttribute("dir","ltr");
      bdi.textContent = match;
      frag.appendChild(bdi);
      last = offset + match.length;
      return match;
    });
    if(last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  });
})();
