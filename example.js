var print = console.log
var ProtoBuf = require('protobufjs')
// var ProtoBufStream = require('protobufjs-stream')
var ProtoBufStream = require('./')

// load the protos using the ProtoBuf library
var protos = ProtoBuf.loadProtoFile("nested.proto")
var SearchResponse = protos.result.SearchResponse

// make a stream-creating object for SearchResponse
var srStreamer = ProtoBufStream(SearchResponse)

print('// you can encode/decode directly (sync).')
var obj = { result: [{ url: "foo.com", title: "FOO", "snippets": ["fff"]}] }
print(srStreamer.encode(obj))

var buf = new Buffer('0a130a07666f6f2e636f6d1203464f4f1a03666666', 'hex')
print(srStreamer.decode(buf))

print('// make streams, yay!')
var enc = srStreamer.createEncodeStream()
var dec = srStreamer.createDecodeStream()

print('// let\'s try encoding')
enc.write({ result: [{ url: "foo.com", title: "FOO", "snippets": ["fff"]}] })
enc.write({ result: [{ url: "bar.com", title: "BAR", "snippets": ["fff"]}] })
enc.write({ result: [{ url: "baz.com", title: "BAZ", "snippets": ["fff"]}] })

print(enc.read())
print(enc.read())
print(enc.read())

print('// let\'s try decoding')
dec.write(new Buffer('0a130a07666f6f2e636f6d1203464f4f1a03666666', 'hex'))
dec.write(new Buffer('0a130a076261722e636f6d12034241521a03626262', 'hex'))
dec.write(new Buffer('0a130a0762617a2e636f6d120342415a1a037a7a7a', 'hex'))

print(dec.read())
print(dec.read())
print(dec.read())

print('// <3 pipes')
enc.pipe(dec)
enc.write({ result: [{ url: "foo.com", title: "FOO", "snippets": ["fff"]}] })
enc.write({ result: [{ url: "bar.com", title: "BAR", "snippets": ["fff"]}] })
enc.write({ result: [{ url: "baz.com", title: "BAZ", "snippets": ["fff"]}] })
dec.on('data', print)
