window.initPortalPage = function ({ $ }) {
  var standardEntries = window.InquiryStandards && window.InquiryStandards.entries;
  if (Array.isArray(standardEntries)) {
    [
      { key: '国家级', label: '国家政策' },
      { key: '省级', label: '省级条目' },
      { key: '市级', label: '市级条目' }
    ].forEach(function (item) {
      var group = document.createElement('div');
      var label = document.createElement('dt');
      var count = document.createElement('dd');
      label.textContent = item.label;
      count.textContent = standardEntries.filter(function (entry) { return entry.level === item.key; }).length;
      group.append(label, count);
      $('#standards-scope-counts').append(group);
    });
  }
};
