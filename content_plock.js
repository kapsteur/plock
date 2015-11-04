var plock = {
    elements : {},
    init: function () {
        this.elementsRefresh(function (){
            chrome.runtime.sendMessage({type: "contentReady", params: {}})
        });
    },
    elementsRefresh: function(callback) {
        var elements = document.getElementsByTagName("iframe");
        for (var i=0; i<elements.length; i++) {
            var src = elements[i].getAttribute('src')
            if (src != undefined && src.length > 0) {
                if (src.indexOf("?") == -1 && src.substr(src.length-1, src.length) != "/") src += "/"
                plock.elements[src] = elements[i];
            }
        }
        var elements = document.getElementsByTagName("img");
        for (var i=0; i<elements.length; i++) {
            var src = elements[i].getAttribute('src')
            if (src != undefined && src.length > 0) {
                if (src.indexOf("?") == -1 && src.substr(src.length-1, src.length) != "/") src += "/"
                plock.elements[src] = elements[i];
            }
        }
        var elements = document.getElementsByTagName("a");
        for (var i=0; i<elements.length; i++) {
            var src = elements[i].getAttribute('href')
            if (src != undefined && src.length > 0) {
                if (src.indexOf("?") == -1 && src.substr(src.length-1, src.length) != "/") src += "/"
                plock.elements[src] = elements[i];
            }
        }
        if (callback != undefined) {
            callback();
        }
    },
    removeElement: function(params, retry) {
        if (params.link != undefined && params.link.length > 0) {
            var el = plock.elements[params.link];
            if (el != undefined && el.parentNode != undefined) {
                el.parentNode.removeChild(el);
            } else if (retry) {
                this.elementsRefresh();
                window.setTimeout(function(){
                    plock.removeElement(params, false);
                }, 1000);
            }
        }
    }
}

plock.init();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type == "linkPlocked") {
            plock.removeElement(request.params, true);
        }
    }
);

