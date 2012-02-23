// warn user if profile url is still the default value
simplePrefs = require("simple-prefs")
if (simplePrefs.prefs.network_url=="http://example.com/network") {
    require("notifications").notify({
        title: "Profile URL needed",
        text: "You need to tell the post2friendica addon the URL of your Friendica site. You can configure it in the addon preferences.",
    });
}

// opens a new tab with friendica, attaches a content script and sends the data to it
function post2friendica(data) {
    require("tabs").open({
        url: simplePrefs.prefs.network_url,
        onReady: function onReady(tab) {
            if (tab._done) return;

            worker = tab.attach({
                contentScriptFile: require("self").data.url("contentscript.js")
            });

            worker.port.on("notify", function(message) {
                require("notifications").notify(message)
            });

            worker.port.on("done", function(success) {
                tab._done = true;
            });

            worker.port.emit("post", data);
        }
    });
}

var contextMenu = require("context-menu");

contextMenu.Item({
  label: "Share Page on Friendica",
  context: contextMenu.PageContext(),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"url", "href":document.URL}); });',
  onMessage: post2friendica
});

contextMenu.Item({
  label: "Share Image on Friendica",
  context: contextMenu.SelectorContext("img"),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"img", "src":node.src, "alt":node.alt}); });',
  onMessage: post2friendica
});

contextMenu.Item({
  label: "Share Link on Friendica",
  context: contextMenu.SelectorContext("a[href]"),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"url", "href": node.href}); });',
  onMessage: post2friendica
});

contextMenu.Item({
  label: "Share Selection on Friendica",
  context: contextMenu.SelectionContext(),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"quote", "source": document.URL, "title":document.title, "text":window.getSelection().toString()}); });',
  onMessage: post2friendica
});
