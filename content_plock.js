var plock = {
    iframes : {},
    init: function () {
        this.iframeRefresh(function (){
            chrome.runtime.sendMessage({type: "contentReady", params: {}})
        });
    },
    iframeRefresh: function(callback) {
        var iframes = document.getElementsByTagName("iframe");
        for (var i=0; i<iframes.length; i++) {
            var src = iframes[i].getAttribute('src')
            if (src != undefined && src.length > 0) {
                if (src.indexOf("?") == -1 && src.substr(src.length-1, src.length) != "/") src += "/"
                plock.iframes[src] = iframes[i];
            }
        }
        if (callback != undefined) {
            callback();
        }
    },
    removeIframe: function(params, retry) {
        if (params.link != undefined && params.link.length > 0) {
            var iframe = plock.iframes[params.link];
            if (iframe != undefined && iframe.parentNode != undefined) {
                iframe.parentNode.removeChild(iframe);
            } else if (retry) {
                this.iframeRefresh();
                window.setTimeout(function(){
                    plock.removeIframe(params, false);
                }, 1000);
            }
        }
    }
}

plock.init();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type == "linkPlocked") {
            plock.removeIframe(request.params, true);
        }
    }
);

