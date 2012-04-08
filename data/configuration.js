var success_message;

// callback for "localize" message from main.js
self.port.on("localize", function(data) {
    document.getElementById("configuration_title").textContent = data["configuration_title"];
    document.getElementById("configuration_header").textContent = data["configuration_header"];
    document.getElementById("configuration_text").textContent = data["configuration_text"];
    document.getElementById("network_url_caption").textContent = data["network_url_caption"];
    document.getElementById("submit").value = data["submit"];
    success_message = data["configuration_successful"];
});

// callback for "done" message from main.js
self.port.on("done", function(data) {
    alert(success_message);
    self.port.emit("close");
});

// add callback for form submission event
document.getElementById("submit").addEventListener("click", function() {
    network_url = document.forms[0].elements["network_url"].value;
    self.port.emit("configure", {"network_url":network_url});
    return false;
});
