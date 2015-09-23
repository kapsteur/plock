hosts = [
  'googleadservices',
  'googlesyndication',
  'a2dfp',
  'ad6media',
  'adbrite',
  'adcash',
  'adknowledge',
  'adnext',
  'adnxs',
  'adsdk',
  'atdmt',
  'atwola',
  'bfast',
  'beead',
  'criteo',
  'ezakus',
  'falkag',
  'himediads',
  'infolinks',
  'kameleoon',
  'ligatus',
  'outbrain',
  'qksrv',
  'skimresources',
  'tradedoubler',
  'tradelab',
  'visualrevenue',
  'doubleclick',
  'blogads',
  'click-fr',
  'ebz.io',
  'edi7',
  'eficiens-',
  'media-clic',
  'netavenir',
  'piximedia',
  'promobenef',
  'pubdirecte',
  'rentabiliweb',
  'sascdn.com',
  'adverpub',
  'deltapub',
  'gestionpub',
  'manchettepub',
  'regiedepub',
  'regypub',
  'storpub',
  'clickthru',
  'taboola',
  'smartadserver.com',
  'r66net.com',
  'videostep.com',
  'scorecardresearch.com',
  'exoclick.com',
];

var tabs = {};

//Init tabs
chrome.tabs.query({}, function(allTabs) {
  for (var i=0; i<allTabs.length; i++) {
    var tab = allTabs[i];
    if (tabs[tab.id] == undefined) {
      tabs[tab.id] = {'block':true, 'url':tab.url, 'count':0};
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
      chrome.browserAction.setIcon({path: "plock.png"});
    } else {
      chrome.browserAction.setIcon({path: "plock_ok.png"});
    }
  });
});

//Update tabs url
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
    if (changeInfo.url != undefined) {
      tabs[tabId]['url'] = changeInfo.url;
      tabs[tabId]['count'] = 0;
      updateBadge();
    }
});

//Update tabs block
chrome.browserAction.onClicked.addListener(function(tab) {
  if (tabs[tab.id]['block']) {
    tabs[tab.id]['block'] = false;
    chrome.browserAction.setIcon({path: "plock_ok.png"});
  } else {
    tabs[tab.id]['block'] = true;
    chrome.browserAction.setIcon({path: "plock.png"});
  }
  chrome.tabs.reload(tab.id);
});

//block request if needed
var block = function(details) {
  if (tabs[details.tabId] != undefined && tabs[details.tabId]['block']) {
    var parser = document.createElement('a');
    parser.href = details.url;
    for (var i=0; i<hosts.length; i++) {
      if (parser.hostname.indexOf(hosts[i]) != -1) {
        tabs[details.tabId]['count']++;
        updateBadge();
        return {cancel:true};
      }
    }
    return {};
  }
}

//Listen request
chrome.webRequest.onBeforeRequest.addListener(
  block,
  {urls: ["<all_urls>"]},
  ["blocking"]);

//Update icon badge
function updateBadge() {
  chrome.tabs.query({'active': true}, function(allTabs) {
    var tab = allTabs[0];
    if (tabs[tab.id]['count']>0) {
      chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 255], tabId:tab.id});
      chrome.browserAction.setBadgeText({text: ""+tabs[tab.id]['count'], tabId:tab.id});
    } else {
      chrome.browserAction.setBadgeText({text: "", tabId:tab.id});
    }
  });
}