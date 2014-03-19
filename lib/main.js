// localization
var _ = require("sdk/l10n").get;

// open configuration tab if network_url is still the default value
simplePrefs = require("sdk/simple-prefs");
if (simplePrefs.prefs.network_url=="http://example.com/network") {
  require("sdk/tabs").open({
    url: require("sdk/self").data.url("configuration.html"),
    onOpen: function(tab) {
      tab.on("ready", function(tab) {
        var worker = tab.attach({
          contentScriptFile: require("sdk/self").data.url("configuration.js"),
          contentScriptWhen: "end"
        });

        // register callbacks
        worker.port.on("configure", function(configuration) {
          for (prop in configuration) {
            simplePrefs.prefs[prop] = configuration[prop];
          }

          worker.port.emit("done");
        });

        worker.port.on("close", function(data) {
          tab.close();
        });
      });
    }
  });
}

// opens a new tab with friendica, attaches a content script and sends the data to it
function post2friendica(data) {
  var attach_worker = function(tab) {
    var worker = tab.attach({
      contentScriptFile: require("sdk/self").data.url("contentscript.js"),
      contentScriptWhen: "ready"
    });

    worker.port.on("error", function(error_type) {
      if (error_type=="text_field") require("sdk/notifications").notify({
        title: _("text_field_error_title"),
        text: _("text_field_error_text")
      });
      else if (error_type=="generator") require("sdk/notifications").notify({
        title: _("generator_error_title"),
        text: _("generator_error_text")
      });
    });

    worker.port.on("done", function(success) {
      tab.removeListener("ready", attach_worker);
    });

    worker.port.emit("post", data);
  }

  require("sdk/tabs").open({
    url: simplePrefs.prefs.network_url,
    onOpen: function onOpen(tab) {
      tab.on("ready", attach_worker);
    }
  });
}

// add context menu items
var contextMenu = require("sdk/context-menu");

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
