onMessage = function onMessage(message) {
    alt = message.alt;
    src = message.src;
    
    // http://stackoverflow.com/questions/2474605/how-to-convert-a-htmlelement-to-a-string
    var container = document.createElement("div");
    var el = document.createElement("img");
    el.setAttribute('src', src);
    el.setAttribute('alt', alt);
    container.appendChild(el);
    code = container.innerHTML;

    // http://wiki.greasespot.net/Content_Script_Injection
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = 'window.addEventListener("message", function(event) { if (!editor) $("#profile-jot-text").val(""); initEditor(function(){ tinyMCE.execCommand("mceInsertRawHTML",false,event.data); }); }, false);';
    document.body.appendChild(script);
    document.body.removeChild(script);
    
    document.defaultView.postMessage(code, '*');
;}
