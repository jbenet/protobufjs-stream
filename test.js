var test = require('tape')
var bufeq = require('buffer-equal');
var ProtoBuf = require('protobufjs')
var ProtoBufStream = require('./')

var proto = ProtoBuf.loadProtoFile("nested.proto")
var SR = proto.result.SearchResponse

var testCases = [
  [
    { result: [{ url: "foo.com", title: "FOO", "snippets": ["fff"] }] },
    new Buffer('0a130a07666f6f2e636f6d1203464f4f1a03666666', 'hex')
  ],
  [
    { result: [{ url: "bar.com", title: "BAR", "snippets": ["bbb"] }] },
    new Buffer('0a130a076261722e636f6d12034241521a03626262', 'hex')
  ],
  [
    { result: [{ url: "baz.com", title: "BAZ", "snippets": ["zzz"] }] },
    new Buffer('0a130a0762617a2e636f6d120342415a1a037a7a7a', 'hex')
  ]
]


test('encode works', function(t) {
  var s = ProtoBufStream(SR)
  for (var tc in testCases) {
    tc = testCases[tc]
    t.ok(bufeq(s.encode(tc[0]), tc[1]), 'encoding ' + tc[0].result.url)
  }
  t.end()
})

test('decode works', function(t) {
  var s = ProtoBufStream(SR)
  for (var tc in testCases) {
    tc = testCases[tc]
    t.deepEqual(s.decode(tc[1]), tc[0], 'decoding ' + tc[0].result.url)
  }
  t.end()
})

test('encode stream works', function(t) {
  var s = ProtoBufStream(SR).createEncodeStream()
  for (var tc in testCases) {
    tc = testCases[tc]
    s.write(tc[0])
    t.ok(bufeq(s.read(), tc[1]), 'encoding ' + tc[0].result.url)
  }
  t.end()
})

test('decode stream works', function(t) {
  var s = ProtoBufStream(SR).createDecodeStream()
  for (var tc in testCases) {
    tc = testCases[tc]
    s.write(tc[1])
    t.deepEqual(s.read(), tc[0], 'decoding ' + tc[0].result.url)
  }
  t.end()
})
