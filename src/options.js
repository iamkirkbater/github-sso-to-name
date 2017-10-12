function save_options() {
	var urlMatch = document.getElementById("urlMatch").value;
  var apiUrl = document.getElementById("apiUrl").value;
	var idPattern = document.getElementById("idPattern").value;

  chrome.storage.sync.set({
    'gheidname_urlMatch': urlMatch,
    'gheidname_apiUrl': apiUrl,
		'gheidname_idPattern': idPattern,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
      'gheidname_urlMatch': '',
      'gheidname_apiUrl': '',
			'gheidname_idPattern': '',
  }, function(items) {
    document.getElementById('urlMatch').value = items.gheidname_urlMatch;
    document.getElementById('apiUrl').value = items.gheidname_apiUrl;
		document.getElementById('idPattern').value = items.gheidname_idPattern;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  restore_options();
});

document.getElementById('save').addEventListener('click',
    save_options);
