
hexo.extend.helper.register('getPagesInFolder', (site, path) => {
  const folderPath = getFolder(path);

  const ourPages = site.pages.data.filter(page => folderPath === getFolder(page.path));

  ourPages.sort((a, b) => a.order < b.order ? -1 : 1);
  return ourPages;
});

function getFolder (path) {
  return path.substring(0, path.lastIndexOf('/'));
}
