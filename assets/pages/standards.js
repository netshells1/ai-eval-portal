window.initPortalPage = function ({ $ }) {
  var standardEntries = window.InquiryStandards && window.InquiryStandards.entries;
  if (Array.isArray(standardEntries)) {
    ['省级', '市级'].forEach(function (level) {
      var group = document.createElement('div');
      var label = document.createElement('dt');
      var count = document.createElement('dd');
      label.textContent = level + '条目';
      count.textContent = standardEntries.filter(function (entry) { return entry.level === level; }).length;
      group.append(label, count);
      $('#standards-scope-counts').append(group);
    });
  }
};
