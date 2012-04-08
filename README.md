Description
-----------

This is the post2friendica add-on (Open Source, MIT License). It adds entries to the context menu which allow the user to share images, links, the page URL or a selection on his Friendica account easily:
A new tab with a configurable Friendica site is opened, and the item is inserted into the textarea. The user can still edit or add something before posting.

It works by injecting Javascript into the newly opened tab with the content script injection technique (http://wiki.greasespot.net/Content_Script_Injection). The injected scripts are based on the jotShare and jotGetLink functions from Friendica, so if the interface used by these functions changes, the addon will probably stop working.

Translation
-----------

Messages are translated on transifex: https://www.transifex.net/projects/p/post2friendica/

Developer info
--------------

The addon is built with the Add-on SDK of Firefox (https://addons.mozilla.org/en-US/developers/builder). Due to the security concepts of Firefox, three layers are needed to inject the necessary script into the Friendica site:

* lib/main.js configures the context menu items and opens a new tab with the Friendica site. main.js is not allowed to touch the DOM of the newly opened tab, therefore a so-called "content script" is attached to the tab.
* data/contentscript.js is allowed to touch the DOM, but has (again for security reasons) no access to Javascript variables of the Friendica page. Therefore a script tag is appended to the DOM. This is the so-called "content script injection technique" (http://wiki.greasespot.net/Content_Script_Injection).
* This script tag contains the necessary Javascript to insert something into the text area (see InsertHTMLScript and InsertURLScript variables in data/contentscript.js).

Communication between these three layers, i.e. sending the item that should be shared from one layer to the next, works with events.
