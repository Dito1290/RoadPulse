ObjC.import('Quartz');
function run(argv) {
  const doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(argv[0]));
  if (!doc || doc.isNil()) return 'CANNOT_OPEN';
  const n = doc.pageCount; const max = argv[1] ? parseInt(argv[1]) : n;
  let out = 'PAGES=' + n + '\n';
  for (let i = 0; i < Math.min(n, max); i++) out += '\n=== page ' + (i+1) + ' ===\n' + ObjC.unwrap(doc.pageAtIndex(i).string);
  return out;
}
