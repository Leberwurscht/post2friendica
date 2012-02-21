simplePrefs = require("simple-prefs")
if (simplePrefs.prefs.profile_url=="http://example.com/network")
{
	var notifications = require("notifications");
	notifications.notify({
	  title: "Profile URL needed",
	  text: "You need to tell the post2friendica addon the URL of your Friendica profile. You can configure it in the addon preferences.",
	});
}

function post2friendica(text){
    require("tabs").open({
        url: simplePrefs.prefs.profile_url,
        onReady: function onReady(tab) {
            var data = require("self").data;
            worker = tab.attach({
                contentScriptFile: data.url("contentscript.js")
    		});
            worker.postMessage(text);
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
