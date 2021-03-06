var DataFile, WordNetFile, fs, get, util;

WordNetFile = require('./wordnet_file');

fs = require('fs');

util = require('util');

get = function(location, callback) {
  var buff;
  buff = new Buffer(4096);
  return this.open(function(err, fd) {
    return WordNetFile.appendLineChar(fd, location, 0, buff, function(line) {
      var data, definition, element, examples, glossArray, i, k, ptrOffset, ptrs, synonyms, tokens, wCnt, _i, _j, _k, _len, _ref, _ref1;
      data = line.split('| ');
      tokens = data[0].split(/\s+/);
      ptrs = [];
      wCnt = parseInt(tokens[3], 16);
      synonyms = [];
      for (i = _i = 0, _ref = wCnt - 1; _i <= _ref; i = _i += 1) {
        synonyms.push(tokens[4 + i * 2]);
      }
      ptrOffset = (wCnt - 1) * 2 + 6;
      for (i = _j = 0, _ref1 = parseInt(tokens[ptrOffset], 10) - 1; _j <= _ref1; i = _j += 1) {
        ptrs.push({
          pointerSymbol: tokens[ptrOffset + 1 + i * 4],
          synsetOffset: parseInt(tokens[ptrOffset + 2 + i * 4], 10),
          pos: tokens[ptrOffset + 3 + i * 4],
          sourceTarget: tokens[ptrOffset + 4 + i * 4]
        });
      }
      glossArray = data[1].split("; ");
      definition = glossArray[0];
      examples = glossArray.slice(1);
      for (k = _k = 0, _len = examples.length; _k < _len; k = ++_k) {
        element = examples[k];
        examples[k] = examples[k].replace(/\"/g, '').replace(/\s\s+/g, '');
      }
      return callback({
        synsetOffset: parseInt(tokens[0], 10),
        lexFilenum: parseInt(tokens[1], 10),
        pos: tokens[2],
        wCnt: wCnt,
        lemma: tokens[4],
        synonyms: synonyms,
        lexId: tokens[5],
        ptrs: ptrs,
        gloss: data[1],
        def: definition,
        exp: examples
      });
    });
  });
};

DataFile = function(dataDir, name) {
  return WordNetFile.call(this, dataDir, 'data.' + name);
};

util.inherits(DataFile, WordNetFile);

DataFile.prototype.get = get;

module.exports = DataFile;
