var plock = {
    iframes : {},
    init: function () {
        this.iframeRefresh()
    },
    iframeRefresh: function() {
        var iframes = document.getElementsByTagName("iframe");
        for (var i=0; i<iframes.length; i++) {
            var src = iframes[i].getAttribute('src')
            if (src != undefined && src.length > 0) {
                if (src.substr(src.length-1, src.length) != "/") src += "/"
                plock.iframes[src] = iframes[i];
            }
        }
    },
    removeIframe: function(params) {
        if (params.link != undefined && params.link.length > 0) {
            var iframe = plock.iframes[params.link];
            if (iframe != undefined) {
                iframe.parentNode.removeChild(iframe);
            } else {
                this.iframeRefresh();
                var iframe = plock.iframes[params.link];
                if (iframe != undefined) {
                    iframe.parentNode.removeChild(iframe);
                }
            }
        }
    }
}

plock.init();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type == "linkPlocked") {
            plock.removeIframe(request.params);
        }
    }
);