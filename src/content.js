//


/**
 * Get a list of id's present in aria-label attributes.
 * This should provide support for screen readers / accessibility.
 */
function getAriaLabelIDs(idPattern) {
  var ariaPattern = new RegExp('aria-label="'+idPattern+'"', 'g');
  var regexPattern = new RegExp(idPattern, 'g');
  var ids = _.uniq(_.map(document.body.innerHTML.match(ariaPattern), function(elem) {
    return _.first(elem.match(regexPattern));
  }));

  return ids;
};

/**
 * Parses the name to format if in lastname, firstname format.  If
 * name has been changed in a users profile it should default to that name.
 */
function parseName(name) {
  if (name.indexOf(',') !== -1) {
    var [lastName, firstName] = name.split(",");

    // extract a preffered name from ()
    var preferredName = firstName.match(/\(([^)]+)\)/);

    if (preferredName != null) {
      firstName = preferredName[1];
    }

    name = `${firstName.trim()} ${lastName}`
  }

  return name;
}


/**
 * Main function to replace Enterprise IDs with Display Names.
 */
function replaceEnterpriseIds() {
  chrome.storage.sync.get([
    'gheidname_apiUrl',
    'gheidname_idPattern'
  ], function(items) {
    // the URL to the Enterprise API root, user defined in Extension Options
    var apiUrl = items.gheidname_apiUrl;

    // The regex pattern string to match IDs against.  User defined in Options.
    var idPattern = items.gheidname_idPattern;

    // The id's present in text
    var textIDs = document.body.innerText.match(new RegExp(idPattern, 'g'));

    // The aria-label ids
    var ariaIDs = getAriaLabelIDs(idPattern);

    // Merge the aria ids and text ids and consolidate to a list of unique ids
    var idList = _.uniq(textIDs.concat(ariaIDs));

    // All elements on the page
    var elements = document.getElementsByTagName('*');

    // iterate over every unique id
    _.each(idList, function(id) {

      // Fetch the user's name using the GitHub API
      $.getJSON(`${apiUrl}/users/${id}`, function(data) {
        const name = parseName(data.name);

        // set the aria-labels to the user's name
        $(`[aria-label=${id}]`).attr('aria-label', name);

        // loop over all the html nodes and replace any text matching the id
        // with the user's name.
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];

            for (var j = 0; j < element.childNodes.length; j++) {
                var node = element.childNodes[j];

                if (node.nodeType === 3) {
                    var text = node.nodeValue;
                    var replacedText = text.replace(new RegExp(`${id}`, "g"), name);

                    if (replacedText !== text) {
                        element.replaceChild(document.createTextNode(replacedText), node);
                    }
                }
            }
        }
      });
    });
  });
};


/**
 * Get the URL Match from Chrome Sync Storage and run the script.  If the
 * options were never set this shouldn't ever run on any pages.
 */
chrome.storage.sync.get([
  'gheidname_urlMatch'
], function(items) {
  var locationMatch = items.gheidname_urlMatch;

  if (locationMatch) {
    if (window.location.href.indexOf(locationMatch) >= 0) {

      // the rest of this is to accomodate GitHub's use of pjax for certain
      // page transitions
      window.addEventListener("pageLoadTransition", replaceEnterpriseIds);

      var s = document.createElement('script');
      s.src = chrome.extension.getURL('inject.js');
      s.onload = function() {
        this.parentNode.removeChild(this);
      };
      (document.head||document.documentElement).appendChild(s);

      // Do the thing.
      replaceEnterpriseIds();
    }
  }
});
