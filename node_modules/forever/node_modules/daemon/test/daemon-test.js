/*
 * daemon-test.js: Tests for the daemon module
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */
 
var assert = require('assert'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    spawn = require('child_process').spawn,
    vows = require('vows'),
    daemon = require('../lib/daemon');

var fixturesDir = path.join(__dirname, 'fixtures'),
    examplesDir = path.join(__dirname, '..', 'examples'),
    bindings = path.join(examplesDir, 'bindings.js'),
    wrapper = path.join(examplesDir, 'wrapper.js');

function runExample(args, callback) {
  var child = spawn('node', args)
  
  child.stderr.on('data', function (d) {
    console.log('' + d);
  })
  
  child.on('exit', function () {
    if (args[1] === 'stop') {
      return callback();
    }
    
    http.get({
      host: 'localhost', 
      port: 8000,
      path: '/'
    }, function (res) {
      var data = '';
      res.on('data', function (d) {
        data += d;
      });
      
      res.on('end', function () {
        callback(null, data);
      });
    });
  });
}

function assertStop(args) {
  args[1] = 'stop';
  
  return {
    topic: function () {
      var that = this;
      
      this.pid = parseInt(fs.readFileSync(args[2], 'utf8'), 10);
      process.nextTick(function () {
        runExample(args.splice(0, 3), that.callback);
      });
    },
    "it should stop correctly": function () {
      var pid = this.pid;
      assert.throws(function () { process.kill(pid, 0) });
      args.forEach(function (file) {
        fs.unlinkSync(file);
      });
    }
  }
}

function assertStartStop(args) {
  return {
    topic: function () {
      runExample(args, this.callback);
    },
    "it should respond correctly": function (_, data) {
      assert.equal(data, 'I know nodejitsu.');
    },
    "when stopped": assertStop(args.slice())
  }
}

vows.describe('daemon').addBatch({
  "When spawning a daemon": {
    "using the raw bindings": assertStartStop([
      bindings,
      'start',
      path.join(fixturesDir, 'bindings.pid'),
      path.join(fixturesDir, 'bindings.log') 
    ])
  }
}).addBatch({
  "When spawning a daemon": {
    "using the Javascript wrapper": {
      "with only a single file": assertStartStop([
        wrapper,
        'start',
        path.join(fixturesDir, 'both.pid'),
        path.join(fixturesDir, 'both.log') 
      ])
    }
  }
}).addBatch({
  "When spawning a daemon": {
    "using the Javascript wrapper": {    
      "with files for both stdout and stderr": assertStartStop([
        wrapper,
        'start',
        path.join(fixturesDir, 'twofiles.pid'),
        path.join(fixturesDir, 'stdout.log'),
        path.join(fixturesDir, 'stderr.log')
      ])
    }
  }
}).export(module);