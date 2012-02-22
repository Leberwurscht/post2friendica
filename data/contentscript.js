function insertImage(imagedata)
{
    // http://stackoverflow.com/questions/2474605/how-to-convert-a-htmlelement-to-a-string
    var container = document.createElement("div");
    var el = document.createElement("img");
    el.setAttribute('src', imagedata.src);
    el.setAttribute('alt', imagedata.alt);
    container.appendChild(el);
    code = container.innerHTML;

    // http://wiki.greasespot.net/Content_Script_Injection
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = 'window.addEventListener("message", function(event) { if (!editor) $("#profile-jot-text").val(""); initEditor(function(){ tinyMCE.execCommand("mceInsertRawHTML",false,event.data); }); }, false);';
    document.body.appendChild(script);
    document.body.removeChild(script);
    
    document.defaultView.postMessage(code, '*');
}

self.port.on("post-image", function(imagedata) {
    try {
        generator = document.getElementsByName('generator')[0].getAttribute('content');
    }
    catch (err) {
        generator = "";
    }

    if (generator.substring(0, 9)=="Friendica") {
        // if this is the login site, wait until login is completed
        if (document.getElementById("login_standard")) {
            return;
        }

        // insert image if text field present
        if (document.getElementById("profile-jot-text")) {
            insertImage(imagedata);
        }
        else {
            self.port.emit("notify", {
                title:"post2friendica was unable to detected a text field",
                text:"Make sure you supplied an URL ending with /network in the addon preferences."
            });
        }
    }
    else {
        self.port.emit("notify", {
            title:"post2friendica URL error",
            text:"The URL you specified in the addon preferences does not point to a Friendica site."
        });
    }

    self.port.emit("done", true);
});
