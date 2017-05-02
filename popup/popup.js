var URL = "https://www.nitrotype.com/race";
var a = document.getElementById('a');
a.onclick = function() {
    var w = window.open(URL, '_blank');
    w.focus();
}