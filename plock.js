hosts = [
  '.a2dfp',
  '.ad6media',
  '.adbrite',
  '.adcash',
  '.adknowledge',
  '.adnext',
  '.adnxs',
  '.adsdk',
  '.atdmt',
  '.atwola',
  '.bfast',
  '.beead',
  '.criteo',
  '.ezakus',
  '.falkag',
  '.himediads',
  '.infolinks',
  '.kameleoon',
  '.ligatus',
  '.outbrain',
  '.qksrv',
  '.skimresources',
  '.tradedoubler',
  '.tradelab',
  '.visualrevenue',
  '.doubleclick',
  '.blogads',
  '.click-fr',
  '.ebz.io',
  '.edi7',
  '.eficiens-',
  '.media-clic',
  '.netavenir',
  '.piximedia',
  '.promobenef',
  '.pubdirecte',
  '.rentabiliweb',
  '.sascdn.com',
  '.adverpub',
  '.deltapub',
  '.gestionpub',
  '.manchettepub',
  '.regiedepub',
  '.regypub',
  '.storpub',
  '.googleadservices',
  '.googlesyndication',
  '.clickthru',
  '.taboola',
];

var rules = {
  conditions: new Array(hosts.length),
  actions: [
    new chrome.declarativeWebRequest.CancelRequest()
  ]};

for (var i=0; i<hosts.length; i++) {
  rules.conditions[i] = new chrome.declarativeWebRequest.RequestMatcher({
    url: { hostContains: hosts[i] } }
  )
}

chrome.declarativeWebRequest.onRequest.addRules([rules]);