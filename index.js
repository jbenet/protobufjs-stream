var _ = require('underscore');
var through2 = require('through2');
var ByteBuffer = require('bytebuffer');

module.exports = ProtoBufTransformer

function ProtoBufTransformer(proto) {
  if (!(this instanceof ProtoBufTransformer))
    return new ProtoBufTransformer(proto)

  if (!isProtoBufObj(proto))
    throw new Error('must construct object with ProtoBuf')

  this.proto = proto
}


ProtoBufTransformer.prototype.encode = function(obj) {
  return (new this.proto(obj)).encode().toBuffer()
}

ProtoBufTransformer.prototype.decode = function(buffer) {
  return convert(this.proto.decode(buffer)) // copy to get raw object
}

ProtoBufTransformer.prototype.createEncodeStream = function(opts) {
  var encode = this.encode.bind(this);
  opts = _.extend({highWaterMark:16, objectMode:true}, opts)
  return through2(opts, function(obj, enc, next) {
    this.push(encode(obj))
    next()
  })
}

ProtoBufTransformer.prototype.createDecodeStream = function(opts) {
  var decode = this.decode.bind(this);
  opts = _.extend({highWaterMark:16, objectMode:true}, opts)
  return through2(opts, function(obj, enc, next) {
    this.push(decode(obj))
    next()
  })
}

function isProtoBufObj(obj) {
  fns = [obj, obj.decode, obj.decode64, obj.decodeHex]
  return  _.all(fns, _.isFunction)
}

function convert(o) {
  if (_.isNumber(o) || _.isString(o) || _.isDate(o) ||
      _.isBoolean(o) || _.isNull(o) || _.isUndefined(o))
    return o

  if (_.isArray(o))
    return _.map(o, convert)

  if (ByteBuffer.isByteBuffer(o))
    return o.toBuffer()

  if (typeof(o) === 'object') {
    var c = {}
    _.map(o, function(v, k) {
      c[k] = convert(o[k])
    })
    return c
  }

  throw new Error("unknown object: " + obj)
}
