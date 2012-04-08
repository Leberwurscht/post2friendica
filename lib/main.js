// localization
var _ = require("l10n").get;

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

            worker.port.on("error", function(error_type) {
                if (error_type=="text_field") require("notifications").notify({
                    title: _("text_field_error_title"),
                    text: _("text_field_error_text")
                });
                else if (error_type=="generator") require("notifications").notify({
                    title: _("generator_error_title"),
                    text: _("generator_error_text")
                });
            });

            worker.port.on("done", function(success) {
                tab._done = true;
            });

            worker.port.emit("post", data);
        }
    });
}

// add context menu items
var contextMenu = require("context-menu");

contextMenu.Item({
  label: _("share_page"),
  context: contextMenu.PageContext(),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"url", "href":document.URL}); });',
  onMessage: post2friendica
});

contextMenu.Item({
  label: _("share_image"),
  context: contextMenu.SelectorContext("img"),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"img", "src":node.src, "alt":node.alt}); });',
  onMessage: post2friendica
});

contextMenu.Item({
  label: _("share_link"),
  context: contextMenu.SelectorContext("a[href]"),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"url", "href": node.href}); });',
  onMessage: post2friendica
});

contextMenu.Item({
  label: _("share_selection"),
  context: contextMenu.SelectionContext(),
  contentScript: 'self.on("click", function (node, data) { self.postMessage({"type":"quote", "source": document.URL, "title":document.title, "text":window.getSelection().toString()}); });',
  onMessage: post2friendica
});
