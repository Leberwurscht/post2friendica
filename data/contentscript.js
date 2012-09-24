//  taken from the Friendica jotShare function (view/jot-header.tpl)
InsertHTMLScript = 'window.addEventListener("message", function(ev) { if (!editor) $("#profile-jot-text").val(""); initEditor(function() { tinyMCE.execCommand("mceInsertRawHTML", false, ev.data); }); }, false);'

//  taken from the Friendica jotGetLink function (view/jot-header.tpl)
InsertURLScript = 'window.addEventListener("message", function(ev) { reply = bin2hex(ev.data); $.get("parse_url?binurl=" + reply, function(data) { if (!editor) $("#profile-jot-text").val(""); initEditor(function() { tinyMCE.execCommand("mceInsertRawHTML", false, data); }); }); }, false);';

// functions to insert items into the Friendica textarea
function insertURL(href) {
  // inject the javascript
  // http://wiki.greasespot.net/Content_Script_Injection
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.textContent = InsertURLScript;
  document.body.appendChild(script);
  document.body.removeChild(script);

  document.defaultView.postMessage(href, '*');
}

function insertImage(src, alt) {
  // create html code to insert
  // http://stackoverflow.com/questions/2474605/how-to-convert-a-htmlelement-to-a-string
  var container = document.createElement("div");
  var el = document.createElement("img");
  el.setAttribute('src', src);
  el.setAttribute('alt', alt);
  container.appendChild(el);
  htmlcode = container.innerHTML;

  // inject the javascript
  // http://wiki.greasespot.net/Content_Script_Injection
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.textContent = InsertHTMLScript;
  document.body.appendChild(script);
  document.body.removeChild(script);

  document.defaultView.postMessage(htmlcode, '*');
}

function insertQuote(source, title, text) {
  // create html code to insert
  // http://stackoverflow.com/questions/2474605/how-to-convert-a-htmlelement-to-a-string
  var container = document.createElement("div");
  var el = document.createElement("a");
  el.setAttribute("href", source);
  el.setAttribute("class", "bookmark");
  el.textContent = title;
  container.appendChild(el);

  var el = document.createElement("br");
  container.appendChild(el);

  var el = document.createElement("br");
  container.appendChild(el);

  var el = document.createElement("blockquote");
  el.textContent = text;
  container.appendChild(el);

  var el = document.createElement("br");
  container.appendChild(el);

  htmlcode = container.innerHTML;

  // inject the javascript
  // http://wiki.greasespot.net/Content_Script_Injection
  var script = document.createElement('script');
  script.setAttribute("type", "application/javascript");
  script.textContent = InsertHTMLScript;
  document.body.appendChild(script);
  document.body.removeChild(script);

  document.defaultView.postMessage(htmlcode, '*');
}

// callback for the "post" event from main.js
self.port.on("post", function(data) {
  // get generator meta tag
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

    // insert item if text field present
    if (document.getElementById("profile-jot-text")) {
      if (data.type=="url") {
        insertURL(data.href);
      }
      else if (data.type=="img") {
        insertImage(data.src, data.alt);
      }
      else if (data.type="quote") {
        insertQuote(data.source, data.title, data.text);
      }
    }
    else {
      self.port.emit("error", "text_field");
    }
  }
  else {
    self.port.emit("error", "generator");
  }

  // notify main.js that the content script should no longer be attached when a new site loads in the tab
  self.port.emit("done", true);
});
