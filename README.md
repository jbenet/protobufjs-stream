# ProtoBuf-stream

This module makes streams out of [ProtoBuf](https://github.com/dcodeIO/ProtoBuf.js).

Interface designed against [mafintosh/protocol-buffers](https://github.com/mafintosh/protocol-buffers/). You should use that module if you can. Use this one for now if you need unsupported protobuf features (nesting, enums, etc). Expect this to be deprecated if/when mafintosh's module does everything.

## Usage

Given:

```sh
> cat nested.js
```

```protobuf
message SearchResponse {
  message Result {
    required string url = 1;
    optional string title = 2;
    repeated string snippets = 3;
  }
  repeated Result result = 1;
}
```

You can:

```js
var ProtoBuf = require('protobufjs')
var ProtoBufStream = require('protobufjs-stream')

// load the protos using the ProtoBuf library
var protos = ProtoBuf.loadProtoFile("nested.proto")
var SearchResponse = protos.result.SearchResponse

// make a stream-creating object for SearchResponse
var srStreamer = ProtoBufStream(SearchResponse)

// you can encode/decode directly (sync).
srStreamer.encode({ result: [{ url: "foo.com", title: "FOO", "snippets": ["fff"]}] })
srStreamer.decode(new Buffer('0a130a07666f6f2e636f6d1203464f4f1a03666666', 'hex'))
```

### make streams, yay!

```
var enc = srStreamer.createEncodeStream()
var dec = srStreamer.createDecodeStream()

// let's try encoding
enc.write({ result: [{ url: "foo.com", title: "FOO", "snippets": ["fff"]}] })
enc.write({ result: [{ url: "bar.com", title: "BAR", "snippets": ["fff"]}] })
enc.write({ result: [{ url: "baz.com", title: "BAZ", "snippets": ["fff"]}] })

enc.read()
enc.read()
enc.read()

// let's try decoding
dec.write(new Buffer('0a130a07666f6f2e636f6d1203464f4f1a03666666', 'hex'))
dec.write(new Buffer('0a130a076261722e636f6d12034241521a03626262', 'hex'))
dec.write(new Buffer('0a130a0762617a2e636f6d120342415a1a037a7a7a', 'hex'))

dec.read()
dec.read()
dec.read()

// <3 pipes
enc.pipe(dec)
enc.write({ result: [{ url: "foo.com", title: "FOO", "snippets": ["fff"]}] })
dec.read()
```

