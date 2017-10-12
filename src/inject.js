$(document).on('pjax:success', function() {
  var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent("pageLoadTransition", true, true, null);
    document.dispatchEvent(evt);
})
