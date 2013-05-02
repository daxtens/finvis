var mil = 1000000;
var bil = 1000 * mil;
var tril = 1000 * bil;

var cssStyles = ['revenue', 'expenses', 'assets', 'liabilities'];

function htmlEscape(str) {
  return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
}
