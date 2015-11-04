data = {
  "hosts":[],
  "paths":{}
}
hosts = new Set(data.hosts);
tabs = {};

//Update hosts set and paths set
function updateData(fallback) {
  var url = 'https://raw.githubusercontent.com/kapsteur/plock/master/data.json';
  if (fallback) {
    url = chrome.extension.getURL('data.json');
  }
  console.log("updateData fallback:"+fallback);
  var xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if(xhr.status == 200) {
        console.log('url:'+url);
        data = JSON.parse(xhr.responseText);
        console.log(data);
        if (data.hosts != undefined && data.hosts.length > 0) {
          hosts = new Set(data.hosts);
        }
      }
    }
    if (!fallback) {
      updateData(true);
    }
  }
  xhr.send();
}
updateData(false);

//Init tabs
chrome.tabs.query({}, function(allTabs) {
  for (var i=0; i<allTabs.length; i++) {
    var tab = allTabs[i];
    if (tabs[tab.id] == undefined) {
      tabs[tab.id] = {'block':true, 'url':tab.url, 'lockedUrls':[], 'count':0, 'contentReady':false};
    };
  }
});

//Update tabs
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (tabs[tab.id] == undefined) {
      tabs[tab.id] = {'block':true, 'url':tab.url, 'count':0};
    };
    if (tabs[tab.id]['block']) {
      chrome.browserAction.setIcon({path: "/img/plock.png"});
    } else {
      chrome.browserAction.setIcon({path: "/img/plock_ok.png"});
    }
  });
});

//Update tabs url
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
    if (changeInfo != undefined && changeInfo.url != undefined) {
      if (tabs[tabId] == undefined) {
        tabs[tabId] = {'block':true, 'url':changeInfo.url, 'lockedUrls':[], 'count':0, 'contentReady':false};
      } else {
        tabs[tabId]['url'] = changeInfo.url;
        tabs[tabId]['count'] = 0;
      }
      updateBadge();
    } else if (changeInfo != undefined && changeInfo.status == "loading" ) {
      if (tabs[tabId] != undefined) {
        tabs[tabId]['count'] = 0;
      }
      updateBadge();
    }
});

//Update tabs url
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    delete tabs[tabId];
});

//Update tabs block
chrome.browserAction.onClicked.addListener(function(tab) {
  if (tabs[tab.id]['block']) {
    tabs[tab.id]['block'] = false;
    chrome.browserAction.setIcon({path: "/img/plock_ok.png"});
  } else {
    tabs[tab.id]['block'] = true;
    chrome.browserAction.setIcon({path: "/img/plock.png"});
  }
  chrome.tabs.reload(tab.id);
});

//block request if needed
var block = function(details) {
  if (tabs[details.tabId] != undefined && tabs[details.tabId]['block']) {
    //Extract request domain
    var parser = document.createElement('a');
    parser.href = details.url;
    var hostname = parser.hostname;
    var masterHostName = null;
    var hostnameArray = hostname.split('.');
    if (hostnameArray.length > 1) {
      masterHostName = hostnameArray[hostnameArray.length-2]+'.'+hostnameArray[hostnameArray.length-1];
    }
    //If requested url = toto.bibi.com/test
    if (masterHostName != null) {
      //test masterHostName = bibi.com
      if (hosts.has(masterHostName)) {
        return lock(details.tabId, details.url);
      }
      //test path = bibi.com/test
      if (data.paths[masterHostName] != undefined) {
        for (var i=0; i<data.paths[masterHostName].length; i++) {
          if (parser.pathname.indexOf(data.paths[masterHostName][i]) != -1) {
            return lock(details.tabId, details.url);
          }
        }
      }
    }
    //test hostname = toto.bibi.com
    if (hosts.has(hostname)) {
      return lock(details.tabId, details.url);
    }
    //test path = toto.bibi.com/test
    if (data.paths[hostname] != undefined) {
      for (var i=0; i<data.paths[hostname].length; i++) {
        if (pathname.indexOf(data.paths[hostname][i]) != -1) {
          return lock(details.tabId, details.url);
        }
      }
    }
    return {};
  }
}

//Listen request
chrome.webRequest.onBeforeRequest.addListener(block, {urls: ["<all_urls>"]}, ["blocking"]);

function lock(tabId, url) {
  tabs[tabId]['count']++;
  updateBadge();
  if (tabs[tabId].contentReady) {
    chrome.tabs.sendMessage(tabId, {type: "linkPlocked", params: {link:url}});
  } else {
    tabs[tabId].lockedUrls.push(url);
  }
  return {redirectUrl:"javascript:"};
}

//Update icon badge
function updateBadge() {
  chrome.tabs.query({'active': true}, function(allTabs) {
    for (var i=0; i<allTabs.length; i++) {
      var tab = allTabs[i];
      if (tabs[tab.id] != undefined && tabs[tab.id]['count'] > 0) {
        chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 255], tabId:tab.id});
        chrome.browserAction.setBadgeText({text: ""+tabs[tab.id]['count'], tabId:tab.id});
      } else {
        chrome.browserAction.setBadgeText({text: "", tabId:tab.id});
      }
    }
  });
}

//Know when tab is ready
function contentReady(tabId) {
  var tab = tabs[tabId];
  tab.contentReady = true;
  for (var i=0; i<tab.lockedUrls.length; i++) {
    chrome.tabs.sendMessage(tabId, {type: "linkPlocked", params: {link:tab.lockedUrls[i]}});
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, callback) {
    if (request.type == "contentReady") {
      contentReady(sender.tab.id);
    }
  }
);