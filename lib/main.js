// warn user if profile url is still the default value
simplePrefs = require("simple-prefs")
if (simplePrefs.prefs.network_url=="http://example.com/network")
{
    require("notifications").notify({
        title: "Profile URL needed",
        text: "You need to tell the post2friendica addon the URL of your Friendica site. You can configure it in the addon preferences.",
    });
}

// opens a new tab with friendica, attaches a content script and sends the image data to it
function post2friendica(imagedata){
    require("tabs").open({
        url: simplePrefs.prefs.network_url,
        onReady: function onReady(tab) {
            if (tab._done) return;

            var data = require("self").data;
            worker = tab.attach({
                contentScriptFile: data.url("contentscript.js")
            });

            worker.port.on("notify", function(message) {
                require("notifications").notify(message)
            });

            worker.port.on("done", function(success) {
                tab._done = true;
            });

            worker.port.emit("post-image", imagedata);
        }
    });
}

var contextMenu = require("context-menu");
contextMenu.Item({
  label: "Post to Friendica",
  context: contextMenu.SelectorContext("img"),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"src":node.src, "alt":node.alt}); });',
  onMessage: post2friendica
});
