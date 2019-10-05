var path = require('path');
var fs = require('fs');
var filesize = require('filesize');
var URL = require('url');

/**
 * Promisified readdir
 */
async function readdir(path) {
  return new Promise(function (resolve, reject) {
    fs.readdir(path, function (err, list) {
      if (err) return reject(err); resolve(list);
    })
  })
}

/**
 * Promisified stat, keeping name
 */
async function stat(dir, filePath) {
  return new Promise(function (resolve, reject) {
    fs.stat(path.join(dir, filePath), function (err, stats) {
      if (err) return reject(err);
      stats.name = filePath;
      resolve(stats);
    });
  })
}

function li(html) { return '<li>' + html + '</li>'; }

/**
 * Generate html of directory listing
 */
async function directoryListing(dirPath, url) {
  var files = await readdir(dirPath);
  var details = await Promise.all(files.map(filePath => stat(dirPath, filePath)));

  var li = details.map(function (file) {
    var href = URL.resolve(url, file.name);
    return '<a href=' + href + '>' + file.name + ' (' + filesize(file.size) + ')' + '</a>';
  }).map(li).join('');

  var folderName = path.basename(dirPath);
  return '<h1>' + folderName + '</h1><ul>' + li + '</ul>';
}

/**
 * Return middleware
 */
function static(_options) {
  var options = Object.assign({}, _options);

  // baseUrl is used for links in directory listings
  var baseUrl = options.baseUrl || '/';
  if (!baseUrl.endsWith('/')) { baseUrl = baseUrl + '/'; }

  var rootDir = path.resolve(options.rootDir);

  var sendFileOpts = Object.assign({
    root: rootDir
  }, _options.sendFileOpts);

  return async function staticFileServer(req, res, next) {
    var fullPath = path.join(rootDir, req.url);
    var filename = path.basename(req.url);
    try {
      var stats = await stat(rootDir, req.url);

      if (stats.isFile()) {
        res.header('Content-Disposition', 'attachment; filename="' + filename + '"');
        fs.createReadStream(fullPath).pipe(res);
        return;
      }
      else if (stats.isDirectory()) {
        return res.send(await directoryListing(fullPath, baseUrl));
      }
    } catch(e) {
      next(e);
    }
  };
}

module.exports = static;
