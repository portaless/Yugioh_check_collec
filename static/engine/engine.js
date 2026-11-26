var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    var i;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
        );
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
        );
      }
      return parts.join("");
    }
  }
});

// node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  "node_modules/ieee754/index.js"(exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer[offset + i - d] |= s * 128;
    };
  }
});

// node_modules/buffer/index.js
var require_buffer = __commonJS({
  "node_modules/buffer/index.js"(exports) {
    "use strict";
    var base64 = require_base64_js();
    var ieee754 = require_ieee754();
    var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer3;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
      console.error(
        "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
      );
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1);
        const proto = { foo: function() {
          return 42;
        } };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e) {
        return false;
      }
    }
    Object.defineProperty(Buffer3.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer3.isBuffer(this)) return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer3.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer3.isBuffer(this)) return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      const buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer3.prototype);
      return buf;
    }
    function Buffer3(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    Buffer3.poolSize = 8192;
    function from(value, encodingOrOffset, length) {
      if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value);
      }
      if (value == null) {
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof value === "number") {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      }
      const valueOf = value.valueOf && value.valueOf();
      if (valueOf != null && valueOf !== value) {
        return Buffer3.from(valueOf, encodingOrOffset, length);
      }
      const b = fromObject(value);
      if (b) return b;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
        return Buffer3.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
      }
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
      );
    }
    Buffer3.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer3, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== void 0) {
        return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }
    Buffer3.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer3.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer3.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer3.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      const length = byteLength(string, encoding) | 0;
      let buf = createBuffer(length);
      const actual = buf.write(string, encoding);
      if (actual !== length) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0;
      const buf = createBuffer(length);
      for (let i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      let buf;
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array);
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }
      Object.setPrototypeOf(buf, Buffer3.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer3.isBuffer(obj)) {
        const len = checked(obj.length) | 0;
        const buf = createBuffer(len);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length | 0;
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer3.alloc(+length);
    }
    Buffer3.isBuffer = function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer3.prototype;
    };
    Buffer3.compare = function compare(a, b) {
      if (isInstance(a, Uint8Array)) a = Buffer3.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array)) b = Buffer3.from(b, b.offset, b.byteLength);
      if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      }
      if (a === b) return 0;
      let x = a.length;
      let y = b.length;
      for (let i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    Buffer3.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer3.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer3.alloc(0);
      }
      let i;
      if (length === void 0) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }
      const buffer = Buffer3.allocUnsafe(length);
      let pos = 0;
      for (i = 0; i < list.length; ++i) {
        let buf = list[i];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf);
            buf.copy(buffer, pos);
          } else {
            Uint8Array.prototype.set.call(
              buffer,
              buf,
              pos
            );
          }
        } else if (!Buffer3.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer, pos);
        }
        pos += buf.length;
      }
      return buffer;
    };
    function byteLength(string, encoding) {
      if (Buffer3.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== "string") {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
        );
      }
      const len = string.length;
      const mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0) return 0;
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len;
          case "utf8":
          case "utf-8":
            return utf8ToBytes(string).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2;
          case "hex":
            return len >>> 1;
          case "base64":
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer3.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      let loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding) encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer3.prototype._isBuffer = true;
    function swap(b, n, m) {
      const i = b[n];
      b[n] = b[m];
      b[m] = i;
    }
    Buffer3.prototype.swap16 = function swap16() {
      const len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this;
    };
    Buffer3.prototype.swap32 = function swap32() {
      const len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    };
    Buffer3.prototype.swap64 = function swap64() {
      const len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (let i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    };
    Buffer3.prototype.toString = function toString() {
      const length = this.length;
      if (length === 0) return "";
      if (arguments.length === 0) return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
    Buffer3.prototype.equals = function equals(b) {
      if (!Buffer3.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
      if (this === b) return true;
      return Buffer3.compare(this, b) === 0;
    };
    Buffer3.prototype.inspect = function inspect() {
      let str = "";
      const max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max) str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
    }
    Buffer3.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer3.from(target, target.offset, target.byteLength);
      }
      if (!Buffer3.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
        );
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target) return 0;
      let x = thisEnd - thisStart;
      let y = end - start;
      const len = Math.min(x, y);
      const thisCopy = this.slice(thisStart, thisEnd);
      const targetCopy = target.slice(start, end);
      for (let i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (buffer.length === 0) return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
      }
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
      }
      if (typeof val === "string") {
        val = Buffer3.from(val, encoding);
      }
      if (Buffer3.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1;
      let arrLength = arr.length;
      let valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i2) {
        if (indexSize === 1) {
          return buf[i2];
        } else {
          return buf.readUInt16BE(i2 * indexSize);
        }
      }
      let i;
      if (dir) {
        let foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          let found = true;
          for (let j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
          }
          if (found) return i;
        }
      }
      return -1;
    }
    Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer3.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer3.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      const remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }
      const strLen = string.length;
      if (length > strLen / 2) {
        length = strLen / 2;
      }
      let i;
      for (i = 0; i < length; ++i) {
        const parsed = parseInt(string.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed)) return i;
        buf[offset + i] = parsed;
      }
      return i;
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    Buffer3.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === void 0) encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      }
      const remaining = this.length - offset;
      if (length === void 0 || length > remaining) length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding) encoding = "utf8";
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer3.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      const res = [];
      let i = start;
      while (i < end) {
        const firstByte = buf[i];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    var MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      const len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      let res = "";
      let i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res;
    }
    function asciiSlice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret;
    }
    function hexSlice(buf, start, end) {
      const len = buf.length;
      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;
      let out = "";
      for (let i = start; i < end; ++i) {
        out += hexSliceLookupTable[buf[i]];
      }
      return out;
    }
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end);
      let res = "";
      for (let i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res;
    }
    Buffer3.prototype.slice = function slice(start, end) {
      const len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start) end = start;
      const newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer3.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
      if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      return val;
    };
    Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length);
      }
      let val = this[offset + --byteLength2];
      let mul = 1;
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul;
      }
      return val;
    };
    Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
      const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
      return BigInt(lo) + (BigInt(hi) << BigInt(32));
    });
    Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
      return (BigInt(hi) << BigInt(32)) + BigInt(lo);
    });
    Buffer3.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer3.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let i = byteLength2;
      let mul = 1;
      let val = this[offset + --i];
      while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128)) return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer3.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
      return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
    });
    Buffer3.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = (first << 24) + // Overflow
      this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
    });
    Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };
    Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };
    Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };
    Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer3.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
    }
    Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let mul = 1;
      let i = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = value & 255;
      return offset + 4;
    };
    Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    function wrtBigUInt64LE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      return offset;
    }
    function wrtBigUInt64BE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset + 7] = lo;
      lo = lo >> 8;
      buf[offset + 6] = lo;
      lo = lo >> 8;
      buf[offset + 5] = lo;
      lo = lo >> 8;
      buf[offset + 4] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset + 3] = hi;
      hi = hi >> 8;
      buf[offset + 2] = hi;
      hi = hi >> 8;
      buf[offset + 1] = hi;
      hi = hi >> 8;
      buf[offset] = hi;
      return offset + 8;
    }
    Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer3.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = 0;
      let mul = 1;
      let sub = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      let sub = 0;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
      if (value < 0) value = 255 + value + 1;
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer3.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer3.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer3.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };
    Buffer3.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (value < 0) value = 4294967295 + value + 1;
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
      if (offset < 0) throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer3.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer3.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer3.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer3.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer3.isBuffer(target)) throw new TypeError("argument should be a Buffer");
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;
      if (end === start) return 0;
      if (target.length === 0 || this.length === 0) return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
      if (end < 0) throw new RangeError("sourceEnd out of bounds");
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      const len = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart
        );
      }
      return len;
    };
    Buffer3.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          const code = val.charCodeAt(0);
          if (encoding === "utf8" && code < 128 || encoding === "latin1") {
            val = code;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val) val = 0;
      let i;
      if (typeof val === "number") {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
        const len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }
      return this;
    };
    var errors = {};
    function E(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
        constructor() {
          super();
          Object.defineProperty(this, "message", {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true
          });
          this.name = `${this.name} [${sym}]`;
          this.stack;
          delete this.name;
        }
        get code() {
          return sym;
        }
        set code(value) {
          Object.defineProperty(this, "code", {
            configurable: true,
            enumerable: true,
            value,
            writable: true
          });
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`;
        }
      };
    }
    E(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function(name) {
        if (name) {
          return `${name} is outside of buffer bounds`;
        }
        return "Attempt to access memory outside buffer bounds";
      },
      RangeError
    );
    E(
      "ERR_INVALID_ARG_TYPE",
      function(name, actual) {
        return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
      },
      TypeError
    );
    E(
      "ERR_OUT_OF_RANGE",
      function(str, range, input) {
        let msg = `The value of "${str}" is out of range.`;
        let received = input;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input));
        } else if (typeof input === "bigint") {
          received = String(input);
          if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
            received = addNumericalSeparator(received);
          }
          received += "n";
        }
        msg += ` It must be ${range}. Received ${received}`;
        return msg;
      },
      RangeError
    );
    function addNumericalSeparator(val) {
      let res = "";
      let i = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`;
      }
      return `${val.slice(0, i)}${res}`;
    }
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, "offset");
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1));
      }
    }
    function checkIntBI(value, min, max, buf, offset, byteLength2) {
      if (value > max || value < min) {
        const n = typeof min === "bigint" ? "n" : "";
        let range;
        if (byteLength2 > 3) {
          if (min === 0 || min === BigInt(0)) {
            range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
          } else {
            range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
          }
        } else {
          range = `>= ${min}${n} and <= ${max}${n}`;
        }
        throw new errors.ERR_OUT_OF_RANGE("value", range, value);
      }
      checkBounds(buf, offset, byteLength2);
    }
    function validateNumber(value, name) {
      if (typeof value !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
      }
    }
    function boundsError(value, length, type) {
      if (Math.floor(value) !== value) {
        validateNumber(value, type);
        throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
      }
      if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
      }
      throw new errors.ERR_OUT_OF_RANGE(
        type || "offset",
        `>= ${type ? 1 : 0} and <= ${length}`,
        value
      );
    }
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2) return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    function utf8ToBytes(string, units) {
      units = units || Infinity;
      let codePoint;
      const length = string.length;
      let leadSurrogate = null;
      const bytes = [];
      for (let i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            } else if (i + 1 === length) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0) break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break;
          bytes.push(
            codePoint >> 6 | 192,
            codePoint & 63 | 128
          );
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break;
          bytes.push(
            codePoint >> 12 | 224,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0) break;
          bytes.push(
            codePoint >> 18 | 240,
            codePoint >> 12 & 63 | 128,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255);
      }
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      let c, hi, lo;
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src, dst, offset, length) {
      let i;
      for (i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length) break;
        dst[i + offset] = src[i];
      }
      return i;
    }
    function isInstance(obj, type) {
      return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    var hexSliceLookupTable = (function() {
      const alphabet = "0123456789abcdef";
      const table = new Array(256);
      for (let i = 0; i < 16; ++i) {
        const i16 = i * 16;
        for (let j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet[i] + alphabet[j];
        }
      }
      return table;
    })();
    function defineBigIntMethod(fn) {
      return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
    }
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported");
    }
  }
});

// node_modules/jszip/dist/jszip.min.js
var require_jszip_min = __commonJS({
  "node_modules/jszip/dist/jszip.min.js"(exports, module2) {
    !(function(e) {
      if ("object" == typeof exports && "undefined" != typeof module2) module2.exports = e();
      else if ("function" == typeof define && define.amd) define([], e);
      else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).JSZip = e();
      }
    })(function() {
      return (function s(a, o, h) {
        function u(r, e2) {
          if (!o[r]) {
            if (!a[r]) {
              var t = "function" == typeof __require && __require;
              if (!e2 && t) return t(r, true);
              if (l) return l(r, true);
              var n = new Error("Cannot find module '" + r + "'");
              throw n.code = "MODULE_NOT_FOUND", n;
            }
            var i = o[r] = { exports: {} };
            a[r][0].call(i.exports, function(e3) {
              var t2 = a[r][1][e3];
              return u(t2 || e3);
            }, i, i.exports, s, a, o, h);
          }
          return o[r].exports;
        }
        for (var l = "function" == typeof __require && __require, e = 0; e < h.length; e++) u(h[e]);
        return u;
      })({ 1: [function(e, t, r) {
        "use strict";
        var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        r.encode = function(e2) {
          for (var t2, r2, n, i, s, a, o, h = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; ) f = l - u, n = c2 ? (t2 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t2 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t2 >> 2, s = (3 & t2) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o));
          return h.join("");
        }, r.decode = function(e2) {
          var t2, r2, n, i, s, a, o = 0, h = 0, u = "data:";
          if (e2.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url.");
          var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
          if (e2.charAt(e2.length - 1) === p.charAt(64) && f--, e2.charAt(e2.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
          for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; ) t2 = p.indexOf(e2.charAt(o++)) << 2 | (i = p.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e2.charAt(o++))), l[h++] = t2, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = n);
          return l;
        };
      }, { "./support": 30, "./utils": 32 }], 2: [function(e, t, r) {
        "use strict";
        var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
        function o(e2, t2, r2, n2, i2) {
          this.compressedSize = e2, this.uncompressedSize = t2, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
        }
        o.prototype = { getContentWorker: function() {
          var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t2 = this;
          return e2.on("end", function() {
            if (this.streamInfo.data_length !== t2.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
          }), e2;
        }, getCompressedWorker: function() {
          return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
        } }, o.createWorkerFrom = function(e2, t2, r2) {
          return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t2);
        }, t.exports = o;
      }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t, r) {
        "use strict";
        var n = e("./stream/GenericWorker");
        r.STORE = { magic: "\0\0", compressWorker: function() {
          return new n("STORE compression");
        }, uncompressWorker: function() {
          return new n("STORE decompression");
        } }, r.DEFLATE = e("./flate");
      }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t, r) {
        "use strict";
        var n = e("./utils");
        var o = (function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n2 = 0; n2 < 8; n2++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        })();
        t.exports = function(e2, t2) {
          return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? (function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a])];
            return -1 ^ e3;
          })(0 | t2, e2, e2.length, 0) : (function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3.charCodeAt(a))];
            return -1 ^ e3;
          })(0 | t2, e2, e2.length, 0) : 0;
        };
      }, { "./utils": 32 }], 5: [function(e, t, r) {
        "use strict";
        r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
      }, {}], 6: [function(e, t, r) {
        "use strict";
        var n = null;
        n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n };
      }, { lie: 37 }], 7: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
        function h(e2, t2) {
          a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t2, this.meta = {};
        }
        r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(e2) {
          this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
        }, h.prototype.flush = function() {
          a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
        }, h.prototype.cleanUp = function() {
          a.prototype.cleanUp.call(this), this._pako = null;
        }, h.prototype._createPako = function() {
          this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
          var t2 = this;
          this._pako.onData = function(e2) {
            t2.push({ data: e2, meta: t2.meta });
          };
        }, r.compressWorker = function(e2) {
          return new h("Deflate", e2);
        }, r.uncompressWorker = function() {
          return new h("Inflate", {});
        };
      }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t, r) {
        "use strict";
        function A(e2, t2) {
          var r2, n2 = "";
          for (r2 = 0; r2 < t2; r2++) n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
          return n2;
        }
        function n(e2, t2, r2, n2, i2, s2) {
          var a, o, h = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
          t2 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
          var S = 0;
          t2 && (S |= 8), l || !_ && !g || (S |= 2048);
          var z = 0, C2 = 0;
          w && (z |= 16), "UNIX" === i2 ? (C2 = 798, z |= (function(e3, t3) {
            var r3 = e3;
            return e3 || (r3 = t3 ? 16893 : 33204), (65535 & r3) << 16;
          })(h.unixPermissions, w)) : (C2 = 20, z |= (function(e3) {
            return 63 & (e3 || 0);
          })(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
          var E = "";
          return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C2, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p };
        }
        var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
        function s(e2, t2, r2, n2) {
          i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t2, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
        }
        I.inherits(s, i), s.prototype.push = function(e2) {
          var t2 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
          this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t2 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
        }, s.prototype.openedSource = function(e2) {
          this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
          var t2 = this.streamFiles && !e2.file.dir;
          if (t2) {
            var r2 = n(e2, t2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            this.push({ data: r2.fileRecord, meta: { percent: 0 } });
          } else this.accumulate = true;
        }, s.prototype.closedSource = function(e2) {
          this.accumulate = false;
          var t2 = this.streamFiles && !e2.file.dir, r2 = n(e2, t2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
          if (this.dirRecords.push(r2.dirRecord), t2) this.push({ data: (function(e3) {
            return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
          })(e2), meta: { percent: 100 } });
          else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
          this.currentFile = null;
        }, s.prototype.flush = function() {
          for (var e2 = this.bytesWritten, t2 = 0; t2 < this.dirRecords.length; t2++) this.push({ data: this.dirRecords[t2], meta: { percent: 100 } });
          var r2 = this.bytesWritten - e2, n2 = (function(e3, t3, r3, n3, i2) {
            var s2 = I.transformTo("string", i2(n3));
            return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
          })(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
          this.push({ data: n2, meta: { percent: 100 } });
        }, s.prototype.prepareNextSource = function() {
          this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
        }, s.prototype.registerPrevious = function(e2) {
          this._sources.push(e2);
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.closedSource(t2.previous.streamInfo), t2._sources.length ? t2.prepareNextSource() : t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
        }, s.prototype.error = function(e2) {
          var t2 = this._sources;
          if (!i.prototype.error.call(this, e2)) return false;
          for (var r2 = 0; r2 < t2.length; r2++) try {
            t2[r2].error(e2);
          } catch (e3) {
          }
          return true;
        }, s.prototype.lock = function() {
          i.prototype.lock.call(this);
          for (var e2 = this._sources, t2 = 0; t2 < e2.length; t2++) e2[t2].lock();
        }, t.exports = s;
      }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t, r) {
        "use strict";
        var u = e("../compressions"), n = e("./ZipFileWorker");
        r.generateWorker = function(e2, a, t2) {
          var o = new n(a.streamFiles, t2, a.platform, a.encodeFileName), h = 0;
          try {
            e2.forEach(function(e3, t3) {
              h++;
              var r2 = (function(e4, t4) {
                var r3 = e4 || t4, n3 = u[r3];
                if (!n3) throw new Error(r3 + " is not a valid compression method !");
                return n3;
              })(t3.options.compression, a.compression), n2 = t3.options.compressionOptions || a.compressionOptions || {}, i = t3.dir, s = t3.date;
              t3._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t3.comment || "", unixPermissions: t3.unixPermissions, dosPermissions: t3.dosPermissions }).pipe(o);
            }), o.entriesCount = h;
          } catch (e3) {
            o.error(e3);
          }
          return o;
        };
      }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t, r) {
        "use strict";
        function n() {
          if (!(this instanceof n)) return new n();
          if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
          this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
            var e2 = new n();
            for (var t2 in this) "function" != typeof this[t2] && (e2[t2] = this[t2]);
            return e2;
          };
        }
        (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.2", n.loadAsync = function(e2, t2) {
          return new n().loadAsync(e2, t2);
        }, n.external = e("./external"), t.exports = n;
      }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t, r) {
        "use strict";
        var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
        function f(n2) {
          return new i.Promise(function(e2, t2) {
            var r2 = n2.decompressed.getContentWorker().pipe(new a());
            r2.on("error", function(e3) {
              t2(e3);
            }).on("end", function() {
              r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t2(new Error("Corrupted zip : CRC32 mismatch")) : e2();
            }).resume();
          });
        }
        t.exports = function(e2, o) {
          var h = this;
          return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
            var t2 = new s(o);
            return t2.load(e3), t2;
          }).then(function(e3) {
            var t2 = [i.Promise.resolve(e3)], r2 = e3.files;
            if (o.checkCRC32) for (var n2 = 0; n2 < r2.length; n2++) t2.push(f(r2[n2]));
            return i.Promise.all(t2);
          }).then(function(e3) {
            for (var t2 = e3.shift(), r2 = t2.files, n2 = 0; n2 < r2.length; n2++) {
              var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
              h.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h.file(a2).unsafeOriginalName = s2);
            }
            return t2.zipComment.length && (h.comment = t2.zipComment), h;
          });
        };
      }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../stream/GenericWorker");
        function s(e2, t2) {
          i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t2);
        }
        n.inherits(s, i), s.prototype._bindStream = function(e2) {
          var t2 = this;
          (this._stream = e2).pause(), e2.on("data", function(e3) {
            t2.push({ data: e3, meta: { percent: 0 } });
          }).on("error", function(e3) {
            t2.isPaused ? this.generatedError = e3 : t2.error(e3);
          }).on("end", function() {
            t2.isPaused ? t2._upstreamEnded = true : t2.end();
          });
        }, s.prototype.pause = function() {
          return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
        }, t.exports = s;
      }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t, r) {
        "use strict";
        var i = e("readable-stream").Readable;
        function n(e2, t2, r2) {
          i.call(this, t2), this._helper = e2;
          var n2 = this;
          e2.on("data", function(e3, t3) {
            n2.push(e3) || n2._helper.pause(), r2 && r2(t3);
          }).on("error", function(e3) {
            n2.emit("error", e3);
          }).on("end", function() {
            n2.push(null);
          });
        }
        e("../utils").inherits(n, i), n.prototype._read = function() {
          this._helper.resume();
        }, t.exports = n;
      }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t, r) {
        "use strict";
        t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t2) {
          if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(e2, t2);
          if ("number" == typeof e2) throw new Error('The "data" argument must not be a number');
          return new Buffer(e2, t2);
        }, allocBuffer: function(e2) {
          if (Buffer.alloc) return Buffer.alloc(e2);
          var t2 = new Buffer(e2);
          return t2.fill(0), t2;
        }, isBuffer: function(e2) {
          return Buffer.isBuffer(e2);
        }, isStream: function(e2) {
          return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
        } };
      }, {}], 15: [function(e, t, r) {
        "use strict";
        function s(e2, t2, r2) {
          var n2, i2 = u.getTypeOf(t2), s2 = u.extend(r2 || {}, f);
          s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
          var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
          r2 && void 0 !== r2.binary || (s2.binary = !a2), (t2 instanceof c && 0 === t2.uncompressedSize || s2.dir || !t2 || 0 === t2.length) && (s2.base64 = false, s2.binary = true, t2 = "", s2.compression = "STORE", i2 = "string");
          var o2 = null;
          o2 = t2 instanceof c || t2 instanceof l ? t2 : p.isNode && p.isStream(t2) ? new m(e2, t2) : u.prepareContent(e2, t2, s2.binary, s2.optimizedBinaryString, s2.base64);
          var h2 = new d(e2, o2, s2);
          this.files[e2] = h2;
        }
        var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function(e2) {
          "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
          var t2 = e2.lastIndexOf("/");
          return 0 < t2 ? e2.substring(0, t2) : "";
        }, g = function(e2) {
          return "/" !== e2.slice(-1) && (e2 += "/"), e2;
        }, b = function(e2, t2) {
          return t2 = void 0 !== t2 ? t2 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t2 }), this.files[e2];
        };
        function h(e2) {
          return "[object RegExp]" === Object.prototype.toString.call(e2);
        }
        var n = { load: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, forEach: function(e2) {
          var t2, r2, n2;
          for (t2 in this.files) n2 = this.files[t2], (r2 = t2.slice(this.root.length, t2.length)) && t2.slice(0, this.root.length) === this.root && e2(r2, n2);
        }, filter: function(r2) {
          var n2 = [];
          return this.forEach(function(e2, t2) {
            r2(e2, t2) && n2.push(t2);
          }), n2;
        }, file: function(e2, t2, r2) {
          if (1 !== arguments.length) return e2 = this.root + e2, s.call(this, e2, t2, r2), this;
          if (h(e2)) {
            var n2 = e2;
            return this.filter(function(e3, t3) {
              return !t3.dir && n2.test(e3);
            });
          }
          var i2 = this.files[this.root + e2];
          return i2 && !i2.dir ? i2 : null;
        }, folder: function(r2) {
          if (!r2) return this;
          if (h(r2)) return this.filter(function(e3, t3) {
            return t3.dir && r2.test(e3);
          });
          var e2 = this.root + r2, t2 = b.call(this, e2), n2 = this.clone();
          return n2.root = t2.name, n2;
        }, remove: function(r2) {
          r2 = this.root + r2;
          var e2 = this.files[r2];
          if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir) delete this.files[r2];
          else for (var t2 = this.filter(function(e3, t3) {
            return t3.name.slice(0, r2.length) === r2;
          }), n2 = 0; n2 < t2.length; n2++) delete this.files[t2[n2].name];
          return this;
        }, generate: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, generateInternalStream: function(e2) {
          var t2, r2 = {};
          try {
            if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
            u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
            var n2 = r2.comment || this.comment || "";
            t2 = o.generateWorker(this, r2, n2);
          } catch (e3) {
            (t2 = new l("error")).error(e3);
          }
          return new a(t2, r2.type || "string", r2.mimeType);
        }, generateAsync: function(e2, t2) {
          return this.generateInternalStream(e2).accumulate(t2);
        }, generateNodeStream: function(e2, t2) {
          return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t2);
        } };
        t.exports = n;
      }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t, r) {
        "use strict";
        t.exports = e("stream");
      }, { stream: void 0 }], 17: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
          for (var t2 = 0; t2 < this.data.length; t2++) e2[t2] = 255 & e2[t2];
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data[this.zero + e2];
        }, i.prototype.lastIndexOfSignature = function(e2) {
          for (var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s) if (this.data[s] === t2 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2) return s - this.zero;
          return -1;
        }, i.prototype.readAndCheckSignature = function(e2) {
          var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
          return t2 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
        }, i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return [];
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t, r) {
        "use strict";
        var n = e("../utils");
        function i(e2) {
          this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
        }
        i.prototype = { checkOffset: function(e2) {
          this.checkIndex(this.index + e2);
        }, checkIndex: function(e2) {
          if (this.length < this.zero + e2 || e2 < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
        }, setIndex: function(e2) {
          this.checkIndex(e2), this.index = e2;
        }, skip: function(e2) {
          this.setIndex(this.index + e2);
        }, byteAt: function() {
        }, readInt: function(e2) {
          var t2, r2 = 0;
          for (this.checkOffset(e2), t2 = this.index + e2 - 1; t2 >= this.index; t2--) r2 = (r2 << 8) + this.byteAt(t2);
          return this.index += e2, r2;
        }, readString: function(e2) {
          return n.transformTo("string", this.readData(e2));
        }, readData: function() {
        }, lastIndexOfSignature: function() {
        }, readAndCheckSignature: function() {
        }, readDate: function() {
          var e2 = this.readInt(4);
          return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
        } }, t.exports = i;
      }, { "../utils": 32 }], 19: [function(e, t, r) {
        "use strict";
        var n = e("./Uint8ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data.charCodeAt(this.zero + e2);
        }, i.prototype.lastIndexOfSignature = function(e2) {
          return this.data.lastIndexOf(e2) - this.zero;
        }, i.prototype.readAndCheckSignature = function(e2) {
          return e2 === this.readData(4);
        }, i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t, r) {
        "use strict";
        var n = e("./ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return new Uint8Array(0);
          var t2 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader");
        t.exports = function(e2) {
          var t2 = n.getTypeOf(e2);
          return n.checkSupport(t2), "string" !== t2 || i.uint8array ? "nodebuffer" === t2 ? new o(e2) : i.uint8array ? new h(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
        };
      }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t, r) {
        "use strict";
        r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
      }, {}], 24: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../utils");
        function s(e2) {
          n.call(this, "ConvertWorker to " + e2), this.destType = e2;
        }
        i.inherits(s, n), s.prototype.processChunk = function(e2) {
          this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../crc32");
        function s() {
          n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
        }
        e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
          this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
        }, t.exports = s;
      }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
        }
        n.inherits(s, i), s.prototype.processChunk = function(e2) {
          if (e2) {
            var t2 = this.streamInfo[this.propName] || 0;
            this.streamInfo[this.propName] = t2 + e2.data.length;
          }
          i.prototype.processChunk.call(this, e2);
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataWorker");
          var t2 = this;
          this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
            t2.dataIsReady = true, t2.data = e3, t2.max = e3 && e3.length || 0, t2.type = n.getTypeOf(e3), t2.isPaused || t2._tickAndRepeat();
          }, function(e3) {
            t2.error(e3);
          });
        }
        n.inherits(s, i), s.prototype.cleanUp = function() {
          i.prototype.cleanUp.call(this), this.data = null;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
        }, s.prototype._tickAndRepeat = function() {
          this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
        }, s.prototype._tick = function() {
          if (this.isPaused || this.isFinished) return false;
          var e2 = null, t2 = Math.min(this.max, this.index + 16384);
          if (this.index >= this.max) return this.end();
          switch (this.type) {
            case "string":
              e2 = this.data.substring(this.index, t2);
              break;
            case "uint8array":
              e2 = this.data.subarray(this.index, t2);
              break;
            case "array":
            case "nodebuffer":
              e2 = this.data.slice(this.index, t2);
          }
          return this.index = t2, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t, r) {
        "use strict";
        function n(e2) {
          this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
        }
        n.prototype = { push: function(e2) {
          this.emit("data", e2);
        }, end: function() {
          if (this.isFinished) return false;
          this.flush();
          try {
            this.emit("end"), this.cleanUp(), this.isFinished = true;
          } catch (e2) {
            this.emit("error", e2);
          }
          return true;
        }, error: function(e2) {
          return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
        }, on: function(e2, t2) {
          return this._listeners[e2].push(t2), this;
        }, cleanUp: function() {
          this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
        }, emit: function(e2, t2) {
          if (this._listeners[e2]) for (var r2 = 0; r2 < this._listeners[e2].length; r2++) this._listeners[e2][r2].call(this, t2);
        }, pipe: function(e2) {
          return e2.registerPrevious(this);
        }, registerPrevious: function(e2) {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, pause: function() {
          return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
        }, resume: function() {
          if (!this.isPaused || this.isFinished) return false;
          var e2 = this.isPaused = false;
          return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
        }, flush: function() {
        }, processChunk: function(e2) {
          this.push(e2);
        }, withStreamInfo: function(e2, t2) {
          return this.extraStreamInfo[e2] = t2, this.mergeStreamInfo(), this;
        }, mergeStreamInfo: function() {
          for (var e2 in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
        }, lock: function() {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.isLocked = true, this.previous && this.previous.lock();
        }, toString: function() {
          var e2 = "Worker " + this.name;
          return this.previous ? this.previous + " -> " + e2 : e2;
        } }, t.exports = n;
      }, {}], 29: [function(e, t, r) {
        "use strict";
        var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
        if (n.nodestream) try {
          o = e("../nodejs/NodejsStreamOutputAdapter");
        } catch (e2) {
        }
        function l(e2, o2) {
          return new a.Promise(function(t2, r2) {
            var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
            e2.on("data", function(e3, t3) {
              n2.push(e3), o2 && o2(t3);
            }).on("error", function(e3) {
              n2 = [], r2(e3);
            }).on("end", function() {
              try {
                var e3 = (function(e4, t3, r3) {
                  switch (e4) {
                    case "blob":
                      return h.newBlob(h.transformTo("arraybuffer", t3), r3);
                    case "base64":
                      return u.encode(t3);
                    default:
                      return h.transformTo(e4, t3);
                  }
                })(s2, (function(e4, t3) {
                  var r3, n3 = 0, i3 = null, s3 = 0;
                  for (r3 = 0; r3 < t3.length; r3++) s3 += t3[r3].length;
                  switch (e4) {
                    case "string":
                      return t3.join("");
                    case "array":
                      return Array.prototype.concat.apply([], t3);
                    case "uint8array":
                      for (i3 = new Uint8Array(s3), r3 = 0; r3 < t3.length; r3++) i3.set(t3[r3], n3), n3 += t3[r3].length;
                      return i3;
                    case "nodebuffer":
                      return Buffer.concat(t3);
                    default:
                      throw new Error("concat : unsupported type '" + e4 + "'");
                  }
                })(i2, n2), a2);
                t2(e3);
              } catch (e4) {
                r2(e4);
              }
              n2 = [];
            }).resume();
          });
        }
        function f(e2, t2, r2) {
          var n2 = t2;
          switch (t2) {
            case "blob":
            case "arraybuffer":
              n2 = "uint8array";
              break;
            case "base64":
              n2 = "string";
          }
          try {
            this._internalType = n2, this._outputType = t2, this._mimeType = r2, h.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
          } catch (e3) {
            this._worker = new s("error"), this._worker.error(e3);
          }
        }
        f.prototype = { accumulate: function(e2) {
          return l(this, e2);
        }, on: function(e2, t2) {
          var r2 = this;
          return "data" === e2 ? this._worker.on(e2, function(e3) {
            t2.call(r2, e3.data, e3.meta);
          }) : this._worker.on(e2, function() {
            h.delay(t2, arguments, r2);
          }), this;
        }, resume: function() {
          return h.delay(this._worker.resume, [], this._worker), this;
        }, pause: function() {
          return this._worker.pause(), this;
        }, toNodejsStream: function(e2) {
          if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
          return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
        } }, t.exports = f;
      }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t, r) {
        "use strict";
        if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
        else {
          var n = new ArrayBuffer(0);
          try {
            r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
          } catch (e2) {
            try {
              var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
            } catch (e3) {
              r.blob = false;
            }
          }
        }
        try {
          r.nodestream = !!e("readable-stream").Readable;
        } catch (e2) {
          r.nodestream = false;
        }
      }, { "readable-stream": 16 }], 31: [function(e, t, s) {
        "use strict";
        for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++) u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
        u[254] = u[254] = 1;
        function a() {
          n.call(this, "utf-8 decode"), this.leftOver = null;
        }
        function l() {
          n.call(this, "utf-8 encode");
        }
        s.utf8encode = function(e2) {
          return h.nodebuffer ? r.newBufferFrom(e2, "utf-8") : (function(e3) {
            var t2, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
            for (i2 = 0; i2 < a2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
            for (t2 = h.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
            return t2;
          })(e2);
        }, s.utf8decode = function(e2) {
          return h.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : (function(e3) {
            var t2, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
            for (t2 = r2 = 0; t2 < s2; ) if ((n2 = e3[t2++]) < 128) a2[r2++] = n2;
            else if (4 < (i2 = u[n2])) a2[r2++] = 65533, t2 += i2 - 1;
            else {
              for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t2 < s2; ) n2 = n2 << 6 | 63 & e3[t2++], i2--;
              1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
            }
            return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
          })(e2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2));
        }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
          var t2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2.data);
          if (this.leftOver && this.leftOver.length) {
            if (h.uint8array) {
              var r2 = t2;
              (t2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t2.set(r2, this.leftOver.length);
            } else t2 = this.leftOver.concat(t2);
            this.leftOver = null;
          }
          var n2 = (function(e3, t3) {
            var r3;
            for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r3 = t3 - 1; 0 <= r3 && 128 == (192 & e3[r3]); ) r3--;
            return r3 < 0 ? t3 : 0 === r3 ? t3 : r3 + u[e3[r3]] > t3 ? r3 : t3;
          })(t2), i2 = t2;
          n2 !== t2.length && (h.uint8array ? (i2 = t2.subarray(0, n2), this.leftOver = t2.subarray(n2, t2.length)) : (i2 = t2.slice(0, n2), this.leftOver = t2.slice(n2, t2.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
        }, a.prototype.flush = function() {
          this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
        }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
          this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
        }, s.Utf8EncodeWorker = l;
      }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t, a) {
        "use strict";
        var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
        function n(e2) {
          return e2;
        }
        function l(e2, t2) {
          for (var r2 = 0; r2 < e2.length; ++r2) t2[r2] = 255 & e2.charCodeAt(r2);
          return t2;
        }
        e("setimmediate"), a.newBlob = function(t2, r2) {
          a.checkSupport("blob");
          try {
            return new Blob([t2], { type: r2 });
          } catch (e2) {
            try {
              var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              return n2.append(t2), n2.getBlob(r2);
            } catch (e3) {
              throw new Error("Bug : can't construct the Blob.");
            }
          }
        };
        var i = { stringifyByChunk: function(e2, t2, r2) {
          var n2 = [], i2 = 0, s2 = e2.length;
          if (s2 <= r2) return String.fromCharCode.apply(null, e2);
          for (; i2 < s2; ) "array" === t2 || "nodebuffer" === t2 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
          return n2.join("");
        }, stringifyByChar: function(e2) {
          for (var t2 = "", r2 = 0; r2 < e2.length; r2++) t2 += String.fromCharCode(e2[r2]);
          return t2;
        }, applyCanBeUsed: { uint8array: (function() {
          try {
            return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
          } catch (e2) {
            return false;
          }
        })(), nodebuffer: (function() {
          try {
            return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
          } catch (e2) {
            return false;
          }
        })() } };
        function s(e2) {
          var t2 = 65536, r2 = a.getTypeOf(e2), n2 = true;
          if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2) for (; 1 < t2; ) try {
            return i.stringifyByChunk(e2, r2, t2);
          } catch (e3) {
            t2 = Math.floor(t2 / 2);
          }
          return i.stringifyByChar(e2);
        }
        function f(e2, t2) {
          for (var r2 = 0; r2 < e2.length; r2++) t2[r2] = e2[r2];
          return t2;
        }
        a.applyFromCharCode = s;
        var c = {};
        c.string = { string: n, array: function(e2) {
          return l(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.string.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return l(e2, new Uint8Array(e2.length));
        }, nodebuffer: function(e2) {
          return l(e2, r.allocBuffer(e2.length));
        } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
          return new Uint8Array(e2).buffer;
        }, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.arraybuffer = { string: function(e2) {
          return s(new Uint8Array(e2));
        }, array: function(e2) {
          return f(new Uint8Array(e2), new Array(e2.byteLength));
        }, arraybuffer: n, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(new Uint8Array(e2));
        } }, c.uint8array = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return e2.buffer;
        }, uint8array: n, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.nodebuffer = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.nodebuffer.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return f(e2, new Uint8Array(e2.length));
        }, nodebuffer: n }, a.transformTo = function(e2, t2) {
          if (t2 = t2 || "", !e2) return t2;
          a.checkSupport(e2);
          var r2 = a.getTypeOf(t2);
          return c[r2][e2](t2);
        }, a.resolve = function(e2) {
          for (var t2 = e2.split("/"), r2 = [], n2 = 0; n2 < t2.length; n2++) {
            var i2 = t2[n2];
            "." === i2 || "" === i2 && 0 !== n2 && n2 !== t2.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
          }
          return r2.join("/");
        }, a.getTypeOf = function(e2) {
          if ("string" == typeof e2) return "string";
          var t2 = Object.prototype.toString.call(e2);
          return "[object Array]" === t2 ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && "[object Uint8Array]" === t2 ? "uint8array" : o.arraybuffer && "[object ArrayBuffer]" === t2 ? "arraybuffer" : void 0;
        }, a.checkSupport = function(e2) {
          if (!o[e2.toLowerCase()]) throw new Error(e2 + " is not supported by this platform");
        }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
          var t2, r2, n2 = "";
          for (r2 = 0; r2 < (e2 || "").length; r2++) n2 += "\\x" + ((t2 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t2.toString(16).toUpperCase();
          return n2;
        }, a.delay = function(e2, t2, r2) {
          setImmediate(function() {
            e2.apply(r2 || null, t2 || []);
          });
        }, a.inherits = function(e2, t2) {
          function r2() {
          }
          r2.prototype = t2.prototype, e2.prototype = new r2();
        }, a.extend = function() {
          var e2, t2, r2 = {};
          for (e2 = 0; e2 < arguments.length; e2++) for (t2 in arguments[e2]) Object.prototype.hasOwnProperty.call(arguments[e2], t2) && void 0 === r2[t2] && (r2[t2] = arguments[e2][t2]);
          return r2;
        }, a.prepareContent = function(r2, e2, n2, i2, s2) {
          return u.Promise.resolve(e2).then(function(n3) {
            return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) ? void 0 !== Blob.prototype.arrayBuffer ? n3.arrayBuffer() : "undefined" != typeof FileReader ? new u.Promise(function(t2, r3) {
              var e3 = new FileReader();
              e3.onload = function(e4) {
                t2(e4.target.result);
              }, e3.onerror = function(e4) {
                r3(e4.target.error);
              }, e3.readAsArrayBuffer(n3);
            }) : u.Promise.reject(new Error(r2 + " is a Blob, but we have no way of reading it.")) : n3;
          }).then(function(e3) {
            var t2 = a.getTypeOf(e3);
            return t2 ? ("arraybuffer" === t2 ? e3 = a.transformTo("uint8array", e3) : "string" === t2 && (s2 ? e3 = h.decode(e3) : n2 && true !== i2 && (e3 = (function(e4) {
              return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
            })(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
          });
        };
      }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
        function h(e2) {
          this.files = [], this.loadOptions = e2;
        }
        h.prototype = { checkSignature: function(e2) {
          if (!this.reader.readAndCheckSignature(e2)) {
            this.reader.index -= 4;
            var t2 = this.reader.readString(4);
            throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t2) + ", expected " + i.pretty(e2) + ")");
          }
        }, isSignature: function(e2, t2) {
          var r2 = this.reader.index;
          this.reader.setIndex(e2);
          var n2 = this.reader.readString(4) === t2;
          return this.reader.setIndex(r2), n2;
        }, readBlockEndOfCentral: function() {
          this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
          var e2 = this.reader.readData(this.zipCommentLength), t2 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t2, e2);
          this.zipComment = this.loadOptions.decodeFileName(r2);
        }, readBlockZip64EndOfCentral: function() {
          this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
          for (var e2, t2, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; ) e2 = this.reader.readInt(2), t2 = this.reader.readInt(4), r2 = this.reader.readData(t2), this.zip64ExtensibleData[e2] = { id: e2, length: t2, value: r2 };
        }, readBlockZip64EndOfCentralLocator: function() {
          if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
        }, readLocalFiles: function() {
          var e2, t2;
          for (e2 = 0; e2 < this.files.length; e2++) t2 = this.files[e2], this.reader.setIndex(t2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t2.readLocalPart(this.reader), t2.handleUTF8(), t2.processAttributes();
        }, readCentralDir: function() {
          var e2;
          for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); ) (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
          if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
        }, readEndOfCentral: function() {
          var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
          if (e2 < 0) throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
          this.reader.setIndex(e2);
          var t2 = e2;
          if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
            if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
            if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
          }
          var r2 = this.centralDirOffset + this.centralDirSize;
          this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
          var n2 = t2 - r2;
          if (0 < n2) this.isSignature(t2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
          else if (n2 < 0) throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
        }, prepareReader: function(e2) {
          this.reader = n(e2);
        }, load: function(e2) {
          this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
        } }, t.exports = h;
      }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support");
        function l(e2, t2) {
          this.options = e2, this.loadOptions = t2;
        }
        l.prototype = { isEncrypted: function() {
          return 1 == (1 & this.bitFlag);
        }, useUTF8: function() {
          return 2048 == (2048 & this.bitFlag);
        }, readLocalPart: function(e2) {
          var t2, r2;
          if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
          if (null === (t2 = (function(e3) {
            for (var t3 in h) if (Object.prototype.hasOwnProperty.call(h, t3) && h[t3].magic === e3) return h[t3];
            return null;
          })(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
          this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t2, e2.readData(this.compressedSize));
        }, readCentralPart: function(e2) {
          this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
          var t2 = e2.readInt(2);
          if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
          e2.skip(t2), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
        }, processAttributes: function() {
          this.unixPermissions = null, this.dosPermissions = null;
          var e2 = this.versionMadeBy >> 8;
          this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
        }, parseZIP64ExtraField: function() {
          if (this.extraFields[1]) {
            var e2 = n(this.extraFields[1].value);
            this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
          }
        }, readExtraFields: function(e2) {
          var t2, r2, n2, i2 = e2.index + this.extraFieldsLength;
          for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; ) t2 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t2] = { id: t2, length: r2, value: n2 };
          e2.setIndex(i2);
        }, handleUTF8: function() {
          var e2 = u.uint8array ? "uint8array" : "array";
          if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
          else {
            var t2 = this.findExtraFieldUnicodePath();
            if (null !== t2) this.fileNameStr = t2;
            else {
              var r2 = s.transformTo(e2, this.fileName);
              this.fileNameStr = this.loadOptions.decodeFileName(r2);
            }
            var n2 = this.findExtraFieldUnicodeComment();
            if (null !== n2) this.fileCommentStr = n2;
            else {
              var i2 = s.transformTo(e2, this.fileComment);
              this.fileCommentStr = this.loadOptions.decodeFileName(i2);
            }
          }
        }, findExtraFieldUnicodePath: function() {
          var e2 = this.extraFields[28789];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileName) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        }, findExtraFieldUnicodeComment: function() {
          var e2 = this.extraFields[25461];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileComment) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        } }, t.exports = l;
      }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t, r) {
        "use strict";
        function n(e2, t2, r2) {
          this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
        }
        var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker");
        n.prototype = { internalStream: function(e2) {
          var t2 = null, r2 = "string";
          try {
            if (!e2) throw new Error("No output type specified.");
            var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
            "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t2 = this._decompressWorker();
            var i2 = !this._dataBinary;
            i2 && !n2 && (t2 = t2.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t2 = t2.pipe(new a.Utf8DecodeWorker()));
          } catch (e3) {
            (t2 = new h("error")).error(e3);
          }
          return new s(t2, r2, "");
        }, async: function(e2, t2) {
          return this.internalStream(e2).accumulate(t2);
        }, nodeStream: function(e2, t2) {
          return this.internalStream(e2 || "nodebuffer").toNodejsStream(t2);
        }, _compressWorker: function(e2, t2) {
          if (this._data instanceof o && this._data.compression.magic === e2.magic) return this._data.getCompressedWorker();
          var r2 = this._decompressWorker();
          return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t2);
        }, _decompressWorker: function() {
          return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data);
        } };
        for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, f = 0; f < u.length; f++) n.prototype[u[f]] = l;
        t.exports = n;
      }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t) {
        (function(t2) {
          "use strict";
          var r, n, e2 = t2.MutationObserver || t2.WebKitMutationObserver;
          if (e2) {
            var i = 0, s = new e2(u), a = t2.document.createTextNode("");
            s.observe(a, { characterData: true }), r = function() {
              a.data = i = ++i % 2;
            };
          } else if (t2.setImmediate || void 0 === t2.MessageChannel) r = "document" in t2 && "onreadystatechange" in t2.document.createElement("script") ? function() {
            var e3 = t2.document.createElement("script");
            e3.onreadystatechange = function() {
              u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
            }, t2.document.documentElement.appendChild(e3);
          } : function() {
            setTimeout(u, 0);
          };
          else {
            var o = new t2.MessageChannel();
            o.port1.onmessage = u, r = function() {
              o.port2.postMessage(0);
            };
          }
          var h = [];
          function u() {
            var e3, t3;
            n = true;
            for (var r2 = h.length; r2; ) {
              for (t3 = h, h = [], e3 = -1; ++e3 < r2; ) t3[e3]();
              r2 = h.length;
            }
            n = false;
          }
          l.exports = function(e3) {
            1 !== h.push(e3) || n || r();
          };
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}], 37: [function(e, t, r) {
        "use strict";
        var i = e("immediate");
        function u() {
        }
        var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
        function o(e2) {
          if ("function" != typeof e2) throw new TypeError("resolver must be a function");
          this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
        }
        function h(e2, t2, r2) {
          this.promise = e2, "function" == typeof t2 && (this.onFulfilled = t2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
        }
        function f(t2, r2, n2) {
          i(function() {
            var e2;
            try {
              e2 = r2(n2);
            } catch (e3) {
              return l.reject(t2, e3);
            }
            e2 === t2 ? l.reject(t2, new TypeError("Cannot resolve promise with itself")) : l.resolve(t2, e2);
          });
        }
        function c(e2) {
          var t2 = e2 && e2.then;
          if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t2) return function() {
            t2.apply(e2, arguments);
          };
        }
        function d(t2, e2) {
          var r2 = false;
          function n2(e3) {
            r2 || (r2 = true, l.reject(t2, e3));
          }
          function i2(e3) {
            r2 || (r2 = true, l.resolve(t2, e3));
          }
          var s2 = p(function() {
            e2(i2, n2);
          });
          "error" === s2.status && n2(s2.value);
        }
        function p(e2, t2) {
          var r2 = {};
          try {
            r2.value = e2(t2), r2.status = "success";
          } catch (e3) {
            r2.status = "error", r2.value = e3;
          }
          return r2;
        }
        (t.exports = o).prototype.finally = function(t2) {
          if ("function" != typeof t2) return this;
          var r2 = this.constructor;
          return this.then(function(e2) {
            return r2.resolve(t2()).then(function() {
              return e2;
            });
          }, function(e2) {
            return r2.resolve(t2()).then(function() {
              throw e2;
            });
          });
        }, o.prototype.catch = function(e2) {
          return this.then(null, e2);
        }, o.prototype.then = function(e2, t2) {
          if ("function" != typeof e2 && this.state === a || "function" != typeof t2 && this.state === s) return this;
          var r2 = new this.constructor(u);
          this.state !== n ? f(r2, this.state === a ? e2 : t2, this.outcome) : this.queue.push(new h(r2, e2, t2));
          return r2;
        }, h.prototype.callFulfilled = function(e2) {
          l.resolve(this.promise, e2);
        }, h.prototype.otherCallFulfilled = function(e2) {
          f(this.promise, this.onFulfilled, e2);
        }, h.prototype.callRejected = function(e2) {
          l.reject(this.promise, e2);
        }, h.prototype.otherCallRejected = function(e2) {
          f(this.promise, this.onRejected, e2);
        }, l.resolve = function(e2, t2) {
          var r2 = p(c, t2);
          if ("error" === r2.status) return l.reject(e2, r2.value);
          var n2 = r2.value;
          if (n2) d(e2, n2);
          else {
            e2.state = a, e2.outcome = t2;
            for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; ) e2.queue[i2].callFulfilled(t2);
          }
          return e2;
        }, l.reject = function(e2, t2) {
          e2.state = s, e2.outcome = t2;
          for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; ) e2.queue[r2].callRejected(t2);
          return e2;
        }, o.resolve = function(e2) {
          if (e2 instanceof this) return e2;
          return l.resolve(new this(u), e2);
        }, o.reject = function(e2) {
          var t2 = new this(u);
          return l.reject(t2, e2);
        }, o.all = function(e2) {
          var r2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var n2 = e2.length, i2 = false;
          if (!n2) return this.resolve([]);
          var s2 = new Array(n2), a2 = 0, t2 = -1, o2 = new this(u);
          for (; ++t2 < n2; ) h2(e2[t2], t2);
          return o2;
          function h2(e3, t3) {
            r2.resolve(e3).then(function(e4) {
              s2[t3] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
            }, function(e4) {
              i2 || (i2 = true, l.reject(o2, e4));
            });
          }
        }, o.race = function(e2) {
          var t2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var r2 = e2.length, n2 = false;
          if (!r2) return this.resolve([]);
          var i2 = -1, s2 = new this(u);
          for (; ++i2 < r2; ) a2 = e2[i2], t2.resolve(a2).then(function(e3) {
            n2 || (n2 = true, l.resolve(s2, e3));
          }, function(e3) {
            n2 || (n2 = true, l.reject(s2, e3));
          });
          var a2;
          return s2;
        };
      }, { immediate: 36 }], 38: [function(e, t, r) {
        "use strict";
        var n = {};
        (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n;
      }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t, r) {
        "use strict";
        var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
        function p(e2) {
          if (!(this instanceof p)) return new p(e2);
          this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 < t2.windowBits ? t2.windowBits = -t2.windowBits : t2.gzip && 0 < t2.windowBits && t2.windowBits < 16 && (t2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
          var r2 = a.deflateInit2(this.strm, t2.level, t2.method, t2.windowBits, t2.memLevel, t2.strategy);
          if (r2 !== l) throw new Error(i[r2]);
          if (t2.header && a.deflateSetHeader(this.strm, t2.header), t2.dictionary) {
            var n2;
            if (n2 = "string" == typeof t2.dictionary ? h.string2buf(t2.dictionary) : "[object ArrayBuffer]" === u.call(t2.dictionary) ? new Uint8Array(t2.dictionary) : t2.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l) throw new Error(i[r2]);
            this._dict_set = true;
          }
        }
        function n(e2, t2) {
          var r2 = new p(t2);
          if (r2.push(e2, true), r2.err) throw r2.msg || i[r2.err];
          return r2.result;
        }
        p.prototype.push = function(e2, t2) {
          var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
          if (this.ended) return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? 4 : 0, "string" == typeof e2 ? i2.input = h.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
          do {
            if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l) return this.onEnd(r2), !(this.ended = true);
            0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
          } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
          return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
        }, p.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, p.prototype.onEnd = function(e2) {
          e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Deflate = p, r.deflate = n, r.deflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, n(e2, t2);
        }, r.gzip = function(e2, t2) {
          return (t2 = t2 || {}).gzip = true, n(e2, t2);
        };
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t, r) {
        "use strict";
        var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
        function a(e2) {
          if (!(this instanceof a)) return new a(e2);
          this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 <= t2.windowBits && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(0 <= t2.windowBits && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), 15 < t2.windowBits && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
          var r2 = c.inflateInit2(this.strm, t2.windowBits);
          if (r2 !== m.Z_OK) throw new Error(n[r2]);
          this.header = new s(), c.inflateGetHeader(this.strm, this.header);
        }
        function o(e2, t2) {
          var r2 = new a(t2);
          if (r2.push(e2, true), r2.err) throw r2.msg || n[r2.err];
          return r2.result;
        }
        a.prototype.push = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
          if (this.ended) return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h.input = p.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h.input = new Uint8Array(e2) : h.input = e2, h.next_in = 0, h.avail_in = h.input.length;
          do {
            if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK) return this.onEnd(r2), !(this.ended = true);
            h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - i2, a2 = p.buf2string(h.output, i2), h.next_out = s2, h.avail_out = u - s2, s2 && d.arraySet(h.output, h.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
          } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
          return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
        }, a.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, a.prototype.onEnd = function(e2) {
          e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, o(e2, t2);
        }, r.ungzip = o;
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
        r.assign = function(e2) {
          for (var t2 = Array.prototype.slice.call(arguments, 1); t2.length; ) {
            var r2 = t2.shift();
            if (r2) {
              if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
              for (var n2 in r2) r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
            }
          }
          return e2;
        }, r.shrinkBuf = function(e2, t2) {
          return e2.length === t2 ? e2 : e2.subarray ? e2.subarray(0, t2) : (e2.length = t2, e2);
        };
        var i = { arraySet: function(e2, t2, r2, n2, i2) {
          if (t2.subarray && e2.subarray) e2.set(t2.subarray(r2, r2 + n2), i2);
          else for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          var t2, r2, n2, i2, s2, a;
          for (t2 = n2 = 0, r2 = e2.length; t2 < r2; t2++) n2 += e2[t2].length;
          for (a = new Uint8Array(n2), t2 = i2 = 0, r2 = e2.length; t2 < r2; t2++) s2 = e2[t2], a.set(s2, i2), i2 += s2.length;
          return a;
        } }, s = { arraySet: function(e2, t2, r2, n2, i2) {
          for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          return [].concat.apply([], e2);
        } };
        r.setTyped = function(e2) {
          e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
        }, r.setTyped(n);
      }, {}], 42: [function(e, t, r) {
        "use strict";
        var h = e("./common"), i = true, s = true;
        try {
          String.fromCharCode.apply(null, [0]);
        } catch (e2) {
          i = false;
        }
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch (e2) {
          s = false;
        }
        for (var u = new h.Buf8(256), n = 0; n < 256; n++) u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
        function l(e2, t2) {
          if (t2 < 65537 && (e2.subarray && s || !e2.subarray && i)) return String.fromCharCode.apply(null, h.shrinkBuf(e2, t2));
          for (var r2 = "", n2 = 0; n2 < t2; n2++) r2 += String.fromCharCode(e2[n2]);
          return r2;
        }
        u[254] = u[254] = 1, r.string2buf = function(e2) {
          var t2, r2, n2, i2, s2, a = e2.length, o = 0;
          for (i2 = 0; i2 < a; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
          for (t2 = new h.Buf8(o), i2 = s2 = 0; s2 < o; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
          return t2;
        }, r.buf2binstring = function(e2) {
          return l(e2, e2.length);
        }, r.binstring2buf = function(e2) {
          for (var t2 = new h.Buf8(e2.length), r2 = 0, n2 = t2.length; r2 < n2; r2++) t2[r2] = e2.charCodeAt(r2);
          return t2;
        }, r.buf2string = function(e2, t2) {
          var r2, n2, i2, s2, a = t2 || e2.length, o = new Array(2 * a);
          for (r2 = n2 = 0; r2 < a; ) if ((i2 = e2[r2++]) < 128) o[n2++] = i2;
          else if (4 < (s2 = u[i2])) o[n2++] = 65533, r2 += s2 - 1;
          else {
            for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; ) i2 = i2 << 6 | 63 & e2[r2++], s2--;
            1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
          }
          return l(o, n2);
        }, r.utf8border = function(e2, t2) {
          var r2;
          for ((t2 = t2 || e2.length) > e2.length && (t2 = e2.length), r2 = t2 - 1; 0 <= r2 && 128 == (192 & e2[r2]); ) r2--;
          return r2 < 0 ? t2 : 0 === r2 ? t2 : r2 + u[e2[r2]] > t2 ? r2 : t2;
        };
      }, { "./common": 41 }], 43: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2, r2, n) {
          for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
            for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t2[n++] | 0) | 0, --a; ) ;
            i %= 65521, s %= 65521;
          }
          return i | s << 16 | 0;
        };
      }, {}], 44: [function(e, t, r) {
        "use strict";
        t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
      }, {}], 45: [function(e, t, r) {
        "use strict";
        var o = (function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n = 0; n < 8; n++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        })();
        t.exports = function(e2, t2, r2, n) {
          var i = o, s = n + r2;
          e2 ^= -1;
          for (var a = n; a < s; a++) e2 = e2 >>> 8 ^ i[255 & (e2 ^ t2[a])];
          return -1 ^ e2;
        };
      }, {}], 46: [function(e, t, r) {
        "use strict";
        var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C2 = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
        function R(e2, t2) {
          return e2.msg = n[t2], t2;
        }
        function T(e2) {
          return (e2 << 1) - (4 < e2 ? 9 : 0);
        }
        function D(e2) {
          for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
        }
        function F(e2) {
          var t2 = e2.state, r2 = t2.pending;
          r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t2.pending_buf, t2.pending_out, r2, e2.next_out), e2.next_out += r2, t2.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t2.pending -= r2, 0 === t2.pending && (t2.pending_out = 0));
        }
        function N(e2, t2) {
          u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t2), e2.block_start = e2.strstart, F(e2.strm);
        }
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = t2;
        }
        function P(e2, t2) {
          e2.pending_buf[e2.pending++] = t2 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t2;
        }
        function L(e2, t2) {
          var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h2 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
          e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
          do {
            if (u2[(r2 = t2) + a2] === p2 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
              s2 += 2, r2++;
              do {
              } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
              if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
                if (e2.match_start = t2, o2 <= (a2 = n2)) break;
                d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
              }
            }
          } while ((t2 = f2[t2 & l2]) > h2 && 0 != --i2);
          return a2 <= e2.lookahead ? a2 : e2.lookahead;
        }
        function j(e2) {
          var t2, r2, n2, i2, s2, a2, o2, h2, u2, l2, f2 = e2.w_size;
          do {
            if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
              for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t2 = r2 = e2.hash_size; n2 = e2.head[--t2], e2.head[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              for (t2 = r2 = f2; n2 = e2.prev[--t2], e2.prev[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              i2 += f2;
            }
            if (0 === e2.strm.avail_in) break;
            if (a2 = e2.strm, o2 = e2.window, h2 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x) for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); ) ;
          } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
        }
        function Z(e2, t2) {
          for (var r2, n2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x) if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
              for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; ) ;
              e2.strstart++;
            } else e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
            else n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
            if (n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function W(e2, t2) {
          for (var r2, n2, i2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
              for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; ) ;
              if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
            } else if (e2.match_available) {
              if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out) return A;
            } else e2.match_available = 1, e2.strstart++, e2.lookahead--;
          }
          return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function M(e2, t2, r2, n2, i2) {
          this.good_length = e2, this.max_lazy = t2, this.nice_length = r2, this.max_chain = n2, this.func = i2;
        }
        function H() {
          this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
        }
        function G(e2) {
          var t2;
          return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t2 = e2.state).pending = 0, t2.pending_out = 0, t2.wrap < 0 && (t2.wrap = -t2.wrap), t2.status = t2.wrap ? C2 : E, e2.adler = 2 === t2.wrap ? 0 : 1, t2.last_flush = l, u._tr_init(t2), m) : R(e2, _);
        }
        function K2(e2) {
          var t2 = G(e2);
          return t2 === m && (function(e3) {
            e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h[e3.level].max_lazy, e3.good_match = h[e3.level].good_length, e3.nice_match = h[e3.level].nice_length, e3.max_chain_length = h[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
          })(e2.state), t2;
        }
        function Y(e2, t2, r2, n2, i2, s2) {
          if (!e2) return _;
          var a2 = 1;
          if (t2 === g && (t2 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t2 < 0 || 9 < t2 || s2 < 0 || b < s2) return R(e2, _);
          8 === n2 && (n2 = 9);
          var o2 = new H();
          return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t2, o2.strategy = s2, o2.method = r2, K2(e2);
        }
        h = [new M(0, 0, 0, 0, function(e2, t2) {
          var r2 = 65535;
          for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
            if (e2.lookahead <= 1) {
              if (j(e2), 0 === e2.lookahead && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            e2.strstart += e2.lookahead, e2.lookahead = 0;
            var n2 = e2.block_start + r2;
            if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out)) return A;
            if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = 0, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
        }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t2) {
          return Y(e2, t2, v, 15, 8, 0);
        }, r.deflateInit2 = Y, r.deflateReset = K2, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t2) {
          return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t2, m) : _;
        }, r.deflate = function(e2, t2) {
          var r2, n2, i2, s2;
          if (!e2 || !e2.state || 5 < t2 || t2 < 0) return e2 ? R(e2, _) : _;
          if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t2 !== f) return R(e2, 0 === e2.avail_out ? -5 : _);
          if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t2, n2.status === C2) if (2 === n2.wrap) e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
          else {
            var a2 = v + (n2.w_bits - 8 << 4) << 8;
            a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
          }
          if (69 === n2.status) if (n2.gzhead.extra) {
            for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); ) U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
          } else n2.status = 73;
          if (73 === n2.status) if (n2.gzhead.name) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
          } else n2.status = 91;
          if (91 === n2.status) if (n2.gzhead.comment) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
          } else n2.status = 103;
          if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
            if (F(e2), 0 === e2.avail_out) return n2.last_flush = -1, m;
          } else if (0 === e2.avail_in && T(t2) <= T(r2) && t2 !== f) return R(e2, -5);
          if (666 === n2.status && 0 !== e2.avail_in) return R(e2, -5);
          if (0 !== e2.avail_in || 0 !== n2.lookahead || t2 !== l && 666 !== n2.status) {
            var o2 = 2 === n2.strategy ? (function(e3, t3) {
              for (var r3; ; ) {
                if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
                  if (t3 === l) return A;
                  break;
                }
                if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            })(n2, t2) : 3 === n2.strategy ? (function(e3, t3) {
              for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
                if (e3.lookahead <= S) {
                  if (j(e3), e3.lookahead <= S && t3 === l) return A;
                  if (0 === e3.lookahead) break;
                }
                if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
                  s3 = e3.strstart + S;
                  do {
                  } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
                  e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
                }
                if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            })(n2, t2) : h[n2.level].func(n2, t2);
            if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O) return 0 === e2.avail_out && (n2.last_flush = -1), m;
            if (o2 === I && (1 === t2 ? u._tr_align(n2) : 5 !== t2 && (u._tr_stored_block(n2, 0, 0, false), 3 === t2 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out)) return n2.last_flush = -1, m;
          }
          return t2 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
        }, r.deflateEnd = function(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state.status) !== C2 && 69 !== t2 && 73 !== t2 && 91 !== t2 && 103 !== t2 && t2 !== E && 666 !== t2 ? R(e2, _) : (e2.state = null, t2 === E ? R(e2, -3) : m) : _;
        }, r.deflateSetDictionary = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2 = t2.length;
          if (!e2 || !e2.state) return _;
          if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C2 || r2.lookahead) return _;
          for (1 === s2 && (e2.adler = d(e2.adler, t2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t2, l2 - r2.w_size, r2.w_size, 0), t2 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h2 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t2, j(r2); r2.lookahead >= x; ) {
            for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; ) ;
            r2.strstart = n2, r2.lookahead = x - 1, j(r2);
          }
          return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h2, e2.avail_in = a2, r2.wrap = s2, m;
        }, r.deflateInfo = "pako deflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
        };
      }, {}], 48: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2) {
          var r2, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C2;
          r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C2 = e2.output, a = s - (t2 - e2.avail_out), o = s + (e2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
          e: do {
            p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g];
            t: for (; ; ) {
              if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C2[s++] = 65535 & v;
              else {
                if (!(16 & y)) {
                  if (0 == (64 & y)) {
                    v = m[(65535 & v) + (d & (1 << y) - 1)];
                    continue t;
                  }
                  if (32 & y) {
                    r2.mode = 12;
                    break e;
                  }
                  e2.msg = "invalid literal/length code", r2.mode = 30;
                  break e;
                }
                w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b];
                r: for (; ; ) {
                  if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                    if (0 == (64 & y)) {
                      v = _[(65535 & v) + (d & (1 << y) - 1)];
                      continue r;
                    }
                    e2.msg = "invalid distance code", r2.mode = 30;
                    break e;
                  }
                  if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) {
                    e2.msg = "invalid distance too far back", r2.mode = 30;
                    break e;
                  }
                  if (d >>>= y, p -= y, (y = s - a) < k) {
                    if (l < (y = k - y) && r2.sane) {
                      e2.msg = "invalid distance too far back", r2.mode = 30;
                      break e;
                    }
                    if (S = c, (x = 0) === f) {
                      if (x += u - y, y < w) {
                        for (w -= y; C2[s++] = c[x++], --y; ) ;
                        x = s - k, S = C2;
                      }
                    } else if (f < y) {
                      if (x += u + f - y, (y -= f) < w) {
                        for (w -= y; C2[s++] = c[x++], --y; ) ;
                        if (x = 0, f < w) {
                          for (w -= y = f; C2[s++] = c[x++], --y; ) ;
                          x = s - k, S = C2;
                        }
                      }
                    } else if (x += f - y, y < w) {
                      for (w -= y; C2[s++] = c[x++], --y; ) ;
                      x = s - k, S = C2;
                    }
                    for (; 2 < w; ) C2[s++] = S[x++], C2[s++] = S[x++], C2[s++] = S[x++], w -= 3;
                    w && (C2[s++] = S[x++], 1 < w && (C2[s++] = S[x++]));
                  } else {
                    for (x = s - k; C2[s++] = C2[x++], C2[s++] = C2[x++], C2[s++] = C2[x++], 2 < (w -= 3); ) ;
                    w && (C2[s++] = C2[x++], 1 < w && (C2[s++] = C2[x++]));
                  }
                  break;
                }
              }
              break;
            }
          } while (n < i && s < o);
          n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p;
        };
      }, {}], 49: [function(e, t, r) {
        "use strict";
        var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
        function L(e2) {
          return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
        }
        function s() {
          this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
        }
        function a(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state, e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = P, t2.last = 0, t2.havedict = 0, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new I.Buf32(n), t2.distcode = t2.distdyn = new I.Buf32(i), t2.sane = 1, t2.back = -1, N) : U;
        }
        function o(e2) {
          var t2;
          return e2 && e2.state ? ((t2 = e2.state).wsize = 0, t2.whave = 0, t2.wnext = 0, a(e2)) : U;
        }
        function h(e2, t2) {
          var r2, n2;
          return e2 && e2.state ? (n2 = e2.state, t2 < 0 ? (r2 = 0, t2 = -t2) : (r2 = 1 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || 15 < t2) ? U : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = r2, n2.wbits = t2, o(e2))) : U;
        }
        function u(e2, t2) {
          var r2, n2;
          return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h(e2, t2)) !== N && (e2.state = null), r2) : U;
        }
        var l, f, c = true;
        function j(e2) {
          if (c) {
            var t2;
            for (l = new I.Buf32(512), f = new I.Buf32(32), t2 = 0; t2 < 144; ) e2.lens[t2++] = 8;
            for (; t2 < 256; ) e2.lens[t2++] = 9;
            for (; t2 < 280; ) e2.lens[t2++] = 7;
            for (; t2 < 288; ) e2.lens[t2++] = 8;
            for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; ) e2.lens[t2++] = 5;
            T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
          }
          e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
        }
        function Z(e2, t2, r2, n2) {
          var i2, s2 = e2.state;
          return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t2, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t2, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
        }
        r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(e2) {
          return u(e2, 15);
        }, r.inflateInit2 = u, r.inflate = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2, f2, c2, d, p, m, _, g, b, v, y, w, k, x, S, z, C2 = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
          if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in) return U;
          12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h2, x = N;
          e: for (; ; ) switch (r2.mode) {
            case P:
              if (0 === r2.wrap) {
                r2.mode = 13;
                break;
              }
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (2 & r2.wrap && 35615 === u2) {
                E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                break;
              }
              if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                e2.msg = "incorrect header check", r2.mode = 30;
                break;
              }
              if (8 != (15 & u2)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits) r2.wbits = k;
              else if (k > r2.wbits) {
                e2.msg = "invalid window size", r2.mode = 30;
                break;
              }
              r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
              break;
            case 2:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.flags = u2, 8 != (255 & r2.flags)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (57344 & r2.flags) {
                e2.msg = "unknown header flags set", r2.mode = 30;
                break;
              }
              r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
            case 3:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
            case 4:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
            case 5:
              if (1024 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
              } else r2.head && (r2.head.extra = null);
              r2.mode = 6;
            case 6:
              if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length)) break e;
              r2.length = 0, r2.mode = 7;
            case 7:
              if (2048 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.name = null);
              r2.length = 0, r2.mode = 8;
            case 8:
              if (4096 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.comment = null);
              r2.mode = 9;
            case 9:
              if (512 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (65535 & r2.check)) {
                  e2.msg = "header crc mismatch", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
              break;
            case 10:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
            case 11:
              if (0 === r2.havedict) return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
              e2.adler = r2.check = 1, r2.mode = 12;
            case 12:
              if (5 === t2 || 6 === t2) break e;
            case 13:
              if (r2.last) {
                u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                break;
              }
              for (; l2 < 3; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                case 0:
                  r2.mode = 14;
                  break;
                case 1:
                  if (j(r2), r2.mode = 20, 6 !== t2) break;
                  u2 >>>= 2, l2 -= 2;
                  break e;
                case 2:
                  r2.mode = 17;
                  break;
                case 3:
                  e2.msg = "invalid block type", r2.mode = 30;
              }
              u2 >>>= 2, l2 -= 2;
              break;
            case 14:
              for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                e2.msg = "invalid stored block lengths", r2.mode = 30;
                break;
              }
              if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t2) break e;
            case 15:
              r2.mode = 16;
            case 16:
              if (d = r2.length) {
                if (o2 < d && (d = o2), h2 < d && (d = h2), 0 === d) break e;
                I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h2 -= d, a2 += d, r2.length -= d;
                break;
              }
              r2.mode = 12;
              break;
            case 17:
              for (; l2 < 14; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                e2.msg = "too many length or distance symbols", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 18;
            case 18:
              for (; r2.have < r2.ncode; ) {
                for (; l2 < 3; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
              }
              for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
              if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid code lengths set", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 19;
            case 19:
              for (; r2.have < r2.nlen + r2.ndist; ) {
                for (; g = (C2 = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C2, !((_ = C2 >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (b < 16) u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                else {
                  if (16 === b) {
                    for (z = _ + 2; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                      e2.msg = "invalid bit length repeat", r2.mode = 30;
                      break;
                    }
                    k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                  } else if (17 === b) {
                    for (z = _ + 3; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                  } else {
                    for (z = _ + 7; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                  }
                  if (r2.have + d > r2.nlen + r2.ndist) {
                    e2.msg = "invalid bit length repeat", r2.mode = 30;
                    break;
                  }
                  for (; d--; ) r2.lens[r2.have++] = k;
                }
              }
              if (30 === r2.mode) break;
              if (0 === r2.lens[256]) {
                e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                break;
              }
              if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid literal/lengths set", r2.mode = 30;
                break;
              }
              if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                e2.msg = "invalid distances set", r2.mode = 30;
                break;
              }
              if (r2.mode = 20, 6 === t2) break e;
            case 20:
              r2.mode = 21;
            case 21:
              if (6 <= o2 && 258 <= h2) {
                e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                break;
              }
              for (r2.back = 0; g = (C2 = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C2, !((_ = C2 >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (g && 0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C2 = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C2, !(v + (_ = C2 >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                r2.mode = 26;
                break;
              }
              if (32 & g) {
                r2.back = -1, r2.mode = 12;
                break;
              }
              if (64 & g) {
                e2.msg = "invalid literal/length code", r2.mode = 30;
                break;
              }
              r2.extra = 15 & g, r2.mode = 22;
            case 22:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              r2.was = r2.length, r2.mode = 23;
            case 23:
              for (; g = (C2 = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C2, !((_ = C2 >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C2 = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C2, !(v + (_ = C2 >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                e2.msg = "invalid distance code", r2.mode = 30;
                break;
              }
              r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
            case 24:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              if (r2.offset > r2.dmax) {
                e2.msg = "invalid distance too far back", r2.mode = 30;
                break;
              }
              r2.mode = 25;
            case 25:
              if (0 === h2) break e;
              if (d = c2 - h2, r2.offset > d) {
                if ((d = r2.offset - d) > r2.whave && r2.sane) {
                  e2.msg = "invalid distance too far back", r2.mode = 30;
                  break;
                }
                p = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
              } else m = i2, p = a2 - r2.offset, d = r2.length;
              for (h2 < d && (d = h2), h2 -= d, r2.length -= d; i2[a2++] = m[p++], --d; ) ;
              0 === r2.length && (r2.mode = 21);
              break;
            case 26:
              if (0 === h2) break e;
              i2[a2++] = r2.length, h2--, r2.mode = 21;
              break;
            case 27:
              if (r2.wrap) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 |= n2[s2++] << l2, l2 += 8;
                }
                if (c2 -= h2, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
                  e2.msg = "incorrect data check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 28;
            case 28:
              if (r2.wrap && r2.flags) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (4294967295 & r2.total)) {
                  e2.msg = "incorrect length check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 29;
            case 29:
              x = 1;
              break e;
            case 30:
              x = -3;
              break e;
            case 31:
              return -4;
            case 32:
            default:
              return U;
          }
          return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t2)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t2) && x === N && (x = -5), x);
        }, r.inflateEnd = function(e2) {
          if (!e2 || !e2.state) return U;
          var t2 = e2.state;
          return t2.window && (t2.window = null), e2.state = null, N;
        }, r.inflateGetHeader = function(e2, t2) {
          var r2;
          return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t2).done = false, N) : U;
        }, r.inflateSetDictionary = function(e2, t2) {
          var r2, n2 = t2.length;
          return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t2, n2, 0) !== r2.check ? -3 : Z(e2, t2, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
        }, r.inflateInfo = "pako inflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t, r) {
        "use strict";
        var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
        t.exports = function(e2, t2, r2, n, i, s, a, o) {
          var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C2 = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
          for (b = 0; b <= 15; b++) O[b] = 0;
          for (v = 0; v < n; v++) O[t2[r2 + v]]++;
          for (k = g, w = 15; 1 <= w && 0 === O[w]; w--) ;
          if (w < k && (k = w), 0 === w) return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
          for (y = 1; y < w && 0 === O[y]; y++) ;
          for (k < y && (k = y), b = z = 1; b <= 15; b++) if (z <<= 1, (z -= O[b]) < 0) return -1;
          if (0 < z && (0 === e2 || 1 !== w)) return -1;
          for (B[1] = 0, b = 1; b < 15; b++) B[b + 1] = B[b] + O[b];
          for (v = 0; v < n; v++) 0 !== t2[r2 + v] && (a[B[t2[r2 + v]]++] = v);
          if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C2 = 1 << (x = k)) - 1, 1 === e2 && 852 < C2 || 2 === e2 && 592 < C2) return 1;
          for (; ; ) {
            for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; ) ;
            for (h = 1 << b - 1; E & h; ) h >>= 1;
            if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
              if (b === w) break;
              b = t2[r2 + a[v]];
            }
            if (k < b && (E & f) !== l) {
              for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
              if (C2 += 1 << x, 1 === e2 && 852 < C2 || 2 === e2 && 592 < C2) return 1;
              i[l = E & f] = k << 24 | x << 16 | c - s | 0;
            }
          }
          return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
        };
      }, { "../utils/common": 41 }], 51: [function(e, t, r) {
        "use strict";
        t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
      }, {}], 52: [function(e, t, r) {
        "use strict";
        var i = e("../utils/common"), o = 0, h = 1;
        function n(e2) {
          for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
        }
        var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
        n(z);
        var C2 = new Array(2 * f);
        n(C2);
        var E = new Array(512);
        n(E);
        var A = new Array(256);
        n(A);
        var I = new Array(a);
        n(I);
        var O, B, R, T = new Array(f);
        function D(e2, t2, r2, n2, i2) {
          this.static_tree = e2, this.extra_bits = t2, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
        }
        function F(e2, t2) {
          this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t2;
        }
        function N(e2) {
          return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
        }
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = 255 & t2, e2.pending_buf[e2.pending++] = t2 >>> 8 & 255;
        }
        function P(e2, t2, r2) {
          e2.bi_valid > d - r2 ? (e2.bi_buf |= t2 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t2 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t2 << e2.bi_valid & 65535, e2.bi_valid += r2);
        }
        function L(e2, t2, r2) {
          P(e2, r2[2 * t2], r2[2 * t2 + 1]);
        }
        function j(e2, t2) {
          for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t2; ) ;
          return r2 >>> 1;
        }
        function Z(e2, t2, r2) {
          var n2, i2, s2 = new Array(g + 1), a2 = 0;
          for (n2 = 1; n2 <= g; n2++) s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
          for (i2 = 0; i2 <= t2; i2++) {
            var o2 = e2[2 * i2 + 1];
            0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
          }
        }
        function W(e2) {
          var t2;
          for (t2 = 0; t2 < l; t2++) e2.dyn_ltree[2 * t2] = 0;
          for (t2 = 0; t2 < f; t2++) e2.dyn_dtree[2 * t2] = 0;
          for (t2 = 0; t2 < c; t2++) e2.bl_tree[2 * t2] = 0;
          e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
        }
        function M(e2) {
          8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
        }
        function H(e2, t2, r2, n2) {
          var i2 = 2 * t2, s2 = 2 * r2;
          return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t2] <= n2[r2];
        }
        function G(e2, t2, r2) {
          for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t2, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t2, n2, e2.heap[i2], e2.depth)); ) e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
          e2.heap[r2] = n2;
        }
        function K2(e2, t2, r2) {
          var n2, i2, s2, a2, o2 = 0;
          if (0 !== e2.last_lit) for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t2) : (L(e2, (s2 = A[i2]) + u + 1, t2), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; ) ;
          L(e2, m, t2);
        }
        function Y(e2, t2) {
          var r2, n2, i2, s2 = t2.dyn_tree, a2 = t2.stat_desc.static_tree, o2 = t2.stat_desc.has_stree, h2 = t2.stat_desc.elems, u2 = -1;
          for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h2; r2++) 0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
          for (; e2.heap_len < 2; ) s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
          for (t2.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--) G(e2, s2, r2);
          for (i2 = h2; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; ) ;
          e2.heap[--e2.heap_max] = e2.heap[1], (function(e3, t3) {
            var r3, n3, i3, s3, a3, o3, h3 = t3.dyn_tree, u3 = t3.max_code, l2 = t3.stat_desc.static_tree, f2 = t3.stat_desc.has_stree, c2 = t3.stat_desc.extra_bits, d2 = t3.stat_desc.extra_base, p2 = t3.stat_desc.max_length, m2 = 0;
            for (s3 = 0; s3 <= g; s3++) e3.bl_count[s3] = 0;
            for (h3[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++) p2 < (s3 = h3[2 * h3[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h3[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
            if (0 !== m2) {
              do {
                for (s3 = p2 - 1; 0 === e3.bl_count[s3]; ) s3--;
                e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p2]--, m2 -= 2;
              } while (0 < m2);
              for (s3 = p2; 0 !== s3; s3--) for (n3 = e3.bl_count[s3]; 0 !== n3; ) u3 < (i3 = e3.heap[--r3]) || (h3[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h3[2 * i3 + 1]) * h3[2 * i3], h3[2 * i3 + 1] = s3), n3--);
            }
          })(e2, t2), Z(s2, u2, e2.bl_count);
        }
        function X(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), t2[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++) i2 = a2, a2 = t2[2 * (n2 + 1) + 1], ++o2 < h2 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
        }
        function V(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++) if (i2 = a2, a2 = t2[2 * (n2 + 1) + 1], !(++o2 < h2 && i2 === a2)) {
            if (o2 < u2) for (; L(e2, i2, e2.bl_tree), 0 != --o2; ) ;
            else 0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
            s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
          }
        }
        n(T);
        var q = false;
        function J(e2, t2, r2, n2) {
          P(e2, (s << 1) + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
            M(e3), n3 && (U(e3, r3), U(e3, ~r3)), i.arraySet(e3.pending_buf, e3.window, t3, r3, e3.pending), e3.pending += r3;
          })(e2, t2, r2, true);
        }
        r._tr_init = function(e2) {
          q || ((function() {
            var e3, t2, r2, n2, i2, s2 = new Array(g + 1);
            for (n2 = r2 = 0; n2 < a - 1; n2++) for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++) A[r2++] = n2;
            for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++) for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++) E[i2++] = n2;
            for (i2 >>= 7; n2 < f; n2++) for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++) E[256 + i2++] = n2;
            for (t2 = 0; t2 <= g; t2++) s2[t2] = 0;
            for (e3 = 0; e3 <= 143; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (; e3 <= 255; ) z[2 * e3 + 1] = 9, e3++, s2[9]++;
            for (; e3 <= 279; ) z[2 * e3 + 1] = 7, e3++, s2[7]++;
            for (; e3 <= 287; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++) C2[2 * e3 + 1] = 5, C2[2 * e3] = j(e3, 5);
            O = new D(z, w, u + 1, l, g), B = new D(C2, k, 0, f, g), R = new D(new Array(0), x, 0, c, p);
          })(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
        }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t2, r2, n2) {
          var i2, s2, a2 = 0;
          0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = (function(e3) {
            var t3, r3 = 4093624447;
            for (t3 = 0; t3 <= 31; t3++, r3 >>>= 1) if (1 & r3 && 0 !== e3.dyn_ltree[2 * t3]) return o;
            if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26]) return h;
            for (t3 = 32; t3 < u; t3++) if (0 !== e3.dyn_ltree[2 * t3]) return h;
            return o;
          })(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = (function(e3) {
            var t3;
            for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t3 = c - 1; 3 <= t3 && 0 === e3.bl_tree[2 * S[t3] + 1]; t3--) ;
            return e3.opt_len += 3 * (t3 + 1) + 5 + 5 + 4, t3;
          })(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t2 ? J(e2, t2, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K2(e2, z, C2)) : (P(e2, 4 + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
            var i3;
            for (P(e3, t3 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++) P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
            V(e3, e3.dyn_ltree, t3 - 1), V(e3, e3.dyn_dtree, r3 - 1);
          })(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K2(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
        }, r._tr_tally = function(e2, t2, r2) {
          return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t2 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t2, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t2 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t2--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t2)]++), e2.last_lit === e2.lit_bufsize - 1;
        }, r._tr_align = function(e2) {
          P(e2, 2, 3), L(e2, m, z), (function(e3) {
            16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
          })(e2);
        };
      }, { "../utils/common": 41 }], 53: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
        };
      }, {}], 54: [function(e, t, r) {
        (function(e2) {
          !(function(r2, n) {
            "use strict";
            if (!r2.setImmediate) {
              var i, s, t2, a, o = 1, h = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
              e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
                process.nextTick(function() {
                  c(e4);
                });
              } : (function() {
                if (r2.postMessage && !r2.importScripts) {
                  var e4 = true, t3 = r2.onmessage;
                  return r2.onmessage = function() {
                    e4 = false;
                  }, r2.postMessage("", "*"), r2.onmessage = t3, e4;
                }
              })() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
                r2.postMessage(a + e4, "*");
              }) : r2.MessageChannel ? ((t2 = new MessageChannel()).port1.onmessage = function(e4) {
                c(e4.data);
              }, function(e4) {
                t2.port2.postMessage(e4);
              }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
                var t3 = l.createElement("script");
                t3.onreadystatechange = function() {
                  c(e4), t3.onreadystatechange = null, s.removeChild(t3), t3 = null;
                }, s.appendChild(t3);
              }) : function(e4) {
                setTimeout(c, 0, e4);
              }, e3.setImmediate = function(e4) {
                "function" != typeof e4 && (e4 = new Function("" + e4));
                for (var t3 = new Array(arguments.length - 1), r3 = 0; r3 < t3.length; r3++) t3[r3] = arguments[r3 + 1];
                var n2 = { callback: e4, args: t3 };
                return h[o] = n2, i(o), o++;
              }, e3.clearImmediate = f;
            }
            function f(e4) {
              delete h[e4];
            }
            function c(e4) {
              if (u) setTimeout(c, 0, e4);
              else {
                var t3 = h[e4];
                if (t3) {
                  u = true;
                  try {
                    !(function(e5) {
                      var t4 = e5.callback, r3 = e5.args;
                      switch (r3.length) {
                        case 0:
                          t4();
                          break;
                        case 1:
                          t4(r3[0]);
                          break;
                        case 2:
                          t4(r3[0], r3[1]);
                          break;
                        case 3:
                          t4(r3[0], r3[1], r3[2]);
                          break;
                        default:
                          t4.apply(n, r3);
                      }
                    })(t3);
                  } finally {
                    f(e4), u = false;
                  }
                }
              }
            }
            function d(e4) {
              e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
            }
          })("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}] }, {}, [10])(10);
    });
  }
});

// node_modules/sql.js/dist/sql-wasm-browser.js
var require_sql_wasm_browser = __commonJS({
  "node_modules/sql.js/dist/sql-wasm-browser.js"(exports, module2) {
    var initSqlJsPromise = void 0;
    var initSqlJs2 = function(moduleConfig) {
      if (initSqlJsPromise) {
        return initSqlJsPromise;
      }
      initSqlJsPromise = new Promise(function(resolveModule, reject) {
        var Module = typeof moduleConfig !== "undefined" ? moduleConfig : {};
        var originalOnAbortFunction = Module["onAbort"];
        Module["onAbort"] = function(errorThatCausedAbort) {
          reject(new Error(errorThatCausedAbort));
          if (originalOnAbortFunction) {
            originalOnAbortFunction(errorThatCausedAbort);
          }
        };
        Module["postRun"] = Module["postRun"] || [];
        Module["postRun"].push(function() {
          resolveModule(Module);
        });
        module2 = void 0;
        var k;
        k ||= typeof Module !== "undefined" ? Module : {};
        var aa = !!globalThis.window, ba = !!globalThis.WorkerGlobalScope, da = {
          SQLITE_ABORT: 4,
          SQLITE_ABORT_ROLLBACK: 516,
          SQLITE_ACCESS_EXISTS: 0,
          SQLITE_ACCESS_READ: 2,
          SQLITE_ACCESS_READWRITE: 1,
          SQLITE_ALTER_TABLE: 26,
          SQLITE_ANALYZE: 28,
          SQLITE_ANY: 5,
          SQLITE_ATTACH: 24,
          SQLITE_AUTH: 23,
          SQLITE_AUTH_USER: 279,
          SQLITE_BLOB: 4,
          SQLITE_BUSY: 5,
          SQLITE_BUSY_RECOVERY: 261,
          SQLITE_BUSY_SNAPSHOT: 517,
          SQLITE_BUSY_TIMEOUT: 773,
          SQLITE_CANTOPEN: 14,
          SQLITE_CANTOPEN_CONVPATH: 1038,
          SQLITE_CANTOPEN_DIRTYWAL: 1294,
          SQLITE_CANTOPEN_FULLPATH: 782,
          SQLITE_CANTOPEN_ISDIR: 526,
          SQLITE_CANTOPEN_NOTEMPDIR: 270,
          SQLITE_CANTOPEN_SYMLINK: 1550,
          SQLITE_CARRAY_BLOB: 4,
          SQLITE_CARRAY_DOUBLE: 2,
          SQLITE_CARRAY_INT32: 0,
          SQLITE_CARRAY_INT64: 1,
          SQLITE_CARRAY_TEXT: 3,
          SQLITE_CHECKPOINT_FULL: 1,
          SQLITE_CHECKPOINT_NOOP: -1,
          SQLITE_CHECKPOINT_PASSIVE: 0,
          SQLITE_CHECKPOINT_RESTART: 2,
          SQLITE_CHECKPOINT_TRUNCATE: 3,
          SQLITE_CONFIG_COVERING_INDEX_SCAN: 20,
          SQLITE_CONFIG_GETMALLOC: 5,
          SQLITE_CONFIG_GETMUTEX: 11,
          SQLITE_CONFIG_GETPCACHE: 15,
          SQLITE_CONFIG_GETPCACHE2: 19,
          SQLITE_CONFIG_HEAP: 8,
          SQLITE_CONFIG_LOG: 16,
          SQLITE_CONFIG_LOOKASIDE: 13,
          SQLITE_CONFIG_MALLOC: 4,
          SQLITE_CONFIG_MEMDB_MAXSIZE: 29,
          SQLITE_CONFIG_MEMSTATUS: 9,
          SQLITE_CONFIG_MMAP_SIZE: 22,
          SQLITE_CONFIG_MULTITHREAD: 2,
          SQLITE_CONFIG_MUTEX: 10,
          SQLITE_CONFIG_PAGECACHE: 7,
          SQLITE_CONFIG_PCACHE: 14,
          SQLITE_CONFIG_PCACHE2: 18,
          SQLITE_CONFIG_PCACHE_HDRSZ: 24,
          SQLITE_CONFIG_PMASZ: 25,
          SQLITE_CONFIG_ROWID_IN_VIEW: 30,
          SQLITE_CONFIG_SCRATCH: 6,
          SQLITE_CONFIG_SERIALIZED: 3,
          SQLITE_CONFIG_SINGLETHREAD: 1,
          SQLITE_CONFIG_SMALL_MALLOC: 27,
          SQLITE_CONFIG_SORTERREF_SIZE: 28,
          SQLITE_CONFIG_SQLLOG: 21,
          SQLITE_CONFIG_STMTJRNL_SPILL: 26,
          SQLITE_CONFIG_URI: 17,
          SQLITE_CONFIG_WIN32_HEAPSIZE: 23,
          SQLITE_CONSTRAINT: 19,
          SQLITE_CONSTRAINT_CHECK: 275,
          SQLITE_CONSTRAINT_COMMITHOOK: 531,
          SQLITE_CONSTRAINT_DATATYPE: 3091,
          SQLITE_CONSTRAINT_FOREIGNKEY: 787,
          SQLITE_CONSTRAINT_FUNCTION: 1043,
          SQLITE_CONSTRAINT_NOTNULL: 1299,
          SQLITE_CONSTRAINT_PINNED: 2835,
          SQLITE_CONSTRAINT_PRIMARYKEY: 1555,
          SQLITE_CONSTRAINT_ROWID: 2579,
          SQLITE_CONSTRAINT_TRIGGER: 1811,
          SQLITE_CONSTRAINT_UNIQUE: 2067,
          SQLITE_CONSTRAINT_VTAB: 2323,
          SQLITE_COPY: 0,
          SQLITE_CORRUPT: 11,
          SQLITE_CORRUPT_INDEX: 779,
          SQLITE_CORRUPT_SEQUENCE: 523,
          SQLITE_CORRUPT_VTAB: 267,
          SQLITE_CREATE_INDEX: 1,
          SQLITE_CREATE_TABLE: 2,
          SQLITE_CREATE_TEMP_INDEX: 3,
          SQLITE_CREATE_TEMP_TABLE: 4,
          SQLITE_CREATE_TEMP_TRIGGER: 5,
          SQLITE_CREATE_TEMP_VIEW: 6,
          SQLITE_CREATE_TRIGGER: 7,
          SQLITE_CREATE_VIEW: 8,
          SQLITE_CREATE_VTABLE: 29,
          SQLITE_DBCONFIG_DEFENSIVE: 1010,
          SQLITE_DBCONFIG_DQS_DDL: 1014,
          SQLITE_DBCONFIG_DQS_DML: 1013,
          SQLITE_DBCONFIG_ENABLE_ATTACH_CREATE: 1020,
          SQLITE_DBCONFIG_ENABLE_ATTACH_WRITE: 1021,
          SQLITE_DBCONFIG_ENABLE_COMMENTS: 1022,
          SQLITE_DBCONFIG_ENABLE_FKEY: 1002,
          SQLITE_DBCONFIG_ENABLE_FTS3_TOKENIZER: 1004,
          SQLITE_DBCONFIG_ENABLE_LOAD_EXTENSION: 1005,
          SQLITE_DBCONFIG_ENABLE_QPSG: 1007,
          SQLITE_DBCONFIG_ENABLE_TRIGGER: 1003,
          SQLITE_DBCONFIG_ENABLE_VIEW: 1015,
          SQLITE_DBCONFIG_FP_DIGITS: 1023,
          SQLITE_DBCONFIG_LEGACY_ALTER_TABLE: 1012,
          SQLITE_DBCONFIG_LEGACY_FILE_FORMAT: 1016,
          SQLITE_DBCONFIG_LOOKASIDE: 1001,
          SQLITE_DBCONFIG_MAINDBNAME: 1e3,
          SQLITE_DBCONFIG_MAX: 1023,
          SQLITE_DBCONFIG_NO_CKPT_ON_CLOSE: 1006,
          SQLITE_DBCONFIG_RESET_DATABASE: 1009,
          SQLITE_DBCONFIG_REVERSE_SCANORDER: 1019,
          SQLITE_DBCONFIG_STMT_SCANSTATUS: 1018,
          SQLITE_DBCONFIG_TRIGGER_EQP: 1008,
          SQLITE_DBCONFIG_TRUSTED_SCHEMA: 1017,
          SQLITE_DBCONFIG_WRITABLE_SCHEMA: 1011,
          SQLITE_DBSTATUS_CACHE_HIT: 7,
          SQLITE_DBSTATUS_CACHE_MISS: 8,
          SQLITE_DBSTATUS_CACHE_SPILL: 12,
          SQLITE_DBSTATUS_CACHE_USED: 1,
          SQLITE_DBSTATUS_CACHE_USED_SHARED: 11,
          SQLITE_DBSTATUS_CACHE_WRITE: 9,
          SQLITE_DBSTATUS_DEFERRED_FKS: 10,
          SQLITE_DBSTATUS_LOOKASIDE_HIT: 4,
          SQLITE_DBSTATUS_LOOKASIDE_MISS_FULL: 6,
          SQLITE_DBSTATUS_LOOKASIDE_MISS_SIZE: 5,
          SQLITE_DBSTATUS_LOOKASIDE_USED: 0,
          SQLITE_DBSTATUS_MAX: 13,
          SQLITE_DBSTATUS_SCHEMA_USED: 2,
          SQLITE_DBSTATUS_STMT_USED: 3,
          SQLITE_DBSTATUS_TEMPBUF_SPILL: 13,
          SQLITE_DELETE: 9,
          SQLITE_DENY: 1,
          SQLITE_DESERIALIZE_FREEONCLOSE: 1,
          SQLITE_DESERIALIZE_READONLY: 4,
          SQLITE_DESERIALIZE_RESIZEABLE: 2,
          SQLITE_DETACH: 25,
          SQLITE_DETERMINISTIC: 2048,
          SQLITE_DIRECTONLY: 524288,
          SQLITE_DONE: 101,
          SQLITE_DROP_INDEX: 10,
          SQLITE_DROP_TABLE: 11,
          SQLITE_DROP_TEMP_INDEX: 12,
          SQLITE_DROP_TEMP_TABLE: 13,
          SQLITE_DROP_TEMP_TRIGGER: 14,
          SQLITE_DROP_TEMP_VIEW: 15,
          SQLITE_DROP_TRIGGER: 16,
          SQLITE_DROP_VIEW: 17,
          SQLITE_DROP_VTABLE: 30,
          SQLITE_EMPTY: 16,
          SQLITE_ERROR: 1,
          SQLITE_ERROR_KEY: 1281,
          SQLITE_ERROR_MISSING_COLLSEQ: 257,
          SQLITE_ERROR_RESERVESIZE: 1025,
          SQLITE_ERROR_RETRY: 513,
          SQLITE_ERROR_SNAPSHOT: 769,
          SQLITE_ERROR_UNABLE: 1537,
          SQLITE_FAIL: 3,
          SQLITE_FCNTL_BEGIN_ATOMIC_WRITE: 31,
          SQLITE_FCNTL_BLOCK_ON_CONNECT: 44,
          SQLITE_FCNTL_BUSYHANDLER: 15,
          SQLITE_FCNTL_CHUNK_SIZE: 6,
          SQLITE_FCNTL_CKPT_DONE: 37,
          SQLITE_FCNTL_CKPT_START: 39,
          SQLITE_FCNTL_CKSM_FILE: 41,
          SQLITE_FCNTL_COMMIT_ATOMIC_WRITE: 32,
          SQLITE_FCNTL_COMMIT_PHASETWO: 22,
          SQLITE_FCNTL_DATA_VERSION: 35,
          SQLITE_FCNTL_EXTERNAL_READER: 40,
          SQLITE_FCNTL_FILESTAT: 45,
          SQLITE_FCNTL_FILE_POINTER: 7,
          SQLITE_FCNTL_GET_LOCKPROXYFILE: 2,
          SQLITE_FCNTL_HAS_MOVED: 20,
          SQLITE_FCNTL_JOURNAL_POINTER: 28,
          SQLITE_FCNTL_LAST_ERRNO: 4,
          SQLITE_FCNTL_LOCKSTATE: 1,
          SQLITE_FCNTL_LOCK_TIMEOUT: 34,
          SQLITE_FCNTL_MMAP_SIZE: 18,
          SQLITE_FCNTL_NULL_IO: 43,
          SQLITE_FCNTL_OVERWRITE: 11,
          SQLITE_FCNTL_PDB: 30,
          SQLITE_FCNTL_PERSIST_WAL: 10,
          SQLITE_FCNTL_POWERSAFE_OVERWRITE: 13,
          SQLITE_FCNTL_PRAGMA: 14,
          SQLITE_FCNTL_RBU: 26,
          SQLITE_FCNTL_RESERVE_BYTES: 38,
          SQLITE_FCNTL_RESET_CACHE: 42,
          SQLITE_FCNTL_ROLLBACK_ATOMIC_WRITE: 33,
          SQLITE_FCNTL_SET_LOCKPROXYFILE: 3,
          SQLITE_FCNTL_SIZE_HINT: 5,
          SQLITE_FCNTL_SIZE_LIMIT: 36,
          SQLITE_FCNTL_SYNC: 21,
          SQLITE_FCNTL_SYNC_OMITTED: 8,
          SQLITE_FCNTL_TEMPFILENAME: 16,
          SQLITE_FCNTL_TRACE: 19,
          SQLITE_FCNTL_VFSNAME: 12,
          SQLITE_FCNTL_VFS_POINTER: 27,
          SQLITE_FCNTL_WAL_BLOCK: 24,
          SQLITE_FCNTL_WIN32_AV_RETRY: 9,
          SQLITE_FCNTL_WIN32_GET_HANDLE: 29,
          SQLITE_FCNTL_WIN32_SET_HANDLE: 23,
          SQLITE_FCNTL_ZIPVFS: 25,
          SQLITE_FINISH: 2,
          SQLITE_FLOAT: 2,
          SQLITE_FORMAT: 24,
          SQLITE_FULL: 13,
          SQLITE_FUNCTION: 31,
          SQLITE_GET_LOCKPROXYFILE: 2,
          SQLITE_IGNORE: 2,
          SQLITE_INDEX_CONSTRAINT_EQ: 2,
          SQLITE_INDEX_CONSTRAINT_FUNCTION: 150,
          SQLITE_INDEX_CONSTRAINT_GE: 32,
          SQLITE_INDEX_CONSTRAINT_GLOB: 66,
          SQLITE_INDEX_CONSTRAINT_GT: 4,
          SQLITE_INDEX_CONSTRAINT_IS: 72,
          SQLITE_INDEX_CONSTRAINT_ISNOT: 69,
          SQLITE_INDEX_CONSTRAINT_ISNOTNULL: 70,
          SQLITE_INDEX_CONSTRAINT_ISNULL: 71,
          SQLITE_INDEX_CONSTRAINT_LE: 8,
          SQLITE_INDEX_CONSTRAINT_LIKE: 65,
          SQLITE_INDEX_CONSTRAINT_LIMIT: 73,
          SQLITE_INDEX_CONSTRAINT_LT: 16,
          SQLITE_INDEX_CONSTRAINT_MATCH: 64,
          SQLITE_INDEX_CONSTRAINT_NE: 68,
          SQLITE_INDEX_CONSTRAINT_OFFSET: 74,
          SQLITE_INDEX_CONSTRAINT_REGEXP: 67,
          SQLITE_INDEX_SCAN_HEX: 2,
          SQLITE_INDEX_SCAN_UNIQUE: 1,
          SQLITE_INNOCUOUS: 2097152,
          SQLITE_INSERT: 18,
          SQLITE_INTEGER: 1,
          SQLITE_INTERNAL: 2,
          SQLITE_INTERRUPT: 9,
          SQLITE_IOCAP_ATOMIC: 1,
          SQLITE_IOCAP_ATOMIC16K: 64,
          SQLITE_IOCAP_ATOMIC1K: 4,
          SQLITE_IOCAP_ATOMIC2K: 8,
          SQLITE_IOCAP_ATOMIC32K: 128,
          SQLITE_IOCAP_ATOMIC4K: 16,
          SQLITE_IOCAP_ATOMIC512: 2,
          SQLITE_IOCAP_ATOMIC64K: 256,
          SQLITE_IOCAP_ATOMIC8K: 32,
          SQLITE_IOCAP_BATCH_ATOMIC: 16384,
          SQLITE_IOCAP_IMMUTABLE: 8192,
          SQLITE_IOCAP_POWERSAFE_OVERWRITE: 4096,
          SQLITE_IOCAP_SAFE_APPEND: 512,
          SQLITE_IOCAP_SEQUENTIAL: 1024,
          SQLITE_IOCAP_SUBPAGE_READ: 32768,
          SQLITE_IOCAP_UNDELETABLE_WHEN_OPEN: 2048,
          SQLITE_IOERR: 10,
          SQLITE_IOERR_ACCESS: 3338,
          SQLITE_IOERR_AUTH: 7178,
          SQLITE_IOERR_BADKEY: 8970,
          SQLITE_IOERR_BEGIN_ATOMIC: 7434,
          SQLITE_IOERR_BLOCKED: 2826,
          SQLITE_IOERR_CHECKRESERVEDLOCK: 3594,
          SQLITE_IOERR_CLOSE: 4106,
          SQLITE_IOERR_CODEC: 9226,
          SQLITE_IOERR_COMMIT_ATOMIC: 7690,
          SQLITE_IOERR_CONVPATH: 6666,
          SQLITE_IOERR_CORRUPTFS: 8458,
          SQLITE_IOERR_DATA: 8202,
          SQLITE_IOERR_DELETE: 2570,
          SQLITE_IOERR_DELETE_NOENT: 5898,
          SQLITE_IOERR_DIR_CLOSE: 4362,
          SQLITE_IOERR_DIR_FSYNC: 1290,
          SQLITE_IOERR_FSTAT: 1802,
          SQLITE_IOERR_FSYNC: 1034,
          SQLITE_IOERR_GETTEMPPATH: 6410,
          SQLITE_IOERR_IN_PAGE: 8714,
          SQLITE_IOERR_LOCK: 3850,
          SQLITE_IOERR_MMAP: 6154,
          SQLITE_IOERR_NOMEM: 3082,
          SQLITE_IOERR_RDLOCK: 2314,
          SQLITE_IOERR_READ: 266,
          SQLITE_IOERR_ROLLBACK_ATOMIC: 7946,
          SQLITE_IOERR_SEEK: 5642,
          SQLITE_IOERR_SHMLOCK: 5130,
          SQLITE_IOERR_SHMMAP: 5386,
          SQLITE_IOERR_SHMOPEN: 4618,
          SQLITE_IOERR_SHMSIZE: 4874,
          SQLITE_IOERR_SHORT_READ: 522,
          SQLITE_IOERR_TRUNCATE: 1546,
          SQLITE_IOERR_UNLOCK: 2058,
          SQLITE_IOERR_VNODE: 6922,
          SQLITE_IOERR_WRITE: 778,
          SQLITE_LAST_ERRNO: 4,
          SQLITE_LIMIT_ATTACHED: 7,
          SQLITE_LIMIT_COLUMN: 2,
          SQLITE_LIMIT_COMPOUND_SELECT: 4,
          SQLITE_LIMIT_EXPR_DEPTH: 3,
          SQLITE_LIMIT_FUNCTION_ARG: 6,
          SQLITE_LIMIT_LENGTH: 0,
          SQLITE_LIMIT_LIKE_PATTERN_LENGTH: 8,
          SQLITE_LIMIT_PARSER_DEPTH: 12,
          SQLITE_LIMIT_SCHEMA: 13,
          SQLITE_LIMIT_SQL_LENGTH: 1,
          SQLITE_LIMIT_TRIGGER_DEPTH: 10,
          SQLITE_LIMIT_TRIGGER_STEPS: 14,
          SQLITE_LIMIT_VARIABLE_NUMBER: 9,
          SQLITE_LIMIT_VDBE_OP: 5,
          SQLITE_LIMIT_WORKER_THREADS: 11,
          SQLITE_LOCKED: 6,
          SQLITE_LOCKED_SHAREDCACHE: 262,
          SQLITE_LOCKED_VTAB: 518,
          SQLITE_LOCK_EXCLUSIVE: 4,
          SQLITE_LOCK_NONE: 0,
          SQLITE_LOCK_PENDING: 3,
          SQLITE_LOCK_RESERVED: 2,
          SQLITE_LOCK_SHARED: 1,
          SQLITE_MISMATCH: 20,
          SQLITE_MISUSE: 21,
          SQLITE_MUTEX_FAST: 0,
          SQLITE_MUTEX_RECURSIVE: 1,
          SQLITE_MUTEX_STATIC_APP1: 8,
          SQLITE_MUTEX_STATIC_APP2: 9,
          SQLITE_MUTEX_STATIC_APP3: 10,
          SQLITE_MUTEX_STATIC_LRU: 6,
          SQLITE_MUTEX_STATIC_LRU2: 7,
          SQLITE_MUTEX_STATIC_MAIN: 2,
          SQLITE_MUTEX_STATIC_MASTER: 2,
          SQLITE_MUTEX_STATIC_MEM: 3,
          SQLITE_MUTEX_STATIC_MEM2: 4,
          SQLITE_MUTEX_STATIC_OPEN: 4,
          SQLITE_MUTEX_STATIC_PMEM: 7,
          SQLITE_MUTEX_STATIC_PRNG: 5,
          SQLITE_MUTEX_STATIC_VFS1: 11,
          SQLITE_MUTEX_STATIC_VFS2: 12,
          SQLITE_MUTEX_STATIC_VFS3: 13,
          SQLITE_NOLFS: 22,
          SQLITE_NOMEM: 7,
          SQLITE_NOTADB: 26,
          SQLITE_NOTFOUND: 12,
          SQLITE_NOTICE: 27,
          SQLITE_NOTICE_RBU: 795,
          SQLITE_NOTICE_RECOVER_ROLLBACK: 539,
          SQLITE_NOTICE_RECOVER_WAL: 283,
          SQLITE_NULL: 5,
          SQLITE_OK: 0,
          SQLITE_OK_LOAD_PERMANENTLY: 256,
          SQLITE_OK_SYMLINK: 512,
          SQLITE_OPEN_AUTOPROXY: 32,
          SQLITE_OPEN_CREATE: 4,
          SQLITE_OPEN_DELETEONCLOSE: 8,
          SQLITE_OPEN_EXCLUSIVE: 16,
          SQLITE_OPEN_EXRESCODE: 33554432,
          SQLITE_OPEN_FULLMUTEX: 65536,
          SQLITE_OPEN_MAIN_DB: 256,
          SQLITE_OPEN_MAIN_JOURNAL: 2048,
          SQLITE_OPEN_MASTER_JOURNAL: 16384,
          SQLITE_OPEN_MEMORY: 128,
          SQLITE_OPEN_NOFOLLOW: 16777216,
          SQLITE_OPEN_NOMUTEX: 32768,
          SQLITE_OPEN_PRIVATECACHE: 262144,
          SQLITE_OPEN_READONLY: 1,
          SQLITE_OPEN_READWRITE: 2,
          SQLITE_OPEN_SHAREDCACHE: 131072,
          SQLITE_OPEN_SUBJOURNAL: 8192,
          SQLITE_OPEN_SUPER_JOURNAL: 16384,
          SQLITE_OPEN_TEMP_DB: 512,
          SQLITE_OPEN_TEMP_JOURNAL: 4096,
          SQLITE_OPEN_TRANSIENT_DB: 1024,
          SQLITE_OPEN_URI: 64,
          SQLITE_OPEN_WAL: 524288,
          SQLITE_PERM: 3,
          SQLITE_PRAGMA: 19,
          SQLITE_PREPARE_DONT_LOG: 16,
          SQLITE_PREPARE_FROM_DDL: 32,
          SQLITE_PREPARE_NORMALIZE: 2,
          SQLITE_PREPARE_NO_VTAB: 4,
          SQLITE_PREPARE_PERSISTENT: 1,
          SQLITE_PROTOCOL: 15,
          SQLITE_RANGE: 25,
          SQLITE_READ: 20,
          SQLITE_READONLY: 8,
          SQLITE_READONLY_CANTINIT: 1288,
          SQLITE_READONLY_CANTLOCK: 520,
          SQLITE_READONLY_DBMOVED: 1032,
          SQLITE_READONLY_DIRECTORY: 1544,
          SQLITE_READONLY_RECOVERY: 264,
          SQLITE_READONLY_ROLLBACK: 776,
          SQLITE_RECURSIVE: 33,
          SQLITE_REINDEX: 27,
          SQLITE_REPLACE: 5,
          SQLITE_RESULT_SUBTYPE: 16777216,
          SQLITE_ROLLBACK: 1,
          SQLITE_ROW: 100,
          SQLITE_SAVEPOINT: 32,
          SQLITE_SCANSTAT_COMPLEX: 1,
          SQLITE_SCANSTAT_EST: 2,
          SQLITE_SCANSTAT_EXPLAIN: 4,
          SQLITE_SCANSTAT_NAME: 3,
          SQLITE_SCANSTAT_NCYCLE: 7,
          SQLITE_SCANSTAT_NLOOP: 0,
          SQLITE_SCANSTAT_NVISIT: 1,
          SQLITE_SCANSTAT_PARENTID: 6,
          SQLITE_SCANSTAT_SELECTID: 5,
          SQLITE_SCHEMA: 17,
          SQLITE_SELECT: 21,
          SQLITE_SELFORDER1: 33554432,
          SQLITE_SERIALIZE_NOCOPY: 1,
          SQLITE_SETLK_BLOCK_ON_CONNECT: 1,
          SQLITE_SET_LOCKPROXYFILE: 3,
          SQLITE_SHM_EXCLUSIVE: 8,
          SQLITE_SHM_LOCK: 2,
          SQLITE_SHM_NLOCK: 8,
          SQLITE_SHM_SHARED: 4,
          SQLITE_SHM_UNLOCK: 1,
          SQLITE_STATUS_MALLOC_COUNT: 9,
          SQLITE_STATUS_MALLOC_SIZE: 5,
          SQLITE_STATUS_MEMORY_USED: 0,
          SQLITE_STATUS_PAGECACHE_OVERFLOW: 2,
          SQLITE_STATUS_PAGECACHE_SIZE: 7,
          SQLITE_STATUS_PAGECACHE_USED: 1,
          SQLITE_STATUS_PARSER_STACK: 6,
          SQLITE_STATUS_SCRATCH_OVERFLOW: 4,
          SQLITE_STATUS_SCRATCH_SIZE: 8,
          SQLITE_STATUS_SCRATCH_USED: 3,
          SQLITE_STMTSTATUS_AUTOINDEX: 3,
          SQLITE_STMTSTATUS_FILTER_HIT: 8,
          SQLITE_STMTSTATUS_FILTER_MISS: 7,
          SQLITE_STMTSTATUS_FULLSCAN_STEP: 1,
          SQLITE_STMTSTATUS_MEMUSED: 99,
          SQLITE_STMTSTATUS_REPREPARE: 5,
          SQLITE_STMTSTATUS_RUN: 6,
          SQLITE_STMTSTATUS_SORT: 2,
          SQLITE_STMTSTATUS_VM_STEP: 4,
          SQLITE_SUBTYPE: 1048576,
          SQLITE_SYNC_DATAONLY: 16,
          SQLITE_SYNC_FULL: 3,
          SQLITE_SYNC_NORMAL: 2,
          SQLITE_TESTCTRL_ALWAYS: 13,
          SQLITE_TESTCTRL_ASSERT: 12,
          SQLITE_TESTCTRL_ATOF: 34,
          SQLITE_TESTCTRL_BENIGN_MALLOC_HOOKS: 10,
          SQLITE_TESTCTRL_BITVEC_TEST: 8,
          SQLITE_TESTCTRL_BYTEORDER: 22,
          SQLITE_TESTCTRL_EXPLAIN_STMT: 19,
          SQLITE_TESTCTRL_EXTRA_SCHEMA_CHECKS: 29,
          SQLITE_TESTCTRL_FAULT_INSTALL: 9,
          SQLITE_TESTCTRL_FIRST: 5,
          SQLITE_TESTCTRL_FK_NO_ACTION: 7,
          SQLITE_TESTCTRL_GETOPT: 16,
          SQLITE_TESTCTRL_IMPOSTER: 25,
          SQLITE_TESTCTRL_INTERNAL_FUNCTIONS: 17,
          SQLITE_TESTCTRL_ISINIT: 23,
          SQLITE_TESTCTRL_ISKEYWORD: 16,
          SQLITE_TESTCTRL_JSON_SELFCHECK: 14,
          SQLITE_TESTCTRL_LAST: 34,
          SQLITE_TESTCTRL_LOCALTIME_FAULT: 18,
          SQLITE_TESTCTRL_LOGEST: 33,
          SQLITE_TESTCTRL_NEVER_CORRUPT: 20,
          SQLITE_TESTCTRL_ONCE_RESET_THRESHOLD: 19,
          SQLITE_TESTCTRL_OPTIMIZATIONS: 15,
          SQLITE_TESTCTRL_PARSER_COVERAGE: 26,
          SQLITE_TESTCTRL_PENDING_BYTE: 11,
          SQLITE_TESTCTRL_PRNG_RESET: 7,
          SQLITE_TESTCTRL_PRNG_RESTORE: 6,
          SQLITE_TESTCTRL_PRNG_SAVE: 5,
          SQLITE_TESTCTRL_PRNG_SEED: 28,
          SQLITE_TESTCTRL_RESERVE: 14,
          SQLITE_TESTCTRL_RESULT_INTREAL: 27,
          SQLITE_TESTCTRL_SCRATCHMALLOC: 17,
          SQLITE_TESTCTRL_SEEK_COUNT: 30,
          SQLITE_TESTCTRL_SORTER_MMAP: 24,
          SQLITE_TESTCTRL_TRACEFLAGS: 31,
          SQLITE_TESTCTRL_TUNE: 32,
          SQLITE_TESTCTRL_USELONGDOUBLE: 34,
          SQLITE_TESTCTRL_VDBE_COVERAGE: 21,
          SQLITE_TEXT: 3,
          SQLITE_TOOBIG: 18,
          SQLITE_TRACE_CLOSE: 8,
          SQLITE_TRACE_PROFILE: 2,
          SQLITE_TRACE_ROW: 4,
          SQLITE_TRACE_STMT: 1,
          SQLITE_TRANSACTION: 22,
          SQLITE_TXN_NONE: 0,
          SQLITE_TXN_READ: 1,
          SQLITE_TXN_WRITE: 2,
          SQLITE_UPDATE: 23,
          SQLITE_UTF16: 4,
          SQLITE_UTF16BE: 3,
          SQLITE_UTF16LE: 2,
          SQLITE_UTF16_ALIGNED: 8,
          SQLITE_UTF8: 1,
          SQLITE_UTF8_ZT: 16,
          SQLITE_VERSION_NUMBER: 3054001,
          SQLITE_VTAB_CONSTRAINT_SUPPORT: 1,
          SQLITE_VTAB_DIRECTONLY: 3,
          SQLITE_VTAB_INNOCUOUS: 2,
          SQLITE_VTAB_USES_ALL_SCHEMAS: 4,
          SQLITE_WARNING: 28,
          SQLITE_WARNING_AUTOINDEX: 284,
          SQLITE_WIN32_DATA_DIRECTORY_TYPE: 1,
          SQLITE_WIN32_TEMP_DIRECTORY_TYPE: 2,
          SQLITE_XFER: 1
        }, ea = "SQLITE_ABORT SQLITE_ABORT_ROLLBACK SQLITE_AUTH SQLITE_AUTH_USER SQLITE_BUSY SQLITE_BUSY_RECOVERY SQLITE_BUSY_SNAPSHOT SQLITE_BUSY_TIMEOUT SQLITE_CANTOPEN SQLITE_CANTOPEN_CONVPATH SQLITE_CANTOPEN_DIRTYWAL SQLITE_CANTOPEN_FULLPATH SQLITE_CANTOPEN_ISDIR SQLITE_CANTOPEN_NOTEMPDIR SQLITE_CANTOPEN_SYMLINK SQLITE_CONSTRAINT SQLITE_CONSTRAINT_CHECK SQLITE_CONSTRAINT_COMMITHOOK SQLITE_CONSTRAINT_DATATYPE SQLITE_CONSTRAINT_FOREIGNKEY SQLITE_CONSTRAINT_FUNCTION SQLITE_CONSTRAINT_NOTNULL SQLITE_CONSTRAINT_PINNED SQLITE_CONSTRAINT_PRIMARYKEY SQLITE_CONSTRAINT_ROWID SQLITE_CONSTRAINT_TRIGGER SQLITE_CONSTRAINT_UNIQUE SQLITE_CONSTRAINT_VTAB SQLITE_CORRUPT SQLITE_CORRUPT_INDEX SQLITE_CORRUPT_SEQUENCE SQLITE_CORRUPT_VTAB SQLITE_DONE SQLITE_EMPTY SQLITE_ERROR SQLITE_ERROR_KEY SQLITE_ERROR_MISSING_COLLSEQ SQLITE_ERROR_RESERVESIZE SQLITE_ERROR_RETRY SQLITE_ERROR_SNAPSHOT SQLITE_ERROR_UNABLE SQLITE_FORMAT SQLITE_FULL SQLITE_INTERNAL SQLITE_INTERRUPT SQLITE_IOERR SQLITE_IOERR_ACCESS SQLITE_IOERR_AUTH SQLITE_IOERR_BADKEY SQLITE_IOERR_BEGIN_ATOMIC SQLITE_IOERR_BLOCKED SQLITE_IOERR_CHECKRESERVEDLOCK SQLITE_IOERR_CLOSE SQLITE_IOERR_CODEC SQLITE_IOERR_COMMIT_ATOMIC SQLITE_IOERR_CONVPATH SQLITE_IOERR_CORRUPTFS SQLITE_IOERR_DATA SQLITE_IOERR_DELETE SQLITE_IOERR_DELETE_NOENT SQLITE_IOERR_DIR_CLOSE SQLITE_IOERR_DIR_FSYNC SQLITE_IOERR_FSTAT SQLITE_IOERR_FSYNC SQLITE_IOERR_GETTEMPPATH SQLITE_IOERR_IN_PAGE SQLITE_IOERR_LOCK SQLITE_IOERR_MMAP SQLITE_IOERR_NOMEM SQLITE_IOERR_RDLOCK SQLITE_IOERR_READ SQLITE_IOERR_ROLLBACK_ATOMIC SQLITE_IOERR_SEEK SQLITE_IOERR_SHMLOCK SQLITE_IOERR_SHMMAP SQLITE_IOERR_SHMOPEN SQLITE_IOERR_SHMSIZE SQLITE_IOERR_SHORT_READ SQLITE_IOERR_TRUNCATE SQLITE_IOERR_UNLOCK SQLITE_IOERR_VNODE SQLITE_IOERR_WRITE SQLITE_LOCKED SQLITE_LOCKED_SHAREDCACHE SQLITE_LOCKED_VTAB SQLITE_MISMATCH SQLITE_MISUSE SQLITE_NOLFS SQLITE_NOMEM SQLITE_NOTADB SQLITE_NOTFOUND SQLITE_NOTICE SQLITE_NOTICE_RBU SQLITE_NOTICE_RECOVER_ROLLBACK SQLITE_NOTICE_RECOVER_WAL SQLITE_PERM SQLITE_PROTOCOL SQLITE_RANGE SQLITE_READONLY SQLITE_READONLY_CANTINIT SQLITE_READONLY_CANTLOCK SQLITE_READONLY_DBMOVED SQLITE_READONLY_DIRECTORY SQLITE_READONLY_RECOVERY SQLITE_READONLY_ROLLBACK SQLITE_ROW SQLITE_SCHEMA SQLITE_TOOBIG SQLITE_WARNING SQLITE_WARNING_AUTOINDEX".split(" ");
        k.onRuntimeInitialized = function() {
          function a(e, h) {
            nb(e, h instanceof Error ? h.message : String(h), -1);
          }
          function b(e, h) {
            switch (typeof h) {
              case "boolean":
                lc(e, h ? 1 : 0);
                break;
              case "number":
                mc(e, h);
                break;
              case "string":
                nc(e, h, l(h), -1);
                break;
              case "object":
                if (h === null) ob(e);
                else if (h.length != null) {
                  var p = fa(h.length);
                  v.set(h, p);
                  oc(e, p, h.length, -1);
                  ha(p);
                } else nb(e, "Wrong API use : tried to return a value of an unknown type (" + h + ").", -1);
                break;
              default:
                ob(e);
            }
          }
          function d(e, h) {
            for (var p = [], r = 0; r < e; r += 1) {
              var u = y(
                h + 4 * r,
                "i32"
              ), w = pc(u);
              if (w === 1 || w === 2) u = qc(u);
              else if (w === 3) w = pb(u), u = rc(u), u = A(u, w, true);
              else if (w === 4) {
                w = u;
                u = pb(w);
                w = sc(w);
                for (var x = new Uint8Array(u), G = 0; G < u; G += 1) x[G] = v[w + G];
                u = x;
              } else u = null;
              p.push(u);
            }
            return p;
          }
          function c(e, h) {
            this.Xa = e;
            this.db = h;
            this.Va = 1;
            this.Hb = [];
          }
          function f(e, h) {
            this.db = h;
            this.xb = ja(e);
            if (this.xb === null) throw Error("Unable to allocate memory for the SQL string");
            this.Cb = this.xb;
            this.ib = this.Nb = null;
          }
          function g(e) {
            this.filename = "dbfile_" + (4294967295 * Math.random() >>> 0);
            e != null && ka(
              this.filename,
              e
            );
            this.handleError(U(this.filename, q));
            this.db = y(q, "i32");
            z && tc(this.db);
            this.Eb = {};
            this.eb = /* @__PURE__ */ new Map();
          }
          function m(e, h) {
            return e.replace(/[A-Z]/g, function(p) {
              return p.toLowerCase();
            }) + ":" + h;
          }
          function t(e) {
            e.forEach(la);
          }
          var z = k.useOldExtensionFunctions !== false, q = oa(4), n = k.cwrap, F = {};
          ea.forEach(function(e) {
            F[da[e]] = e;
          });
          var U = n("sqlite3_open", "number", ["string", "number"]), ma = n("sqlite3_close_v2", "number", ["number"]), za = n("sqlite3_backup_init", "number", ["number", "string", "number", "string"]), na = n(
            "sqlite3_backup_step",
            "number",
            ["number", "number"]
          ), ca = n("sqlite3_backup_finish", "number", ["number"]), Aa = n("sqlite3_exec", "number", ["number", "number", "number", "number", "number"]), N = n("sqlite3_changes", "number", ["number"]), uc = n("sqlite3_sql", "string", ["number"]), vc = n("sqlite3_normalized_sql", "string", ["number"]), Pa = n("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]), wc = n("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]), rb = n("sqlite3_bind_blob", "number", [
            "number",
            "number",
            "number",
            "number",
            "number"
          ]), xc = n("sqlite3_bind_double", "number", ["number", "number", "number"]), yc = n("sqlite3_bind_int", "number", ["number", "number", "number"]), sb = n("sqlite3_bind_int64", "number", ["number", "number", "number"]), zc = typeof n("sqlite3_memory_used", "number", [])() === "bigint", Ac = n("sqlite3_bind_parameter_index", "number", ["number", "string"]), Bc = n("sqlite3_step", "number", ["number"]), ia = n("sqlite3_errmsg", "string", ["number"]), Cc = n("sqlite3_extended_errcode", "number", ["number"]), Dc = n(
            "sqlite3_column_count",
            "number",
            ["number"]
          ), Ec = n("sqlite3_data_count", "number", ["number"]), Fc = n("sqlite3_column_double", "number", ["number", "number"]), Gc = n("sqlite3_column_text", "number", ["number", "number"]), Hc = n("sqlite3_column_blob", "number", ["number", "number"]), tb = n("sqlite3_column_bytes", "number", ["number", "number"]), Ic = n("sqlite3_column_type", "number", ["number", "number"]), Jc = n("sqlite3_column_name", "string", ["number", "number"]), Kc = n("sqlite3_reset", "number", ["number"]), Lc = n("sqlite3_clear_bindings", "number", ["number"]), Mc = n("sqlite3_finalize", "number", ["number"]), ub = n("sqlite3_create_function_v2", "number", "number string number number number number number number number".split(" ")), pc = n("sqlite3_value_type", "number", ["number"]), pb = n("sqlite3_value_bytes", "number", ["number"]), rc = n("sqlite3_value_text", "number", ["number"]), sc = n("sqlite3_value_blob", "number", ["number"]), qc = n("sqlite3_value_double", "number", ["number"]), mc = n("sqlite3_result_double", "", ["number", "number"]), ob = n("sqlite3_result_null", "", ["number"]), nc = n("sqlite3_result_text", "", ["number", "string", "number", "number"]), oc = n("sqlite3_result_blob", "", ["number", "number", "number", "number"]), lc = n("sqlite3_result_int", "", ["number", "number"]), nb = n("sqlite3_result_error", "", ["number", "string", "number"]), vb = n("sqlite3_aggregate_context", "number", ["number", "number"]), tc = n("RegisterExtensionFunctions", "number", ["number"]), wb = n("sqlite3_update_hook", "number", ["number", "number", "number"]);
          c.prototype.bind = function(e) {
            if (!this.Xa) throw "Statement closed";
            this.reset();
            return Array.isArray(e) ? this.ec(e) : e != null && typeof e === "object" ? this.fc(e) : true;
          };
          c.prototype.step = function() {
            if (!this.Xa) throw "Statement closed";
            this.Va = 1;
            var e = Bc(this.Xa);
            switch (e) {
              case 100:
                return true;
              case 101:
                return false;
              default:
                throw this.db.handleError(e);
            }
          };
          c.prototype.Wb = function(e) {
            e == null && (e = this.Va, this.Va += 1);
            return Fc(this.Xa, e);
          };
          c.prototype.tc = function(e) {
            e == null && (e = this.Va, this.Va += 1);
            if (typeof BigInt !== "function") throw Error("BigInt is not supported");
            return BigInt(this.Xb(e));
          };
          c.prototype.Xb = function(e) {
            e == null && (e = this.Va, this.Va += 1);
            var h = Gc(this.Xa, e);
            e = tb(this.Xa, e);
            return A(h, e, true);
          };
          c.prototype.getBlob = function(e) {
            e == null && (e = this.Va, this.Va += 1);
            var h = tb(this.Xa, e);
            e = Hc(this.Xa, e);
            for (var p = new Uint8Array(h), r = 0; r < h; r += 1) p[r] = v[e + r];
            return p;
          };
          c.prototype.get = function(e, h) {
            h = h || {};
            e != null && this.bind(e) && this.step();
            e = [];
            for (var p = Ec(this.Xa), r = 0; r < p; r += 1) switch (Ic(this.Xa, r)) {
              case 1:
                var u = h.useBigInt ? this.tc(r) : this.Wb(r);
                e.push(u);
                break;
              case 2:
                e.push(this.Wb(r));
                break;
              case 3:
                e.push(this.Xb(r));
                break;
              case 4:
                e.push(this.getBlob(r));
                break;
              default:
                e.push(null);
            }
            return e;
          };
          c.prototype.Lb = function() {
            for (var e = [], h = Dc(this.Xa), p = 0; p < h; p += 1) e.push(Jc(this.Xa, p));
            return e;
          };
          c.prototype.Vb = function(e, h) {
            var p = this.get(e, h);
            e = this.Lb();
            return Object.fromEntries(e.map(function(r, u) {
              return [r, p[u]];
            }));
          };
          c.prototype.xc = function() {
            return uc(this.Xa);
          };
          c.prototype.uc = function() {
            return vc(this.Xa);
          };
          c.prototype.run = function(e) {
            e != null && this.bind(e);
            this.step();
            return this.reset();
          };
          c.prototype.jc = function(e, h) {
            h == null && (h = this.Va, this.Va += 1);
            var p = ja(e);
            this.Hb.push(p);
            this.db.handleError(wc(this.Xa, h, p, l(e), 0));
          };
          c.prototype.dc = function(e, h) {
            h == null && (h = this.Va, this.Va += 1);
            var p = fa(e.length);
            v.set(e, p);
            this.Hb.push(p);
            this.db.handleError(rb(this.Xa, h, p, e.length, 0));
          };
          c.prototype.Rb = function(e, h) {
            h == null && (h = this.Va, this.Va += 1);
            this.db.handleError((e === (e | 0) ? yc : xc)(this.Xa, h, e));
          };
          c.prototype.cc = function(e, h) {
            h == null && (h = this.Va, this.Va += 1);
            if (BigInt.asIntN(64, e) !== e) throw new RangeError("BigInt value is out of range for a 64-bit integer: " + e);
            e = zc ? sb(this.Xa, h, e) : sb(this.Xa, h, Number(BigInt.asIntN(32, e)), Number(e >> BigInt(32)));
            this.db.handleError(e);
          };
          c.prototype.hc = function(e) {
            e == null && (e = this.Va, this.Va += 1);
            rb(this.Xa, e, 0, 0, 0);
          };
          c.prototype.Sb = function(e, h) {
            h == null && (h = this.Va, this.Va += 1);
            switch (typeof e) {
              case "string":
                this.jc(e, h);
                return;
              case "number":
                this.Rb(e, h);
                return;
              case "bigint":
                this.cc(e, h);
                return;
              case "boolean":
                this.Rb(e + 0, h);
                return;
              case "object":
                if (e === null) {
                  this.hc(h);
                  return;
                }
                if (e.length != null) {
                  this.dc(e, h);
                  return;
                }
            }
            throw "Wrong API use : tried to bind a value of an unknown type (" + e + ").";
          };
          c.prototype.fc = function(e) {
            var h = this;
            Object.keys(e).forEach(function(p) {
              var r = Ac(h.Xa, p);
              r !== 0 && h.Sb(e[p], r);
            });
            return true;
          };
          c.prototype.ec = function(e) {
            for (var h = 0; h < e.length; h += 1) this.Sb(e[h], h + 1);
            return true;
          };
          c.prototype.reset = function() {
            this.Kb();
            return Lc(this.Xa) === 0 && Kc(this.Xa) === 0;
          };
          c.prototype.Kb = function() {
            for (var e; (e = this.Hb.pop()) !== void 0; ) ha(e);
          };
          c.prototype.mb = function() {
            this.Kb();
            var e = Mc(this.Xa) === 0;
            delete this.db.Eb[this.Xa];
            this.Xa = 0;
            return e;
          };
          f.prototype.next = function() {
            if (this.xb === null) return { done: true };
            this.ib !== null && (this.ib.mb(), this.ib = null);
            if (!this.db.db) throw this.yb(), Error("Database closed");
            var e = pa(), h = oa(4);
            qa(q);
            qa(h);
            try {
              this.db.handleError(Pa(this.db.db, this.Cb, -1, q, h));
              this.Cb = y(h, "i32");
              var p = y(q, "i32");
              if (p === 0) return this.yb(), { done: true };
              this.ib = new c(p, this.db);
              this.db.Eb[p] = this.ib;
              return { value: this.ib, done: false };
            } catch (r) {
              throw this.Nb = A(this.Cb), this.yb(), r;
            } finally {
              ra(e);
            }
          };
          f.prototype.yb = function() {
            ha(this.xb);
            this.xb = null;
          };
          f.prototype["return"] = function() {
            this.ib !== null && (this.ib.mb(), this.ib = null);
            this.yb();
            return { done: true };
          };
          f.prototype.vc = function() {
            return this.Nb !== null ? this.Nb : A(this.Cb);
          };
          typeof Symbol === "function" && typeof Symbol.iterator === "symbol" && (f.prototype[Symbol.iterator] = function() {
            return this;
          });
          g.prototype.run = function(e, h) {
            if (!this.db) throw "Database closed";
            if (h) {
              e = this.Ob(e, h);
              try {
                e.step();
              } finally {
                e.mb();
              }
            } else {
              e = ja(e);
              try {
                this.handleError(Aa(this.db, e, 0, 0, q));
              } finally {
                ha(e);
              }
            }
            return this;
          };
          g.prototype.exec = function(e, h, p) {
            if (!this.db) throw "Database closed";
            var r = pa(), u = null, w = null, x = null;
            try {
              x = w = ja(e);
              var G = oa(4);
              for (e = []; y(x, "i8") !== 0; ) {
                qa(q);
                qa(G);
                this.handleError(Pa(this.db, x, -1, q, G));
                var S = y(q, "i32");
                x = y(G, "i32");
                if (S !== 0) {
                  var D = null;
                  u = new c(S, this);
                  for (h != null && u.bind(h); u.step(); ) D === null && (D = { columns: u.Lb(), values: [] }, e.push(D)), D.values.push(u.get(null, p));
                  u.mb();
                }
              }
              return e;
            } catch (K2) {
              throw u && u.mb(), K2;
            } finally {
              w && ha(w), ra(r);
            }
          };
          g.prototype.qc = function(e, h, p, r, u) {
            typeof h === "function" && (r = p, p = h, h = void 0);
            e = this.Ob(e, h);
            try {
              for (; e.step(); ) p(e.Vb(
                null,
                u
              ));
            } finally {
              e.mb();
            }
            if (typeof r === "function") return r();
          };
          g.prototype.Ob = function(e, h) {
            e = ja(e);
            try {
              qa(q), this.handleError(Pa(this.db, e, -1, q, 0));
            } finally {
              ha(e);
            }
            e = y(q, "i32");
            if (e === 0) throw "Nothing to prepare";
            var p = new c(e, this);
            h != null && p.bind(h);
            return this.Eb[e] = p;
          };
          g.prototype.Ac = function(e) {
            return new f(e, this);
          };
          g.prototype.sc = function() {
            if (!this.db) throw Error("Database closed");
            var e = this.filename + "_export";
            ka(e, []);
            var h = 0, p = 0;
            try {
              var r = B(e).node, u = null, w = r.Ta.write;
              r.Ta = Object.create(r.Ta);
              r.Ta.write = function(S, D, K2, V, T) {
                if (u === null) return w(S, D, K2, V, T);
                r.Ya.set(D.subarray(K2, K2 + V), T);
                r.Za = Math.max(r.Za, T + V);
                return V;
              };
              var x = U(e, q);
              h = y(q, "i32");
              if (x !== 0) throw Error(ia(h));
              p = za(h, "main", this.db, "main");
              if (p === 0) throw Error(ia(h));
              x = na(p, 0);
              if (x === 0) {
                var G = this.exec("PRAGMA main.page_count; PRAGMA main.page_size");
                u = new Uint8Array(G[0].values[0][0] * G[1].values[0][0]);
                r.Ya = u;
                x = na(p, -1);
              }
              if (x === 5 || x === 6) throw Error("Unable to export: SQLite is busy or locked. Finish active write transactions before exporting.");
              if (x !== 101) throw Error(ia(h));
              x = ca(p);
              p = 0;
              if (x !== 0) throw Error(ia(h));
              x = ma(h);
              if (x !== 0) throw Error(ia(h));
              h = 0;
              u = new Uint8Array(r.Ya.buffer, r.Ya.byteOffset, r.Za);
              u.length > 0 && (u[18] = 1, u[19] = 1);
              return u;
            } finally {
              p !== 0 && ca(p), h !== 0 && ma(h), sa("/" + e);
            }
          };
          g.prototype.close = function() {
            this.db !== null && (Object.values(this.Eb).forEach(function(e) {
              e.mb();
            }), this.eb.forEach(t), this.eb.clear(), this.ob && (la(this.ob), this.ob = void 0), this.handleError(ma(this.db)), sa("/" + this.filename), this.db = null);
          };
          g.prototype.handleError = function(e) {
            if (e === 0) return null;
            var h = ia(this.db);
            var p = Cc(this.db);
            (p & 255) !== (e & 255) && (p = e);
            e = Error(h);
            e.code = F[p];
            e.errcode = p;
            throw e;
          };
          g.prototype.wc = function() {
            return N(this.db);
          };
          g.prototype.nc = function(e, h) {
            var p = m(e, h.length);
            this.eb.has(p) && (t(this.eb.get(p)), this.eb.delete(p));
            var r = ta(function(u, w, x) {
              w = d(w, x);
              try {
                var G = h.apply(null, w);
              } catch (S) {
                a(u, S);
                return;
              }
              b(u, G);
            }, "viii");
            this.eb.set(p, [r]);
            this.handleError(ub(this.db, e, h.length, 1, 0, r, 0, 0, 0));
            return this;
          };
          g.prototype.mc = function(e, h) {
            function p(D) {
              x.has(D) || x.set(D, r());
              return x.get(D);
            }
            var r = h.init || function() {
              return null;
            }, u = h.finalize || function(D) {
              return D;
            }, w = h.step;
            if (!w) throw "An aggregate function must have a step function in " + e;
            var x = /* @__PURE__ */ new Map();
            h = m(e, w.length - 1);
            this.eb.has(h) && (t(this.eb.get(h)), this.eb.delete(h));
            var G = ta(function(D, K2, V) {
              var T = vb(D, 1), Ra = p(T);
              K2 = d(K2, V);
              Ra = [Ra].concat(K2);
              try {
                x.set(T, w.apply(null, Ra));
              } catch (Nc) {
                x.delete(T), a(D, Nc);
              }
            }, "viii"), S = ta(
              function(D) {
                var K2 = vb(D, 1);
                try {
                  var V = u(p(K2));
                } catch (T) {
                  x.delete(K2);
                  a(D, T);
                  return;
                }
                b(D, V);
                x.delete(K2);
              },
              "vi"
            );
            this.eb.set(h, [G, S]);
            this.handleError(ub(this.db, e, w.length - 1, 1, 0, 0, G, S, 0));
            return this;
          };
          g.prototype.Hc = function(e) {
            this.ob && (wb(this.db, 0, 0), la(this.ob), this.ob = void 0);
            if (!e) return this;
            this.ob = ta(function(h, p, r, u, w) {
              switch (p) {
                case 18:
                  h = "insert";
                  break;
                case 23:
                  h = "update";
                  break;
                case 9:
                  h = "delete";
                  break;
                default:
                  throw "unknown operationCode in updateHook callback: " + p;
              }
              r = A(r);
              u = A(u);
              if (w > Number.MAX_SAFE_INTEGER) throw "rowId too big to fit inside a Number";
              e(h, r, u, Number(w));
            }, "viiiij");
            wb(
              this.db,
              this.ob,
              0
            );
            return this;
          };
          c.prototype.bind = c.prototype.bind;
          c.prototype.step = c.prototype.step;
          c.prototype.get = c.prototype.get;
          c.prototype.getColumnNames = c.prototype.Lb;
          c.prototype.getAsObject = c.prototype.Vb;
          c.prototype.getSQL = c.prototype.xc;
          c.prototype.getNormalizedSQL = c.prototype.uc;
          c.prototype.run = c.prototype.run;
          c.prototype.reset = c.prototype.reset;
          c.prototype.freemem = c.prototype.Kb;
          c.prototype.free = c.prototype.mb;
          f.prototype.next = f.prototype.next;
          f.prototype.getRemainingSQL = f.prototype.vc;
          g.prototype.run = g.prototype.run;
          g.prototype.exec = g.prototype.exec;
          g.prototype.each = g.prototype.qc;
          g.prototype.prepare = g.prototype.Ob;
          g.prototype.iterateStatements = g.prototype.Ac;
          g.prototype["export"] = g.prototype.sc;
          g.prototype.close = g.prototype.close;
          g.prototype.handleError = g.prototype.handleError;
          g.prototype.getRowsModified = g.prototype.wc;
          g.prototype.create_function = g.prototype.nc;
          g.prototype.create_aggregate = g.prototype.mc;
          g.prototype.updateHook = g.prototype.Hc;
          k.Database = g;
          k.constants = Object.freeze(da);
        };
        var ua = "./this.program", va = globalThis.document?.currentScript?.src;
        ba && (va = self.location.href);
        var wa = "", xa, ya;
        if (aa || ba) {
          try {
            wa = new URL(".", va).href;
          } catch {
          }
          ba && (ya = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          });
          xa = async (a) => {
            a = await fetch(a, { credentials: "same-origin" });
            if (a.ok) return a.arrayBuffer();
            throw Error(a.status + " : " + a.url);
          };
        }
        var Ba = console.log.bind(console), C2 = console.error.bind(console), Ca, Da = false, Ea;
        function Fa() {
          if (!v?.buffer?.resizable) {
            var a = Ga.buffer;
            v = new Int8Array(a);
            Ha = new Int16Array(a);
            E = new Uint8Array(a);
            H = new Int32Array(a);
            I = new Uint32Array(a);
            Ia = new Float32Array(a);
            Ja = new Float64Array(a);
            J = new BigInt64Array(a);
          }
        }
        function Ka() {
          var a = k.preRun;
          a && (typeof a === "function" && (a = [a]), La.push(...a));
          for (a = La; a.length > 0; ) a.shift()(k);
        }
        function Ma() {
          var a = k.postRun;
          a && (typeof a === "function" && (a = [a]), Na.push(...a));
          for (a = Na; a.length > 0; ) a.shift()(k);
        }
        function Oa(a) {
          k.onAbort?.(a);
          a = `Aborted(${a})`;
          C2(a);
          Da = true;
          throw new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
        }
        var Qa;
        async function Sa(a) {
          if (!Ca) try {
            return await xa(a);
          } catch {
          }
          if (a == Qa && Ca) a = new Uint8Array(Ca);
          else if (ya) a = ya(a);
          else throw "both async and sync fetching of the wasm failed";
          return a;
        }
        async function Ta(a, b) {
          try {
            var d = await Sa(a);
            return await WebAssembly.instantiate(d, b);
          } catch (c) {
            C2(`failed to asynchronously prepare wasm: ${c}`), Oa(c);
          }
        }
        async function Ua(a) {
          var b = Qa;
          if (!Ca) try {
            var d = fetch(b, { credentials: "same-origin" });
            return await WebAssembly.instantiateStreaming(d, a);
          } catch (c) {
            C2(`wasm streaming compile failed: ${c}`), C2("falling back to ArrayBuffer instantiation");
          }
          return Ta(b, a);
        }
        class Va {
          name = "ExitStatus";
          constructor(a) {
            this.message = `Program terminated with exit(${a})`;
            this.status = a;
          }
        }
        var v, Na = [], La = [], Wa = true, E, Xa = new TextDecoder(), Ya = (a, b, d, c) => {
          d = b + d;
          if (c) return d;
          for (; a[b] && !(b >= d); ) ++b;
          return b;
        }, A = (a, b, d) => a ? Xa.decode(E.subarray(a, Ya(E, a, b, d))) : "", Za = (a, b) => {
          for (var d = 0, c = a.length - 1; c >= 0; c--) {
            var f = a[c];
            f === "." ? a.splice(c, 1) : f === ".." ? (a.splice(c, 1), d++) : d && (a.splice(c, 1), d--);
          }
          if (b) for (; d; d--) a.unshift("..");
          return a;
        }, $a = (a) => {
          var b = a.charAt(0) === "/", d = a.slice(-1) === "/";
          (a = Za(a.split("/").filter((c) => !!c), !b).join("/")) || b || (a = ".");
          a && d && (a += "/");
          return (b ? "/" : "") + a;
        }, ab = (a) => {
          var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
          a = b[0];
          b = b[1];
          if (!a && !b) return ".";
          b &&= b.slice(0, -1);
          return a + b;
        }, bb = (a) => a && a.match(/([^\/]+|\/)\/*$/)[1], cb = (...a) => {
          for (var b = "", d = false, c = a.length - 1; c >= -1 && !d; c--) {
            d = c >= 0 ? a[c] : "/";
            if (typeof d !== "string") throw new TypeError("Arguments to path.resolve must be strings");
            if (!d) return "";
            b = d + "/" + b;
            d = d.charAt(0) === "/";
          }
          b = Za(b.split("/").filter((f) => !!f), !d).join("/");
          return (d ? "/" : "") + b || ".";
        }, l = (a) => {
          for (var b = 0, d = 0; d < a.length; ++d) {
            var c = a.codePointAt(d);
            c <= 127 ? b++ : c <= 2047 ? b += 2 : c <= 65535 ? b += 3 : (b += 4, d++);
          }
          return b;
        }, L = (a, b, d, c) => {
          if (!(c > 0)) return 0;
          var f = d;
          c = d + c - 1;
          for (var g = 0; g < a.length; ++g) {
            var m = a.codePointAt(g);
            if (m <= 127) {
              if (d >= c) break;
              b[d++] = m;
            } else if (m <= 2047) {
              if (d + 1 >= c) break;
              b[d++] = 192 | m >> 6;
              b[d++] = 128 | m & 63;
            } else if (m <= 65535) {
              if (d + 2 >= c) break;
              b[d++] = 224 | m >> 12;
              b[d++] = 128 | m >> 6 & 63;
              b[d++] = 128 | m & 63;
            } else {
              if (d + 3 >= c) break;
              b[d++] = 240 | m >> 18;
              b[d++] = 128 | m >> 12 & 63;
              b[d++] = 128 | m >> 6 & 63;
              b[d++] = 128 | m & 63;
              g++;
            }
          }
          b[d] = 0;
          return d - f;
        }, db = (a) => {
          var b = Array(l(a) + 1);
          a = L(a, b, 0, b.length);
          b.length = a;
          return b;
        }, eb = (a, b) => {
          var d = 0;
          a && (d |= 365);
          b && (d |= 146);
          return d;
        }, M = { gb: null, kb() {
          return M.createNode(null, "/", 16895, 0);
        }, createNode(a, b, d, c) {
          if ((d & 61440) === 24576 || (d & 61440) === 4096) throw new O(63);
          M.gb || (M.gb = { dir: { node: { cb: M.Ua.cb, hb: M.Ua.hb, ub: M.Ua.ub, zb: M.Ua.zb, ac: M.Ua.ac, Gb: M.Ua.Gb, Db: M.Ua.Db, Qb: M.Ua.Qb, Fb: M.Ua.Fb }, stream: { fb: M.Ta.fb } }, file: { node: { cb: M.Ua.cb, hb: M.Ua.hb }, stream: { fb: M.Ta.fb, read: M.Ta.read, write: M.Ta.write, Ab: M.Ta.Ab, Bb: M.Ta.Bb } }, link: { node: { cb: M.Ua.cb, hb: M.Ua.hb, nb: M.Ua.nb }, stream: {} }, Tb: { node: { cb: M.Ua.cb, hb: M.Ua.hb }, stream: fb } });
          d = gb(a, b, d, c);
          P(d.mode) ? (d.Ua = M.gb.dir.node, d.Ta = M.gb.dir.stream, d.Ya = {}) : (d.mode & 61440) === 32768 ? (d.Ua = M.gb.file.node, d.Ta = M.gb.file.stream, d.Za = 0, d.Ya = M.rc ?? (M.rc = new Uint8Array(0))) : (d.mode & 61440) === 40960 ? (d.Ua = M.gb.link.node, d.Ta = M.gb.link.stream) : (d.mode & 61440) === 8192 && (d.Ua = M.gb.Tb.node, d.Ta = M.gb.Tb.stream);
          d.jb = d.ab = d.$a = Date.now();
          a && (a.Ya[b] = d, a.jb = a.ab = a.$a = d.jb);
          return d;
        }, Ua: { cb(a) {
          var b = {};
          b.oc = (a.mode & 61440) === 8192 ? a.id : 1;
          b.zc = a.id;
          b.mode = a.mode;
          b.Cc = 1;
          b.uid = 0;
          b.yc = 0;
          b.wb = a.wb;
          P(a.mode) ? b.size = 4096 : (a.mode & 61440) === 32768 ? b.size = a.Za : (a.mode & 61440) === 40960 ? b.size = a.link.length : b.size = 0;
          b.jb = new Date(a.jb);
          b.ab = new Date(a.ab);
          b.$a = new Date(a.$a);
          b.kc = 4096;
          b.lc = Math.ceil(b.size / b.kc);
          return b;
        }, hb(a, b) {
          for (var d of ["mode", "atime", "mtime", "ctime"]) b[d] != null && (a[d] = b[d]);
          b.size !== void 0 && (b = b.size, a.Za != b && (d = a.Ya, a.Ya = new Uint8Array(b), a.Ya.set(d.subarray(0, Math.min(b, a.Za))), a.Za = b));
        }, ub() {
          M.Ib || (M.Ib = new O(44), M.Ib.stack = "<generic error, no stack>");
          throw M.Ib;
        }, zb(a, b, d, c) {
          return M.createNode(
            a,
            b,
            d,
            c
          );
        }, ac(a, b, d) {
          try {
            var c = hb(b, d);
          } catch (g) {
          }
          if (c && P(a.mode)) for (var f in c.Ya) throw new O(55);
          delete a.parent.Ya[a.name];
          b.Ya[d] = a;
          a.name = d;
          b.$a = b.ab = a.parent.$a = a.parent.ab = Date.now();
        }, Gb(a, b) {
          delete a.Ya[b];
          a.$a = a.ab = Date.now();
        }, Db(a, b) {
          var d = hb(a, b), c;
          for (c in d.Ya) throw new O(55);
          delete a.Ya[b];
          a.$a = a.ab = Date.now();
        }, Qb(a) {
          return [".", "..", ...Object.keys(a.Ya)];
        }, Fb(a, b, d) {
          a = M.createNode(a, b, 41471, 0);
          a.link = d;
          return a;
        }, nb(a) {
          if ((a.mode & 61440) !== 40960) throw new O(28);
          return a.link;
        } }, Ta: { read(a, b, d, c, f) {
          if (f >= a.node.Za) return 0;
          c = Math.min(a.node.Za - f, c);
          b.set(a.node.Ya.subarray(f, f + c), d);
          return c;
        }, write(a, b, d, c, f, g) {
          b.buffer === v.buffer && (g = false);
          if (!c) return 0;
          a = a.node;
          a.ab = a.$a = Date.now();
          if (g) a.Ya = b.subarray(d, d + c), a.Za = c;
          else if (a.Za || f) {
            g = f + c;
            var m = a.Ya.length;
            m >= g || (g = Math.max(g, m * (m < 1048576 ? 2 : 1.125) >>> 0), m && (g = Math.max(g, 256)), m = a.Ya.subarray(0, a.Za), a.Ya = new Uint8Array(g), a.Ya.set(m));
            a.Ya.set(b.subarray(d, d + c), f);
            a.Za = Math.max(a.Za, f + c);
          } else a.Ya = b.slice(d, d + c), a.Za = c;
          return c;
        }, fb(a, b, d) {
          d === 1 ? b += a.position : d === 2 && (a.node.mode & 61440) === 32768 && (b += a.node.Za);
          if (b < 0) throw new O(28);
          return b;
        }, Ab(a, b, d, c, f) {
          if ((a.node.mode & 61440) !== 32768) throw new O(43);
          a = a.node.Ya;
          if (f & 2 || a.buffer !== v.buffer) {
            f = true;
            c = Math.ceil(b / 65536) * 65536;
            var g = ib(65536, c);
            g && E.fill(0, g, g + c);
            c = g;
            if (!c) throw new O(48);
            if (a) {
              if (d > 0 || d + b < a.length) a = a.subarray ? a.subarray(d, d + b) : a.slice(d, d + b);
              v.set(a, c);
            }
          } else f = false, c = a.byteOffset;
          return { Fc: c, bc: f };
        }, Bb(a, b, d, c) {
          M.Ta.write(a, b, 0, c, d, false);
          return 0;
        } } }, jb = [], kb = (a) => {
          var b = Ya(a, 0);
          return Xa.decode(a.buffer ? a.subarray(0, b) : new Uint8Array(a.slice(0, b)));
        }, lb = [];
        function mb(a, b) {
          lb[a] = { input: [], output: [], sb: b };
          qb(a, xb);
        }
        var xb = { open(a) {
          var b = lb[a.node.wb];
          if (!b) throw new O(43);
          a.bb = b;
          a.seekable = false;
        }, close(a) {
          a.bb.sb.tb(a.bb);
        }, tb(a) {
          a.bb.sb.tb(a.bb);
        }, read(a, b, d, c) {
          if (!a.bb || !a.bb.sb.Yb) throw new O(60);
          for (var f = 0, g = 0; g < c; g++) {
            try {
              var m = a.bb.sb.Yb(a.bb);
            } catch (t) {
              throw new O(29);
            }
            if (m === void 0 && !f) throw new O(6);
            if (m === null || m === void 0) break;
            f++;
            b[d + g] = m;
            if (m === 10) break;
          }
          f && (a.node.jb = Date.now());
          return f;
        }, write(a, b, d, c) {
          if (!a.bb || !a.bb.sb.Pb) throw new O(60);
          try {
            for (var f = 0; f < c; f++) a.bb.sb.Pb(a.bb, b[d + f]);
          } catch (g) {
            throw new O(29);
          }
          c && (a.node.ab = a.node.$a = Date.now());
          return f;
        } }, yb = { Yb() {
          a: {
            if (!jb.length) {
              var a = null;
              globalThis.window?.prompt && (a = window.prompt("Input: "), a !== null && (a += "\n"));
              if (!a) {
                a = null;
                break a;
              }
              jb = db(a);
            }
            a = jb.shift();
          }
          return a;
        }, Pb(a, b) {
          b === null || b === 10 ? (Ba(kb(a.output)), a.output = []) : b != 0 && a.output.push(b);
        }, tb(a) {
          a.output?.length > 0 && (Ba(kb(a.output)), a.output = []);
        }, Oc() {
          return { Kc: 25856, Mc: 5, Jc: 191, Lc: 35387, Ic: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
        }, Pc() {
          return 0;
        }, Qc() {
          return [
            24,
            80
          ];
        } }, zb = { Pb(a, b) {
          b === null || b === 10 ? (C2(kb(a.output)), a.output = []) : b != 0 && a.output.push(b);
        }, tb(a) {
          a.output?.length > 0 && (C2(kb(a.output)), a.output = []);
        } }, Ab = () => (a) => (crypto.getRandomValues(a), 0), Bb = (a) => (Bb = Ab())(a), Cb = null, Db = {}, Eb = [], Fb = 1, Q = [], Gb = false, Hb = true, Ib = {}, O = class {
          name = "ErrnoError";
          constructor(a) {
            this.Wa = a;
          }
        }, Jb = class {
          shared = {};
          node = null;
          get flags() {
            return this.shared.flags;
          }
          set flags(a) {
            this.shared.flags = a;
          }
          get position() {
            return this.shared.position;
          }
          set position(a) {
            this.shared.position = a;
          }
        }, Kb = class {
          Ua = {};
          Ta = {};
          qb = null;
          constructor(a, b, d, c) {
            a ||= this;
            this.parent = a;
            this.kb = a.kb;
            this.id = Fb++;
            this.name = b;
            this.mode = d;
            this.wb = c;
            this.jb = this.ab = this.$a = Date.now();
          }
          get read() {
            return (this.mode & 365) === 365;
          }
          set read(a) {
            a ? this.mode |= 365 : this.mode &= -366;
          }
          get write() {
            return (this.mode & 146) === 146;
          }
          set write(a) {
            a ? this.mode |= 146 : this.mode &= -147;
          }
          Ec() {
          }
        };
        function B(a, b = {}) {
          if (!a) throw new O(44);
          b.Jb ?? (b.Jb = true);
          a.charAt(0) === "/" || (a = "//" + a);
          var d = 0;
          a: for (; d < 40; d++) {
            a = a.split("/").filter((t) => !!t);
            for (var c = Cb, f = "/", g = 0; g < a.length; g++) {
              var m = g === a.length - 1;
              if (m && b.parent) break;
              if (a[g] !== ".") if (a[g] === "..") if (f = ab(f), c === c.parent) {
                a = f + "/" + a.slice(g + 1).join("/");
                d--;
                continue a;
              } else c = c.parent;
              else {
                f = $a(f + "/" + a[g]);
                try {
                  c = hb(c, a[g]);
                } catch (t) {
                  if (t?.Wa === 44 && m && b.Dc) return { path: f };
                  throw t;
                }
                !c.qb || m && !b.Jb || (c = c.qb.root);
                if ((c.mode & 61440) === 40960 && (!m || b.pb)) {
                  if (!c.Ua.nb) throw new O(52);
                  c = c.Ua.nb(c);
                  c.charAt(0) === "/" || (c = ab(f) + "/" + c);
                  a = c + "/" + a.slice(g + 1).join("/");
                  continue a;
                }
              }
            }
            return { path: f, node: c };
          }
          throw new O(32);
        }
        function Lb(a) {
          for (var b; ; ) {
            if (a === a.parent) return a = a.kb.$b, b ? a[a.length - 1] !== "/" ? `${a}/${b}` : a + b : a;
            b = b ? `${a.name}/${b}` : a.name;
            a = a.parent;
          }
        }
        function Mb(a, b) {
          for (var d = 0, c = 0; c < b.length; c++) d = (d << 5) - d + b.charCodeAt(c) | 0;
          return (a + d >>> 0) % Q.length;
        }
        function Nb(a) {
          var b = Mb(a.parent.id, a.name);
          if (Q[b] === a) Q[b] = a.rb;
          else for (b = Q[b]; b; ) {
            if (b.rb === a) {
              b.rb = a.rb;
              break;
            }
            b = b.rb;
          }
        }
        function hb(a, b) {
          var d = P(a.mode) ? (d = Ob(a, "x")) ? d : a.Ua.ub ? 0 : 2 : 54;
          if (d) throw new O(d);
          for (d = Q[Mb(a.id, b)]; d; d = d.rb) {
            var c = d.name;
            if (d.parent.id === a.id && c === b) return d;
          }
          return a.Ua.ub(a, b);
        }
        function gb(a, b, d, c) {
          a = new Kb(a, b, d, c);
          b = Mb(a.parent.id, a.name);
          a.rb = Q[b];
          return Q[b] = a;
        }
        function P(a) {
          return (a & 61440) === 16384;
        }
        function Ob(a, b) {
          return Hb ? 0 : b.includes("r") && !(a.mode & 292) || b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73) ? 2 : 0;
        }
        function Pb(a, b) {
          if (!P(a.mode)) return 54;
          try {
            return hb(a, b), 20;
          } catch (d) {
          }
          return Ob(a, "wx");
        }
        function Qb(a, b, d) {
          try {
            var c = hb(a, b);
          } catch (f) {
            return f.Wa;
          }
          if (a = Ob(a, "wx")) return a;
          if (d) {
            if (!P(c.mode)) return 54;
            if (c === c.parent || Lb(c) === "/") return 10;
          } else if (P(c.mode)) return 31;
          return 0;
        }
        function Rb(a) {
          if (!a) throw new O(63);
          return a;
        }
        function R(a) {
          a = Eb[a];
          if (!a) throw new O(8);
          return a;
        }
        function Sb(a, b = -1) {
          a = Object.assign(new Jb(), a);
          if (b == -1) a: {
            for (b = 0; b <= 4096; b++) if (!Eb[b]) break a;
            throw new O(33);
          }
          a.lb = b;
          return Eb[b] = a;
        }
        function Tb(a, b = -1) {
          a = Sb(a, b);
          a.Ta?.Nc?.(a);
          return a;
        }
        function Ub(a, b, d) {
          var c = a?.Ta.hb;
          a = c ? a : b;
          c ??= b.Ua.hb;
          Rb(c);
          try {
            c(a, d);
          } catch (f) {
            if (f instanceof RangeError) throw new O(22);
            throw f;
          }
        }
        var fb = { open(a) {
          a.Ta = Db[a.node.wb].Ta;
          a.Ta.open?.(a);
        }, fb() {
          throw new O(70);
        } };
        function qb(a, b) {
          Db[a] = { Ta: b };
        }
        function Vb(a, b) {
          var d = b === "/";
          if (d && Cb) throw new O(10);
          if (!d && b) {
            var c = B(b, { Jb: false });
            b = c.path;
            c = c.node;
            if (c.qb) throw new O(10);
            if (!P(c.mode)) throw new O(54);
          }
          b = { type: a, Rc: {}, $b: b, Bc: [] };
          a = a.kb(b);
          a.kb = b;
          b.root = a;
          d ? Cb = a : c && (c.qb = b, c.kb && c.kb.Bc.push(b));
        }
        function Wb(a, b, d) {
          var c = B(a, { parent: true }).node;
          a = bb(a);
          if (!a) throw new O(28);
          if (a === "." || a === "..") throw new O(20);
          var f = Pb(c, a);
          if (f) throw new O(f);
          if (!c.Ua.zb) throw new O(63);
          return c.Ua.zb(c, a, b, d);
        }
        function Xb(a, b = 438) {
          return Wb(a, b & 4095 | 32768, 0);
        }
        function W(a, b = 511) {
          return Wb(a, b & 1023 | 16384, 0);
        }
        function Yb(a, b, d) {
          typeof d === "undefined" && (d = b, b = 438);
          Wb(a, b | 8192, d);
        }
        function Zb(a, b) {
          if (!cb(a)) throw new O(44);
          var d = B(b, { parent: true }).node;
          if (!d) throw new O(44);
          b = bb(b);
          var c = Pb(d, b);
          if (c) throw new O(c);
          if (!d.Ua.Fb) throw new O(63);
          d.Ua.Fb(d, b, a);
        }
        function $b(a) {
          var b = B(a, { parent: true }).node;
          a = bb(a);
          var d = hb(b, a), c = Qb(b, a, true);
          if (c) throw new O(c);
          if (!b.Ua.Db) throw new O(63);
          if (d.qb) throw new O(10);
          b.Ua.Db(b, a);
          Nb(d);
        }
        function sa(a) {
          var b = B(a, { parent: true }).node;
          if (!b) throw new O(44);
          a = bb(a);
          var d = hb(b, a), c = Qb(b, a, false);
          if (c) throw new O(c);
          if (!b.Ua.Gb) throw new O(63);
          if (d.qb) throw new O(10);
          b.Ua.Gb(b, a);
          Nb(d);
        }
        function ac(a, b = false) {
          a = B(a, { pb: !b }).node;
          return Rb(a.Ua.cb)(a);
        }
        function bc(a, b, d) {
          Ub(a, b, { mode: d & 4095 | b.mode & -4096, $a: Date.now(), Ub: false });
        }
        function cc(a, b) {
          a = typeof a === "string" ? B(a, { pb: true }).node : a;
          bc(null, a, b);
        }
        function dc(a, b, d) {
          if (P(b.mode)) throw new O(31);
          if ((b.mode & 61440) !== 32768) throw new O(28);
          var c = Ob(b, "w");
          if (c) throw new O(c);
          Ub(a, b, { size: d, timestamp: Date.now() });
        }
        function ec(a, b, d, c = false) {
          a = B(a, { pb: !c });
          Ub(null, a.node, { jb: b, ab: d, Ub: c });
        }
        function fc(a, b, d = 438) {
          if (a === "") throw new O(44);
          if (typeof b === "string") {
            var c = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b];
            if (typeof c === "undefined") throw Error(`Unknown file open mode: ${b}`);
            b = c;
          }
          d = b & 64 ? d & 4095 | 32768 : 0;
          if (typeof a === "object") c = a;
          else {
            var f = a.endsWith("/");
            a = B(a, { pb: !(b & 131072), Dc: true });
            c = a.node;
            a = a.path;
          }
          var g = false;
          if (b & 64) if (c) {
            if (b & 128) throw new O(20);
          } else {
            if (f) throw new O(31);
            c = Wb(a, d | 511, 0);
            g = true;
          }
          if (!c) throw new O(44);
          (c.mode & 61440) === 8192 && (b &= -513);
          if (b & 65536 && !P(c.mode)) throw new O(54);
          if (!g && (c ? (c.mode & 61440) === 40960 ? f = 32 : (f = ["r", "w", "rw"][b & 3], b & 512 && (f += "w"), f = P(c.mode) && (f !== "r" || b & 576) ? 31 : Ob(c, f)) : f = 44, f)) throw new O(f);
          b & 512 && !g && (f = c, f = typeof f === "string" ? B(f, { pb: true }).node : f, dc(null, f, 0));
          b &= -131713;
          f = Sb({ node: c, path: Lb(c), flags: b, seekable: true, position: 0, Ta: c.Ta, Gc: [], error: false });
          f.Ta.open && f.Ta.open(f);
          g && cc(c, d & 511);
          !k.logReadFiles || b & 1 || a in Ib || (Ib[a] = 1, C2(`read file: ${a}`));
          return f;
        }
        function hc(a) {
          if (a.lb === null) throw new O(8);
          a.Mb && (a.Mb = null);
          a.node?.Ec();
          try {
            a.Ta.close && a.Ta.close(a);
          } catch (b) {
            throw b;
          } finally {
            Eb[a.lb] = null;
          }
          a.lb = null;
        }
        function ic(a, b, d) {
          if (a.lb === null) throw new O(8);
          if (!a.seekable || !a.Ta.fb) throw new O(70);
          if (d != 0 && d != 1 && d != 2) throw new O(28);
          a.position = a.Ta.fb(a, b, d);
          a.Gc = [];
        }
        function jc(a, b, d, c, f) {
          if (c < 0 || f < 0) throw new O(28);
          if (a.lb === null) throw new O(8);
          if ((a.flags & 2097155) === 0) throw new O(8);
          if (P(a.node.mode)) throw new O(31);
          if (!a.Ta.write) throw new O(28);
          a.seekable && a.flags & 1024 && ic(a, 0, 2);
          var g = typeof f !== "undefined";
          if (!g) f = a.position;
          else if (!a.seekable) throw new O(70);
          b = a.Ta.write(a, b, d, c, f, void 0);
          g || (a.position += b);
          return b;
        }
        function kc() {
          var a, b, d;
          Gb = true;
          a ??= k.stdin;
          b ??= k.stdout;
          d ??= k.stderr;
          a ? X("stdin", a) : Zb("/dev/tty", "/dev/stdin");
          b ? X("stdout", null, b) : Zb("/dev/tty", "/dev/stdout");
          d ? X("stderr", null, d) : Zb("/dev/tty1", "/dev/stderr");
          fc("/dev/stdin", 0);
          fc("/dev/stdout", 1);
          fc("/dev/stderr", 1);
        }
        function ka(a, b) {
          var d = "/", c = a;
          d && (d = typeof d === "string" ? d : Lb(d), c = a ? $a(d + "/" + a) : d);
          a = eb(true, true);
          c = Xb(c, a);
          b && (typeof b === "string" && (b = db(b)), b.subarray || (b = new Uint8Array(b)), cc(c, a | 146), d = fc(c, 577), jc(d, b, 0, b.length, 0), hc(d), cc(c, a));
        }
        function X(a, b, d) {
          a = $a("/dev/" + a);
          var c = eb(!!b, !!d);
          X.Zb ?? (X.Zb = 64);
          var f = X.Zb++ << 8 | 0;
          qb(f, { open(g) {
            g.seekable = false;
          }, close() {
            d?.buffer?.length && d(10);
          }, read(g, m, t, z) {
            for (var q = 0, n = 0; n < z; n++) {
              try {
                var F = b();
              } catch (U) {
                throw new O(29);
              }
              if (F === void 0 && !q) throw new O(6);
              if (F === null || F === void 0) break;
              q++;
              m[t + n] = F;
            }
            q && (g.node.jb = Date.now());
            return q;
          }, write(g, m, t, z) {
            for (var q = 0; q < z; q++) try {
              d(m[t + q]);
            } catch (n) {
              throw new O(29);
            }
            z && (g.node.ab = g.node.$a = Date.now());
            return q;
          } });
          Yb(a, c, f);
        }
        var Y = {}, H, J, I;
        function Oc(a, b, d = false) {
          if (b.charAt(0) === "/") return b;
          a = a === -100 ? "/" : R(a).path;
          if (b.length == 0) {
            if (!d) throw new O(44);
            return a;
          }
          return a + "/" + b;
        }
        function Pc(a, b) {
          I[a >> 2] = b.oc;
          I[a + 4 >> 2] = b.mode;
          I[a + 8 >> 2] = b.Cc;
          I[a + 12 >> 2] = b.uid;
          I[a + 16 >> 2] = b.yc;
          I[a + 20 >> 2] = b.wb;
          J[a + 24 >> 3] = BigInt(b.size);
          H[a + 32 >> 2] = 4096;
          H[a + 36 >> 2] = b.lc;
          var d = b.jb.getTime(), c = b.ab.getTime(), f = b.$a.getTime();
          J[a + 40 >> 3] = BigInt(Math.floor(d / 1e3));
          I[a + 48 >> 2] = d % 1e3 * 1e3 * 1e3;
          J[a + 56 >> 3] = BigInt(Math.floor(c / 1e3));
          I[a + 64 >> 2] = c % 1e3 * 1e3 * 1e3;
          J[a + 72 >> 3] = BigInt(Math.floor(f / 1e3));
          I[a + 80 >> 2] = f % 1e3 * 1e3 * 1e3;
          J[a + 88 >> 3] = BigInt(b.zc);
          return 0;
        }
        var Qc = void 0, Ha, Rc = () => {
          var a = H[+Qc >> 2];
          Qc += 4;
          return a;
        }, Sc = 0, Tc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Uc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Vc = (a) => {
          if (!(a instanceof Va || a == "unwind")) throw a;
        }, Wc = (a) => {
          Ea = a;
          Wa || Sc > 0 || (k.onExit?.(a), Da = true);
          throw new Va(a);
        }, Xc = {}, Yc = {}, $c = () => {
          if (!Zc) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8", _: ua }, b;
            for (b in Yc) Yc[b] === void 0 ? delete a[b] : a[b] = Yc[b];
            var d = [];
            for (b in a) d.push(`${b}=${a[b]}`);
            Zc = d;
          }
          return Zc;
        }, Zc, Ia, Ja;
        function qa(a) {
          var b = "i32";
          b.endsWith("*") && (b = "*");
          switch (b) {
            case "i1":
              v[a] = 0;
              break;
            case "i8":
              v[a] = 0;
              break;
            case "i16":
              Ha[a >> 1] = 0;
              break;
            case "i32":
              H[a >> 2] = 0;
              break;
            case "i64":
              J[a >> 3] = BigInt(0);
              break;
            case "float":
              Ia[a >> 2] = 0;
              break;
            case "double":
              Ja[a >> 3] = 0;
              break;
            case "*":
              I[a >> 2] = 0;
              break;
            default:
              Oa(`invalid type for setValue: ${b}`);
          }
        }
        function y(a, b = "i8") {
          b.endsWith("*") && (b = "*");
          switch (b) {
            case "i1":
              return v[a];
            case "i8":
              return v[a];
            case "i16":
              return Ha[a >> 1];
            case "i32":
              return H[a >> 2];
            case "i64":
              return J[a >> 3];
            case "float":
              return Ia[a >> 2];
            case "double":
              return Ja[a >> 3];
            case "*":
              return I[a >> 2];
            default:
              Oa(`invalid type for getValue: ${b}`);
          }
        }
        var ad = (a, b, d, c) => {
          var f = { string: (q) => {
            var n = 0;
            if (q !== null && q !== void 0 && q !== 0) {
              n = l(q) + 1;
              var F = oa(n);
              L(q, E, F, n);
              n = F;
            }
            return n;
          }, array: (q) => {
            var n = oa(q.length);
            v.set(q, n);
            return n;
          } };
          a = k["_" + a];
          var g = [], m = 0;
          if (c) for (var t = 0; t < c.length; t++) {
            var z = f[d[t]];
            z ? (m ||= pa(), g[t] = z(c[t])) : g[t] = c[t];
          }
          d = a(...g);
          return d = (function(q) {
            m && ra(m);
            return b === "string" ? A(q) : b === "boolean" ? !!q : q;
          })(d);
        }, ja = (a) => {
          var b = l(a) + 1, d = fa(b);
          d && L(a, E, d, b);
          return d;
        }, bd = [], cd, la = (a) => {
          cd.delete(Z.get(a));
          Z.set(a, null);
          bd.push(a);
        }, dd = (a) => {
          var b = a.length;
          return [b % 128 | 128, b >> 7, ...a];
        }, ed = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 }, fd = (a) => dd(Array.from(a, (b) => ed[b])), ta = (a, b) => {
          if (!cd) {
            cd = /* @__PURE__ */ new WeakMap();
            var d = Z.length;
            if (cd) for (var c = 0; c < 0 + d; c++) {
              var f = Z.get(c);
              f && cd.set(f, c);
            }
          }
          if (d = cd.get(a) || 0) return d;
          d = bd.length ? bd.pop() : Z.grow(1);
          try {
            Z.set(d, a);
          } catch (g) {
            if (!(g instanceof TypeError)) throw g;
            b = Uint8Array.of(0, 97, 115, 109, 1, 0, 0, 0, 1, ...dd([1, 96, ...fd(b.slice(1)), ...fd(b[0] === "v" ? "" : b[0])]), 2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
            b = new WebAssembly.Module(b);
            b = new WebAssembly.Instance(
              b,
              { e: { f: a } }
            ).exports.f;
            Z.set(d, b);
          }
          cd.set(a, d);
          return d;
        };
        Q.length = 4096;
        Vb(M, "/");
        W("/tmp");
        W("/home");
        W("/home/web_user");
        (function() {
          W("/dev");
          qb(259, { read: () => 0, write: (c, f, g, m) => m, fb: () => 0 });
          Yb("/dev/null", 259);
          mb(1280, yb);
          mb(1536, zb);
          Yb("/dev/tty", 1280);
          Yb("/dev/tty1", 1536);
          var a = new Uint8Array(1024), b = 0, d = () => {
            b || (Bb(a), b = a.byteLength);
            return a[--b];
          };
          X("random", d);
          X("urandom", d);
          W("/dev/shm");
          W("/dev/shm/tmp");
        })();
        (function() {
          W("/proc");
          var a = W("/proc/self");
          W("/proc/self/fd");
          Vb({ kb() {
            var b = gb(a, "fd", 16895, 73);
            b.Ta = { fb: M.Ta.fb };
            b.Ua = { ub(d, c) {
              d = +c;
              var f = R(d);
              d = { parent: null, kb: { $b: "fake" }, Ua: { nb: () => f.path }, id: d + 1 };
              return d.parent = d;
            }, Qb() {
              return Array.from(Eb.entries()).filter(([, d]) => d).map(([d]) => d.toString());
            } };
            return b;
          } }, "/proc/self/fd");
        })();
        k.noExitRuntime && (Wa = k.noExitRuntime);
        k.print && (Ba = k.print);
        k.printErr && (C2 = k.printErr);
        k.wasmBinary && (Ca = k.wasmBinary);
        k.thisProgram && (ua = k.thisProgram);
        var gd = k.preInit;
        if (gd) for (typeof gd === "function" && (k.preInit = gd = [gd]); gd.length > 0; ) gd.shift()();
        k.stackSave = () => pa();
        k.stackRestore = (a) => ra(a);
        k.stackAlloc = (a) => oa(a);
        k.cwrap = (a, b, d, c) => {
          var f = !d || d.every((g) => g === "number" || g === "boolean");
          return b !== "string" && f && !c ? k["_" + a] : (...g) => ad(a, b, d, g);
        };
        k.addFunction = ta;
        k.removeFunction = la;
        k.UTF8ToString = A;
        k.lengthBytesUTF8 = l;
        k.stringToNewUTF8 = ja;
        k.writeArrayToMemory = (a, b) => {
          v.set(a, b);
        };
        var fa, ha, ib, hd, ra, oa, pa, Ga, Z, jd = {
          a: (a, b, d, c) => Oa(`Assertion failed: ${A(a)}, at: ` + [b ? A(b) : "unknown filename", d, c ? A(c) : "unknown function"]),
          i: function(a, b) {
            try {
              return a = A(a), cc(a, b), 0;
            } catch (d) {
              if (typeof Y === "undefined" || d.name !== "ErrnoError") throw d;
              return -d.Wa;
            }
          },
          D: function(a, b, d) {
            try {
              b = A(b);
              b = Oc(a, b);
              if (d & -8) return -28;
              var c = B(b, { pb: true }).node;
              if (!c) return -44;
              a = "";
              d & 4 && (a += "r");
              d & 2 && (a += "w");
              d & 1 && (a += "x");
              return a && Ob(c, a) ? -2 : 0;
            } catch (f) {
              if (typeof Y === "undefined" || f.name !== "ErrnoError") throw f;
              return -f.Wa;
            }
          },
          j: function(a, b) {
            try {
              var d = R(a);
              bc(d, d.node, b);
              return 0;
            } catch (c) {
              if (typeof Y === "undefined" || c.name !== "ErrnoError") throw c;
              return -c.Wa;
            }
          },
          h: function(a) {
            try {
              var b = R(a);
              Ub(b, b.node, { timestamp: Date.now(), Ub: false });
              return 0;
            } catch (d) {
              if (typeof Y === "undefined" || d.name !== "ErrnoError") throw d;
              return -d.Wa;
            }
          },
          b: function(a, b, d) {
            Qc = d;
            try {
              var c = R(a);
              switch (b) {
                case 0:
                  var f = Rc();
                  if (f < 0) break;
                  for (; Eb[f]; ) f++;
                  return Tb(c, f).lb;
                case 1:
                case 2:
                  return 0;
                case 3:
                  return c.flags;
                case 4:
                  return f = Rc(), c.flags = c.flags & -289793 | f & 289792, 0;
                case 12:
                  return f = Rc(), Ha[f + 0 >> 1] = 2, 0;
                case 13:
                case 14:
                  return 0;
              }
              return -28;
            } catch (g) {
              if (typeof Y === "undefined" || g.name !== "ErrnoError") throw g;
              return -g.Wa;
            }
          },
          g: function(a, b) {
            try {
              var d = R(a), c = d.node, f = d.Ta.cb;
              a = f ? d : c;
              f ??= c.Ua.cb;
              Rb(f);
              var g = f(a);
              return Pc(b, g);
            } catch (m) {
              if (typeof Y === "undefined" || m.name !== "ErrnoError") throw m;
              return -m.Wa;
            }
          },
          J: function(a, b) {
            b = b < -9007199254740992 || b > 9007199254740992 ? NaN : Number(b);
            try {
              if (isNaN(b)) return -22;
              var d = R(a);
              if (b < 0 || (d.flags & 2097155) === 0) throw new O(28);
              dc(
                d,
                d.node,
                b
              );
              return 0;
            } catch (c) {
              if (typeof Y === "undefined" || c.name !== "ErrnoError") throw c;
              return -c.Wa;
            }
          },
          I: function(a, b) {
            try {
              if (!b) return -28;
              var d = l("/") + 1;
              if (b < d) return -68;
              L("/", E, a, b);
              return d;
            } catch (c) {
              if (typeof Y === "undefined" || c.name !== "ErrnoError") throw c;
              return -c.Wa;
            }
          },
          F: () => 0,
          M: function(a, b) {
            try {
              return a = A(a), Pc(b, ac(a, true));
            } catch (d) {
              if (typeof Y === "undefined" || d.name !== "ErrnoError") throw d;
              return -d.Wa;
            }
          },
          C: function(a, b, d) {
            try {
              return b = A(b), b = Oc(a, b), W(b, d & -19), 0;
            } catch (c) {
              if (typeof Y === "undefined" || c.name !== "ErrnoError") throw c;
              return -c.Wa;
            }
          },
          L: function(a, b, d, c) {
            try {
              b = A(b);
              var f = c & 256;
              b = Oc(a, b, c & 4096);
              return Pc(d, f ? ac(b, true) : ac(b));
            } catch (g) {
              if (typeof Y === "undefined" || g.name !== "ErrnoError") throw g;
              return -g.Wa;
            }
          },
          x: function(a, b, d, c) {
            Qc = c;
            try {
              b = A(b);
              b = Oc(a, b);
              var f = c ? Rc() : 0;
              d & 64 && (f &= -19);
              return fc(b, d, f).lb;
            } catch (g) {
              if (typeof Y === "undefined" || g.name !== "ErrnoError") throw g;
              return -g.Wa;
            }
          },
          s: function(a, b, d, c) {
            try {
              b = A(b);
              b = Oc(a, b);
              if (c <= 0) return -28;
              var f = B(b).node;
              if (!f) throw new O(44);
              if (!f.Ua.nb) throw new O(28);
              var g = f.Ua.nb(f);
              var m = Math.min(c, l(g)), t = v[d + m];
              L(g, E, d, c + 1);
              v[d + m] = t;
              return m;
            } catch (z) {
              if (typeof Y === "undefined" || z.name !== "ErrnoError") throw z;
              return -z.Wa;
            }
          },
          r: function(a) {
            try {
              return a = A(a), $b(a), 0;
            } catch (b) {
              if (typeof Y === "undefined" || b.name !== "ErrnoError") throw b;
              return -b.Wa;
            }
          },
          N: function(a, b) {
            try {
              return a = A(a), Pc(b, ac(a));
            } catch (d) {
              if (typeof Y === "undefined" || d.name !== "ErrnoError") throw d;
              return -d.Wa;
            }
          },
          o: function(a, b, d) {
            try {
              b = A(b);
              b = Oc(a, b);
              if (d) if (d === 512) $b(b);
              else return -28;
              else sa(b);
              return 0;
            } catch (c) {
              if (typeof Y === "undefined" || c.name !== "ErrnoError") throw c;
              return -c.Wa;
            }
          },
          n: function(a, b, d, c) {
            try {
              c &= 256;
              b = A(b);
              b = Oc(a, b, true);
              var f = Date.now();
              if (d) {
                let t2 = function(z) {
                  var q = H[z + 8 >> 2];
                  return q == 1073741823 ? f : q == 1073741822 ? null : (I[z >> 2] + H[z + 4 >> 2] * 4294967296) * 1e3 + Math.floor(q / 1e6);
                };
                var t = t2;
                var g = t2(d);
                var m = t2(d + 16);
              } else m = g = f;
              (m ?? g) !== null && ec(b, g, m, c);
              return 0;
            } catch (t2) {
              if (typeof Y === "undefined" || t2.name !== "ErrnoError") throw t2;
              return -t2.Wa;
            }
          },
          w: () => Oa(""),
          v: () => {
            Wa = false;
            Sc = 0;
          },
          A: function(a, b) {
            a = a < -9007199254740992 || a > 9007199254740992 ? NaN : Number(a);
            a = new Date(a * 1e3);
            if (isNaN(a.getTime())) return 1;
            H[b >> 2] = a.getSeconds();
            H[b + 4 >> 2] = a.getMinutes();
            H[b + 8 >> 2] = a.getHours();
            H[b + 12 >> 2] = a.getDate();
            H[b + 16 >> 2] = a.getMonth();
            H[b + 20 >> 2] = a.getFullYear() - 1900;
            H[b + 24 >> 2] = a.getDay();
            var d = a.getFullYear();
            H[b + 28 >> 2] = (d % 4 !== 0 || d % 100 === 0 && d % 400 !== 0 ? Uc : Tc)[a.getMonth()] + a.getDate() - 1 | 0;
            H[b + 36 >> 2] = -(a.getTimezoneOffset() * 60);
            d = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var c = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            H[b + 32 >> 2] = (d != c && a.getTimezoneOffset() == Math.min(c, d)) | 0;
            return 0;
          },
          y: function(a, b, d, c, f, g, m) {
            f = f < -9007199254740992 || f > 9007199254740992 ? NaN : Number(f);
            try {
              var t = R(c);
              if (b & 2 && !(d & 2) && (t.flags & 2097155) !== 2) throw new O(2);
              if ((t.flags & 2097155) === 1) throw new O(2);
              if (!t.Ta.Ab) throw new O(43);
              if (!a) throw new O(28);
              var z = t.Ta.Ab(t, a, f, b, d);
              var q = z.Fc;
              H[g >> 2] = z.bc;
              I[m >> 2] = q;
              return 0;
            } catch (n) {
              if (typeof Y === "undefined" || n.name !== "ErrnoError") throw n;
              return -n.Wa;
            }
          },
          z: function(a, b, d, c, f, g) {
            g = g < -9007199254740992 || g > 9007199254740992 ? NaN : Number(g);
            try {
              var m = R(f);
              if (d & 2) {
                if ((m.node.mode & 61440) !== 32768) throw new O(43);
                c & 2 || m.Ta.Bb && m.Ta.Bb(m, E.subarray(a, a + b), g, b, c);
              }
            } catch (t) {
              if (typeof Y === "undefined" || t.name !== "ErrnoError") throw t;
              return -t.Wa;
            }
          },
          k: (a, b) => {
            Xc[a] && (clearTimeout(Xc[a].id), delete Xc[a]);
            if (!b) return 0;
            var d = setTimeout(() => {
              delete Xc[a];
              var c = [a, performance.now()], f = hd;
              if (!Da) try {
                f(...c);
              } catch (g) {
                Vc(g);
              } finally {
                if (!(Wa || Sc > 0)) try {
                  Ea = c = Ea, Wc(c);
                } catch (g) {
                  Vc(g);
                }
              }
            }, b);
            Xc[a] = { id: d, Sc: b };
            return 0;
          },
          B: (a, b, d, c) => {
            var f = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(f, 0, 1).getTimezoneOffset();
            f = new Date(f, 6, 1).getTimezoneOffset();
            I[a >> 2] = Math.max(g, f) * 60;
            H[b >> 2] = Number(g != f);
            b = (m) => {
              var t = Math.abs(m);
              return `UTC${m >= 0 ? "-" : "+"}${String(Math.floor(t / 60)).padStart(2, "0")}${String(t % 60).padStart(2, "0")}`;
            };
            a = b(g);
            b = b(f);
            f < g ? (L(a, E, d, 17), L(b, E, c, 17)) : (L(a, E, c, 17), L(b, E, d, 17));
          },
          d: () => Date.now(),
          p: () => 2147483648,
          c: () => performance.now(),
          l: (a) => {
            var b = E.length;
            a >>>= 0;
            if (a > 2147483648) return false;
            for (var d = 1; d <= 4; d *= 2) {
              var c = b * (1 + 0.2 / d);
              c = Math.min(c, a + 100663296);
              a: {
                c = (Math.min(2147483648, Math.ceil(Math.max(a, c) / 65536) * 65536) - Ga.buffer.byteLength + 65535) / 65536 | 0;
                try {
                  Ga.grow(c);
                  Fa();
                  var f = 1;
                  break a;
                } catch (g) {
                }
                f = void 0;
              }
              if (f) return true;
            }
            return false;
          },
          G: (a, b) => {
            var d = 0, c = 0, f;
            for (f of $c()) {
              var g = b + d;
              I[a + c >> 2] = g;
              d += L(f, E, g, Infinity) + 1;
              c += 4;
            }
            return 0;
          },
          H: (a, b) => {
            var d = $c();
            I[a >> 2] = d.length;
            a = 0;
            for (var c of d) a += l(c) + 1;
            I[b >> 2] = a;
            return 0;
          },
          e: function(a) {
            try {
              var b = R(a);
              hc(b);
              return 0;
            } catch (d) {
              if (typeof Y === "undefined" || d.name !== "ErrnoError") throw d;
              return d.Wa;
            }
          },
          m: function(a, b) {
            try {
              var d = R(a);
              v[b] = d.bb ? 2 : P(d.mode) ? 3 : (d.mode & 61440) === 40960 ? 7 : 4;
              Ha[b + 2 >> 1] = 0;
              J[b + 8 >> 3] = BigInt(0);
              J[b + 16 >> 3] = BigInt(0);
              return 0;
            } catch (c) {
              if (typeof Y === "undefined" || c.name !== "ErrnoError") throw c;
              return c.Wa;
            }
          },
          t: function(a, b, d, c) {
            try {
              a: {
                var f = R(a);
                a = b;
                for (var g, m = b = 0; m < d; m++) {
                  var t = I[a >> 2], z = I[a + 4 >> 2];
                  a += 8;
                  try {
                    var q = f, n = t, F = z, U = g, ma = v;
                    if (F < 0 || U < 0) throw new O(28);
                    if (q.lb === null) throw new O(8);
                    if ((q.flags & 2097155) === 1) throw new O(8);
                    if (P(q.node.mode)) throw new O(31);
                    if (!q.Ta.read) throw new O(28);
                    var za = typeof U !== "undefined";
                    if (!za) U = q.position;
                    else if (!q.seekable) throw new O(70);
                    var na = q.Ta.read(q, ma, n, F, U);
                    za || (q.position += na);
                    var ca = na;
                  } catch (N) {
                    if (b > 0 && N instanceof O && (N.Wa == 6 || N.Wa == 6)) break;
                    throw N;
                  }
                  if (ca < 0) {
                    var Aa = -1;
                    break a;
                  }
                  b += ca;
                  if (ca < z) break;
                  typeof g !== "undefined" && (g += ca);
                }
                Aa = b;
              }
              I[c >> 2] = Aa;
              return 0;
            } catch (N) {
              if (typeof Y === "undefined" || N.name !== "ErrnoError") throw N;
              return N.Wa;
            }
          },
          E: function(a, b, d, c) {
            b = b < -9007199254740992 || b > 9007199254740992 ? NaN : Number(b);
            try {
              if (isNaN(b)) return 22;
              var f = R(a);
              ic(f, b, d);
              J[c >> 3] = BigInt(f.position);
              f.Mb && !b && d === 0 && (f.Mb = null);
              return 0;
            } catch (g) {
              if (typeof Y === "undefined" || g.name !== "ErrnoError") throw g;
              return g.Wa;
            }
          },
          K: function(a) {
            try {
              var b = R(a);
              return b.Ta?.tb?.(b);
            } catch (d) {
              if (typeof Y === "undefined" || d.name !== "ErrnoError") throw d;
              return d.Wa;
            }
          },
          q: function(a, b, d, c) {
            try {
              var f = R(a);
              a = b;
              if (d == 1) var g = jc(f, v, I[a >> 2], I[a + 4 >> 2]);
              else {
                for (var m = b = 0, t = a; m < d; m++, t += 8) b += I[t + 4 >> 2];
                var z = new Uint8Array(b);
                for (m = t = 0; m < d; m++, a += 8) {
                  var q = I[a >> 2], n = I[a + 4 >> 2];
                  z.set(
                    E.subarray(q, q + n),
                    t
                  );
                  t += n;
                }
                g = jc(f, z, 0, b);
              }
              I[c >> 2] = g;
              return 0;
            } catch (F) {
              if (typeof Y === "undefined" || F.name !== "ErrnoError") throw F;
              return F.Wa;
            }
          },
          u: Wc,
          f: function(a) {
            console.warn("sql.js: legacy function " + A(a) + "() is deprecated and will be disabled by default in the next major version. Initialize with useOldExtensionFunctions: false to use native SQLite functions. See https://github.com/sql-js/sql.js/pull/647");
          }
        };
        async function kd() {
          Ka();
          var a = k.setStatus;
          a && (a("Running..."), await new Promise((b) => setTimeout(b, 1)), setTimeout(a, 1, ""));
          Da || (k.noFSInit || Gb || kc(), ld.P(), Hb = false, k.onRuntimeInitialized?.(), Ma());
        }
        var ld;
        (async function() {
          function a(c) {
            c = ld = c.exports;
            k._sqlite3_memory_used = c.R;
            k._sqlite3_free = c.S;
            k._sqlite3_value_text = c.T;
            k._sqlite3_prepare_v2 = c.U;
            k._sqlite3_step = c.V;
            k._sqlite3_reset = c.W;
            k._sqlite3_exec = c.X;
            k._sqlite3_finalize = c.Y;
            k._sqlite3_column_name = c.Z;
            k._sqlite3_column_text = c._;
            k._sqlite3_column_type = c.$;
            k._sqlite3_errmsg = c.aa;
            k._sqlite3_backup_init = c.ba;
            k._sqlite3_backup_step = c.ca;
            k._sqlite3_backup_finish = c.da;
            k._sqlite3_clear_bindings = c.ea;
            k._sqlite3_value_blob = c.fa;
            k._sqlite3_value_bytes = c.ga;
            k._sqlite3_value_double = c.ha;
            k._sqlite3_value_int = c.ia;
            k._sqlite3_value_type = c.ja;
            k._sqlite3_result_blob = c.ka;
            k._sqlite3_result_double = c.la;
            k._sqlite3_result_error = c.ma;
            k._sqlite3_result_int = c.na;
            k._sqlite3_result_int64 = c.oa;
            k._sqlite3_result_null = c.pa;
            k._sqlite3_result_text = c.qa;
            k._sqlite3_aggregate_context = c.ra;
            k._sqlite3_column_count = c.sa;
            k._sqlite3_data_count = c.ta;
            k._sqlite3_column_blob = c.ua;
            k._sqlite3_column_bytes = c.va;
            k._sqlite3_column_double = c.wa;
            k._sqlite3_bind_blob = c.xa;
            k._sqlite3_bind_double = c.ya;
            k._sqlite3_bind_int = c.za;
            k._sqlite3_bind_int64 = c.Aa;
            k._sqlite3_bind_text = c.Ba;
            k._sqlite3_bind_parameter_index = c.Ca;
            k._sqlite3_sql = c.Da;
            k._sqlite3_normalized_sql = c.Ea;
            k._sqlite3_changes = c.Fa;
            k._sqlite3_close_v2 = c.Ga;
            k._sqlite3_create_function_v2 = c.Ha;
            k._sqlite3_update_hook = c.Ia;
            k._sqlite3_extended_errcode = c.Ja;
            k._sqlite3_open = c.Ka;
            fa = k._malloc = c.La;
            ha = k._free = c.Ma;
            k._RegisterExtensionFunctions = c.Na;
            ib = c.Oa;
            hd = c.Pa;
            ra = c.Qa;
            oa = c.Ra;
            pa = c.Sa;
            Ga = c.O;
            Z = c.Q;
            Fa();
            return ld;
          }
          var b = { a: jd }, d = k.instantiateWasm;
          if (d) return new Promise((c) => {
            d(b, (f) => c(a(f)));
          });
          Qa ??= k.locateFile ? k.locateFile("sql-wasm-browser.wasm", wa) : wa + "sql-wasm-browser.wasm";
          return (function(c) {
            return a(c.instance);
          })(await Ua(b));
        })().then(() => kd());
        return Module;
      });
      return initSqlJsPromise;
    };
    if (typeof exports === "object" && typeof module2 === "object") {
      module2.exports = initSqlJs2;
      module2.exports.default = initSqlJs2;
    } else if (typeof define === "function" && define["amd"]) {
      define([], function() {
        return initSqlJs2;
      });
    } else if (typeof exports === "object") {
      exports["Module"] = initSqlJs2;
    }
  }
});

// node_modules/koishipro-core.js/dist/index.mjs
var import_buffer = __toESM(require_buffer(), 1);

// node_modules/typed-reflector/dist/index.mjs
var GLOBAL_REGISTRY_KEY = /* @__PURE__ */ Symbol.for("typed-reflector.global-registry");
function getPropertyBucket(store, propertyKey, create) {
  const bucket = store.properties.get(propertyKey);
  if (bucket || !create) {
    return bucket;
  }
  const nextBucket = /* @__PURE__ */ new Map();
  store.properties.set(propertyKey, nextBucket);
  return nextBucket;
}
var MetadataRegistry = class {
  constructor() {
    this.store = /* @__PURE__ */ new WeakMap();
  }
  getStore(target, create) {
    const store = this.store.get(target);
    if (store || !create) {
      return store;
    }
    const nextStore = {
      target: /* @__PURE__ */ new Map(),
      properties: /* @__PURE__ */ new Map()
    };
    this.store.set(target, nextStore);
    return nextStore;
  }
  getOwnBucket(target, propertyKey, create = false) {
    const store = this.getStore(target, create);
    if (!store) {
      return void 0;
    }
    if (propertyKey === void 0) {
      return store.target;
    }
    return getPropertyBucket(store, propertyKey, create);
  }
  *walkPrototypeChain(target) {
    let current = target;
    while (current) {
      yield current;
      current = Object.getPrototypeOf(current);
    }
  }
  defineMetadata(metadataKey, value, target, propertyKey) {
    const bucket = this.getOwnBucket(target, propertyKey, true);
    bucket.set(metadataKey, value);
  }
  hasOwnMetadata(metadataKey, target, propertyKey) {
    return this.getOwnBucket(target, propertyKey)?.has(metadataKey) ?? false;
  }
  hasMetadata(metadataKey, target, propertyKey) {
    for (const current of this.walkPrototypeChain(target)) {
      if (this.hasOwnMetadata(metadataKey, current, propertyKey)) {
        return true;
      }
    }
    return false;
  }
  getOwnMetadata(metadataKey, target, propertyKey) {
    return this.getOwnBucket(target, propertyKey)?.get(metadataKey);
  }
  getMetadata(metadataKey, target, propertyKey) {
    for (const current of this.walkPrototypeChain(target)) {
      const bucket = this.getOwnBucket(current, propertyKey);
      if (bucket?.has(metadataKey)) {
        return bucket.get(metadataKey);
      }
    }
    return void 0;
  }
};
var globalRegistryHost = globalThis;
var GlobalRegistry = globalRegistryHost[GLOBAL_REGISTRY_KEY] || (globalRegistryHost[GLOBAL_REGISTRY_KEY] = new MetadataRegistry());
function isClass(target) {
  if (typeof target !== "function") {
    return false;
  }
  const proto = target.constructor;
  return proto === Function;
}
function getClass(target) {
  return isClass(target) ? target : getClass(target.constructor);
}
var MODERN_REGISTRY_TARGETS_KEY = /* @__PURE__ */ Symbol.for(
  "typed-reflector.modern.registry-targets"
);
function ensureSymbolMetadata() {
  const symbolCtor = Symbol;
  if (!symbolCtor.metadata) {
    Object.defineProperty(symbolCtor, "metadata", {
      value: /* @__PURE__ */ Symbol("Symbol.metadata"),
      configurable: true
    });
  }
  return symbolCtor.metadata;
}
function ensureRegistryTargets(metadata) {
  if (Object.prototype.hasOwnProperty.call(metadata, MODERN_REGISTRY_TARGETS_KEY)) {
    return metadata[MODERN_REGISTRY_TARGETS_KEY];
  }
  const parent = Object.getPrototypeOf(metadata);
  const parentTargets = parent ? ensureRegistryTargets(parent) : void 0;
  const targets = {
    target: Object.create(parentTargets?.target ?? null),
    staticProperties: Object.create(parentTargets?.staticProperties ?? null),
    instanceProperties: Object.create(
      parentTargets?.instanceProperties ?? null
    )
  };
  metadata[MODERN_REGISTRY_TARGETS_KEY] = targets;
  return targets;
}
function getClassMetadataObject(target) {
  const symbolMetadata = ensureSymbolMetadata();
  return target[symbolMetadata];
}
function getRegistryTarget(metadata, isStatic, propertyKey) {
  const targets = ensureRegistryTargets(metadata);
  if (propertyKey === void 0) {
    return targets.target;
  }
  return isStatic ? targets.staticProperties : targets.instanceProperties;
}
var BaseReflector = class {
  constructor(options = {}) {
    this.registry = options.registry || GlobalRegistry;
  }
  prepareMetadataValue(metadataValue) {
    if (Array.isArray(metadataValue)) {
      return metadataValue.slice();
    }
    return metadataValue;
  }
  readMetadataInDecorator(metadataKey, context) {
    const target = this.resolveDecoratorMetadataTarget(context);
    return target.key !== void 0 ? this.registry.getMetadata(metadataKey, target.target, target.key) : this.registry.getMetadata(metadataKey, target.target);
  }
  writeMetadataInDecorator(metadataKey, metadataValue, context) {
    const target = this.resolveDecoratorMetadataTarget(context);
    if (target.key !== void 0) {
      this.registry.defineMetadata(
        metadataKey,
        metadataValue,
        target.target,
        target.key
      );
      return;
    }
    this.registry.defineMetadata(metadataKey, metadataValue, target.target);
  }
  appendIndexedKey(metadataKey, context) {
    const indexedKey = this.resolveIndexedKey(context);
    const keysContext = this.resolveKeysIndexContext(context);
    if (indexedKey === void 0 || !keysContext) {
      return;
    }
    this.applyMetadataTransform(
      metadataKey,
      (currentValue) => {
        const nextValue = currentValue || [];
        if (!nextValue.includes(indexedKey)) {
          nextValue.push(indexedKey);
        }
        return nextValue;
      },
      keysContext
    );
  }
  applyMetadataTransform(metadataKey, metadataValueFun, context, keysIndexMeta) {
    const oldValue = this.prepareMetadataValue(
      this.readMetadataInDecorator(metadataKey, context)
    );
    const newValue = metadataValueFun(oldValue);
    this.writeMetadataInDecorator(metadataKey, newValue, context);
    if (keysIndexMeta !== void 0) {
      this.appendIndexedKey(keysIndexMeta, context);
    }
  }
  setParameterMetadata(metadataKey, metadataValue, context, index) {
    const oldValue = this.prepareMetadataValue(
      this.readMetadataInDecorator(metadataKey, context)
    );
    const nextValue = oldValue || [];
    nextValue[index] = metadataValue;
    this.writeMetadataInDecorator(
      metadataKey,
      nextValue,
      context
    );
  }
  getClassMetadataTargets(instance) {
    const instanceClass = getClass(instance);
    const targets = [instanceClass];
    const modernMetadata = getClassMetadataObject(instanceClass);
    if (modernMetadata) {
      targets.unshift(getRegistryTarget(modernMetadata, void 0));
    }
    return Array.from(new Set(targets));
  }
  getMemberMetadataTargets(instance, key) {
    const instanceClass = getClass(instance);
    const isPrototypeTarget = !isClass(instance) && instance === instanceClass.prototype;
    const prototypeTarget = isClass(instance) ? instanceClass.prototype : isPrototypeTarget ? instance : Object.getPrototypeOf(instance);
    const legacyTargets = isClass(instance) ? [instanceClass, prototypeTarget] : [prototypeTarget, instanceClass];
    const modernMetadata = getClassMetadataObject(instanceClass);
    const modernTargets = modernMetadata ? [
      getRegistryTarget(modernMetadata, isClass(instance), key),
      getRegistryTarget(modernMetadata, !isClass(instance), key)
    ] : [];
    return Array.from(/* @__PURE__ */ new Set([...modernTargets, ...legacyTargets]));
  }
  transform(metadataKey, metadataValueFun, keysIndexMeta) {
    return this.createDecorator(
      metadataKey,
      metadataValueFun,
      keysIndexMeta
    );
  }
  set(metadataKey, metadataValue, keysIndexMeta) {
    return this.transform(
      metadataKey,
      () => metadataValue,
      keysIndexMeta
    );
  }
  append(metadataKey, metadataValue, keysIndexMeta) {
    return this.transform(
      metadataKey,
      (currentValue) => {
        const nextValue = currentValue || [];
        nextValue.push(metadataValue);
        return nextValue;
      },
      keysIndexMeta
    );
  }
  appendUnique(metadataKey, metadataValue, keysIndexMeta) {
    return this.transform(
      metadataKey,
      (currentValue) => {
        const nextValue = currentValue || [];
        if (!nextValue.includes(metadataValue)) {
          nextValue.push(metadataValue);
        }
        return nextValue;
      },
      keysIndexMeta
    );
  }
  concat(metadataKey, metadataValue, keysIndexMeta) {
    return this.transform(
      metadataKey,
      (currentValue) => (currentValue || []).concat(metadataValue),
      keysIndexMeta
    );
  }
  get(metadataKey, instance, key) {
    const targets = key !== void 0 ? this.getMemberMetadataTargets(instance, key) : this.getClassMetadataTargets(instance);
    for (const target of targets) {
      if (key !== void 0 ? this.registry.hasMetadata(metadataKey, target, key) : this.registry.hasMetadata(metadataKey, target)) {
        return key !== void 0 ? this.registry.getMetadata(metadataKey, target, key) : this.registry.getMetadata(metadataKey, target);
      }
    }
    return void 0;
  }
  getArray(metadataKey, instance, key) {
    return this.get(
      metadataKey,
      instance,
      key
    ) || [];
  }
  getProperty(metadataKey, instance, key, alternate) {
    const valueFromClass = this.getArray(metadataKey, instance);
    const valueFromAlternate = alternate ? this.getArray(metadataKey, alternate) : [];
    const valueFromProperty = this.getArray(metadataKey, instance, key);
    return [
      ...valueFromClass,
      ...valueFromAlternate,
      ...valueFromProperty
    ];
  }
};
var Reflector = class extends BaseReflector {
  prepareMetadataValue(metadataValue) {
    return metadataValue;
  }
  resolveDecoratorMetadataTarget(context) {
    return context;
  }
  resolveKeysIndexContext(context) {
    if (context.key === void 0) {
      return void 0;
    }
    return { target: getClass(context.target) };
  }
  resolveIndexedKey(context) {
    return context.key;
  }
  createDecorator(metadataKey, metadataValueFun, keysIndexMeta) {
    return (target, key) => {
      this.applyMetadataTransform(
        metadataKey,
        metadataValueFun,
        { target, key },
        keysIndexMeta
      );
    };
  }
  getMetadataFromDecorator(dec, metadataKey, options = {}) {
    class TempClass {
    }
    if (options.index !== void 0) {
      const parameterDecorator = dec;
      parameterDecorator(
        options.key === void 0 ? TempClass : TempClass.prototype,
        options.key,
        options.index
      );
      if (options.key !== void 0) {
        return this.get(metadataKey, TempClass, options.key);
      }
      return this.get(metadataKey, TempClass);
    }
    const propertyKey = options.key ?? "_temp_property_key_" + Math.random().toString(16).slice(2);
    const decorator = dec;
    decorator(TempClass.prototype, propertyKey);
    return this.get(metadataKey, TempClass, propertyKey);
  }
  param(metadataKey, metadataValue, keysIndexMeta) {
    return (target, key, index) => {
      this.setParameterMetadata(
        metadataKey,
        metadataValue,
        {
          target,
          key
        },
        index
      );
      if (keysIndexMeta !== void 0 && key !== void 0) {
        this.appendIndexedKey(keysIndexMeta, {
          target,
          key
        });
      }
    };
  }
};

// node_modules/ygopro-deck-encode/dist/index.mjs
function toBase64Url(bytes) {
  const base64 = typeof Buffer !== "undefined" ? Buffer.from(bytes).toString("base64") : btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(encoded) {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(padded, "base64"));
  }
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function countItems(arr) {
  const map = /* @__PURE__ */ new Map();
  for (const item of arr) {
    map.set(item, (map.get(item) || 0) + 1);
  }
  const blocks = [];
  for (const [item, count] of map.entries()) {
    blocks.push({ item, count });
  }
  return blocks;
}
function countConsecutiveItems(arr) {
  const result = [];
  if (arr.length === 0)
    return result;
  let currentItem = arr[0];
  let count = 1;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === currentItem) {
      count++;
    } else {
      result.push({ item: currentItem, count });
      currentItem = arr[i];
      count = 1;
    }
  }
  result.push({ item: currentItem, count });
  return result;
}
var BufferCursor = class {
  buffer;
  pointer = 0;
  constructor(bufOrLength) {
    if (typeof bufOrLength === "number") {
      this.buffer = new Uint8Array(bufOrLength);
    } else {
      this.buffer = bufOrLength;
    }
  }
  /**
   * 安全地将 pointer 向前移动指定字节数。
   * @param bytes 要移动的字节数
   * @returns 原来 pointer 的值
   * @throws RangeError 如果越界
   */
  increasePointer(bytes) {
    const old = this.pointer;
    const next = old + bytes;
    if (next > this.buffer.length) {
      throw new RangeError(
        `Pointer overflow: tried to move to ${next}, but buffer length is ${this.buffer.length}`
      );
    }
    this.pointer = next;
    return old;
  }
};
var BufferWriter = class extends BufferCursor {
  constructor(length) {
    super(length);
  }
  writeUint32LE(value) {
    const idx = this.increasePointer(4);
    this.buffer[idx] = value & 255;
    this.buffer[idx + 1] = value >>> 8 & 255;
    this.buffer[idx + 2] = value >>> 16 & 255;
    this.buffer[idx + 3] = value >>> 24 & 255;
    return this;
  }
  writeUint32BE(value) {
    const idx = this.increasePointer(4);
    this.buffer[idx] = value >>> 24 & 255;
    this.buffer[idx + 1] = value >>> 16 & 255;
    this.buffer[idx + 2] = value >>> 8 & 255;
    this.buffer[idx + 3] = value & 255;
    return this;
  }
  writeUint16LE(value) {
    const idx = this.increasePointer(2);
    this.buffer[idx] = value & 255;
    this.buffer[idx + 1] = value >>> 8 & 255;
    return this;
  }
  writeUint16BE(value) {
    const idx = this.increasePointer(2);
    this.buffer[idx] = value >>> 8 & 255;
    this.buffer[idx + 1] = value & 255;
    return this;
  }
  writeUint8(value) {
    const idx = this.increasePointer(1);
    this.buffer[idx] = value & 255;
    return this;
  }
  writeString(str) {
    for (let i = 0; i < str.length; i++) {
      const idx = this.increasePointer(1);
      this.buffer[idx] = str.charCodeAt(i);
    }
    return this;
  }
};
var BufferReader = class extends BufferCursor {
  constructor(buf) {
    super(buf);
  }
  readUint32LE() {
    const idx = this.increasePointer(4);
    const b = this.buffer;
    return (b[idx] | b[idx + 1] << 8 | b[idx + 2] << 16 | b[idx + 3] << 24) >>> 0;
  }
  readUint32BE() {
    const idx = this.increasePointer(4);
    const b = this.buffer;
    return (b[idx] << 24 | b[idx + 1] << 16 | b[idx + 2] << 8 | b[idx + 3]) >>> 0;
  }
  readUint16LE() {
    const idx = this.increasePointer(2);
    const b = this.buffer;
    return b[idx] | b[idx + 1] << 8;
  }
  readUint16BE() {
    const idx = this.increasePointer(2);
    const b = this.buffer;
    return b[idx] << 8 | b[idx + 1];
  }
  readUint8() {
    const idx = this.increasePointer(1);
    return this.buffer[idx];
  }
  readString(length) {
    let s = "";
    for (let i = 0; i < length; i++) {
      const idx = this.increasePointer(1);
      s += String.fromCharCode(this.buffer[idx]);
    }
    return s;
  }
  readRemaining() {
    const remaining = this.buffer.length - this.pointer;
    const idx = this.increasePointer(remaining);
    return this.buffer.subarray(idx, this.buffer.length);
  }
};
var arrayEquals = (a, b) => {
  return a.length === b.length && a.every((v, i) => v === b[i]);
};
function decodeBase64(base64) {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(base64, "base64"));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function encodeBase64(bytes) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function base64ToUint32Array(base64) {
  const bytes = decodeBase64(base64);
  const view = new DataView(bytes.buffer);
  const result = [];
  for (let i = 0; i < bytes.length; i += 4) {
    result.push(view.getUint32(i, true));
  }
  return result;
}
function uint32ArrayToBase64(data) {
  const buffer = new ArrayBuffer(data.length * 4);
  const view = new DataView(buffer);
  data.forEach((val, i) => view.setUint32(i * 4, val, true));
  return encodeBase64(new Uint8Array(buffer));
}
function toYdkeURL(deck) {
  return "ydke://" + uint32ArrayToBase64(deck.main) + "!" + uint32ArrayToBase64(deck.extra) + "!" + uint32ArrayToBase64(deck.side) + "!";
}
function fromYdkeURL(ydke) {
  if (!ydke.startsWith("ydke://")) {
    throw new Error("Invalid ydke:// URI");
  }
  const [mainStr, extraStr, sideStr] = ydke.slice(7).split("!");
  if (mainStr === void 0 || extraStr === void 0 || sideStr === void 0) {
    throw new Error("Incomplete ydke:// URI");
  }
  return {
    main: base64ToUint32Array(mainStr),
    extra: base64ToUint32Array(extraStr),
    side: base64ToUint32Array(sideStr)
  };
}
var QUERY_YGO_TYPE = "ygotype";
var QUERY_VERSION = "v";
var ARG_DECK = "deck";
var QUERY_DECK = "d";
var QUERY_NAME = "name";
var URL_SCHEME_HTTP = "http";
var URL_HOST_DECK = "deck.ourygo.top";
var BitWriter = class {
  buffer = [];
  current = 0;
  bitPos = 0;
  writeBits(value, length) {
    while (length > 0) {
      const remain = 8 - this.bitPos;
      const take = Math.min(remain, length);
      const shift = length - take;
      this.current |= (value >>> shift & (1 << take) - 1) << remain - take;
      this.bitPos += take;
      length -= take;
      if (this.bitPos === 8) {
        this.buffer.push(this.current);
        this.current = 0;
        this.bitPos = 0;
      }
    }
  }
  finish() {
    if (this.bitPos > 0)
      this.buffer.push(this.current);
    return new Uint8Array(this.buffer);
  }
};
var BitReader = class {
  constructor(bytes) {
    this.bytes = bytes;
  }
  index = 0;
  bitPos = 0;
  readBits(length) {
    let result = 0;
    while (length > 0) {
      const remain = 8 - this.bitPos;
      const take = Math.min(remain, length);
      const bits = this.bytes[this.index] >>> remain - take & (1 << take) - 1;
      result = result << take | bits;
      this.bitPos += take;
      length -= take;
      if (this.bitPos === 8) {
        this.bitPos = 0;
        this.index++;
      }
    }
    return result;
  }
};
function countUnique(cards) {
  let count = 0;
  for (let i = 0; i < cards.length; ) {
    const id = cards[i];
    count++;
    while (i < cards.length && cards[i] === id)
      i++;
  }
  return count;
}
function toYGOMobileDeckURL(main, extra, side, customParams = {}) {
  const mNum = countUnique(main);
  const eNum = countUnique(extra);
  const sNum = countUnique(side);
  const writer = new BitWriter();
  writer.writeBits(mNum, 8);
  writer.writeBits(eNum, 4);
  writer.writeBits(sNum, 4);
  const encodeSection = (cards) => {
    for (let i = 0; i < cards.length; ) {
      const id = cards[i];
      let count = 1;
      while (i + count < cards.length && cards[i + count] === id && count < 3)
        count++;
      const prefix = count === 2 ? 2 : count === 3 ? 3 : 1;
      writer.writeBits(prefix, 2);
      writer.writeBits(id, 27);
      i += count;
    }
  };
  encodeSection(main);
  encodeSection(extra);
  encodeSection(side);
  const encoded = toBase64Url(writer.finish());
  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(customParams)) {
    searchParams.set(k, v);
  }
  searchParams.set(QUERY_YGO_TYPE, ARG_DECK);
  searchParams.set(QUERY_VERSION, "1");
  searchParams.set(QUERY_DECK, encoded);
  return `${URL_SCHEME_HTTP}://${URL_HOST_DECK}?${searchParams.toString()}`;
}
function fromYGOMobileDeckURL(uri) {
  const url = new URL(uri);
  if (url.searchParams.get(QUERY_YGO_TYPE) !== ARG_DECK) {
    throw new Error("Invalid deck URL");
  }
  const encoded = url.searchParams.get(QUERY_DECK);
  if (!encoded)
    throw new Error("Missing deck data");
  const bytes = fromBase64Url(encoded);
  const reader = new BitReader(bytes);
  const mNum = reader.readBits(8);
  const eNum = reader.readBits(4);
  const sNum = reader.readBits(4);
  const total = mNum + eNum + sNum;
  const result = {
    main: [],
    extra: [],
    side: []
  };
  for (let i = 0; i < total; i++) {
    const prefix = reader.readBits(2);
    const count = prefix === 2 ? 2 : prefix === 3 ? 3 : 1;
    const id = reader.readBits(27);
    const target = i < mNum ? result.main : i < mNum + eNum ? result.extra : result.side;
    for (let j = 0; j < count; j++) {
      target.push(id);
    }
  }
  return {
    ...result,
    name: url.searchParams.get(QUERY_NAME) ?? void 0
  };
}
var YGOProDeck = class {
  main = [];
  extra = [];
  side = [];
  name;
  constructor(init = {}) {
    this.main = init.main ? [...init.main] : [];
    this.extra = init.extra ? [...init.extra] : [];
    this.side = init.side ? [...init.side] : [];
    this.name = init.name;
  }
  bufferLength(noCompact = false) {
    const counted = [this.main, this.extra, this.side].map(
      noCompact ? countConsecutiveItems : countItems
    );
    return counted.reduce((a, b) => a + b.length * 4, 0);
  }
  toUint8Array(noCompact = false) {
    const counted = [this.main, this.extra, this.side].map(
      noCompact ? countConsecutiveItems : countItems
    );
    const writer = new BufferWriter(
      counted.reduce((a, b) => a + b.length * 4, 0)
    );
    const writeCards = (countMap, type) => {
      for (const { item, count } of countMap) {
        if (count > 4) {
          throw new Error(`Too many cards: ${item}`);
        }
        const value = item & 268435455 | type << 28 | count - 1 << 30;
        writer.writeUint32LE(value);
      }
    };
    counted.forEach(writeCards);
    return writer.buffer;
  }
  toEncodedString(noCompact = false) {
    return toBase64Url(this.toUint8Array(noCompact));
  }
  toString(noCompact = false) {
    return this.toEncodedString(noCompact);
  }
  fromUint8Array(buf) {
    for (let i = 0; i < buf.length - 3; i += 4) {
      const value = buf[i] | buf[i + 1] << 8 | buf[i + 2] << 16 | buf[i + 3] << 24;
      const id = value & 268435455;
      const type = value >>> 28 & 3;
      const count = (value >>> 30 & 3) + 1;
      const cards = [this.main, this.extra, this.side][type];
      for (let j = 0; j < count; j++) {
        cards.push(id);
      }
    }
    return this;
  }
  static fromUint8Array(buf) {
    return new YGOProDeck().fromUint8Array(buf);
  }
  fromEncodedString(str) {
    return this.fromUint8Array(fromBase64Url(str));
  }
  static fromEncodedString(str) {
    return new YGOProDeck().fromEncodedString(str);
  }
  toYdkString() {
    return [
      "#created by ygopro-deck-encode",
      "#main",
      ...this.main.map((id) => id.toString()),
      "#extra",
      ...this.extra.map((id) => id.toString()),
      "!side",
      ...this.side.map((id) => id.toString())
    ].join("\n");
  }
  fromYdkString(str) {
    const lines = str.split(/\r?\n/);
    let current = this.main;
    for (const _line of lines) {
      const line = _line.trim();
      if (line === "#main") {
        current = this.main;
      }
      if (line === "#extra") {
        current = this.extra;
      }
      if (line === "!side") {
        current = this.side;
      }
      if (line.match(/^\d+$/)) {
        current.push(parseInt(line, 10));
      }
    }
    return this;
  }
  static fromYdkString(str) {
    return new YGOProDeck().fromYdkString(str);
  }
  fromUpdateDeckPayload(buf, isExtraDeckCard = () => false) {
    const reader = new BufferReader(buf);
    const mainc = reader.readUint32LE();
    const sidec = reader.readUint32LE();
    this.main = [];
    this.extra = [];
    this.side = [];
    for (let i = 0; i < mainc; i++) {
      const id = reader.readUint32LE();
      if (isExtraDeckCard(id, i, mainc)) {
        this.extra.push(id);
      } else {
        this.main.push(id);
      }
    }
    for (let i = 0; i < sidec; i++) {
      const id = reader.readUint32LE();
      this.side.push(id);
    }
    return this;
  }
  static fromUpdateDeckPayload(buf, isExtraDeckCard = () => false) {
    return new YGOProDeck().fromUpdateDeckPayload(buf, isExtraDeckCard);
  }
  toUpdateDeckPayload() {
    const cards = [...this.main, ...this.extra, ...this.side];
    const writer = new BufferWriter(cards.length * 4 + 8).writeUint32LE(this.main.length + this.extra.length).writeUint32LE(this.side.length);
    cards.forEach((id) => writer.writeUint32LE(id));
    return writer.buffer;
  }
  fromYGOMobileDeckURL(uri) {
    const parsed = fromYGOMobileDeckURL(uri);
    this.main = parsed.main;
    this.extra = parsed.extra;
    this.side = parsed.side;
    this.name = parsed.name;
    return this;
  }
  static fromYGOMobileDeckURL(uri) {
    return new YGOProDeck().fromYGOMobileDeckURL(uri);
  }
  toYGOMobileDeckURL() {
    return toYGOMobileDeckURL(
      this.main,
      this.extra,
      this.side,
      this.name && {
        name: this.name
      }
    );
  }
  fromYdkeURL(uri) {
    const parsed = fromYdkeURL(uri);
    this.main = parsed.main;
    this.extra = parsed.extra;
    this.side = parsed.side;
    return this;
  }
  static fromYdkeURL(uri) {
    return new YGOProDeck().fromYdkeURL(uri);
  }
  toYdkeURL() {
    return toYdkeURL({
      main: this.main,
      extra: this.extra,
      side: this.side
    });
  }
  isEqual(other, options = {}) {
    const { ignoreOrder = false } = options;
    const fields = ["main", "extra", "side"];
    const getField = (o, field) => o[field] || [];
    if (fields.some(
      (field) => getField(this, field).length !== getField(other, field).length
    )) {
      return false;
    }
    const normalize = (arr) => ignoreOrder ? [...arr].sort((a, b) => a - b) : arr;
    return fields.every(
      (field) => arrayEquals(
        normalize(getField(this, field)),
        normalize(getField(other, field))
      )
    );
  }
};

// node_modules/@cjser/lzma1/lib/lz-window.js
var LzOutWindow = class {
  buffer = null;
  pos = 0;
  streamPos = 0;
  stream = null;
  windowSize = 0;
  // Private Go-style properties
  w = null;
  buf;
  constructor(writer = null, windowSize = 4096) {
    this.w = writer;
    this.stream = writer;
    this.windowSize = windowSize;
    this.buf = new Uint8Array(windowSize);
    this.buffer = this.buf;
    this.pos = 0;
    this.streamPos = 0;
  }
  /**
   * Copy a block of data from a previous position (LZ77-style)
   */
  copyBlock(distance, length) {
    if (!this.buffer)
      return;
    for (let i = 0; i < length; i++) {
      let sourcePos = this.pos - distance - 1;
      if (sourcePos < 0) {
        sourcePos += this.windowSize;
      }
      const byte = this.buffer[sourcePos];
      this.putByte(byte);
    }
  }
  /**
   * Put a single byte into the window
   */
  putByte(byte) {
    if (!this.buffer)
      return;
    this.buffer[this.pos] = byte;
    this.pos++;
    this.streamPos++;
    if (this.pos >= this.windowSize) {
      this.flush();
    }
  }
  /**
   * Get a byte from a relative position
   */
  getByte(relativePos) {
    if (!this.buffer)
      return 0;
    let pos = this.pos + relativePos;
    if (pos < 0) {
      pos += this.windowSize;
    } else if (pos >= this.windowSize) {
      pos -= this.windowSize;
    }
    return this.buffer[pos];
  }
  /**
   * Flush buffered data to output writer
   */
  flush() {
    if (this.w && this.buffer && this.pos > 0) {
      this.w.writeBytes(this.buffer, 0, this.pos);
      this.pos = 0;
    }
  }
  /**
   * Check if the window is empty
   */
  isEmpty() {
    return this.streamPos === 0;
  }
  /**
   * Reset the window
   */
  reset() {
    this.pos = 0;
    this.streamPos = 0;
    if (this.buffer) {
      this.buffer.fill(0);
    }
  }
};

// node_modules/@cjser/lzma1/lib/range-decoder.js
var RangeDecoder = class {
  stream = null;
  code = 0;
  rrange = 0;
  /**
   * Set input stream for decoding
   */
  setStream(stream) {
    this.stream = stream;
  }
  /**
   * Initialize range decoder
   */
  init() {
    this.code = 0;
    this.rrange = -1;
    for (let i = 0; i < 5; ++i) {
      this.code = this.code << 8 | this.readFromStream();
    }
  }
  /**
   * Decode a single bit using probability model
   */
  decodeBit(probs, index) {
    let newBound, prob = probs[index];
    newBound = (this.rrange >>> 11) * prob;
    if ((this.code ^ -2147483648) < (newBound ^ -2147483648)) {
      this.rrange = newBound;
      probs[index] = prob + (2048 - prob >>> 5);
      if (!(this.rrange & -16777216)) {
        this.code = this.code << 8 | this.readFromStream();
        this.rrange <<= 8;
      }
      return 0;
    } else {
      this.rrange -= newBound;
      this.code -= newBound;
      probs[index] = prob - (prob >>> 5);
      if (!(this.rrange & -16777216)) {
        this.code = this.code << 8 | this.readFromStream();
        this.rrange <<= 8;
      }
      return 1;
    }
  }
  /**
   * Decode direct bits (without probability model)
   */
  decodeDirectBits(numTotalBits) {
    let result = 0;
    for (let i = numTotalBits; i != 0; i -= 1) {
      this.rrange >>>= 1;
      let t = this.code - this.rrange >>> 31;
      this.code -= this.rrange & t - 1;
      result = result << 1 | 1 - t;
      if (!(this.rrange & -16777216)) {
        this.code = this.code << 8 | this.readFromStream();
        this.rrange <<= 8;
      }
    }
    return result;
  }
  /**
   * Get current code value (for compatibility)
   */
  get currentCode() {
    return this.code;
  }
  /**
   * Get current range value (for compatibility)
   */
  get currentRange() {
    return this.rrange;
  }
  /**
   * Read a single byte from the input stream
   */
  readFromStream() {
    if (!this.stream) {
      return 0;
    }
    return this.stream.readByte();
  }
};

// node_modules/@cjser/lzma1/lib/utils.js
var INFINITY_PRICE = 268435455;
var _MAX_UINT32 = 4294967295;
var DICTIONARY_SIZE_THRESHOLD = 1073741823;
var kTopValue = 1 << 24;
var kNumBitModelTotalBits = 11;
var kBitModelTotal = 1 << kNumBitModelTotalBits;
var MATCH_DECODERS_SIZE = 192;
var REP_DECODERS_SIZE = 12;
var POS_DECODERS_SIZE = 114;
var LITERAL_DECODER_SIZE = 768;
var DEFAULT_WINDOW_SIZE = 4096;
var CHOICE_ARRAY_SIZE = 2;
var CRC32_TABLE = [
  0,
  1996959894,
  3993919788,
  2567524794,
  124634137,
  1886057615,
  3915621685,
  2657392035,
  249268274,
  2044508324,
  3772115230,
  2547177864,
  162941995,
  2125561021,
  3887607047,
  2428444049,
  498536548,
  1789927666,
  4089016648,
  2227061214,
  450548861,
  1843258603,
  4107580753,
  2211677639,
  325883990,
  1684777152,
  4251122042,
  2321926636,
  335633487,
  1661365465,
  4195302755,
  2366115317,
  997073096,
  1281953886,
  3579855332,
  2724688242,
  1006888145,
  1258607687,
  3524101629,
  2768942443,
  901097722,
  1119000684,
  3686517206,
  2898065728,
  853044451,
  1172266101,
  3705015759,
  2882616665,
  651767980,
  1373503546,
  3369554304,
  3218104598,
  565507253,
  1454621731,
  3485111705,
  3099436303,
  671266974,
  1594198024,
  3322730930,
  2970347812,
  795835527,
  1483230225,
  3244367275,
  3060149565,
  1994146192,
  31158534,
  2563907772,
  4023717930,
  1907459465,
  112637215,
  2680153253,
  3904427059,
  2013776290,
  251722036,
  2517215374,
  3775830040,
  2137656763,
  141376813,
  2439277719,
  3865271297,
  1802195444,
  476864866,
  2238001368,
  4066508878,
  1812370925,
  453092731,
  2181625025,
  4111451223,
  1706088902,
  314042704,
  2344532202,
  4240017532,
  1658658271,
  366619977,
  2362670323,
  4224994405,
  1303535960,
  984961486,
  2747007092,
  3569037538,
  1256170817,
  1037604311,
  2765210733,
  3554079995,
  1131014506,
  879679996,
  2909243462,
  3663771856,
  1141124467,
  855842277,
  2852801631,
  3708648649,
  1342533948,
  654459306,
  3188396048,
  3373015174,
  1466479909,
  544179635,
  3110523913,
  3462522015,
  1591671054,
  702138776,
  2966460450,
  3352799412,
  1504918807,
  783551873,
  3082640443,
  3233442989,
  3988292384,
  2596254646,
  62317068,
  1957810842,
  3939845945,
  2647816111,
  81470997,
  1943803523,
  3814918930,
  2489596804,
  225274430,
  2053790376,
  3826175755,
  2466906013,
  167816743,
  2097651377,
  4027552580,
  2265490386,
  503444072,
  1762050814,
  4150417245,
  2154129355,
  426522225,
  1852507879,
  4275313526,
  2312317920,
  282753626,
  1742555852,
  4189708143,
  2394877945,
  397917763,
  1622183637,
  3604390888,
  2714866558,
  953729732,
  1340076626,
  3518719985,
  2797360999,
  1068828381,
  1219638859,
  3624741850,
  2936675148,
  906185462,
  1090812512,
  3747672003,
  2825379669,
  829329135,
  1181335161,
  3412177804,
  3160834842,
  628085408,
  1382605366,
  3423369109,
  3138078467,
  570562233,
  1426400815,
  3317316542,
  2998733608,
  733239954,
  1555261956,
  3268935591,
  3050360625,
  752459403,
  1541320221,
  2607071920,
  3965973030,
  1969922972,
  40735498,
  2617837225,
  3943577151,
  1913087877,
  83908371,
  2512341634,
  3803740692,
  2075208622,
  213261112,
  2463272603,
  3855990285,
  2094854071,
  198958881,
  2262029012,
  4057260610,
  1759359992,
  534414190,
  2176718541,
  4139329115,
  1873836001,
  414664567,
  2282248934,
  4279200368,
  1711684554,
  285281116,
  2405801727,
  4167216745,
  1634467795,
  376229701,
  2685067896,
  3608007406,
  1308918612,
  956543938,
  2808555105,
  3495958263,
  1231636301,
  1047427035,
  2932959818,
  3654703836,
  1088359270,
  936918e3,
  2847714899,
  3736837829,
  1202900863,
  817233897,
  3183342108,
  3401237130,
  1404277552,
  615818150,
  3134207493,
  3453421203,
  1423857449,
  601450431,
  3009837614,
  3294710456,
  1567103746,
  711928724,
  3020668471,
  3272380065,
  1510334235,
  755167117
];
var PROB_PRICES = createProbPrices();
var G_FAST_POS = createFastPos();
function initArray(len, value = 0) {
  const array = [];
  array[len - 1] = void 0;
  if (value !== 0) {
    for (let i = 0; i < len; i++) {
      array[i] = value;
    }
  }
  return array;
}
function getBitPrice(probability, bit) {
  return PROB_PRICES[((probability - bit ^ -bit) & 2047) >>> 2];
}
function initBitModels(probs) {
  for (let i = probs.length - 1; i >= 0; --i) {
    probs[i] = 1024;
  }
}
function getLenToPosState(len) {
  len -= 2;
  if (len < 4) {
    return len;
  }
  return 3;
}
var STATE_UPDATE_CHAR_TABLE = [0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 4, 5];
function stateUpdateChar(index) {
  if (index >= 0 && index < STATE_UPDATE_CHAR_TABLE.length) {
    return STATE_UPDATE_CHAR_TABLE[index];
  }
  if (index < 4) {
    return 0;
  }
  if (index < 10) {
    return index - 3;
  }
  return index - 6;
}
function createBitTree(numBitLevels) {
  return {
    numBitLevels,
    models: initArray(1 << numBitLevels)
  };
}
function createProbPrices() {
  const probPrices = [];
  for (let i = 8; i >= 0; --i) {
    let start = 1 << 9 - i - 1;
    let end = 1 << 9 - i;
    for (let j = start; j < end; ++j) {
      probPrices[j] = (i << 6) + (end - j << 6 >>> 9 - i - 1);
    }
  }
  return probPrices;
}
function createFastPos() {
  const gFastPos = [0, 1];
  let c = 2;
  for (let slotFast = 2; slotFast < 22; ++slotFast) {
    let k = 1 << (slotFast >> 1) - 1;
    for (let j = 0; j < k; ++j, ++c) {
      gFastPos[c] = slotFast;
    }
  }
  return gFastPos;
}

// node_modules/@cjser/lzma1/lib/decoder.js
var Decoder = class {
  rangeDecoder;
  outWindow;
  // Decoder state
  state = 0;
  rep0 = 0;
  rep1 = 0;
  rep2 = 0;
  rep3 = 0;
  prevByte = 0;
  nowPos64 = 0n;
  outSize = 0n;
  // Decoder configuration
  posStateMask = 0;
  dictSizeCheck = 0;
  // Probability models for different symbols
  matchDecoders = [];
  rep0LongDecoders = [];
  repDecoders = [];
  repG0Decoders = [];
  repG1Decoders = [];
  repG2Decoders = [];
  posDecoders = [];
  // Complex decoders
  literalDecoder;
  posSlotDecoders = [];
  lenDecoder;
  repLenDecoder;
  posAlignDecoder;
  // Alias for compatibility with LZMA class
  get literalCoder() {
    return this.literalDecoder;
  }
  constructor() {
    this.rangeDecoder = new RangeDecoder();
    this.outWindow = new LzOutWindow(null, DEFAULT_WINDOW_SIZE);
    this.matchDecoders = initArray(MATCH_DECODERS_SIZE);
    this.rep0LongDecoders = initArray(MATCH_DECODERS_SIZE);
    this.repDecoders = initArray(REP_DECODERS_SIZE);
    this.repG0Decoders = initArray(REP_DECODERS_SIZE);
    this.repG1Decoders = initArray(REP_DECODERS_SIZE);
    this.repG2Decoders = initArray(REP_DECODERS_SIZE);
    this.posDecoders = initArray(POS_DECODERS_SIZE);
    this.literalDecoder = {
      coders: [],
      numPrevBits: 0,
      numPosBits: 0,
      posMask: 0,
      init: () => this.initLiteralDecoder()
    };
    for (let i = 0; i < 4; i++) {
      this.posSlotDecoders[i] = createBitTree(6);
    }
    this.lenDecoder = this.createLenDecoder();
    this.repLenDecoder = this.createLenDecoder();
    this.posAlignDecoder = createBitTree(4);
  }
  /**
   * Read LZMA header, configure decoder, and prepare for decompression.
   */
  initDecompression(input, output) {
    const properties = [];
    for (let i = 0; i < 5; ++i) {
      const r = input.readByte();
      if (r === -1) {
        throw new Error("truncated input");
      }
      properties[i] = r << 24 >> 24;
    }
    if (!this.setDecoderProperties(properties)) {
      throw new Error("corrupted input");
    }
    let outSize;
    {
      let value = 0n;
      for (let i = 0; i < 8; i++) {
        const r = input.readByte();
        if (r === -1) {
          throw new Error("truncated input");
        }
        value += BigInt(r & 255) << BigInt(i * 8);
      }
      if (value === 0xffffffffffffffffn) {
        outSize = -1n;
      } else if (value > BigInt(_MAX_UINT32)) {
        outSize = -1n;
      } else {
        outSize = value;
      }
    }
    this.rangeDecoder.setStream(input);
    this.flush();
    this.outWindow.stream = null;
    this.outWindow.stream = output;
    this.init();
    this.state = 0;
    this.rep0 = 0;
    this.rep1 = 0;
    this.rep2 = 0;
    this.rep3 = 0;
    this.outSize = outSize;
    this.nowPos64 = 0n;
    this.prevByte = 0;
  }
  /**
   * Full decompression: read header, decode all chunks, flush and cleanup.
   */
  decompress(input, output) {
    this.initDecompression(input, output);
    while (true) {
      const result = this.codeOneChunk();
      if (result === -1) {
        throw new Error("corrupted input");
      }
      const isOutputComplete = this.outSize >= 0n && this.nowPos64 >= this.outSize;
      if (result || isOutputComplete) {
        this.flush();
        this.cleanup();
        return;
      }
    }
  }
  createLenDecoder() {
    const decoder3 = {
      choice: initArray(CHOICE_ARRAY_SIZE),
      lowCoder: [],
      midCoder: [],
      highCoder: createBitTree(8),
      numPosStates: 0
    };
    return decoder3;
  }
  setDecoderProperties(properties) {
    if (properties.length < 5) {
      return false;
    }
    const lc = properties[0] % 9;
    const remainder = Math.floor(properties[0] / 9);
    const lp = remainder % 5;
    const pb = Math.floor(remainder / 5);
    if (pb > 4) {
      return false;
    }
    this.literalDecoder.numPrevBits = lc;
    this.literalDecoder.numPosBits = lp;
    this.literalDecoder.posMask = (1 << lp) - 1;
    this.posStateMask = (1 << pb) - 1;
    let dictSize = 0;
    for (let i = 0; i < 4; i++) {
      const unsignedByte = properties[1 + i] & 255;
      dictSize += unsignedByte << i * 8;
    }
    this.dictSizeCheck = Math.max(dictSize, 1);
    if (dictSize > 0) {
      this.outWindow.windowSize = Math.max(dictSize, 4096);
      this.outWindow.buffer = new Uint8Array(this.outWindow.windowSize);
    }
    const numStates = 1 << this.literalDecoder.numPrevBits + this.literalDecoder.numPosBits;
    this.literalDecoder.coders = [];
    for (let i = 0; i < numStates; i++) {
      this.literalDecoder.coders[i] = {
        decoders: initArray(LITERAL_DECODER_SIZE)
        // 0x300
      };
    }
    this.lenDecoder.numPosStates = 1 << pb;
    this.repLenDecoder.numPosStates = 1 << pb;
    this.lenDecoder.lowCoder = [];
    this.lenDecoder.midCoder = [];
    this.repLenDecoder.lowCoder = [];
    this.repLenDecoder.midCoder = [];
    for (let posState = 0; posState < 1 << pb; posState++) {
      this.lenDecoder.lowCoder[posState] = createBitTree(3);
      this.lenDecoder.midCoder[posState] = createBitTree(3);
      this.repLenDecoder.lowCoder[posState] = createBitTree(3);
      this.repLenDecoder.midCoder[posState] = createBitTree(3);
    }
    return true;
  }
  // Methods that modify decoder state
  copyBlock(len) {
    const outputWindow = this.outWindow;
    const distance = this.rep0;
    let pos = outputWindow.pos - distance - 1;
    if (pos < 0) {
      pos += outputWindow.windowSize;
    }
    for (; len != 0; len -= 1) {
      if (pos >= outputWindow.windowSize) {
        pos = 0;
      }
      outputWindow.buffer[outputWindow.pos] = outputWindow.buffer[pos];
      outputWindow.pos += 1;
      pos += 1;
      if (outputWindow.pos >= outputWindow.windowSize) {
        this.flush();
      }
    }
  }
  putByte(b) {
    this.outWindow.buffer[this.outWindow.pos] = b;
    this.outWindow.pos += 1;
    if (this.outWindow.pos >= this.outWindow.windowSize) {
      this.flush();
    }
  }
  getByte(distance) {
    const outputWindow = this.outWindow;
    let pos = outputWindow.pos - distance - 1;
    if (pos < 0) {
      pos += outputWindow.windowSize;
    }
    return outputWindow.buffer[pos];
  }
  getDecoder(pos, prevByte) {
    const positionMask = pos & this.literalDecoder.posMask;
    const prevBitsMask = (prevByte & 255) >>> 8 - this.literalDecoder.numPrevBits;
    const index = (positionMask << this.literalDecoder.numPrevBits) + prevBitsMask;
    return this.literalDecoder.coders[index];
  }
  initLiteralDecoder() {
    let numStates = 1 << this.literalDecoder.numPrevBits + this.literalDecoder.numPosBits;
    for (let i = 0; i < numStates; ++i) {
      for (let j = 0; j < this.literalDecoder.coders[i].decoders.length; j++) {
        this.literalDecoder.coders[i].decoders[j] = 1024;
      }
    }
  }
  init() {
    this.outWindow.streamPos = 0;
    this.outWindow.pos = 0;
    initBitModels(this.matchDecoders);
    initBitModels(this.rep0LongDecoders);
    initBitModels(this.repDecoders);
    initBitModels(this.repG0Decoders);
    initBitModels(this.repG1Decoders);
    initBitModels(this.repG2Decoders);
    initBitModels(this.posDecoders);
    this.initLiteralDecoder();
    for (let i = 0; i < 4; ++i) {
      initBitModels(this.posSlotDecoders[i].models);
    }
    this.initLenDecoder(this.lenDecoder);
    this.initLenDecoder(this.repLenDecoder);
    initBitModels(this.posAlignDecoder.models);
    this.initRangeDecoder();
  }
  initLenDecoder(decoder3) {
    initBitModels(decoder3.choice);
    for (let posState = 0; posState < decoder3.numPosStates; ++posState) {
      initBitModels(decoder3.lowCoder[posState].models);
      initBitModels(decoder3.midCoder[posState].models);
    }
    initBitModels(decoder3.highCoder.models);
  }
  outWindowReleaseStream() {
    this.flush();
    this.outWindow.stream = null;
  }
  decodeBit(probs, index) {
    return this.rangeDecoder.decodeBit(probs, index);
  }
  decodeDirectBits(numTotalBits) {
    return this.rangeDecoder.decodeDirectBits(numTotalBits);
  }
  initRangeDecoder() {
    this.rangeDecoder.init();
  }
  rangeBitTreeDecoder(bitTree) {
    let bitIndex, m = 1;
    for (bitIndex = bitTree.numBitLevels; bitIndex != 0; bitIndex -= 1) {
      m = (m << 1) + this.decodeBit(bitTree.models, m);
    }
    return m - (1 << bitTree.numBitLevels);
  }
  reverseDecode(models, startIndex, numBitLevels) {
    let symbol = 0;
    for (let bitIndex = 0, m = 1, bit; bitIndex < numBitLevels; ++bitIndex) {
      bit = this.decodeBit(models, startIndex + m);
      m <<= 1;
      m += bit;
      symbol |= bit << bitIndex;
    }
    return symbol;
  }
  reverseDecodeAlignDecoder() {
    let symbol = 0;
    for (let m = 1, bitIndex = 0, bit; bitIndex < this.posAlignDecoder.numBitLevels; ++bitIndex) {
      bit = this.decodeBit(this.posAlignDecoder.models, m);
      m <<= 1;
      m += bit;
      symbol |= bit << bitIndex;
    }
    return symbol;
  }
  // Update the placeholder implementations with actual logic
  decodeNormalWithRangeDecoder(decoder3) {
    let symbol = 1;
    do {
      symbol = symbol << 1 | this.decodeBit(decoder3.decoders, symbol);
    } while (symbol < 256);
    return symbol << 24 >> 24;
  }
  decodeWithMatchByteWithRangeDecoder(encoder3, matchByte) {
    let bit, matchBit, symbol = 1;
    do {
      matchBit = matchByte >> 7 & 1;
      matchByte <<= 1;
      bit = this.decodeBit(encoder3.decoders, (1 + matchBit << 8) + symbol);
      symbol = symbol << 1 | bit;
      if (matchBit != bit) {
        while (symbol < 256) {
          symbol = symbol << 1 | this.decodeBit(encoder3.decoders, symbol);
        }
        break;
      }
    } while (symbol < 256);
    return symbol << 24 >> 24;
  }
  decodeLenWithRangeDecoder(decoder3, posState) {
    if (!this.decodeBit(decoder3.choice, 0)) {
      return this.rangeBitTreeDecoder(decoder3.lowCoder[posState]);
    }
    let symbol = 8;
    if (!this.decodeBit(decoder3.choice, 1)) {
      symbol += this.rangeBitTreeDecoder(decoder3.midCoder[posState]);
    } else {
      symbol += 8 + this.rangeBitTreeDecoder(decoder3.highCoder);
    }
    return symbol;
  }
  codeOneChunk() {
    let decoder22, distance, len, numDirectBits, positionSlot;
    let posState = Number(this.nowPos64 & 0xffffffffn) & this.posStateMask;
    if (!this.decodeBit(this.matchDecoders, (this.state << 4) + posState)) {
      decoder22 = this.getDecoder(Number(this.nowPos64 & 0xffffffffn), this.prevByte);
      if (this.state < 7) {
        this.prevByte = this.decodeNormalWithRangeDecoder(decoder22);
      } else {
        this.prevByte = this.decodeWithMatchByteWithRangeDecoder(decoder22, this.getByte(this.rep0));
      }
      this.putByte(this.prevByte);
      this.state = stateUpdateChar(this.state);
      this.nowPos64 += 1n;
    } else {
      if (this.decodeBit(this.repDecoders, this.state)) {
        len = 0;
        if (!this.decodeBit(this.repG0Decoders, this.state)) {
          if (!this.decodeBit(this.rep0LongDecoders, (this.state << 4) + posState)) {
            this.state = this.state < 7 ? 9 : 11;
            len = 1;
          }
        } else {
          if (!this.decodeBit(this.repG1Decoders, this.state)) {
            distance = this.rep1;
          } else {
            if (!this.decodeBit(this.repG2Decoders, this.state)) {
              distance = this.rep2;
            } else {
              distance = this.rep3;
              this.rep3 = this.rep2;
            }
            this.rep2 = this.rep1;
          }
          this.rep1 = this.rep0;
          this.rep0 = distance;
        }
        if (!len) {
          len = this.decodeLenWithRangeDecoder(this.repLenDecoder, posState) + 2;
          this.state = this.state < 7 ? 8 : 11;
        }
      } else {
        this.rep3 = this.rep2;
        this.rep2 = this.rep1;
        this.rep1 = this.rep0;
        len = 2 + this.decodeLenWithRangeDecoder(this.lenDecoder, posState);
        this.state = this.state < 7 ? 7 : 10;
        positionSlot = this.rangeBitTreeDecoder(this.posSlotDecoders[getLenToPosState(len)]);
        if (positionSlot >= 4) {
          numDirectBits = (positionSlot >> 1) - 1;
          this.rep0 = (2 | positionSlot & 1) << numDirectBits;
          if (positionSlot < 14) {
            this.rep0 += this.reverseDecode(this.posDecoders, this.rep0 - positionSlot - 1, numDirectBits);
          } else {
            this.rep0 += this.decodeDirectBits(numDirectBits - 4) << 4;
            this.rep0 += this.reverseDecodeAlignDecoder();
            if (this.rep0 < 0) {
              if (this.rep0 == -1) {
                return 1;
              }
              return -1;
            }
          }
        } else {
          this.rep0 = positionSlot;
        }
      }
      if (BigInt(this.rep0) >= this.nowPos64 || this.rep0 >= this.dictSizeCheck) {
        return -1;
      }
      this.copyBlock(len);
      this.nowPos64 += BigInt(len);
      this.prevByte = this.getByte(0);
    }
    return 0;
  }
  writeToOutput(buffer, data, offset, length) {
    buffer.writeBytes(data, offset, length);
  }
  flush() {
    const size = this.outWindow.pos - this.outWindow.streamPos;
    if (!size) {
      return;
    }
    if (this.outWindow.stream && this.outWindow.buffer) {
      this.outWindow.stream.writeBytes(this.outWindow.buffer, this.outWindow.streamPos, size);
    }
    if (this.outWindow.pos >= this.outWindow.windowSize) {
      this.outWindow.pos = 0;
    }
    this.outWindow.streamPos = this.outWindow.pos;
  }
  /**
   * Cleanup decoder resources
   */
  cleanup() {
    this.outWindow.stream = null;
    this.rangeDecoder.stream = null;
  }
};

// node_modules/@cjser/lzma1/lib/len-coder.js
var LenEncoder = class {
  // Choice probability arrays for length range selection
  choice = initArray(2);
  // Low range coders (for lengths 2-9)
  lowCoder = [];
  // Mid range coders (for lengths 10-17)
  midCoder = [];
  // High range coder (for lengths 18+)
  highCoder = createBitTree(8);
  // Price optimization properties
  tableSize = 0;
  prices = [];
  counters = [];
  constructor() {
    for (let posState = 0; posState < 16; ++posState) {
      this.lowCoder[posState] = createBitTree(3);
      this.midCoder[posState] = createBitTree(3);
    }
  }
  /**
   * Initialize the encoder with specified number of position states
   */
  init(numPosStates) {
    initBitModels(this.choice);
    for (let posState = 0; posState < numPosStates; ++posState) {
      initBitModels(this.lowCoder[posState].models);
      initBitModels(this.midCoder[posState].models);
    }
    initBitModels(this.highCoder.models);
  }
  /**
   * Encode a length value using the provided range encoder
   */
  encode(symbol, posState, rangeEncoder) {
    if (symbol < 8) {
      rangeEncoder.encodeBit(this.choice, 0, 0);
      rangeEncoder.encodeBitTree(this.lowCoder[posState], symbol);
    } else {
      symbol -= 8;
      rangeEncoder.encodeBit(this.choice, 0, 1);
      if (symbol < 8) {
        rangeEncoder.encodeBit(this.choice, 1, 0);
        rangeEncoder.encodeBitTree(this.midCoder[posState], symbol);
      } else {
        rangeEncoder.encodeBit(this.choice, 1, 1);
        rangeEncoder.encodeBitTree(this.highCoder, symbol - 8);
      }
    }
  }
  /**
   * Encode with price table update
   */
  encodeWithUpdate(symbol, posState, rangeEncoder) {
    this.encode(symbol, posState, rangeEncoder);
    if (this.counters && (this.counters[posState] -= 1) == 0) {
      this.counters[posState] = this.tableSize;
    }
  }
  /**
   * Get price for encoding a symbol at the given position state
   */
  getPrice(symbol, posState) {
    return this.prices[posState * 272 + symbol];
  }
  /**
   * Initialize as a price table encoder
   */
  initPriceTable() {
    this.prices = [];
    this.counters = [];
  }
  /**
   * Set table size for price optimization
   */
  setTableSize(size) {
    this.tableSize = size;
  }
  /**
   * Set table size and update internal counters
   */
  setTableSizeAndInitCounters(size, numPosStates) {
    this.tableSize = size;
    if (this.counters) {
      for (let posState = 0; posState < numPosStates; ++posState) {
        this.counters[posState] = size;
      }
    }
  }
  /**
   * Get table size
   */
  getTableSize() {
    return this.tableSize;
  }
  /**
   * Update price tables for all position states
   */
  updateTables(numPosStates) {
    if (!this.prices || !this.counters) {
      this.initPriceTable();
    }
    for (let posState = 0; posState < numPosStates; ++posState) {
      this.setPrices(posState, this.tableSize, this.prices, 0);
      if (this.counters) {
        this.counters[posState] = this.tableSize;
      }
    }
  }
  // Private methods for internal state management
  /**
   * Calculate price for bit tree encoder
   */
  getBitTreePrice(encoder3, symbol) {
    let bit, bitIndex, m = 1, price = 0;
    for (bitIndex = encoder3.numBitLevels; bitIndex != 0; ) {
      bitIndex -= 1;
      bit = symbol >>> bitIndex & 1;
      price += this.getBitPrice(encoder3.models[m], bit);
      m = (m << 1) + bit;
    }
    return price;
  }
  /**
   * Get price for a single bit
   */
  getBitPrice(prob, symbol) {
    return getBitPrice(prob, symbol);
  }
  /**
   * Set prices for all symbols in a position state range
   */
  setPrices(posState, numSymbols, prices, priceIndex) {
    const a0 = this.getBitPrice(this.choice[0], 0);
    const a1 = this.getBitPrice(this.choice[0], 1);
    const b0 = a1 + this.getBitPrice(this.choice[1], 0);
    const b1 = a1 + this.getBitPrice(this.choice[1], 1);
    let i = 0;
    const st = priceIndex + posState * 272;
    for (i = 0; i < 8; ++i) {
      if (i >= numSymbols)
        return;
      prices[st + i] = a0 + this.getBitTreePrice(this.lowCoder[posState], i);
    }
    for (; i < 16; ++i) {
      if (i >= numSymbols)
        return;
      prices[st + i] = b0 + this.getBitTreePrice(this.midCoder[posState], i - 8);
    }
    for (; i < numSymbols; ++i) {
      prices[st + i] = b1 + this.getBitTreePrice(this.highCoder, i - 8 - 8);
    }
  }
};

// node_modules/@cjser/lzma1/lib/lit-coder.js
var LitSubCoder = class {
  coders;
  constructor() {
    this.coders = initArray(768, 1024);
  }
  /**
   * Decode normal literal symbol
   */
  decodeNormal(rd) {
    let symbol = 1;
    while (symbol < 256) {
      const i = rd.decodeBit(this.coders, symbol);
      symbol = symbol << 1 | i;
    }
    return symbol & 255;
  }
  /**
   * Decode literal symbol with match byte context
   */
  decodeWithMatchByte(rd, matchByte) {
    let uMatchByte = matchByte;
    let symbol = 1;
    while (symbol < 256) {
      const matchBit = uMatchByte >> 7 & 1;
      uMatchByte <<= 1;
      const bit = rd.decodeBit(this.coders, (1 + matchBit << 8) + symbol);
      symbol = symbol << 1 | bit;
      if (matchBit !== bit) {
        while (symbol < 256) {
          const i = rd.decodeBit(this.coders, symbol);
          symbol = symbol << 1 | i;
        }
        break;
      }
    }
    return symbol & 255;
  }
  /**
   * Encode literal symbol
   */
  encode(re, symbol) {
    let context = 1;
    for (let i = 7; i >= 0; i--) {
      const bit = symbol >> i & 1;
      re.encodeBit(this.coders, context, bit);
      context = context << 1 | bit;
    }
  }
  /**
   * Encode literal symbol with match byte context
   */
  encodeMatched(re, matchByte, symbol) {
    let uMatchByte = matchByte;
    let context = 1;
    let same = true;
    for (let i = 7; i >= 0; i--) {
      const bit = symbol >> i & 1;
      let state = context;
      if (same) {
        const matchBit = uMatchByte >> i & 1;
        state += 1 + matchBit << 8;
        same = matchBit === bit;
      }
      re.encodeBit(this.coders, state, bit);
      context = context << 1 | bit;
    }
  }
  /**
   * Get price for encoding literal symbol
   */
  getPrice(matchMode, matchByte, symbol) {
    let uMatchByte = matchByte;
    let price = 0;
    let context = 1;
    let i = 7;
    if (matchMode) {
      while (i >= 0) {
        const matchBit = uMatchByte >> i & 1;
        const bit = symbol >> i & 1;
        price += getBitPrice(this.coders[1 + matchBit << 8 + context], bit);
        context = context << 1 | bit;
        if (matchBit !== bit) {
          i--;
          break;
        }
        i--;
      }
    }
    while (i >= 0) {
      const bit = symbol >> i & 1;
      price += getBitPrice(this.coders[context], bit);
      context = context << 1 | bit;
      i--;
    }
    return price;
  }
  /**
   * Reset coder to initial state
   */
  reset() {
    this.coders.fill(1024);
  }
  /**
   * Get decoders array (for compatibility with LiteralDecoderEncoder2)
   */
  get decoders() {
    return this.coders;
  }
};
var LitCoder = class {
  _coders;
  _numPrevBits;
  _posMask;
  constructor(numPosBits, numPrevBits) {
    const numStates = 1 << numPrevBits + numPosBits;
    this._coders = [];
    this._numPrevBits = numPrevBits;
    this._posMask = (1 << numPosBits) - 1;
    for (let i = 0; i < numStates; i++) {
      this._coders[i] = new LitSubCoder();
    }
  }
  /**
   * Get sub-coder for position and previous byte
   */
  getSubCoder(pos, prevByte) {
    return this._coders[((pos & this._posMask) << this._numPrevBits) + (prevByte >> 8 - this._numPrevBits)];
  }
  /**
   * Reset all sub-coders
   */
  reset() {
    this._coders.forEach((coder) => coder.reset());
  }
  /**
   * Get number of previous bits (for compatibility)
   */
  get numPrevBits() {
    return this._numPrevBits;
  }
  /**
   * Get number of position bits (for compatibility)
   */
  get numPosBits() {
    return Math.log2(this._posMask + 1);
  }
  /**
   * Get position mask (for compatibility)
   */
  get posMask() {
    return this._posMask;
  }
  /**
   * Get coders array (for compatibility)
   */
  get coders() {
    return this._coders;
  }
};

// node_modules/@cjser/lzma1/lib/match-finder.js
var BinTreeMatchFinder = class {
  // Input window fields
  _posLimit = 0;
  _bufferBase = new Uint8Array(0);
  _pos = 0;
  _streamPos = 0;
  _streamEndWasReached = 0;
  _bufferOffset = 0;
  _blockSize = 0;
  _keepSizeBefore = 0;
  _keepSizeAfter = 0;
  _pointerToLastSafePosition = 0;
  _stream = null;
  // Hash and tree fields
  HASH_ARRAY = true;
  kNumHashDirectBytes = 0;
  kMinMatchCheck = 4;
  kFixHashSize = 66560;
  _hashMask = 0;
  _hashSizeSum = 0;
  _hash = new Int32Array(0);
  _cyclicBufferSize = 0;
  _cyclicBufferPos = 0;
  _son = new Int32Array(0);
  _matchMaxLen = 0;
  _cutValue = 255;
  // --- LzInWindow methods ---
  getIndexByte(index) {
    return this._bufferBase[this._bufferOffset + this._pos + index];
  }
  getMatchLen(index, distance, limit) {
    if (this._streamEndWasReached) {
      if (this._pos + index + limit > this._streamPos) {
        limit = this._streamPos - (this._pos + index);
      }
    }
    ++distance;
    let i;
    const pby = this._bufferOffset + this._pos + index;
    for (i = 0; i < limit && this._bufferBase[pby + i] == this._bufferBase[pby + i - distance]; ++i)
      ;
    return i;
  }
  getNumAvailableBytes() {
    return this._streamPos - this._pos;
  }
  moveBlock() {
    let offset = this._bufferOffset + this._pos - this._keepSizeBefore;
    if (offset > 0) {
      --offset;
    }
    const numBytes = this._bufferOffset + this._streamPos - offset;
    this._bufferBase.copyWithin(0, offset, offset + numBytes);
    this._bufferOffset -= offset;
  }
  movePosInWindow() {
    this._pos += 1;
    if (this._pos > this._posLimit) {
      const pointerToPosition = this._bufferOffset + this._pos;
      if (pointerToPosition > this._pointerToLastSafePosition) {
        this.moveBlock();
      }
      this.readBlock();
    }
  }
  readBlock() {
    if (this._streamEndWasReached) {
      return;
    }
    while (true) {
      const size = -this._bufferOffset + this._blockSize - this._streamPos;
      if (!size) {
        return;
      }
      const bytesRead = this.readFromStream(this._bufferOffset + this._streamPos, size);
      if (bytesRead == -1) {
        this._posLimit = this._streamPos;
        const pointerToPosition = this._bufferOffset + this._posLimit;
        if (pointerToPosition > this._pointerToLastSafePosition) {
          this._posLimit = this._pointerToLastSafePosition - this._bufferOffset;
        }
        this._streamEndWasReached = 1;
        return;
      }
      this._streamPos += bytesRead;
      if (this._streamPos >= this._pos + this._keepSizeAfter) {
        this._posLimit = this._streamPos - this._keepSizeAfter;
      }
    }
  }
  reduceOffsets(subValue) {
    this._bufferOffset += subValue;
    this._posLimit -= subValue;
    this._pos -= subValue;
    this._streamPos -= subValue;
  }
  readFromStream(off, len) {
    const stream = this._stream;
    const buffer = this._bufferBase;
    return stream.readBytes(buffer, off, len);
  }
  // --- Match finder configuration methods ---
  createBuffers(keepSizeBefore, keepSizeAfter, keepSizeReserv) {
    this._keepSizeBefore = keepSizeBefore;
    this._keepSizeAfter = keepSizeAfter;
    const blockSize = keepSizeBefore + keepSizeAfter + keepSizeReserv;
    if (this._blockSize != blockSize) {
      this._bufferBase = new Uint8Array(blockSize);
      this._blockSize = blockSize;
    }
    this._pointerToLastSafePosition = this._blockSize - keepSizeAfter;
  }
  create(dictionarySize, numFastBytes, keepAddBufferBefore, keepAddBufferAfter) {
    if (dictionarySize < DICTIONARY_SIZE_THRESHOLD) {
      this._cutValue = 16 + (numFastBytes >> 1);
      const windowReservSize = ~~((dictionarySize + keepAddBufferBefore + numFastBytes + keepAddBufferAfter) / 2) + 256;
      this.createBuffers(dictionarySize + keepAddBufferBefore, numFastBytes + keepAddBufferAfter, windowReservSize);
      this._matchMaxLen = numFastBytes;
      const cyclicBufferSize = dictionarySize + 1;
      if (this._cyclicBufferSize !== cyclicBufferSize) {
        this._cyclicBufferSize = cyclicBufferSize;
        this._son = new Int32Array(cyclicBufferSize * 2);
      }
      let hs = 65536;
      if (this.HASH_ARRAY) {
        hs = dictionarySize - 1;
        hs |= hs >> 1;
        hs |= hs >> 2;
        hs |= hs >> 4;
        hs |= hs >> 8;
        hs >>= 1;
        hs |= 65535;
        if (hs > 16777216) {
          hs >>= 1;
        }
        this._hashMask = hs;
        hs += 1;
        const finalHashSizeSum = hs + this.kFixHashSize;
        if (finalHashSizeSum !== this._hashSizeSum) {
          this._hashSizeSum = finalHashSizeSum;
          this._hash = new Int32Array(finalHashSizeSum);
        }
      } else {
        if (hs !== this._hashSizeSum) {
          this._hashSizeSum = hs;
          this._hash = new Int32Array(hs);
        }
      }
    }
  }
  // --- Match finding methods ---
  getMatches(distances) {
    let count, cur, curMatch, curMatch2, curMatch3, cyclicPos, delta, hash2Value, hash3Value, hashValue, len, len0, len1, lenLimit, matchMinPos, maxLen, offset, pby1, ptr0, ptr1, temp;
    if (this._pos + this._matchMaxLen <= this._streamPos) {
      lenLimit = this._matchMaxLen;
    } else {
      lenLimit = this._streamPos - this._pos;
      if (lenLimit < this.kMinMatchCheck) {
        this.movePos();
        return 0;
      }
    }
    offset = 0;
    matchMinPos = this._pos > this._cyclicBufferSize ? this._pos - this._cyclicBufferSize : 0;
    cur = this._bufferOffset + this._pos;
    maxLen = 1;
    hash2Value = 0;
    hash3Value = 0;
    if (this.HASH_ARRAY) {
      temp = CRC32_TABLE[this._bufferBase[cur]] ^ this._bufferBase[cur + 1];
      hash2Value = temp & 1023;
      temp ^= this._bufferBase[cur + 2] << 8;
      hash3Value = temp & 65535;
      hashValue = (temp ^ CRC32_TABLE[this._bufferBase[cur + 3]] << 5) & this._hashMask;
    } else {
      hashValue = this._bufferBase[cur] ^ this._bufferBase[cur + 1] << 8;
    }
    curMatch = this._hash[this.kFixHashSize + hashValue] || 0;
    if (this.HASH_ARRAY) {
      curMatch2 = this._hash[hash2Value] || 0;
      curMatch3 = this._hash[1024 + hash3Value] || 0;
      this._hash[hash2Value] = this._pos;
      this._hash[1024 + hash3Value] = this._pos;
      if (curMatch2 > matchMinPos) {
        if (this._bufferBase[this._bufferOffset + curMatch2] == this._bufferBase[cur]) {
          distances[offset++] = maxLen = 2;
          distances[offset++] = this._pos - curMatch2 - 1;
        }
      }
      if (curMatch3 > matchMinPos) {
        if (this._bufferBase[this._bufferOffset + curMatch3] == this._bufferBase[cur]) {
          if (curMatch3 == curMatch2) {
            offset -= 2;
          }
          distances[offset++] = maxLen = 3;
          distances[offset++] = this._pos - curMatch3 - 1;
          curMatch2 = curMatch3;
        }
      }
      if (offset != 0 && curMatch2 == curMatch) {
        offset -= 2;
        maxLen = 1;
      }
    }
    this._hash[this.kFixHashSize + hashValue] = this._pos;
    ptr0 = (this._cyclicBufferPos << 1) + 1;
    ptr1 = this._cyclicBufferPos << 1;
    len0 = len1 = this.kNumHashDirectBytes;
    if (this.kNumHashDirectBytes != 0) {
      if (curMatch > matchMinPos) {
        if (this._bufferBase[this._bufferOffset + curMatch + this.kNumHashDirectBytes] != this._bufferBase[cur + this.kNumHashDirectBytes]) {
          distances[offset++] = maxLen = this.kNumHashDirectBytes;
          distances[offset++] = this._pos - curMatch - 1;
        }
      }
    }
    count = this._cutValue;
    while (1) {
      if (curMatch <= matchMinPos || count == 0) {
        count -= 1;
        this._son[ptr0] = this._son[ptr1] = 0;
        break;
      }
      delta = this._pos - curMatch;
      cyclicPos = (delta <= this._cyclicBufferPos ? this._cyclicBufferPos - delta : this._cyclicBufferPos - delta + this._cyclicBufferSize) << 1;
      pby1 = this._bufferOffset + curMatch;
      len = len0 < len1 ? len0 : len1;
      if (this._bufferBase[pby1 + len] == this._bufferBase[cur + len]) {
        while ((len += 1) != lenLimit) {
          if (this._bufferBase[pby1 + len] != this._bufferBase[cur + len]) {
            break;
          }
        }
        if (maxLen < len) {
          distances[offset++] = maxLen = len;
          distances[offset++] = delta - 1;
          if (len == lenLimit) {
            this._son[ptr1] = this._son[cyclicPos];
            this._son[ptr0] = this._son[cyclicPos + 1];
            break;
          }
        }
      }
      if (this._bufferBase[pby1 + len] < this._bufferBase[cur + len]) {
        this._son[ptr1] = curMatch;
        ptr1 = cyclicPos + 1;
        curMatch = this._son[ptr1];
        len1 = len;
      } else {
        this._son[ptr0] = curMatch;
        ptr0 = cyclicPos;
        curMatch = this._son[ptr0];
        len0 = len;
      }
    }
    this.movePos();
    return offset;
  }
  skip(num) {
    let count, cur, curMatch, cyclicPos, delta, hash2Value, hash3Value, hashValue, len, len0, len1, lenLimit, matchMinPos, pby1, ptr0, ptr1, temp;
    do {
      if (this._pos + this._matchMaxLen <= this._streamPos) {
        lenLimit = this._matchMaxLen;
      } else {
        lenLimit = this._streamPos - this._pos;
        if (lenLimit < this.kMinMatchCheck) {
          this.movePos();
          continue;
        }
      }
      matchMinPos = this._pos > this._cyclicBufferSize ? this._pos - this._cyclicBufferSize : 0;
      cur = this._bufferOffset + this._pos;
      if (this.HASH_ARRAY) {
        temp = CRC32_TABLE[this._bufferBase[cur]] ^ this._bufferBase[cur + 1];
        hash2Value = temp & 1023;
        this._hash[hash2Value] = this._pos;
        temp ^= this._bufferBase[cur + 2] << 8;
        hash3Value = temp & 65535;
        this._hash[1024 + hash3Value] = this._pos;
        hashValue = (temp ^ CRC32_TABLE[this._bufferBase[cur + 3]] << 5) & this._hashMask;
      } else {
        hashValue = this._bufferBase[cur] ^ this._bufferBase[cur + 1] << 8;
      }
      curMatch = this._hash[this.kFixHashSize + hashValue];
      this._hash[this.kFixHashSize + hashValue] = this._pos;
      ptr0 = (this._cyclicBufferPos << 1) + 1;
      ptr1 = this._cyclicBufferPos << 1;
      len0 = len1 = this.kNumHashDirectBytes;
      count = this._cutValue;
      while (1) {
        if (curMatch <= matchMinPos || count == 0) {
          count -= 1;
          this._son[ptr0] = this._son[ptr1] = 0;
          break;
        }
        delta = this._pos - curMatch;
        cyclicPos = (delta <= this._cyclicBufferPos ? this._cyclicBufferPos - delta : this._cyclicBufferPos - delta + this._cyclicBufferSize) << 1;
        pby1 = this._bufferOffset + curMatch;
        len = len0 < len1 ? len0 : len1;
        if (this._bufferBase[pby1 + len] == this._bufferBase[cur + len]) {
          while ((len += 1) != lenLimit) {
            if (this._bufferBase[pby1 + len] != this._bufferBase[cur + len]) {
              break;
            }
          }
          if (len == lenLimit) {
            this._son[ptr1] = this._son[cyclicPos];
            this._son[ptr0] = this._son[cyclicPos + 1];
            break;
          }
        }
        if (this._bufferBase[pby1 + len] < this._bufferBase[cur + len]) {
          this._son[ptr1] = curMatch;
          ptr1 = cyclicPos + 1;
          curMatch = this._son[ptr1];
          len1 = len;
        } else {
          this._son[ptr0] = curMatch;
          ptr0 = cyclicPos;
          curMatch = this._son[ptr0];
          len0 = len;
        }
      }
      this.movePos();
    } while ((num -= 1) != 0);
  }
  movePos() {
    if ((this._cyclicBufferPos += 1) >= this._cyclicBufferSize) {
      this._cyclicBufferPos = 0;
    }
    this.movePosInWindow();
    if (this._pos == DICTIONARY_SIZE_THRESHOLD) {
      const subValue = this._pos - this._cyclicBufferSize;
      this.normalizeLinks(this._son, this._cyclicBufferSize * 2, subValue);
      this.normalizeLinks(this._hash, this._hashSizeSum, subValue);
      this.reduceOffsets(subValue);
    }
  }
  init() {
    this._bufferOffset = 0;
    this._pos = 0;
    this._streamPos = 0;
    this._streamEndWasReached = 0;
    this.readBlock();
    this._cyclicBufferPos = 0;
    this.reduceOffsets(-1);
  }
  /**
   * This is only called after reading one whole gigabyte.
   */
  normalizeLinks(items, numItems, subValue) {
    for (let i = 0; i < numItems; ++i) {
      let value = items[i];
      if (value <= subValue) {
        value = 0;
      } else {
        value -= subValue;
      }
      items[i] = value;
    }
  }
  setType(numHashBytes) {
    this.HASH_ARRAY = numHashBytes > 2;
    if (this.HASH_ARRAY) {
      this.kNumHashDirectBytes = 0;
      this.kMinMatchCheck = 4;
      this.kFixHashSize = 66560;
    } else {
      this.kNumHashDirectBytes = 2;
      this.kMinMatchCheck = 3;
      this.kFixHashSize = 0;
    }
  }
};

// node_modules/@cjser/lzma1/lib/encoder.js
var bitTreePriceCache = /* @__PURE__ */ new Map();
function getDirectBitsPrice(numBits) {
  return numBits << 6;
}
function getBitTreePrice(bitTree, symbol) {
  const cacheKey = bitTree.numBitLevels << 16 | symbol;
  if (bitTreePriceCache.has(cacheKey)) {
    return bitTreePriceCache.get(cacheKey);
  }
  let price = 0;
  let modelIndex = 1;
  for (let bitIndex = bitTree.numBitLevels; bitIndex > 0; bitIndex--) {
    const bit = symbol >>> bitIndex - 1 & 1;
    price += getBitPrice(bitTree.models[modelIndex], bit);
    modelIndex = (modelIndex << 1) + bit;
  }
  if (bitTreePriceCache.size < 1e4) {
    bitTreePriceCache.set(cacheKey, price);
  }
  return price;
}
var EncoderState = class {
  // Core state
  state = 0;
  previousByte = 0;
  position = 0n;
  // Repetition distances (LZ77 back-references)
  repDistances = [0, 0, 0, 0];
  // Match finding state
  longestMatchLength = 0;
  longestMatchWasFound = false;
  additionalOffset = 0;
  // Probability models for different encoding decisions
  isMatch = initArray(192);
  isRep = initArray(12);
  isRepG0 = initArray(12);
  isRepG1 = initArray(12);
  isRepG2 = initArray(12);
  isRep0Long = initArray(192);
  /**
   * Initialize all probability models to default values
   */
  initModels() {
    initBitModels(this.isMatch);
    initBitModels(this.isRep);
    initBitModels(this.isRepG0);
    initBitModels(this.isRepG1);
    initBitModels(this.isRepG2);
    initBitModels(this.isRep0Long);
  }
  /**
   * Update repetition distances when a new match is found
   */
  updateRepDistances(newDistance, repIndex) {
    if (repIndex === 0) {
      this.repDistances[3] = this.repDistances[2];
      this.repDistances[2] = this.repDistances[1];
      this.repDistances[1] = this.repDistances[0];
      this.repDistances[0] = newDistance;
    } else {
      const temp = this.repDistances[repIndex];
      for (let i = repIndex; i > 0; i--) {
        this.repDistances[i] = this.repDistances[i - 1];
      }
      this.repDistances[0] = temp;
    }
  }
};
var PositionEncoder = class {
  posSlotEncoder = [];
  posEncoders = initArray(114);
  posAlignEncoder;
  constructor() {
    for (let lenState = 0; lenState < 4; lenState++) {
      this.posSlotEncoder[lenState] = createBitTree(6);
    }
    this.posAlignEncoder = createBitTree(4);
  }
  /**
   * Initialize all position models
   */
  init() {
    for (const encoder3 of this.posSlotEncoder) {
      initBitModels(encoder3.models);
    }
    initBitModels(this.posEncoders);
    initBitModels(this.posAlignEncoder.models);
  }
  /**
   * Encode position using optimal method
   */
  encodePosition(distance, lenState, rangeEncoder) {
    const posSlot = this.getPosSlot(distance);
    rangeEncoder.encodeBitTree(this.posSlotEncoder[lenState], posSlot);
    if (posSlot >= 4) {
      const footerBits = (posSlot >> 1) - 1;
      const baseVal = (2 | posSlot & 1) << footerBits;
      const posReduced = distance - baseVal;
      if (posSlot < 14) {
        this.encodeReverseBits(posReduced, footerBits, rangeEncoder);
      } else {
        rangeEncoder.encodeDirectBits(posReduced >> 4, footerBits - 4);
        rangeEncoder.encodeBitTree(this.posAlignEncoder, posReduced & 15);
      }
    }
  }
  /**
   * Calculate price for encoding a position
   */
  getPositionPrice(distance, lenState) {
    const posSlot = this.getPosSlot(distance);
    let price = getBitTreePrice(this.posSlotEncoder[lenState], posSlot);
    if (posSlot >= 4) {
      const footerBits = (posSlot >> 1) - 1;
      const baseVal = (2 | posSlot & 1) << footerBits;
      const posReduced = distance - baseVal;
      if (posSlot < 14) {
        price += this.getReverseBitsPrice(posReduced, footerBits);
      } else {
        price += getDirectBitsPrice(footerBits - 4);
        price += getBitTreePrice(this.posAlignEncoder, posReduced & 15);
      }
    }
    return price;
  }
  getPosSlot(distance) {
    if (distance < 4)
      return distance;
    if (distance < 1 << 31 - 11) {
      return G_FAST_POS[distance >> 6] + 12;
    }
    return G_FAST_POS[distance >> 26] + 52;
  }
  encodeReverseBits(value, numBits, rangeEncoder) {
    let modelIndex = 1;
    for (let i = 0; i < numBits; i++) {
      const bit = value & 1;
      rangeEncoder.encodeBit(this.posEncoders, modelIndex, bit);
      modelIndex = modelIndex << 1 | bit;
      value >>>= 1;
    }
  }
  getReverseBitsPrice(value, numBits) {
    let price = 0;
    let modelIndex = 1;
    for (let i = 0; i < numBits; i++) {
      const bit = value & 1;
      price += getBitPrice(this.posEncoders[modelIndex], bit);
      modelIndex = modelIndex << 1 | bit;
      value >>>= 1;
    }
    return price;
  }
};
var Encoder = class {
  encoderState = new EncoderState();
  positionEncoder = new PositionEncoder();
  // Core state properties
  _state = 0;
  _previousByte = 0;
  _distTableSize = 0;
  _longestMatchWasFound = 0;
  _optimumEndIndex = 0;
  _optimumCurrentIndex = 0;
  _additionalOffset = 0;
  // Dictionary and match finding
  _dictionarySize = 0;
  _matchFinder = null;
  _dictionarySizePrev = 0;
  _numFastBytes = 0;
  // Literal encoding configuration
  _numLiteralContextBits = 0;
  _numLiteralPosStateBits = 0;
  _posStateBits = 0;
  _posStateMask = 0;
  // Stream and processing state
  _needReleaseMFStream = 0;
  _inStream = null;
  _finished = 0;
  nowPos64 = 0n;
  // Distance and repetition arrays
  _repDistances = initArray(4);
  _optimum = [];
  // Range encoder
  _rangeEncoder = {
    stream: null,
    rrange: 0,
    cache: 0,
    low: 0n,
    cacheSize: 0,
    position: 0n,
    encodeBit: () => {
    },
    encodeBitTree: () => {
    },
    encodeDirectBits: () => {
    }
  };
  // Bit model arrays for different types of encoding decisions
  _isMatch = initArray(192);
  _isRep = initArray(12);
  _isRepG0 = initArray(12);
  _isRepG1 = initArray(12);
  _isRepG2 = initArray(12);
  _isRep0Long = initArray(192);
  // Position and alignment encoders
  _posSlotEncoder = [];
  _posEncoders = initArray(114);
  _posAlignEncoder = null;
  // Length encoders
  _lenEncoder = null;
  _repMatchLenEncoder = null;
  // Literal encoder
  _literalEncoder = null;
  // Distance and price arrays
  _matchDistances = [];
  _posSlotPrices = [];
  _distancesPrices = [];
  _alignPrices = initArray(16);
  _matchPriceCount = 0;
  _alignPriceCount = 0;
  // Optimization arrays
  reps = initArray(4);
  repLens = initArray(4);
  // Processing counters
  processedInSize = [0n];
  processedOutSize = [0n];
  finished = [0];
  properties = new Uint8Array(5);
  tempPrices = initArray(128);
  // 128
  // Match finding properties
  _longestMatchLength = 0;
  _matchFinderType = 1;
  _numDistancePairs = 0;
  _numFastBytesPrev = -1;
  backRes = 0;
  constructor() {
  }
  /**
   * Initialize basic encoder state
   */
  baseInit() {
    this._state = 0;
    this._previousByte = 0;
    for (let i = 0; i < 4; ++i) {
      this._repDistances[i] = 0;
    }
  }
  /**
   * Get optimum array
   */
  getOptimum() {
    return this._optimum;
  }
  /**
   * Get back result
   */
  getBackRes() {
    return this.backRes;
  }
  setBackRes(backRes) {
    this.backRes = backRes;
  }
  init() {
    this.baseInit();
    this.encoderState.initModels();
    this.positionEncoder.init();
    this._optimum = [];
    for (let i = 0; i < 4096; i++) {
      this._optimum[i] = {};
    }
    this.initEncoderState();
    initBitModels(this._isMatch);
    initBitModels(this._isRep0Long);
    initBitModels(this._isRep);
    initBitModels(this._isRepG0);
    initBitModels(this._isRepG1);
    initBitModels(this._isRepG2);
    initBitModels(this._posEncoders);
    this.initLiteralEncoder();
    for (let i = 0; i < 4; ++i) {
      initBitModels(this._posSlotEncoder[i].models);
    }
    if (this._lenEncoder) {
      this._lenEncoder.init(1 << this._posStateBits);
    }
    if (this._repMatchLenEncoder) {
      this._repMatchLenEncoder.init(1 << this._posStateBits);
    }
    if (this._posAlignEncoder) {
      initBitModels(this._posAlignEncoder.models);
    }
    this._longestMatchWasFound = 0;
    this._optimumEndIndex = 0;
    this._optimumCurrentIndex = 0;
    this._additionalOffset = 0;
  }
  /**
   * Initialize encoder range coder
   */
  initEncoderState() {
    this._rangeEncoder.low = 0n;
    this._rangeEncoder.rrange = 4294967295;
    this._rangeEncoder.cacheSize = 1;
    this._rangeEncoder.cache = 0;
    this._rangeEncoder.position = 0n;
  }
  /**
   * Initialize literal encoder
   */
  initLiteralEncoder() {
    const totalStates = 1 << this._literalEncoder.numPrevBits + this._literalEncoder.numPosBits;
    for (let i = 0; i < totalStates; ++i) {
      initBitModels(this._literalEncoder.coders[i].decoders);
    }
  }
  /**
   * Create optimum structures
   */
  createOptimumStructures() {
    for (let i = 0; i < 4096; ++i) {
      this._optimum[i] = {};
    }
    for (let i = 0; i < 4; ++i) {
      this._posSlotEncoder[i] = createBitTree(6);
    }
  }
  /**
   * Create length price table encoder
   */
  createLenPriceTableEncoder() {
    const encoder3 = new LenEncoder();
    encoder3.initPriceTable();
    return encoder3;
  }
  /**
   * Create literal encoder encoder2
   */
  createLiteralEncoderEncoder2() {
    const encoder3 = {
      decoders: initArray(768)
    };
    return encoder3;
  }
  /**
   * Create literal encoder
   */
  createLiteralEncoder() {
    if (this._literalEncoder != null && this._literalEncoder.numPrevBits == this._numLiteralContextBits && this._literalEncoder.numPosBits == this._numLiteralPosStateBits) {
      return;
    }
    this._literalEncoder = new LitCoder(this._numLiteralPosStateBits, this._numLiteralContextBits);
  }
  /**
   * Initialize completely with proper encoder state
   */
  initialize() {
    this._lenEncoder = this.createLenPriceTableEncoder();
    this._repMatchLenEncoder = this.createLenPriceTableEncoder();
    this._posAlignEncoder = createBitTree(4);
    this._optimum = [];
    this.createOptimumStructures();
    this.createLiteralEncoder();
    this.init();
  }
  /**
   * Configure encoder settings
   */
  configure(mode) {
    this.setDictionarySize(1 << mode.searchDepth);
    this._numFastBytes = mode.filterStrength;
    this._matchFinderType = mode.modeIndex;
    this._numLiteralContextBits = 3;
    this._numLiteralPosStateBits = 0;
    this._posStateBits = 2;
    this._posStateMask = 3;
  }
  /**
   * Set dictionary size
   */
  setDictionarySize(dictionarySize) {
    this._dictionarySize = dictionarySize;
    let dicLogSize = 0;
    for (; dictionarySize > 1 << dicLogSize; ++dicLogSize)
      ;
    this._distTableSize = dicLogSize * 2;
  }
  /**
   * Encode a bit using range coder
   */
  encodeBit(probs, index, symbol) {
    const rangeEncoder = this._rangeEncoder;
    let newBound, prob = probs[index];
    newBound = (rangeEncoder.rrange >>> 11) * prob;
    if (!symbol) {
      rangeEncoder.rrange = newBound;
      probs[index] = prob + (2048 - prob >>> 5);
    } else {
      rangeEncoder.low += BigInt(newBound >>> 0);
      rangeEncoder.rrange -= newBound;
      probs[index] = prob - (prob >>> 5);
    }
    if (!(rangeEncoder.rrange & -16777216)) {
      rangeEncoder.rrange <<= 8;
      this.shiftLow();
    }
  }
  /**
   * Encode bit tree
   */
  encodeBitTree(encoder3, symbol) {
    let bit, bitIndex, m = 1;
    for (bitIndex = encoder3.numBitLevels; bitIndex != 0; ) {
      bitIndex -= 1;
      bit = symbol >>> bitIndex & 1;
      this.encodeBit(encoder3.models, m, bit);
      m = m << 1 | bit;
    }
  }
  /**
   * Encode literal
   */
  encodeLiteral(encoder3, symbol) {
    let bit, context = 1;
    for (let i = 7; i >= 0; --i) {
      bit = symbol >> i & 1;
      this.encodeBit(encoder3.decoders, context, bit);
      context = context << 1 | bit;
    }
  }
  /**
   * Encode matched literal
   */
  encodeMatched(encoder3, matchByte, symbol) {
    let bit, matchBit, state, same = true, context = 1;
    for (let i = 7; i >= 0; --i) {
      bit = symbol >> i & 1;
      state = context;
      if (same) {
        matchBit = matchByte >> i & 1;
        state += 1 + matchBit << 8;
        same = matchBit === bit;
      }
      this.encodeBit(encoder3.decoders, state, bit);
      context = context << 1 | bit;
    }
  }
  /**
   * Encode length using direct method calls
   */
  encodeLength(encoder3, symbol, posState) {
    encoder3.encode(symbol, posState, this);
  }
  /**
   * Encode direct bits
   */
  encodeDirectBits(valueToEncode, numTotalBits) {
    const rangeEncoder = this._rangeEncoder;
    for (let i = numTotalBits - 1; i >= 0; i -= 1) {
      rangeEncoder.rrange >>>= 1;
      if ((valueToEncode >>> i & 1) == 1) {
        rangeEncoder.low += BigInt(rangeEncoder.rrange >>> 0);
      }
      if (!(rangeEncoder.rrange & -16777216)) {
        rangeEncoder.rrange <<= 8;
        this.shiftLow();
      }
    }
  }
  /**
   * Reverse encode
   */
  reverseEncode(symbol) {
    const posAlignEncoder = this._posAlignEncoder;
    if (!posAlignEncoder)
      return;
    let bit, m = 1;
    for (let i = 0; i < posAlignEncoder.numBitLevels; ++i) {
      bit = symbol & 1;
      this.encodeBit(posAlignEncoder.models, m, bit);
      m = m << 1 | bit;
      symbol >>= 1;
    }
  }
  /**
   * Reverse encode range
   */
  reverseEncodeRange(startIndex, numBitLevels, symbol) {
    let bit, m = 1;
    for (let i = 0; i < numBitLevels; ++i) {
      bit = symbol & 1;
      this.encodeBit(this._posEncoders, startIndex + m, bit);
      m = m << 1 | bit;
      symbol >>= 1;
    }
  }
  /**
   * Write end marker
   */
  writeEndMarker(positionState) {
    this.encodeBit(this._isMatch, (this._state << 4) + positionState, 1);
    this.encodeBit(this._isRep, this._state, 0);
    this._state = this._state < 7 ? 7 : 10;
    this.encodeLength(this._lenEncoder, 0, positionState);
    const posSlot = 63;
    const lenToPosState = getLenToPosState(2);
    this.encodeBitTree(this._posSlotEncoder[lenToPosState], posSlot);
    this.encodeDirectBits(67108863, 26);
    this.reverseEncode(15);
  }
  /**
   * Encode length with price table update
   */
  encodeLengthWithPriceUpdate(encoder3, symbol, posState) {
    encoder3.encodeWithUpdate(symbol, posState, this);
  }
  /**
   * Shift low helper (proper implementation) - public method for external access
   */
  shiftLow() {
    const rangeEncoder = this._rangeEncoder;
    const lowHi = Number(rangeEncoder.low >> 32n & 0xffffffffn);
    const lowLow = Number(rangeEncoder.low & 0xffffffffn);
    if (lowHi != 0 || lowLow < 4278190080) {
      rangeEncoder.position += BigInt(rangeEncoder.cacheSize);
      let temp = rangeEncoder.cache;
      do {
        this.writeToStream(rangeEncoder.stream, temp + lowHi);
        temp = 255;
      } while ((rangeEncoder.cacheSize -= 1) != 0);
      rangeEncoder.cache = lowLow >>> 24 & 255;
    }
    rangeEncoder.cacheSize += 1;
    rangeEncoder.low = BigInt(lowLow & 16777215) << 8n;
  }
  /**
   * Write byte to stream
   */
  writeToStream(stream, b) {
    if (!stream)
      return;
    stream.writeByte(b << 24 >> 24);
  }
  initRangeEncoder() {
    this._rangeEncoder.position = 0n;
    this._rangeEncoder.low = 0n;
    this._rangeEncoder.rrange = -1;
    this._rangeEncoder.cacheSize = 1;
    this._rangeEncoder.cache = 0;
  }
  /**
   * Fill alignment prices for position alignment encoder
   */
  fillAlignPrices() {
    for (let i = 0; i < 16; ++i) {
      this._alignPrices[i] = this.reverseGetPrice(this._posAlignEncoder, i);
    }
    this._alignPriceCount = 0;
  }
  /**
   * Fill distance prices for position encoders
   */
  fillDistancesPrices() {
    let baseVal, bitTreeEncoder, footerBits, posSlot, st, st2;
    for (let i = 4; i < 128; ++i) {
      posSlot = this.getPosSlot(i);
      footerBits = (posSlot >> 1) - 1;
      baseVal = (2 | posSlot & 1) << footerBits;
      this.tempPrices[i] = this.reverseGetPriceArray(this._posEncoders, baseVal - posSlot - 1, footerBits, i - baseVal);
    }
    for (let lenToPosState = 0; lenToPosState < 4; ++lenToPosState) {
      bitTreeEncoder = this._posSlotEncoder[lenToPosState];
      st = lenToPosState << 6;
      for (posSlot = 0; posSlot < this._distTableSize; posSlot += 1) {
        this._posSlotPrices[st + posSlot] = this.getEncoderBitTreePrice(bitTreeEncoder, posSlot);
      }
      for (posSlot = 14; posSlot < this._distTableSize; posSlot += 1) {
        this._posSlotPrices[st + posSlot] += (posSlot >> 1) - 1 - 4 << 6;
      }
      st2 = lenToPosState * 128;
      for (let i = 0; i < 4; ++i) {
        this._distancesPrices[st2 + i] = this._posSlotPrices[st + i];
      }
      for (let i = 4; i < 128; ++i) {
        this._distancesPrices[st2 + i] = this._posSlotPrices[st + this.getPosSlot(i)] + this.tempPrices[i];
      }
    }
    this._matchPriceCount = 0;
  }
  /**
   * Get position slot for a distance value
   */
  getPosSlot(pos) {
    if (pos < 2048) {
      return G_FAST_POS[pos];
    }
    if (pos < 2097152) {
      return G_FAST_POS[pos >> 10] + 20;
    }
    return G_FAST_POS[pos >> 20] + 40;
  }
  /**
   * Get reverse price for bit tree encoder
   */
  reverseGetPrice(encoder3, symbol) {
    let bit, m = 1, price = 0;
    for (let i = encoder3.numBitLevels; i != 0; i -= 1) {
      bit = symbol & 1;
      symbol >>>= 1;
      price += this.getPrice(encoder3.models[m], bit);
      m = m << 1 | bit;
    }
    return price;
  }
  /**
   * Get reverse price for array of models
   */
  reverseGetPriceArray(models, startIndex, numBitLevels, symbol) {
    let bit, m = 1, price = 0;
    for (let i = numBitLevels; i != 0; i -= 1) {
      bit = symbol & 1;
      symbol >>>= 1;
      price += PROB_PRICES[((models[startIndex + m] - bit ^ -bit) & 2047) >>> 2];
      m = m << 1 | bit;
    }
    return price;
  }
  /**
   * Get price for probability model (optimized)
   */
  getPrice(prob, symbol) {
    return getBitPrice(prob, symbol);
  }
  /**
   * Get price for bit tree encoder
   */
  getEncoderBitTreePrice(encoder3, symbol) {
    return getBitTreePrice(encoder3, symbol);
  }
  /**
   * Create encoder optimization structures (optimized)
   */
  createEncoderStructures() {
    this._optimum = [];
    for (let i = 0; i < 4096; i++) {
      this._optimum[i] = {};
    }
    for (let i = 0; i < 4096; ++i) {
      this._optimum[i] = {};
    }
    this._posSlotEncoder = new Array(4);
    for (let i = 0; i < 4; ++i) {
      this._posSlotEncoder[i] = createBitTree(6);
    }
  }
  /**
   * Get literal encoder subcoder (utility method)
   */
  getSubCoderUtility(pos, prevByte) {
    const posBits = pos & this._literalEncoder.posMask;
    const posShifted = posBits << this._literalEncoder.numPrevBits;
    const prevByteShift = 8 - this._literalEncoder.numPrevBits;
    const prevByteBits = (prevByte & 255) >>> prevByteShift;
    const coderIndex = posShifted + prevByteBits;
    return this._literalEncoder.coders[coderIndex];
  }
  // ── Encoding orchestration methods (moved from LZMA) ──
  makeAsChar(optimum) {
    optimum.backPrev = -1;
    optimum.prev1IsChar = 0;
  }
  makeAsShortRep(optimum) {
    optimum.backPrev = 0;
    optimum.prev1IsChar = 0;
  }
  releaseMFStream() {
    if (this._matchFinder && this._needReleaseMFStream) {
      this._matchFinder._stream = null;
      this._needReleaseMFStream = 0;
    }
  }
  releaseStreams() {
    this.releaseMFStream();
    this._rangeEncoder.stream = null;
  }
  getProcessedSizeAdd() {
    return BigInt(this._rangeEncoder.cacheSize) + this._rangeEncoder.position + 4n;
  }
  getSubCoder(pos, prevByte) {
    const subCoder = this._literalEncoder.getSubCoder(pos, prevByte);
    return { decoders: subCoder.decoders };
  }
  getLiteralPrice(encoder3, matchMode, matchByte, symbol) {
    let bit, context = 1, i = 7, matchBit, price = 0;
    if (matchMode) {
      for (; i >= 0; --i) {
        matchBit = matchByte >> i & 1;
        bit = symbol >> i & 1;
        price += getBitPrice(encoder3.decoders[(1 + matchBit << 8) + context], bit);
        context = context << 1 | bit;
        if (matchBit != bit) {
          --i;
          break;
        }
      }
    }
    for (; i >= 0; --i) {
      bit = symbol >> i & 1;
      price += getBitPrice(encoder3.decoders[context], bit);
      context = context << 1 | bit;
    }
    return price;
  }
  getPosLenPrice(pos, len, posState) {
    let price, lenToPosState = getLenToPosState(len);
    if (pos < 128) {
      price = this._distancesPrices[lenToPosState * 128 + pos];
    } else {
      const position = (lenToPosState << 6) + this.getPosSlot2(pos);
      price = this._posSlotPrices[position] + this._alignPrices[pos & 15];
    }
    return price + this._lenEncoder.getPrice(len - 2, posState);
  }
  getPureRepPrice(repIndex, state, posState) {
    let price;
    if (!repIndex) {
      price = PROB_PRICES[this._isRepG0[state] >>> 2];
      price += PROB_PRICES[2048 - this._isRep0Long[(state << 4) + posState] >>> 2];
    } else {
      price = PROB_PRICES[2048 - this._isRepG0[state] >>> 2];
      if (repIndex == 1) {
        price += PROB_PRICES[this._isRepG1[state] >>> 2];
      } else {
        price += PROB_PRICES[2048 - this._isRepG1[state] >>> 2];
        price += getBitPrice(this._isRepG2[state], repIndex - 2);
      }
    }
    return price;
  }
  getRepLen1Price(posState) {
    const repG0Price = PROB_PRICES[this._isRepG0[this._state] >>> 2];
    const rep0LongPrice = PROB_PRICES[this._isRep0Long[(this._state << 4) + posState] >>> 2];
    return repG0Price + rep0LongPrice;
  }
  getPosSlot2(pos) {
    if (pos < 131072) {
      return G_FAST_POS[pos >> 6] + 12;
    }
    if (pos < 134217728) {
      return G_FAST_POS[pos >> 16] + 32;
    }
    return G_FAST_POS[pos >> 26] + 52;
  }
  movePosHelper(num) {
    if (num > 0) {
      this._matchFinder.skip(num);
      this._additionalOffset += num;
    }
  }
  readMatchDistances() {
    let lenRes = 0;
    this._numDistancePairs = this._matchFinder.getMatches(this._matchDistances);
    if (this._numDistancePairs > 0) {
      lenRes = this._matchDistances[this._numDistancePairs - 2];
      if (lenRes == this._numFastBytes) {
        lenRes += this._matchFinder.getMatchLen(lenRes - 1, this._matchDistances[this._numDistancePairs - 1], 273 - lenRes);
      }
    }
    this._additionalOffset += 1;
    return lenRes;
  }
  flushEncoding(nowPos) {
    this.releaseMFStream();
    this.writeEndMarker(nowPos & this._posStateMask);
    for (let i = 0; i < 5; ++i) {
      this.shiftLow();
    }
  }
  backward(cur) {
    let backCur, backMem, posMem, posPrev;
    this._optimumEndIndex = cur;
    posMem = this._optimum[cur].posPrev;
    backMem = this._optimum[cur].backPrev;
    do {
      if (this._optimum[cur].prev1IsChar) {
        this.makeAsChar(this._optimum[posMem]);
        this._optimum[posMem].posPrev = posMem - 1;
        if (this._optimum[cur].prev2) {
          this._optimum[posMem - 1].prev1IsChar = 0;
          this._optimum[posMem - 1].posPrev = this._optimum[cur].posPrev2;
          this._optimum[posMem - 1].backPrev = this._optimum[cur].backPrev2;
        }
      }
      posPrev = posMem;
      backCur = backMem;
      backMem = this._optimum[posPrev].backPrev;
      posMem = this._optimum[posPrev].posPrev;
      this._optimum[posPrev].backPrev = backCur;
      this._optimum[posPrev].posPrev = cur;
      cur = posPrev;
    } while (cur > 0);
    this.backRes = this._optimum[0].backPrev;
    this._optimumCurrentIndex = this._optimum[0].posPrev;
    return this._optimumCurrentIndex;
  }
  getOptimumLength(position) {
    let cur, curAnd1Price, curAndLenCharPrice, curAndLenPrice, curBack, curPrice, currentByte, distance, len, lenEnd, lenMain, lenTest, lenTest2, lenTestTemp, matchByte, matchPrice, newLen, nextIsChar, nextMatchPrice, nextOptimum, nextRepMatchPrice, normalMatchPrice, numAvailableBytes, numAvailableBytesFull, numDistancePairs, offs, offset, opt, optimum, pos, posPrev, posState, posStateNext, price_4, repIndex, repLen, repMatchPrice, repMaxIndex, shortRepPrice, startLen, state, state2, t, price, price_0, price_1, price_2, price_3, lenRes;
    if (this._optimumEndIndex != this._optimumCurrentIndex) {
      lenRes = this._optimum[this._optimumCurrentIndex].posPrev - this._optimumCurrentIndex;
      this.backRes = this._optimum[this._optimumCurrentIndex].backPrev;
      this._optimumCurrentIndex = this._optimum[this._optimumCurrentIndex].posPrev;
      return lenRes;
    }
    this._optimumCurrentIndex = this._optimumEndIndex = 0;
    if (this._longestMatchWasFound) {
      lenMain = this._longestMatchLength;
      this._longestMatchWasFound = 0;
    } else {
      lenMain = this.readMatchDistances();
    }
    numDistancePairs = this._numDistancePairs;
    numAvailableBytes = this._matchFinder.getNumAvailableBytes() + 1;
    if (numAvailableBytes < 2) {
      this.backRes = -1;
      return 1;
    }
    if (numAvailableBytes > 273) {
      numAvailableBytes = 273;
    }
    repMaxIndex = 0;
    for (let i = 0; i < 4; ++i) {
      this.reps[i] = this._repDistances[i];
      this.repLens[i] = this._matchFinder.getMatchLen(-1, this.reps[i], 273);
      if (this.repLens[i] > this.repLens[repMaxIndex]) {
        repMaxIndex = i;
      }
    }
    if (this.repLens[repMaxIndex] >= this._numFastBytes) {
      this.backRes = repMaxIndex;
      lenRes = this.repLens[repMaxIndex];
      this.movePosHelper(lenRes - 1);
      return lenRes;
    }
    if (lenMain >= this._numFastBytes) {
      this.backRes = this._matchDistances[numDistancePairs - 1] + 4;
      this.movePosHelper(lenMain - 1);
      return lenMain;
    }
    currentByte = this._matchFinder.getIndexByte(-1);
    matchByte = this._matchFinder.getIndexByte(-this._repDistances[0] - 1 - 1);
    if (lenMain < 2 && currentByte != matchByte && this.repLens[repMaxIndex] < 2) {
      this.backRes = -1;
      return 1;
    }
    this._optimum[0].state = this._state;
    posState = position & this._posStateMask;
    this._optimum[1].price = PROB_PRICES[this._isMatch[(this._state << 4) + posState] >>> 2] + this.getLiteralPrice(this.getSubCoder(position, this._previousByte), this._state >= 7, matchByte, currentByte);
    this.makeAsChar(this._optimum[1]);
    matchPrice = PROB_PRICES[2048 - this._isMatch[(this._state << 4) + posState] >>> 2];
    repMatchPrice = matchPrice + PROB_PRICES[2048 - this._isRep[this._state] >>> 2];
    if (matchByte == currentByte) {
      shortRepPrice = repMatchPrice + this.getRepLen1Price(posState);
      if (shortRepPrice < this._optimum[1].price) {
        this._optimum[1].price = shortRepPrice;
        this.makeAsShortRep(this._optimum[1]);
      }
    }
    lenEnd = lenMain >= this.repLens[repMaxIndex] ? lenMain : this.repLens[repMaxIndex];
    if (lenEnd < 2) {
      this.backRes = this._optimum[1].backPrev;
      return 1;
    }
    this._optimum[1].posPrev = 0;
    this._optimum[0].backs0 = this.reps[0];
    this._optimum[0].backs1 = this.reps[1];
    this._optimum[0].backs2 = this.reps[2];
    this._optimum[0].backs3 = this.reps[3];
    len = lenEnd;
    do {
      this._optimum[len].price = INFINITY_PRICE;
      len -= 1;
    } while (len >= 2);
    for (let i = 0; i < 4; ++i) {
      repLen = this.repLens[i];
      if (repLen < 2) {
        continue;
      }
      price_4 = repMatchPrice + this.getPureRepPrice(i, this._state, posState);
      do {
        curAndLenPrice = price_4 + this._repMatchLenEncoder.getPrice(repLen - 2, posState);
        optimum = this._optimum[repLen];
        if (curAndLenPrice < optimum.price) {
          optimum.price = curAndLenPrice;
          optimum.posPrev = 0;
          optimum.backPrev = i;
          optimum.prev1IsChar = 0;
        }
      } while ((repLen -= 1) >= 2);
    }
    normalMatchPrice = matchPrice + PROB_PRICES[this._isRep[this._state] >>> 2];
    len = this.repLens[0] >= 2 ? this.repLens[0] + 1 : 2;
    if (len <= lenMain) {
      offs = 0;
      while (len > this._matchDistances[offs]) {
        offs += 2;
      }
      for (; ; len += 1) {
        distance = this._matchDistances[offs + 1];
        curAndLenPrice = normalMatchPrice + this.getPosLenPrice(distance, len, posState);
        optimum = this._optimum[len];
        if (curAndLenPrice < optimum.price) {
          optimum.price = curAndLenPrice;
          optimum.posPrev = 0;
          optimum.backPrev = distance + 4;
          optimum.prev1IsChar = 0;
        }
        if (len == this._matchDistances[offs]) {
          offs += 2;
          if (offs == numDistancePairs) {
            break;
          }
        }
      }
    }
    cur = 0;
    while (1) {
      ++cur;
      if (cur == lenEnd) {
        return this.backward(cur);
      }
      newLen = this.readMatchDistances();
      numDistancePairs = this._numDistancePairs;
      if (newLen >= this._numFastBytes) {
        this._longestMatchLength = newLen;
        this._longestMatchWasFound = 1;
        return this.backward(cur);
      }
      position += 1;
      posPrev = this._optimum[cur].posPrev;
      if (this._optimum[cur].prev1IsChar) {
        posPrev -= 1;
        if (this._optimum[cur].prev2) {
          state = this._optimum[this._optimum[cur].posPrev2].state;
          if (this._optimum[cur].backPrev2 < 4) {
            state = state < 7 ? 8 : 11;
          } else {
            state = state < 7 ? 7 : 10;
          }
        } else {
          state = this._optimum[posPrev].state;
        }
        state = stateUpdateChar(state);
      } else {
        state = this._optimum[posPrev].state;
      }
      if (posPrev == cur - 1) {
        if (!this._optimum[cur].backPrev) {
          state = state < 7 ? 9 : 11;
        } else {
          state = stateUpdateChar(state);
        }
      } else {
        if (this._optimum[cur].prev1IsChar && this._optimum[cur].prev2) {
          posPrev = this._optimum[cur].posPrev2;
          pos = this._optimum[cur].backPrev2;
          state = state < 7 ? 8 : 11;
        } else {
          pos = this._optimum[cur].backPrev;
          if (pos < 4) {
            state = state < 7 ? 8 : 11;
          } else {
            state = state < 7 ? 7 : 10;
          }
        }
        opt = this._optimum[posPrev];
        if (pos < 4) {
          if (!pos) {
            this.reps[0] = opt.backs0;
            this.reps[1] = opt.backs1;
            this.reps[2] = opt.backs2;
            this.reps[3] = opt.backs3;
          } else if (pos == 1) {
            this.reps[0] = opt.backs1;
            this.reps[1] = opt.backs0;
            this.reps[2] = opt.backs2;
            this.reps[3] = opt.backs3;
          } else if (pos == 2) {
            this.reps[0] = opt.backs2;
            this.reps[1] = opt.backs0;
            this.reps[2] = opt.backs1;
            this.reps[3] = opt.backs3;
          } else {
            this.reps[0] = opt.backs3;
            this.reps[1] = opt.backs0;
            this.reps[2] = opt.backs1;
            this.reps[3] = opt.backs2;
          }
        } else {
          this.reps[0] = pos - 4;
          this.reps[1] = opt.backs0;
          this.reps[2] = opt.backs1;
          this.reps[3] = opt.backs2;
        }
      }
      this._optimum[cur].state = state;
      this._optimum[cur].backs0 = this.reps[0];
      this._optimum[cur].backs1 = this.reps[1];
      this._optimum[cur].backs2 = this.reps[2];
      this._optimum[cur].backs3 = this.reps[3];
      curPrice = this._optimum[cur].price;
      currentByte = this._matchFinder.getIndexByte(-1);
      matchByte = this._matchFinder.getIndexByte(-this.reps[0] - 1 - 1);
      posState = position & this._posStateMask;
      curAnd1Price = curPrice + PROB_PRICES[this._isMatch[(state << 4) + posState] >>> 2] + this.getLiteralPrice(this.getSubCoder(position, this._matchFinder.getIndexByte(-2)), state >= 7, matchByte, currentByte);
      nextOptimum = this._optimum[cur + 1];
      nextIsChar = 0;
      if (curAnd1Price < nextOptimum.price) {
        nextOptimum.price = curAnd1Price;
        nextOptimum.posPrev = cur;
        nextOptimum.backPrev = -1;
        nextOptimum.prev1IsChar = 0;
        nextIsChar = 1;
      }
      matchPrice = curPrice + PROB_PRICES[2048 - this._isMatch[(state << 4) + posState] >>> 2];
      repMatchPrice = matchPrice + PROB_PRICES[2048 - this._isRep[state] >>> 2];
      if (matchByte == currentByte && !(nextOptimum.posPrev < cur && !nextOptimum.backPrev)) {
        shortRepPrice = repMatchPrice + (PROB_PRICES[this._isRepG0[state] >>> 2] + PROB_PRICES[this._isRep0Long[(state << 4) + posState] >>> 2]);
        if (shortRepPrice <= nextOptimum.price) {
          nextOptimum.price = shortRepPrice;
          nextOptimum.posPrev = cur;
          nextOptimum.backPrev = 0;
          nextOptimum.prev1IsChar = 0;
          nextIsChar = 1;
        }
      }
      numAvailableBytesFull = this._matchFinder.getNumAvailableBytes() + 1;
      numAvailableBytesFull = 4095 - cur < numAvailableBytesFull ? 4095 - cur : numAvailableBytesFull;
      numAvailableBytes = numAvailableBytesFull;
      if (numAvailableBytes < 2) {
        continue;
      }
      if (numAvailableBytes > this._numFastBytes) {
        numAvailableBytes = this._numFastBytes;
      }
      if (!nextIsChar && matchByte != currentByte) {
        t = Math.min(numAvailableBytesFull - 1, this._numFastBytes);
        lenTest2 = this._matchFinder.getMatchLen(0, this.reps[0], t);
        if (lenTest2 >= 2) {
          state2 = stateUpdateChar(state);
          posStateNext = position + 1 & this._posStateMask;
          nextRepMatchPrice = curAnd1Price + PROB_PRICES[2048 - this._isMatch[(state2 << 4) + posStateNext] >>> 2] + PROB_PRICES[2048 - this._isRep[state2] >>> 2];
          offset = cur + 1 + lenTest2;
          while (lenEnd < offset) {
            this._optimum[lenEnd += 1].price = INFINITY_PRICE;
          }
          curAndLenPrice = nextRepMatchPrice + (price = this._repMatchLenEncoder.getPrice(lenTest2 - 2, posStateNext), price + this.getPureRepPrice(0, state2, posStateNext));
          optimum = this._optimum[offset];
          if (curAndLenPrice < optimum.price) {
            optimum.price = curAndLenPrice;
            optimum.posPrev = cur + 1;
            optimum.backPrev = 0;
            optimum.prev1IsChar = 1;
            optimum.prev2 = 0;
          }
        }
      }
      startLen = 2;
      for (repIndex = 0; repIndex < 4; ++repIndex) {
        lenTest = this._matchFinder.getMatchLen(-1, this.reps[repIndex], numAvailableBytes);
        if (lenTest < 2) {
          continue;
        }
        lenTestTemp = lenTest;
        do {
          while (lenEnd < cur + lenTest) {
            this._optimum[lenEnd += 1].price = INFINITY_PRICE;
          }
          curAndLenPrice = repMatchPrice + (price_0 = this._repMatchLenEncoder.getPrice(lenTest - 2, posState), price_0 + this.getPureRepPrice(repIndex, state, posState));
          optimum = this._optimum[cur + lenTest];
          if (curAndLenPrice < optimum.price) {
            optimum.price = curAndLenPrice;
            optimum.posPrev = cur;
            optimum.backPrev = repIndex;
            optimum.prev1IsChar = 0;
          }
        } while ((lenTest -= 1) >= 2);
        lenTest = lenTestTemp;
        if (!repIndex) {
          startLen = lenTest + 1;
        }
        if (lenTest < numAvailableBytesFull) {
          t = Math.min(numAvailableBytesFull - 1 - lenTest, this._numFastBytes);
          lenTest2 = this._matchFinder.getMatchLen(lenTest, this.reps[repIndex], t);
          if (lenTest2 >= 2) {
            state2 = state < 7 ? 8 : 11;
            posStateNext = position + lenTest & this._posStateMask;
            curAndLenCharPrice = repMatchPrice + (price_1 = this._repMatchLenEncoder.getPrice(lenTest - 2, posState), price_1 + this.getPureRepPrice(repIndex, state, posState)) + PROB_PRICES[this._isMatch[(state2 << 4) + posStateNext] >>> 2] + this.getLiteralPrice(this.getSubCoder(position + lenTest, this._matchFinder.getIndexByte(lenTest - 1 - 1)), true, this._matchFinder.getIndexByte(lenTest - 1 - (this.reps[repIndex] + 1)), this._matchFinder.getIndexByte(lenTest - 1));
            state2 = stateUpdateChar(state2);
            posStateNext = position + lenTest + 1 & this._posStateMask;
            nextMatchPrice = curAndLenCharPrice + PROB_PRICES[2048 - this._isMatch[(state2 << 4) + posStateNext] >>> 2];
            nextRepMatchPrice = nextMatchPrice + PROB_PRICES[2048 - this._isRep[state2] >>> 2];
            offset = lenTest + 1 + lenTest2;
            while (lenEnd < cur + offset) {
              this._optimum[lenEnd += 1].price = INFINITY_PRICE;
            }
            curAndLenPrice = nextRepMatchPrice + (price_2 = this._repMatchLenEncoder.getPrice(lenTest2 - 2, posStateNext), price_2 + this.getPureRepPrice(0, state2, posStateNext));
            optimum = this._optimum[cur + offset];
            if (curAndLenPrice < optimum.price) {
              optimum.price = curAndLenPrice;
              optimum.posPrev = cur + lenTest + 1;
              optimum.backPrev = 0;
              optimum.prev1IsChar = 1;
              optimum.prev2 = 1;
              optimum.posPrev2 = cur;
              optimum.backPrev2 = repIndex;
            }
          }
        }
      }
      if (newLen > numAvailableBytes) {
        newLen = numAvailableBytes;
        for (numDistancePairs = 0; newLen > this._matchDistances[numDistancePairs]; numDistancePairs += 2) {
        }
        this._matchDistances[numDistancePairs] = newLen;
        numDistancePairs += 2;
      }
      if (newLen >= startLen) {
        normalMatchPrice = matchPrice + PROB_PRICES[this._isRep[state] >>> 2];
        while (lenEnd < cur + newLen) {
          this._optimum[lenEnd += 1].price = INFINITY_PRICE;
        }
        offs = 0;
        while (startLen > this._matchDistances[offs]) {
          offs += 2;
        }
        for (lenTest = startLen; ; lenTest += 1) {
          curBack = this._matchDistances[offs + 1];
          curAndLenPrice = normalMatchPrice + this.getPosLenPrice(curBack, lenTest, posState);
          optimum = this._optimum[cur + lenTest];
          if (curAndLenPrice < optimum.price) {
            optimum.price = curAndLenPrice;
            optimum.posPrev = cur;
            optimum.backPrev = curBack + 4;
            optimum.prev1IsChar = 0;
          }
          if (lenTest == this._matchDistances[offs]) {
            if (lenTest < numAvailableBytesFull) {
              t = Math.min(numAvailableBytesFull - 1 - lenTest, this._numFastBytes);
              lenTest2 = this._matchFinder.getMatchLen(lenTest, curBack, t);
              if (lenTest2 >= 2) {
                state2 = state < 7 ? 7 : 10;
                posStateNext = position + lenTest & this._posStateMask;
                curAndLenCharPrice = curAndLenPrice + PROB_PRICES[this._isMatch[(state2 << 4) + posStateNext] >>> 2] + this.getLiteralPrice(this.getSubCoder(position + lenTest, this._matchFinder.getIndexByte(lenTest - 1 - 1)), true, this._matchFinder.getIndexByte(lenTest - (curBack + 1) - 1), this._matchFinder.getIndexByte(lenTest - 1));
                state2 = stateUpdateChar(state2);
                posStateNext = position + lenTest + 1 & this._posStateMask;
                nextMatchPrice = curAndLenCharPrice + PROB_PRICES[2048 - this._isMatch[(state2 << 4) + posStateNext] >>> 2];
                nextRepMatchPrice = nextMatchPrice + PROB_PRICES[2048 - this._isRep[state2] >>> 2];
                offset = lenTest + 1 + lenTest2;
                while (lenEnd < cur + offset) {
                  this._optimum[lenEnd += 1].price = INFINITY_PRICE;
                }
                curAndLenPrice = nextRepMatchPrice + (price_3 = this._repMatchLenEncoder.getPrice(lenTest2 - 2, posStateNext), price_3 + this.getPureRepPrice(0, state2, posStateNext));
                optimum = this._optimum[cur + offset];
                if (curAndLenPrice < optimum.price) {
                  optimum.price = curAndLenPrice;
                  optimum.posPrev = cur + lenTest + 1;
                  optimum.backPrev = 0;
                  optimum.prev1IsChar = 1;
                  optimum.prev2 = 1;
                  optimum.posPrev2 = cur;
                  optimum.backPrev2 = curBack + 4;
                }
              }
            }
            offs += 2;
            if (offs == numDistancePairs) {
              break;
            }
          }
        }
      }
    }
    return 1;
  }
  codeOneBlock() {
    let baseVal, complexState, curByte, distance, footerBits, len, lenToPosState, matchByte, pos, posReduced, posSlot, posState, progressPosValuePrev, subCoder;
    this.processedInSize[0] = 0n;
    this.processedOutSize[0] = 0n;
    this.finished[0] = 1;
    progressPosValuePrev = this.nowPos64;
    if (this._inStream) {
      this._matchFinder._stream = this._inStream;
      this._matchFinder.init();
      this._needReleaseMFStream = 1;
      this._inStream = null;
    }
    if (this._finished) {
      return;
    }
    this._finished = 1;
    if (this.nowPos64 === 0n) {
      if (!this._matchFinder.getNumAvailableBytes()) {
        this.flushEncoding(Number(this.nowPos64 & 0xffffffffn));
        return;
      }
      this.readMatchDistances();
      posState = Number(this.nowPos64 & 0xffffffffn) & this._posStateMask;
      this.encodeBit(this._isMatch, (this._state << 4) + posState, 0);
      this._state = stateUpdateChar(this._state);
      curByte = this._matchFinder.getIndexByte(-this._additionalOffset);
      this.encodeLiteral(this.getSubCoder(Number(this.nowPos64 & 0xffffffffn), this._previousByte), curByte);
      this._previousByte = curByte;
      this._additionalOffset -= 1;
      this.nowPos64 += 1n;
    }
    if (!this._matchFinder.getNumAvailableBytes()) {
      this.flushEncoding(Number(this.nowPos64 & 0xffffffffn));
      return;
    }
    while (1) {
      len = this.getOptimumLength(Number(this.nowPos64 & 0xffffffffn));
      pos = this.backRes;
      posState = Number(this.nowPos64 & 0xffffffffn) & this._posStateMask;
      complexState = (this._state << 4) + posState;
      if (len == 1 && pos == -1) {
        this.encodeBit(this._isMatch, complexState, 0);
        curByte = this._matchFinder.getIndexByte(-this._additionalOffset);
        subCoder = this.getSubCoder(Number(this.nowPos64 & 0xffffffffn), this._previousByte);
        if (this._state < 7) {
          this.encodeLiteral(subCoder, curByte);
        } else {
          matchByte = this._matchFinder.getIndexByte(-this._repDistances[0] - 1 - this._additionalOffset);
          this.encodeMatched(subCoder, matchByte, curByte);
        }
        this._previousByte = curByte;
        this._state = stateUpdateChar(this._state);
      } else {
        this.encodeBit(this._isMatch, complexState, 1);
        if (pos < 4) {
          this.encodeBit(this._isRep, this._state, 1);
          if (!pos) {
            this.encodeBit(this._isRepG0, this._state, 0);
            if (len == 1) {
              this.encodeBit(this._isRep0Long, complexState, 0);
            } else {
              this.encodeBit(this._isRep0Long, complexState, 1);
            }
          } else {
            this.encodeBit(this._isRepG0, this._state, 1);
            if (pos == 1) {
              this.encodeBit(this._isRepG1, this._state, 0);
            } else {
              this.encodeBit(this._isRepG1, this._state, 1);
              this.encodeBit(this._isRepG2, this._state, pos - 2);
            }
          }
          if (len == 1) {
            this._state = this._state < 7 ? 9 : 11;
          } else {
            this.encodeLength(this._repMatchLenEncoder, len - 2, posState);
            this._state = this._state < 7 ? 8 : 11;
          }
          distance = this._repDistances[pos];
          if (pos != 0) {
            for (let i = pos; i >= 1; --i) {
              this._repDistances[i] = this._repDistances[i - 1];
            }
            this._repDistances[0] = distance;
          }
        } else {
          this.encodeBit(this._isRep, this._state, 0);
          this._state = this._state < 7 ? 7 : 10;
          this.encodeLength(this._lenEncoder, len - 2, posState);
          pos -= 4;
          posSlot = this.getPosSlot(pos);
          lenToPosState = getLenToPosState(len);
          this.encodeBitTree(this._posSlotEncoder[lenToPosState], posSlot);
          if (posSlot >= 4) {
            footerBits = (posSlot >> 1) - 1;
            baseVal = (2 | posSlot & 1) << footerBits;
            posReduced = pos - baseVal;
            if (posSlot < 14) {
              this.reverseEncodeRange(baseVal - posSlot - 1, footerBits, posReduced);
            } else {
              this.encodeDirectBits(posReduced >> 4, footerBits - 4);
              this.reverseEncode(posReduced & 15);
              this._alignPriceCount += 1;
            }
          }
          distance = pos;
          for (let i = 3; i >= 1; --i) {
            this._repDistances[i] = this._repDistances[i - 1];
          }
          this._repDistances[0] = distance;
          this._matchPriceCount += 1;
        }
        this._previousByte = this._matchFinder.getIndexByte(len - 1 - this._additionalOffset);
      }
      this._additionalOffset -= len;
      this.nowPos64 += BigInt(len);
      if (!this._additionalOffset) {
        if (this._matchPriceCount >= 128) {
          this.fillDistancesPrices();
        }
        if (this._alignPriceCount >= 16) {
          this.fillAlignPrices();
        }
        this.processedInSize[0] = this.nowPos64;
        this.processedOutSize[0] = this.getProcessedSizeAdd();
        if (!this._matchFinder.getNumAvailableBytes()) {
          this.flushEncoding(Number(this.nowPos64 & 0xffffffffn));
          return;
        }
        if (this.nowPos64 - progressPosValuePrev >= 0x1000n) {
          this._finished = 0;
          this.finished[0] = 0;
          return;
        }
      }
    }
  }
  createMatchFinder() {
    if (!this._matchFinder) {
      const binTree = new BinTreeMatchFinder();
      let numHashBytes = 4;
      if (!this._matchFinderType) {
        numHashBytes = 2;
      }
      binTree.setType(numHashBytes);
      this._matchFinder = binTree;
    }
    this.createLiteralEncoder();
    if (this._dictionarySize == this._dictionarySizePrev && this._numFastBytesPrev == this._numFastBytes) {
      return;
    }
    this._matchFinder.create(this._dictionarySize, this._numFastBytes, 4096, 274);
    this._dictionarySizePrev = this._dictionarySize;
    this._numFastBytesPrev = this._numFastBytes;
  }
  writeHeaderProperties(output) {
    this.properties[0] = (this._posStateBits * 5 + this._numLiteralPosStateBits) * 9 + this._numLiteralContextBits & 255;
    for (let byteIndex = 0; byteIndex < 4; byteIndex++) {
      this.properties[1 + byteIndex] = this._dictionarySize >> 8 * byteIndex & 255;
    }
    for (let i = 0; i < 5; i++) {
      output.writeByte(this.properties[i]);
    }
  }
  initCompression(input, output, len, mode) {
    if (len < -1n) {
      throw new Error("invalid length " + len);
    }
    this.initialize();
    this.configure(mode);
    this.writeHeaderProperties(output);
    for (let i = 0; i < 64; i += 8) {
      output.writeByte(Number(len >> BigInt(i) & 0xffn) << 24 >> 24);
    }
    this._needReleaseMFStream = 0;
    this._inStream = input;
    this._finished = 0;
    this.createMatchFinder();
    this._rangeEncoder.stream = output;
    this.init();
    this.fillDistancesPrices();
    this.fillAlignPrices();
    this._lenEncoder.setTableSize(this._numFastBytes + 1 - 2);
    this._lenEncoder.updateTables(1 << this._posStateBits);
    this._repMatchLenEncoder.setTableSize(this._numFastBytes + 1 - 2);
    this._repMatchLenEncoder.updateTables(1 << this._posStateBits);
    this.nowPos64 = 0n;
  }
  compress(input, output, mode) {
    this.initCompression(input, output, BigInt(input.count), mode);
    do {
      this.codeOneBlock();
      if (this.finished[0]) {
        this.releaseStreams();
        break;
      }
    } while (true);
  }
};

// node_modules/@cjser/lzma1/lib/streams.js
var InputBuffer = class {
  buf;
  pos = 0;
  count;
  constructor(data) {
    this.buf = data;
    this.count = data.length;
  }
  readByte() {
    if (this.pos >= this.count)
      return -1;
    return this.buf[this.pos++] & 255;
  }
  readBytes(dest, off, len) {
    if (this.pos >= this.count)
      return -1;
    len = Math.min(len, this.count - this.pos);
    dest.set(this.buf.subarray(this.pos, this.pos + len), off);
    this.pos += len;
    return len;
  }
  get remaining() {
    return this.count - this.pos;
  }
};
var OutputBuffer = class {
  buf;
  count = 0;
  constructor(capacity = 32) {
    this.buf = new Uint8Array(capacity);
  }
  grow(requiredSize) {
    const newSize = Math.max(this.buf.length * 2, requiredSize);
    const newBuf = new Uint8Array(newSize);
    newBuf.set(this.buf.subarray(0, this.count));
    this.buf = newBuf;
  }
  writeByte(b) {
    if (this.count >= this.buf.length) {
      this.grow(this.count + 1);
    }
    this.buf[this.count++] = b;
  }
  writeBytes(src, off, len) {
    const requiredSize = this.count + len;
    if (requiredSize > this.buf.length) {
      this.grow(requiredSize);
    }
    this.buf.set(src.subarray(off, off + len), this.count);
    this.count += len;
  }
  write(buf) {
    this.writeBytes(buf, 0, buf.length);
  }
  toArray() {
    return this.buf.slice(0, this.count);
  }
};

// node_modules/@cjser/lzma1/lib/lzma.js
var MODES = {
  1: { searchDepth: 16, filterStrength: 64, modeIndex: 0 },
  2: { searchDepth: 20, filterStrength: 64, modeIndex: 0 },
  3: { searchDepth: 19, filterStrength: 64, modeIndex: 1 },
  4: { searchDepth: 20, filterStrength: 64, modeIndex: 1 },
  5: { searchDepth: 21, filterStrength: 128, modeIndex: 1 },
  6: { searchDepth: 22, filterStrength: 128, modeIndex: 1 },
  7: { searchDepth: 23, filterStrength: 128, modeIndex: 1 },
  8: { searchDepth: 24, filterStrength: 255, modeIndex: 1 },
  9: { searchDepth: 25, filterStrength: 255, modeIndex: 1 }
};
var LZMA = class {
  #encoder = new Encoder();
  #decoder = new Decoder();
  compress(data, mode = 5) {
    const inputData = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
    const output = new OutputBuffer(Math.max(32, Math.ceil(inputData.length * 1.2)));
    const input = new InputBuffer(inputData);
    this.#encoder.compress(input, output, MODES[mode]);
    const result = output.toArray();
    return new Int8Array(result.buffer, result.byteOffset, result.byteLength);
  }
  compressString(data, mode = 5) {
    return this.compress(new Uint8Array(this.#encodeString(data)), mode);
  }
  decompress(bytearray) {
    const inputData = bytearray instanceof ArrayBuffer ? new Uint8Array(bytearray) : bytearray;
    const output = new OutputBuffer(Math.max(32, inputData.length * 2));
    const input = new InputBuffer(inputData);
    this.#decoder.decompress(input, output);
    return output.toArray();
  }
  decompressString(bytearray) {
    const decodedByteArray = this.decompress(bytearray);
    const result = this.#decodeUTF8(decodedByteArray);
    if (typeof result === "string") {
      return result;
    }
    return String.fromCharCode(...result);
  }
  #encodeString(inputString) {
    const l = inputString.length;
    const chars = [];
    for (let i = 0; i < l; ++i) {
      chars[i] = inputString.charCodeAt(i);
    }
    const data = [];
    let elen = 0;
    for (let i = 0; i < l; ++i) {
      const ch = chars[i];
      if (ch >= 1 && ch <= 127) {
        data[elen++] = ch << 24 >> 24;
      } else if (!ch || ch >= 128 && ch <= 2047) {
        data[elen++] = (192 | ch >> 6 & 31) << 24 >> 24;
        data[elen++] = (128 | ch & 63) << 24 >> 24;
      } else {
        data[elen++] = (224 | ch >> 12 & 15) << 24 >> 24;
        data[elen++] = (128 | ch >> 6 & 63) << 24 >> 24;
        data[elen++] = (128 | ch & 63) << 24 >> 24;
      }
    }
    return data;
  }
  #decodeUTF8(utf) {
    let j = 0, x, y, z, l = utf.length, buf = [], charCodes = [];
    for (let i = 0; i < l; ++i, ++j) {
      x = utf[i] & 255;
      if (!(x & 128)) {
        if (!x)
          return utf;
        charCodes[j] = x;
      } else if ((x & 224) == 192) {
        if (i + 1 >= l)
          return String.fromCharCode(...utf);
        y = utf[++i] & 255;
        if ((y & 192) != 128)
          return String.fromCharCode(...utf);
        charCodes[j] = (x & 31) << 6 | y & 63;
      } else if ((x & 240) == 224) {
        if (i + 2 >= l)
          return utf;
        y = utf[++i] & 255;
        if ((y & 192) != 128)
          return utf;
        z = utf[++i] & 255;
        if ((z & 192) != 128)
          return utf;
        charCodes[j] = (x & 15) << 12 | (y & 63) << 6 | z & 63;
      } else {
        return utf;
      }
      if (j == 16383) {
        buf.push(String.fromCharCode.apply(String, charCodes));
        j = -1;
      }
    }
    if (j > 0) {
      charCodes.length = j;
      buf.push(String.fromCharCode.apply(String, charCodes));
    }
    return buf.join("");
  }
};

// node_modules/@cjser/lzma1/lib/index.js
function compress(data, mode = 5) {
  const input = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  const result = new LZMA().compress(input, mode);
  return new Uint8Array(result);
}
function decompress(data) {
  const input = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  const decompressedData = new LZMA().decompress(input);
  return new Uint8Array(decompressedData);
}

// node_modules/ygopro-yrp-encode/dist/index.mjs
var SEED_COUNT = 8;
var REPLAY_ID_YRP2 = 846230137;
var REPLAY_COMPRESSED_FLAG = 1;
var REPLAY_TAG_FLAG = 2;
var REPLAY_SINGLE_MODE = 8;
var DUEL_TAG_MODE = 32;
var ReplayHeader = class {
  constructor() {
    this.id = 0;
    this.version = 0;
    this.flag = 0;
    this.seed = 0;
    this.dataSizeRaw = [0, 0, 0, 0];
    this.hash = 0;
    this.props = new Array(8).fill(0);
    this.seedSequence = [];
    this.headerVersion = 0;
    this.value = new Uint8Array(15);
  }
  /** Initial deck shuffle version. Unrecognized byte values are preserved. */
  get shuffleVersion() {
    return this.props[7] ?? 0;
  }
  set shuffleVersion(version) {
    this.props[7] = version;
  }
  /** @deprecated Use value instead; this maps to value[3..7). */
  get value1() {
    return this.readValue(3);
  }
  /** @deprecated Use value instead; this maps to value[3..7). */
  set value1(v) {
    this.writeValue(3, v);
  }
  /** @deprecated Use value instead; this maps to value[7..11). */
  get value2() {
    return this.readValue(7);
  }
  /** @deprecated Use value instead; this maps to value[7..11). */
  set value2(v) {
    this.writeValue(7, v);
  }
  /** @deprecated Use value instead; this maps to value[11..15). */
  get value3() {
    return this.readValue(11);
  }
  /** @deprecated Use value instead; this maps to value[11..15). */
  set value3(v) {
    this.writeValue(11, v);
  }
  readValue(offset) {
    return ((this.value[offset] ?? 0) | (this.value[offset + 1] ?? 0) << 8 | (this.value[offset + 2] ?? 0) << 16 | (this.value[offset + 3] ?? 0) << 24) >>> 0;
  }
  writeValue(offset, v) {
    if (this.value.length !== 15) {
      const value = new Uint8Array(15);
      value.set(this.value.subarray(0, 15));
      this.value = value;
    }
    for (let i = 0; i < 4; i++) {
      this.value[offset + i] = v >>> i * 8 & 255;
    }
  }
  get dataSize() {
    return (this.dataSizeRaw[0] | 0 | (this.dataSizeRaw[1] | 0) << 8 | (this.dataSizeRaw[2] | 0) << 16 | (this.dataSizeRaw[3] | 0) << 24) >>> 0;
  }
  set dataSize(v) {
    const u = v >>> 0;
    this.dataSizeRaw = [
      u & 255,
      u >>> 8 & 255,
      u >>> 16 & 255,
      u >>> 24 & 255
    ];
  }
  get isTag() {
    return (this.flag & REPLAY_TAG_FLAG) !== 0;
  }
  get isCompressed() {
    return (this.flag & REPLAY_COMPRESSED_FLAG) !== 0;
  }
  get isSingleMode() {
    return (this.flag & REPLAY_SINGLE_MODE) !== 0;
  }
  /** Compose a standard 13-byte .lzma header (props[0..5) + uncompressed size (8 bytes LE)) */
  getLzmaHeader13() {
    const out = new Uint8Array(13);
    out.set(Uint8Array.from(this.props.slice(0, 5)), 0);
    out.set(Uint8Array.from(this.dataSizeRaw.slice(0, 4)), 5);
    out[9] = 0;
    out[10] = 0;
    out[11] = 0;
    out[12] = 0;
    return out;
  }
};
function concatBytes(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}
function u8ToI32(u) {
  return u | 0;
}
function createDeck(init) {
  const Deck = typeof YGOProDeck === "function" ? YGOProDeck : YGOProDeck.default;
  return new Deck(init);
}
var MAX_RESPONSE_LENGTH = 255;
function readHeader(r) {
  const h = new ReplayHeader();
  h.id = r.readUInt32();
  h.version = r.readUInt32();
  h.flag = r.readUInt32();
  h.seed = r.readUInt32();
  h.dataSizeRaw = r.readByteArray(4);
  h.hash = r.readUInt32();
  h.props = r.readByteArray(8);
  if (h.id === REPLAY_ID_YRP2) {
    h.seedSequence = [];
    for (let i = 0; i < SEED_COUNT; i++) h.seedSequence.push(r.readUInt32());
    h.headerVersion = r.readUInt8();
    h.value = new Uint8Array(r.readBytes(15));
  }
  return h;
}
function writeHeader(w, h) {
  w.writeUInt32(h.id);
  w.writeUInt32(h.version);
  w.writeUInt32(h.flag);
  w.writeUInt32(h.seed);
  w.writeByteArray(h.dataSizeRaw);
  w.writeUInt32(h.hash);
  const props8 = new Array(8).fill(0).map((_, i) => (h.props[i] ?? 0) & 255);
  w.writeByteArray(props8);
  if (h.id === REPLAY_ID_YRP2) {
    for (let i = 0; i < SEED_COUNT; i++) w.writeUInt32(h.seedSequence[i] ?? 0);
    w.writeUInt8(h.headerVersion);
    for (let i = 0; i < 15; i++) w.writeUInt8(h.value[i] ?? 0);
  }
}
function decompressBody(h, rawBody) {
  const lzmaPayload = concatBytes(h.getLzmaHeader13(), rawBody);
  return decompress(lzmaPayload);
}
function readDeckPack(r) {
  const len = r.readInt32();
  const out = [];
  for (let i = 0; i < len; i++) out.push(r.readInt32());
  return out;
}
function readDeck(r) {
  const deck = createDeck();
  deck.main = readDeckPack(r);
  deck.extra = readDeckPack(r);
  return deck;
}
function writeDeckPack(w, pack) {
  w.writeInt32(u8ToI32(pack.length));
  for (const id of pack) w.writeInt32(id | 0);
}
function writeDeck(w, d) {
  if (!d) {
    w.writeInt32(0);
    w.writeInt32(0);
    return;
  }
  writeDeckPack(w, d.main ?? []);
  writeDeckPack(w, d.extra ?? []);
}
function readResponses(r) {
  const out = [];
  while (r.remaining > 0) {
    try {
      const len = r.readUInt8();
      if (len === 0 || r.remaining < len) break;
      out.push(r.readBytes(len));
    } catch {
      break;
    }
  }
  return out;
}
function writeResponses(w, res) {
  for (const seg of res) {
    if (seg.length === 0 || seg.length > MAX_RESPONSE_LENGTH) continue;
    w.writeUInt8(seg.length);
    w.writeBytes(seg);
  }
}
function decodeUtf16leZ(bytes) {
  let end = bytes.length;
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    if (bytes[i] === 0 && bytes[i + 1] === 0) {
      end = i;
      break;
    }
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes.subarray(0, end)).toString("utf16le");
  }
  const TD = globalThis.TextDecoder;
  if (TD) {
    try {
      return new TD("utf-16le").decode(bytes.subarray(0, end));
    } catch {
    }
  }
  const codeUnits = [];
  for (let i = 0; i + 1 < end; i += 2) {
    codeUnits.push(bytes[i] | bytes[i + 1] << 8);
  }
  return String.fromCharCode(...codeUnits);
}
function encodeUtf16le(s) {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(s, "utf16le"));
  }
  const out = new Uint8Array(s.length * 2);
  for (let i = 0; i < s.length; i++) {
    const cu = s.charCodeAt(i);
    out[i * 2] = cu & 255;
    out[i * 2 + 1] = cu >>> 8 & 255;
  }
  return out;
}
var ByteReader = class {
  constructor(buf) {
    this.buf = buf;
    this.ptr = 0;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  get remaining() {
    return this.buf.length - this.ptr;
  }
  readUInt8() {
    const v = this.view.getUint8(this.ptr);
    this.ptr += 1;
    return v;
  }
  readInt8() {
    const v = this.view.getInt8(this.ptr);
    this.ptr += 1;
    return v;
  }
  readUInt16() {
    const v = this.view.getUint16(this.ptr, true);
    this.ptr += 2;
    return v;
  }
  readInt16() {
    const v = this.view.getInt16(this.ptr, true);
    this.ptr += 2;
    return v;
  }
  readUInt32() {
    const v = this.view.getUint32(this.ptr, true);
    this.ptr += 4;
    return v >>> 0;
  }
  readInt32() {
    const v = this.view.getInt32(this.ptr, true);
    this.ptr += 4;
    return v | 0;
  }
  readBytes(len) {
    if (this.ptr + len > this.buf.length) {
      throw new Error(
        `readBytes out of range: want=${len}, remaining=${this.remaining}`
      );
    }
    const out = this.buf.subarray(this.ptr, this.ptr + len);
    this.ptr += len;
    return out;
  }
  readByteArray(len) {
    const b = this.readBytes(len);
    return Array.from(b);
  }
  readAll() {
    return this.buf.subarray(this.ptr);
  }
  /** fixed-size UTF-16LE string, null-terminated */
  readStringUtf16le(byteLen) {
    const raw = this.readBytes(byteLen);
    return decodeUtf16leZ(raw);
  }
};
var ByteWriter = class {
  constructor(initialSize = 256) {
    this.ptr = 0;
    this.buf = new Uint8Array(initialSize);
    this.view = new DataView(this.buf.buffer);
  }
  ensure(n) {
    const need = this.ptr + n;
    if (need <= this.buf.length) return;
    let next = this.buf.length;
    while (next < need) next = Math.max(256, next * 2);
    const nb = new Uint8Array(next);
    nb.set(this.buf, 0);
    this.buf = nb;
    this.view = new DataView(this.buf.buffer);
  }
  get length() {
    return this.ptr;
  }
  toUint8Array() {
    return this.buf.subarray(0, this.ptr);
  }
  writeUInt8(v) {
    this.ensure(1);
    this.view.setUint8(this.ptr, v & 255);
    this.ptr += 1;
  }
  writeInt32(v) {
    this.ensure(4);
    this.view.setInt32(this.ptr, v | 0, true);
    this.ptr += 4;
  }
  writeUInt16(v) {
    this.ensure(2);
    this.view.setUint16(this.ptr, v & 65535, true);
    this.ptr += 2;
  }
  writeUInt32(v) {
    this.ensure(4);
    this.view.setUint32(this.ptr, v >>> 0, true);
    this.ptr += 4;
  }
  writeBytes(bytes) {
    this.ensure(bytes.length);
    this.buf.set(bytes, this.ptr);
    this.ptr += bytes.length;
  }
  writeByteArray(values) {
    for (const v of values) this.writeUInt8(v);
  }
  /** fixed-size UTF-16LE string, zero-padded */
  writeStringUtf16leFixed(s, byteLen) {
    const raw = encodeUtf16le(s);
    const out = new Uint8Array(byteLen);
    out.set(raw.subarray(0, Math.min(raw.length, byteLen)));
    this.writeBytes(out);
  }
};
function decodeUtf8(bytes) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("utf8");
  }
  const TD = globalThis.TextDecoder;
  if (TD) {
    return new TD("utf-8").decode(bytes);
  }
  return String.fromCharCode(...bytes);
}
function encodeUtf8(s) {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(s, "utf8"));
  }
  const TE = globalThis.TextEncoder;
  if (TE) {
    return new TE().encode(s);
  }
  return Uint8Array.from(s.split("").map((c) => c.charCodeAt(0)));
}
var YGOProYrp = class {
  constructor(init = {}) {
    this.header = null;
    this.hostName = "";
    this.clientName = "";
    this.startLp = 0;
    this.startHand = 0;
    this.drawCount = 0;
    this.opt = 0;
    this.hostDeck = null;
    this.clientDeck = null;
    this.tagHostName = null;
    this.tagClientName = null;
    this.tagHostDeck = null;
    this.tagClientDeck = null;
    this.singleScript = null;
    this.responses = [];
    if (init.header) {
      const h = new ReplayHeader();
      h.id = init.header.id ?? 0;
      h.version = init.header.version ?? 0;
      h.flag = init.header.flag ?? 0;
      h.seed = init.header.seed ?? 0;
      h.dataSizeRaw = [...init.header.dataSizeRaw ?? [0, 0, 0, 0]];
      h.hash = init.header.hash ?? 0;
      h.props = [...init.header.props ?? []];
      h.seedSequence = [...init.header.seedSequence ?? []];
      const headerVersion = init.header.headerVersion ?? 0;
      h.headerVersion = headerVersion & 255;
      if (init.header.value) {
        h.value.set(init.header.value.subarray(0, 15));
      } else {
        for (let i = 0; i < 3; i++)
          h.value[i] = headerVersion >>> (i + 1) * 8 & 255;
        h.value1 = init.header.value1 ?? 0;
        h.value2 = init.header.value2 ?? 0;
        h.value3 = init.header.value3 ?? 0;
      }
      this.header = h;
    } else if (init.header === null) {
      this.header = null;
    }
    if (init.hostName !== void 0) this.hostName = init.hostName;
    if (init.clientName !== void 0) this.clientName = init.clientName;
    if (init.startLp !== void 0) this.startLp = init.startLp;
    if (init.startHand !== void 0) this.startHand = init.startHand;
    if (init.drawCount !== void 0) this.drawCount = init.drawCount;
    if (init.opt !== void 0) this.opt = init.opt;
    if (init.hostDeck) {
      this.hostDeck = createDeck({
        main: [...init.hostDeck.main ?? []],
        extra: [...init.hostDeck.extra ?? []],
        side: [...init.hostDeck.side ?? []],
        name: init.hostDeck.name
      });
    } else if (init.hostDeck === null) {
      this.hostDeck = null;
    }
    if (init.clientDeck) {
      this.clientDeck = createDeck({
        main: [...init.clientDeck.main ?? []],
        extra: [...init.clientDeck.extra ?? []],
        side: [...init.clientDeck.side ?? []],
        name: init.clientDeck.name
      });
    } else if (init.clientDeck === null) {
      this.clientDeck = null;
    }
    if (init.tagHostName !== void 0) this.tagHostName = init.tagHostName;
    if (init.tagClientName !== void 0)
      this.tagClientName = init.tagClientName;
    if (init.tagHostDeck) {
      this.tagHostDeck = createDeck({
        main: [...init.tagHostDeck.main ?? []],
        extra: [...init.tagHostDeck.extra ?? []],
        side: [...init.tagHostDeck.side ?? []],
        name: init.tagHostDeck.name
      });
    } else if (init.tagHostDeck === null) {
      this.tagHostDeck = null;
    }
    if (init.tagClientDeck) {
      this.tagClientDeck = createDeck({
        main: [...init.tagClientDeck.main ?? []],
        extra: [...init.tagClientDeck.extra ?? []],
        side: [...init.tagClientDeck.side ?? []],
        name: init.tagClientDeck.name
      });
    } else if (init.tagClientDeck === null) {
      this.tagClientDeck = null;
    }
    if (init.singleScript !== void 0) this.singleScript = init.singleScript;
    if (init.responses)
      this.responses = init.responses.map((seg) => new Uint8Array(seg));
  }
  get isTag() {
    return this.header?.isTag ?? false;
  }
  get isCompressed() {
    return this.header?.isCompressed ?? false;
  }
  get isSingleMode() {
    return this.header?.isSingleMode ?? false;
  }
  /** Parse .yrp/.yrp2 bytes */
  fromYrp(payload) {
    const r0 = new ByteReader(payload);
    const h = readHeader(r0);
    const rawBody = r0.readAll();
    const body = h.isCompressed ? decompressBody(h, rawBody) : rawBody;
    const r = new ByteReader(body);
    this.header = h;
    this.hostName = r.readStringUtf16le(40);
    if (h.isTag) {
      this.tagHostName = r.readStringUtf16le(40);
      this.tagClientName = r.readStringUtf16le(40);
    } else {
      this.tagHostName = null;
      this.tagClientName = null;
    }
    this.clientName = r.readStringUtf16le(40);
    this.startLp = r.readInt32();
    this.startHand = r.readInt32();
    this.drawCount = r.readInt32();
    this.opt = r.readInt32();
    const isTagFromHeader = h.isTag;
    const isTagFromOpt = (this.opt & DUEL_TAG_MODE) !== 0;
    if (isTagFromHeader !== isTagFromOpt) {
      throw new Error("Replay tag flag mismatch between header and params.");
    }
    if (h.isSingleMode) {
      const slen = r.readUInt16();
      if (slen === 0 || slen > 255)
        throw new Error("Invalid single mode script length.");
      const raw = r.readBytes(slen);
      const filename = decodeUtf8(raw);
      if (!filename.startsWith("./single/"))
        throw new Error("Invalid single mode script path.");
      const scriptName = filename.slice(9);
      if (scriptName.includes("/") || scriptName.includes("\\")) {
        throw new Error("Invalid single mode script name.");
      }
      this.singleScript = scriptName;
      this.hostDeck = null;
      this.clientDeck = null;
      this.tagHostDeck = null;
      this.tagClientDeck = null;
    } else {
      this.singleScript = null;
      this.hostDeck = readDeck(r);
      if (h.isTag) {
        this.tagHostDeck = readDeck(r);
        this.tagClientDeck = readDeck(r);
      } else {
        this.tagHostDeck = null;
        this.tagClientDeck = null;
      }
      this.clientDeck = readDeck(r);
    }
    this.responses = readResponses(r);
    return this;
  }
  /** Serialize to .yrp/.yrp2 bytes (Uint8Array) */
  toYrp() {
    if (!this.header)
      throw new Error(
        "Header not initialized. Call fromYrp() or set header first."
      );
    const isTagFromHeader = this.header.isTag;
    const isTagFromOpt = (this.opt & DUEL_TAG_MODE) !== 0;
    if (isTagFromHeader !== isTagFromOpt) {
      throw new Error("Replay tag flag mismatch between header and params.");
    }
    const w = new ByteWriter(1024);
    w.writeStringUtf16leFixed(this.hostName ?? "", 40);
    if (this.header.isTag) {
      w.writeStringUtf16leFixed(this.tagHostName ?? "", 40);
      w.writeStringUtf16leFixed(this.tagClientName ?? "", 40);
    }
    w.writeStringUtf16leFixed(this.clientName ?? "", 40);
    w.writeInt32(this.startLp);
    w.writeInt32(this.startHand);
    w.writeInt32(this.drawCount);
    w.writeInt32(this.opt);
    if (this.header.isSingleMode) {
      if (!this.singleScript)
        throw new Error("singleScript is required for single mode replay.");
      if (this.singleScript.includes("/") || this.singleScript.includes("\\")) {
        throw new Error("Invalid single mode script name.");
      }
      const filename = `./single/${this.singleScript}`;
      const raw = encodeUtf8(filename);
      if (raw.length === 0 || raw.length > 255)
        throw new Error("Invalid single mode script length.");
      w.writeUInt16(raw.length);
      w.writeBytes(raw);
    } else {
      writeDeck(w, this.hostDeck);
      if (this.header.isTag) {
        writeDeck(w, this.tagHostDeck);
        writeDeck(w, this.tagClientDeck);
      }
      writeDeck(w, this.clientDeck);
    }
    writeResponses(w, this.responses);
    const bodyRaw = w.toUint8Array();
    this.header.dataSize = bodyRaw.length;
    let bodyOut = bodyRaw;
    if (this.header.isCompressed) {
      const compressedFull = compress(bodyRaw);
      if (compressedFull.length < 13)
        throw new Error("Invalid LZMA output: too short.");
      const props5 = compressedFull.subarray(0, 5);
      const newProps8 = new Array(8).fill(0);
      for (let i = 0; i < 5; i++) newProps8[i] = props5[i];
      for (let i = 5; i < 8; i++)
        newProps8[i] = (this.header.props[i] ?? 0) & 255;
      this.header.props = newProps8;
      bodyOut = compressedFull.subarray(13);
    }
    const hw = new ByteWriter(this.header.id === REPLAY_ID_YRP2 ? 96 : 64);
    writeHeader(hw, this.header);
    const headerBytes = hw.toUint8Array();
    return concatBytes(headerBytes, bodyOut);
  }
};

// node_modules/ygopro-msg-encode/dist/index.mjs
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp2(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc2(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp2(target, key, result);
  return result;
};
var Metadata = new Reflector();
var reflector = new Reflector();
var BinaryField = /* @__PURE__ */ __name((type, offset, length, options) => {
  if ((type === "utf8" || type === "utf16") && length == null) {
    throw new Error(`String type ${type} requires length parameter`);
  }
  const enumDefinition = options?.enum;
  const enumValues = enumDefinition && new Set(
    Object.entries(enumDefinition).filter(([key, value]) => {
      const member = typeof value === "string" && enumDefinition[value];
      return typeof member !== "number" || String(member) !== key;
    }).map(([, value]) => value)
  );
  return Metadata.set(
    "binaryField",
    { type, offset, length, enumValues },
    "binaryFieldKeys"
  );
}, "BinaryField");
var isStaticInfo = /* @__PURE__ */ __name((info) => typeof info.offset === "number" && (info.length == null || typeof info.length === "number"), "isStaticInfo");
var resolveLength = /* @__PURE__ */ __name((obj, length, key) => {
  return typeof length === "number" ? length : length(obj, key);
}, "resolveLength");
var getTypeSize = /* @__PURE__ */ __name((type) => {
  switch (type) {
    case "i8":
    case "u8":
      return 1;
    case "i16":
    case "u16":
      return 2;
    case "i32":
    case "u32":
      return 4;
    default:
      return 0;
  }
}, "getTypeSize");
var validateEnum = /* @__PURE__ */ __name((key, info, value) => {
  if (info.enumValues && !info.enumValues.has(value)) {
    throw new Error(`Invalid enum value for binary field ${key}: ${value}`);
  }
  return value;
}, "validateEnum");
var getFieldInfos = /* @__PURE__ */ __name((objOrClass) => {
  const fields = reflector.getArray("binaryFieldKeys", objOrClass).map((key) => ({
    key,
    info: reflector.get("binaryField", objOrClass, key)
  })).filter((s) => s.info);
  const staticInfos = fields.filter((s) => isStaticInfo(s.info));
  const dynamicInfos = fields.filter((s) => !isStaticInfo(s.info));
  return { fields, staticInfos, dynamicInfos };
}, "getFieldInfos");
var fillBinaryFields = /* @__PURE__ */ __name((obj, data, useClass) => {
  const { staticInfos, dynamicInfos } = getFieldInfos(useClass || obj);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const utf8Decoder2 = new TextDecoder("utf-8");
  const utf16Decoder = new TextDecoder("utf-16le");
  let totalSize = 0;
  const readValue = /* @__PURE__ */ __name((type, offset) => {
    const typeSize = getTypeSize(type);
    if (offset + typeSize > data.length) {
      throw new Error(
        `Data too short: need ${offset + typeSize} bytes, got ${data.length} bytes`
      );
    }
    switch (type) {
      case "i8":
        return view.getInt8(offset);
      case "u8":
        return view.getUint8(offset);
      case "i16":
        return view.getInt16(offset, true);
      case "u16":
        return view.getUint16(offset, true);
      case "i32":
        return view.getInt32(offset, true);
      case "u32":
        return view.getUint32(offset, true);
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }, "readValue");
  const readString = /* @__PURE__ */ __name((type, offset, byteLength) => {
    if (offset + byteLength > data.length) {
      throw new Error(
        `Data too short: need ${offset + byteLength} bytes, got ${data.length} bytes`
      );
    }
    const bytes = data.slice(offset, offset + byteLength);
    let nullIndex = -1;
    if (type === "utf8") {
      nullIndex = bytes.indexOf(0);
    } else if (type === "utf16") {
      for (let i = 0; i < bytes.length - 1; i += 2) {
        if (bytes[i] === 0 && bytes[i + 1] === 0) {
          nullIndex = i;
          break;
        }
      }
    }
    const actualBytes = nullIndex >= 0 ? bytes.slice(0, nullIndex) : bytes;
    if (type === "utf8") {
      return utf8Decoder2.decode(actualBytes);
    } else if (type === "utf16") {
      return utf16Decoder.decode(actualBytes);
    }
    throw new Error(`Unknown string type: ${type}`);
  }, "readString");
  const parseField = /* @__PURE__ */ __name((key, info) => {
    const offset = resolveLength(obj, info.offset, key);
    const type = info.type;
    if (typeof type === "function") {
      const Constructor = type();
      if (info.length != null) {
        const length = resolveLength(obj, info.length, key);
        const array = [];
        let currentOffset = offset;
        for (let i = 0; i < length; i++) {
          if (currentOffset >= data.length) {
            throw new Error(
              `Data too short: need more bytes for object array at offset ${currentOffset}, got ${data.length} bytes`
            );
          }
          const instance = new Constructor();
          const elementData = data.slice(currentOffset);
          const size = fillBinaryFields(instance, elementData, Constructor);
          array.push(instance);
          currentOffset += size;
        }
        obj[key] = array;
        totalSize = Math.max(totalSize, currentOffset);
      } else {
        if (offset >= data.length) {
          throw new Error(
            `Data too short: need more bytes for object at offset ${offset}, got ${data.length} bytes`
          );
        }
        const instance = new Constructor();
        const elementData = data.slice(offset);
        const size = fillBinaryFields(instance, elementData, Constructor);
        obj[key] = instance;
        totalSize = Math.max(totalSize, offset + size);
      }
      return;
    }
    if (type === "utf8" || type === "utf16") {
      const lengthValue = resolveLength(obj, info.length, key);
      const byteLength = type === "utf16" ? lengthValue * 2 : lengthValue;
      obj[key] = validateEnum(
        key,
        info,
        readString(type, offset, byteLength)
      );
      totalSize = Math.max(totalSize, offset + byteLength);
      return;
    }
    const typeStr = type;
    const typeSize = getTypeSize(typeStr);
    if (info.length != null) {
      const length = resolveLength(obj, info.length, key);
      const array = [];
      for (let i = 0; i < length; i++) {
        array.push(
          validateEnum(key, info, readValue(typeStr, offset + i * typeSize))
        );
      }
      obj[key] = array;
      totalSize = Math.max(totalSize, offset + length * typeSize);
    } else {
      obj[key] = validateEnum(key, info, readValue(typeStr, offset));
      totalSize = Math.max(totalSize, offset + typeSize);
    }
  }, "parseField");
  for (const { key, info } of staticInfos) {
    parseField(key, info);
  }
  for (const { key, info } of dynamicInfos) {
    parseField(key, info);
  }
  return totalSize;
}, "fillBinaryFields");
var toBinaryFields = /* @__PURE__ */ __name((obj, useClass) => {
  const { staticInfos, dynamicInfos } = getFieldInfos(useClass || obj);
  if (staticInfos.length === 0 && dynamicInfos.length === 0) {
    return new Uint8Array(0);
  }
  let totalSize = 0;
  for (const { key, info } of [...staticInfos, ...dynamicInfos]) {
    const offset = resolveLength(obj, info.offset, key);
    const type = info.type;
    if (typeof type === "function") {
      const Constructor = type();
      const value = obj[key];
      if (info.length != null) {
        const length = resolveLength(obj, info.length, key);
        let currentOffset = offset;
        for (let i = 0; i < length; i++) {
          if (value && value[i]) {
            const itemData = toBinaryFields(value[i], Constructor);
            currentOffset += itemData.length;
          }
        }
        totalSize = Math.max(totalSize, currentOffset);
      } else {
        if (value) {
          const itemData = toBinaryFields(value, Constructor);
          totalSize = Math.max(totalSize, offset + itemData.length);
        }
      }
    } else if (type === "utf8" || type === "utf16") {
      const lengthValue = resolveLength(obj, info.length, key);
      const byteLength = type === "utf16" ? lengthValue * 2 : lengthValue;
      totalSize = Math.max(totalSize, offset + byteLength);
    } else {
      const typeSize = getTypeSize(type);
      if (info.length != null) {
        const length = resolveLength(obj, info.length, key);
        totalSize = Math.max(totalSize, offset + length * typeSize);
      } else {
        totalSize = Math.max(totalSize, offset + typeSize);
      }
    }
  }
  const data = new Uint8Array(totalSize);
  const view = new DataView(data.buffer);
  const utf8Encoder2 = new TextEncoder();
  const writeValue = /* @__PURE__ */ __name((type, offset, value) => {
    switch (type) {
      case "i8":
        view.setInt8(offset, value);
        break;
      case "u8":
        view.setUint8(offset, value);
        break;
      case "i16":
        view.setInt16(offset, value, true);
        break;
      case "u16":
        view.setUint16(offset, value, true);
        break;
      case "i32":
        view.setInt32(offset, value, true);
        break;
      case "u32":
        view.setUint32(offset, value, true);
        break;
    }
  }, "writeValue");
  const writeString = /* @__PURE__ */ __name((type, offset, byteLength, value) => {
    if (type === "utf8") {
      const encoded = utf8Encoder2.encode(value);
      const len = Math.min(encoded.length, byteLength);
      data.set(encoded.slice(0, len), offset);
    } else if (type === "utf16") {
      for (let i = 0; i < Math.min(value.length, byteLength / 2); i++) {
        view.setUint16(offset + i * 2, value.charCodeAt(i), true);
      }
    }
  }, "writeString");
  const writeField = /* @__PURE__ */ __name((key, info) => {
    const offset = resolveLength(obj, info.offset, key);
    const type = info.type;
    const value = obj[key];
    if (value == null && !info.enumValues) {
      return;
    }
    if (typeof type === "function") {
      const Constructor = type();
      if (info.length != null) {
        const length = resolveLength(obj, info.length, key);
        let currentOffset = offset;
        for (let i = 0; i < length; i++) {
          if (value && i < value.length && value[i]) {
            const itemData = toBinaryFields(value[i], Constructor);
            data.set(itemData, currentOffset);
            currentOffset += itemData.length;
          } else {
            const emptyInstance = new Constructor();
            const itemData = toBinaryFields(emptyInstance, Constructor);
            currentOffset += itemData.length;
          }
        }
      } else {
        const itemData = toBinaryFields(value, Constructor);
        data.set(itemData, offset);
      }
      return;
    }
    if (type === "utf8" || type === "utf16") {
      const lengthValue = resolveLength(obj, info.length, key);
      const byteLength = type === "utf16" ? lengthValue * 2 : lengthValue;
      validateEnum(key, info, value ?? "");
      if (value != null) {
        writeString(type, offset, byteLength, value);
      }
      return;
    }
    const typeStr = type;
    const typeSize = getTypeSize(typeStr);
    if (info.length != null) {
      const length = resolveLength(obj, info.length, key);
      for (let i = 0; i < length; i++) {
        const item = value && i < value.length ? value[i] : void 0;
        validateEnum(key, info, item ?? 0);
        if (item != null) {
          writeValue(typeStr, offset + i * typeSize, item);
        }
      }
    } else {
      validateEnum(key, info, value ?? 0);
      if (value != null) {
        writeValue(typeStr, offset, value);
      }
    }
  }, "writeField");
  for (const { key, info } of staticInfos) {
    writeField(key, info);
  }
  for (const { key, info } of dynamicInfos) {
    writeField(key, info);
  }
  return data;
}, "toBinaryFields");
var HandResult = /* @__PURE__ */ ((HandResult2) => {
  HandResult2[HandResult2["ROCK"] = 1] = "ROCK";
  HandResult2[HandResult2["SCISSORS"] = 2] = "SCISSORS";
  HandResult2[HandResult2["PAPER"] = 3] = "PAPER";
  return HandResult2;
})(HandResult || {});
var TurnPlayerResult = /* @__PURE__ */ ((TurnPlayerResult2) => {
  TurnPlayerResult2[TurnPlayerResult2["SECOND"] = 0] = "SECOND";
  TurnPlayerResult2[TurnPlayerResult2["FIRST"] = 1] = "FIRST";
  return TurnPlayerResult2;
})(TurnPlayerResult || {});
var NetPlayerType = /* @__PURE__ */ ((NetPlayerType2) => {
  NetPlayerType2[NetPlayerType2["PLAYER1"] = 0] = "PLAYER1";
  NetPlayerType2[NetPlayerType2["PLAYER2"] = 1] = "PLAYER2";
  NetPlayerType2[NetPlayerType2["PLAYER3"] = 2] = "PLAYER3";
  NetPlayerType2[NetPlayerType2["PLAYER4"] = 3] = "PLAYER4";
  NetPlayerType2[NetPlayerType2["PLAYER5"] = 4] = "PLAYER5";
  NetPlayerType2[NetPlayerType2["PLAYER6"] = 5] = "PLAYER6";
  NetPlayerType2[NetPlayerType2["OBSERVER"] = 7] = "OBSERVER";
  return NetPlayerType2;
})(NetPlayerType || {});
var GameMode = /* @__PURE__ */ ((GameMode2) => {
  GameMode2[GameMode2["SINGLE"] = 0] = "SINGLE";
  GameMode2[GameMode2["MATCH"] = 1] = "MATCH";
  GameMode2[GameMode2["TAG"] = 2] = "TAG";
  return GameMode2;
})(GameMode || {});
var ErrorMessageType = /* @__PURE__ */ ((ErrorMessageType2) => {
  ErrorMessageType2[ErrorMessageType2["JOINERROR"] = 1] = "JOINERROR";
  ErrorMessageType2[ErrorMessageType2["DECKERROR"] = 2] = "DECKERROR";
  ErrorMessageType2[ErrorMessageType2["SIDEERROR"] = 3] = "SIDEERROR";
  ErrorMessageType2[ErrorMessageType2["VERERROR"] = 4] = "VERERROR";
  return ErrorMessageType2;
})(ErrorMessageType || {});
var RoomStatus = /* @__PURE__ */ ((RoomStatus2) => {
  RoomStatus2[RoomStatus2["WAITING"] = 0] = "WAITING";
  RoomStatus2[RoomStatus2["DUELING"] = 1] = "DUELING";
  RoomStatus2[RoomStatus2["SIDING"] = 2] = "SIDING";
  return RoomStatus2;
})(RoomStatus || {});
var HostInfo = class {
  static {
    __name(this, "HostInfo");
  }
};
__decorateClass([
  BinaryField("u32", 0)
], HostInfo.prototype, "lflist", 2);
__decorateClass([
  BinaryField("u8", 4)
], HostInfo.prototype, "rule", 2);
__decorateClass([
  BinaryField("u8", 5, void 0, { enum: GameMode })
], HostInfo.prototype, "mode", 2);
__decorateClass([
  BinaryField("u8", 6)
], HostInfo.prototype, "duel_rule", 2);
__decorateClass([
  BinaryField("u8", 7)
], HostInfo.prototype, "no_check_deck", 2);
__decorateClass([
  BinaryField("u8", 8)
], HostInfo.prototype, "no_shuffle_deck", 2);
__decorateClass([
  BinaryField("i32", 12)
], HostInfo.prototype, "start_lp", 2);
__decorateClass([
  BinaryField("u8", 16)
], HostInfo.prototype, "start_hand", 2);
__decorateClass([
  BinaryField("u8", 17)
], HostInfo.prototype, "draw_count", 2);
__decorateClass([
  BinaryField("u16", 18)
], HostInfo.prototype, "time_limit", 2);
var PayloadBase = class {
  static {
    __name(this, "PayloadBase");
  }
  static {
    this.identifier = 0;
  }
  get identifier() {
    return this.constructor.identifier;
  }
  fromPartial(data) {
    const safeData = typeof globalThis.structuredClone === "function" ? globalThis.structuredClone(data) : JSON.parse(JSON.stringify(data));
    Object.assign(this, safeData);
    return this;
  }
  fromPayload(data) {
    fillBinaryFields(this, data);
    return this;
  }
  toPayload() {
    return toBinaryFields(this);
  }
  copy() {
    const Constructor = this.constructor;
    const copied = new Constructor();
    return copied.fromPartial(this);
  }
};
var OcgcoreCommonConstants = {
  ACTIVITY_ATTACK: 5,
  ACTIVITY_BATTLE_PHASE: 6,
  ACTIVITY_CHAIN: 7,
  ACTIVITY_FLIPSUMMON: 4,
  ACTIVITY_NORMALSUMMON: 2,
  ACTIVITY_SPSUMMON: 3,
  ACTIVITY_SUMMON: 1,
  ATTRIBUTES_COUNT: 7,
  ATTRIBUTE_ALL: 127,
  ATTRIBUTE_DARK: 32,
  ATTRIBUTE_DEVINE: 64,
  ATTRIBUTE_EARTH: 1,
  ATTRIBUTE_FIRE: 4,
  ATTRIBUTE_LIGHT: 16,
  ATTRIBUTE_WATER: 2,
  ATTRIBUTE_WIND: 8,
  CARDDATA_ALIAS: 2,
  CARDDATA_ATTACK: 8,
  CARDDATA_ATTRIBUTE: 6,
  CARDDATA_CODE: 1,
  CARDDATA_DEFENSE: 9,
  CARDDATA_LEVEL: 5,
  CARDDATA_LINK_MARKER: 12,
  CARDDATA_LSCALE: 10,
  CARDDATA_RACE: 7,
  CARDDATA_RSCALE: 11,
  CARDDATA_SETCODE: 3,
  CARDDATA_TYPE: 4,
  CHINT_ATTRIBUTE: 4,
  CHINT_CARD: 2,
  CHINT_DESC_ADD: 6,
  CHINT_DESC_REMOVE: 7,
  CHINT_NUMBER: 5,
  CHINT_RACE: 3,
  CHINT_TURN: 1,
  CTOS_CHAT: 22,
  CTOS_CREATE_GAME: 17,
  CTOS_EXTERNAL_ADDRESS: 23,
  CTOS_HAND_RESULT: 3,
  CTOS_HS_KICK: 36,
  CTOS_HS_NOTREADY: 35,
  CTOS_HS_READY: 34,
  CTOS_HS_START: 37,
  CTOS_HS_TODUELIST: 32,
  CTOS_HS_TOOBSERVER: 33,
  CTOS_JOIN_GAME: 18,
  CTOS_LEAVE_GAME: 19,
  CTOS_PLAYER_INFO: 16,
  CTOS_REQUEST_FIELD: 48,
  CTOS_RESPONSE: 1,
  CTOS_SURRENDER: 20,
  CTOS_TIME_CONFIRM: 21,
  CTOS_TP_RESULT: 4,
  CTOS_UPDATE_DECK: 2,
  CURRENT_RULE: 5,
  DECKERROR_CARDCOUNT: 5,
  DECKERROR_EXTRACOUNT: 7,
  DECKERROR_LFLIST: 1,
  DECKERROR_MAINCOUNT: 6,
  DECKERROR_NOTAVAIL: 9,
  DECKERROR_OCGONLY: 2,
  DECKERROR_SIDECOUNT: 8,
  DECKERROR_TCGONLY: 3,
  DECKERROR_UNKNOWNCARD: 4,
  DUEL_ATTACK_FIRST_TURN: 2,
  DUEL_OBSOLETE_RULING: 8,
  DUEL_PSEUDO_SHUFFLE: 16,
  DUEL_RETURN_DECK_TOP: 128,
  DUEL_REVEAL_DECK_SEQ: 256,
  DUEL_SIMPLE_AI: 64,
  DUEL_STAGE_BEGIN: 0,
  DUEL_STAGE_DUELING: 3,
  DUEL_STAGE_END: 5,
  DUEL_STAGE_FINGER: 1,
  DUEL_STAGE_FIRSTGO: 2,
  DUEL_STAGE_SIDING: 4,
  DUEL_TAG_MODE: 32,
  DUEL_TEST_MODE: 1,
  EDESC_OPERATION: 1,
  EDESC_RESET: 2,
  ERRMSG_DECKERROR: 2,
  ERRMSG_JOINERROR: 1,
  ERRMSG_SIDEERROR: 3,
  ERRMSG_VERERROR: 4,
  FALSE: 0,
  GETEFFECT_ALL: 15,
  GETEFFECT_COPY: 4,
  GETEFFECT_GAIN: 2,
  GETEFFECT_GRANT: 8,
  GETEFFECT_INITIAL: 1,
  HINT_ATTRIB: 7,
  HINT_CARD: 10,
  HINT_CODE: 8,
  HINT_EFFECT: 5,
  HINT_EVENT: 1,
  HINT_MESSAGE: 2,
  HINT_MUSIC: 21,
  HINT_MUSIC_OGG: 23,
  HINT_NUMBER: 9,
  HINT_OPSELECTED: 4,
  HINT_RACE: 6,
  HINT_SELECTMSG: 3,
  HINT_SOUND: 22,
  HINT_ZONE: 11,
  LINK_MARKER_BOTTOM: 2,
  LINK_MARKER_BOTTOM_LEFT: 1,
  LINK_MARKER_BOTTOM_RIGHT: 4,
  LINK_MARKER_LEFT: 8,
  LINK_MARKER_RIGHT: 32,
  LINK_MARKER_TOP: 128,
  LINK_MARKER_TOP_LEFT: 64,
  LINK_MARKER_TOP_RIGHT: 256,
  LOCATION_DECK: 1,
  LOCATION_DECKBOT: 65537,
  LOCATION_DECKSHF: 131073,
  LOCATION_EXTRA: 64,
  LOCATION_FZONE: 256,
  LOCATION_GRAVE: 16,
  LOCATION_HAND: 2,
  LOCATION_MZONE: 4,
  LOCATION_ONFIELD: 12,
  LOCATION_OVERLAY: 128,
  LOCATION_PZONE: 512,
  LOCATION_REMOVED: 32,
  LOCATION_SZONE: 8,
  MASTER_RULE3: 3,
  MASTER_RULE_2020: 5,
  MODE_MATCH: 1,
  MODE_SINGLE: 0,
  MODE_TAG: 2,
  MSG_ADD_COUNTER: 101,
  MSG_AI_NAME: 163,
  MSG_ANNOUNCE_ATTRIB: 141,
  MSG_ANNOUNCE_CARD: 142,
  MSG_ANNOUNCE_NUMBER: 143,
  MSG_ANNOUNCE_RACE: 140,
  MSG_ATTACK: 110,
  MSG_ATTACK_DISABLED: 112,
  MSG_BATTLE: 111,
  MSG_BECOME_TARGET: 83,
  MSG_BE_CHAIN_TARGET: 121,
  MSG_CANCEL_TARGET: 97,
  MSG_CARD_HINT: 160,
  MSG_CARD_SELECTED: 80,
  MSG_CARD_TARGET: 96,
  MSG_CHAINED: 71,
  MSG_CHAINING: 70,
  MSG_CHAIN_DISABLED: 76,
  MSG_CHAIN_END: 74,
  MSG_CHAIN_NEGATED: 75,
  MSG_CHAIN_SOLVED: 73,
  MSG_CHAIN_SOLVING: 72,
  MSG_CONFIRM_CARDS: 31,
  MSG_CONFIRM_DECKTOP: 30,
  MSG_CONFIRM_EXTRATOP: 42,
  MSG_CREATE_RELATION: 122,
  MSG_CUSTOM_MSG: 180,
  MSG_DAMAGE: 91,
  MSG_DAMAGE_STEP_END: 114,
  MSG_DAMAGE_STEP_START: 113,
  MSG_DECK_TOP: 38,
  MSG_DRAW: 90,
  MSG_EQUIP: 93,
  MSG_FIELD_DISABLED: 56,
  MSG_FLIPSUMMONED: 65,
  MSG_FLIPSUMMONING: 64,
  MSG_HAND_RES: 133,
  MSG_HINT: 2,
  MSG_LPUPDATE: 94,
  MSG_MATCH_KILL: 170,
  MSG_MISSED_EFFECT: 120,
  MSG_MOVE: 50,
  MSG_NEW_PHASE: 41,
  MSG_NEW_TURN: 40,
  MSG_PAY_LPCOST: 100,
  MSG_PLAYER_HINT: 165,
  MSG_POS_CHANGE: 53,
  MSG_RANDOM_SELECTED: 81,
  MSG_RECOVER: 92,
  MSG_REFRESH_DECK: 34,
  MSG_RELEASE_RELATION: 123,
  MSG_RELOAD_FIELD: 162,
  MSG_REMOVE_COUNTER: 102,
  MSG_REQUEST_DECK: 8,
  MSG_RESET_TIME: 221,
  MSG_RETRY: 1,
  MSG_REVERSE_DECK: 37,
  MSG_ROCK_PAPER_SCISSORS: 132,
  MSG_SELECT_BATTLECMD: 10,
  MSG_SELECT_CARD: 15,
  MSG_SELECT_CHAIN: 16,
  MSG_SELECT_COUNTER: 22,
  MSG_SELECT_DISFIELD: 24,
  MSG_SELECT_EFFECTYN: 12,
  MSG_SELECT_IDLECMD: 11,
  MSG_SELECT_OPTION: 14,
  MSG_SELECT_PLACE: 18,
  MSG_SELECT_POSITION: 19,
  MSG_SELECT_SUM: 23,
  MSG_SELECT_TRIBUTE: 20,
  MSG_SELECT_UNSELECT_CARD: 26,
  MSG_SELECT_YESNO: 13,
  MSG_SET: 54,
  MSG_SHOW_HINT: 164,
  MSG_SHUFFLE_DECK: 32,
  MSG_SHUFFLE_EXTRA: 39,
  MSG_SHUFFLE_HAND: 33,
  MSG_SHUFFLE_SET_CARD: 36,
  MSG_SORT_CARD: 25,
  MSG_SPSUMMONED: 63,
  MSG_SPSUMMONING: 62,
  MSG_START: 4,
  MSG_SUMMONED: 61,
  MSG_SUMMONING: 60,
  MSG_SWAP: 55,
  MSG_SWAP_GRAVE_DECK: 35,
  MSG_TAG_SWAP: 161,
  MSG_TOSS_COIN: 130,
  MSG_TOSS_DICE: 131,
  MSG_UNEQUIP: 95,
  MSG_UPDATE_CARD: 7,
  MSG_UPDATE_DATA: 6,
  MSG_WAITING: 3,
  MSG_WIN: 5,
  NETPLAYER_TYPE_OBSERVER: 7,
  NETPLAYER_TYPE_PLAYER1: 0,
  NETPLAYER_TYPE_PLAYER2: 1,
  NETPLAYER_TYPE_PLAYER3: 2,
  NETPLAYER_TYPE_PLAYER4: 3,
  NETPLAYER_TYPE_PLAYER5: 4,
  NETPLAYER_TYPE_PLAYER6: 5,
  NETWORK_CLIENT_ID: 57078,
  NETWORK_SERVER_ID: 29736,
  NEW_MASTER_RULE: 4,
  NO_FLIP_EFFECT: 65536,
  OCGCORE_CREATE_ENABLE_LUA_COVERAGE: 1,
  OPCODE_ADD: 1073741824,
  OPCODE_AND: 1073741828,
  OPCODE_DIV: 1073741827,
  OPCODE_ISATTRIBUTE: 1073742084,
  OPCODE_ISCODE: 1073742080,
  OPCODE_ISRACE: 1073742083,
  OPCODE_ISSETCARD: 1073742081,
  OPCODE_ISTYPE: 1073742082,
  OPCODE_MUL: 1073741826,
  OPCODE_NEG: 1073741830,
  OPCODE_NOT: 1073741831,
  OPCODE_OR: 1073741829,
  OPCODE_SUB: 1073741825,
  OPERATION_CANCELED: -1,
  OPERATION_FAIL: 0,
  OPERATION_SUCCESS: 1,
  PHASE_BATTLE: 128,
  PHASE_BATTLE_START: 8,
  PHASE_BATTLE_STEP: 16,
  PHASE_DAMAGE: 32,
  PHASE_DAMAGE_CAL: 64,
  PHASE_DRAW: 1,
  PHASE_END: 512,
  PHASE_MAIN1: 4,
  PHASE_MAIN2: 256,
  PHASE_STANDBY: 2,
  PHINT_DESC_ADD: 6,
  PHINT_DESC_REMOVE: 7,
  PLAYERCHANGE_LEAVE: 11,
  PLAYERCHANGE_NOTREADY: 10,
  PLAYERCHANGE_OBSERVE: 8,
  PLAYERCHANGE_READY: 9,
  PLAYER_ALL: 3,
  PLAYER_NONE: 2,
  PLAYER_SELFDES: 5,
  POS_ATTACK: 3,
  POS_DEFENSE: 12,
  POS_FACEDOWN: 10,
  POS_FACEDOWN_ATTACK: 2,
  POS_FACEDOWN_DEFENSE: 8,
  POS_FACEUP: 5,
  POS_FACEUP_ATTACK: 1,
  POS_FACEUP_DEFENSE: 4,
  POS_REVEAL: 128,
  PROCESSOR_BUFFER_LEN: 268435455,
  PROCESSOR_END: 536870912,
  PROCESSOR_FLAG: 4026531840,
  PROCESSOR_NONE: 0,
  PROCESSOR_WAITING: 268435456,
  QUERY_ALIAS: 4,
  QUERY_ATTACK: 256,
  QUERY_ATTRIBUTE: 64,
  QUERY_BASE_ATTACK: 1024,
  QUERY_BASE_DEFENSE: 2048,
  QUERY_CODE: 1,
  QUERY_COUNTERS: 131072,
  QUERY_DEFENSE: 512,
  QUERY_EQUIP_CARD: 16384,
  QUERY_LEVEL: 16,
  QUERY_LINK: 8388608,
  QUERY_LSCALE: 2097152,
  QUERY_OVERLAY_CARD: 65536,
  QUERY_OWNER: 262144,
  QUERY_POSITION: 2,
  QUERY_RACE: 128,
  QUERY_RANK: 32,
  QUERY_REASON: 4096,
  QUERY_REASON_CARD: 8192,
  QUERY_RSCALE: 4194304,
  QUERY_STATUS: 524288,
  QUERY_TARGET_CARD: 32768,
  QUERY_TYPE: 8,
  RACES_COUNT: 26,
  RACE_ALL: 67108863,
  RACE_AQUA: 64,
  RACE_BEAST: 16384,
  RACE_BEASTWARRIOR: 32768,
  RACE_CREATORGOD: 4194304,
  RACE_CYBERSE: 16777216,
  RACE_DEVINE: 2097152,
  RACE_DINOSAUR: 65536,
  RACE_DRAGON: 8192,
  RACE_FAIRY: 4,
  RACE_FIEND: 8,
  RACE_FISH: 131072,
  RACE_ILLUSION: 33554432,
  RACE_INSECT: 2048,
  RACE_MACHINE: 32,
  RACE_PLANT: 1024,
  RACE_PSYCHO: 1048576,
  RACE_PYRO: 128,
  RACE_REPTILE: 524288,
  RACE_ROCK: 256,
  RACE_SEASERPENT: 262144,
  RACE_SPELLCASTER: 2,
  RACE_THUNDER: 4096,
  RACE_WARRIOR: 1,
  RACE_WINDBEAST: 512,
  RACE_WYRM: 8388608,
  RACE_ZOMBIE: 16,
  REASONS_PROCEDURE: 271056896,
  REASON_ACTION: 2147483648,
  REASON_ADJUST: 256,
  REASON_BATTLE: 32,
  REASON_COST: 128,
  REASON_DESTROY: 1,
  REASON_DISCARD: 16384,
  REASON_DISSUMMON: 4096,
  REASON_DRAW: 33554432,
  REASON_EFFECT: 64,
  REASON_FLIP: 8192,
  REASON_FUSION: 262144,
  REASON_LINK: 268435456,
  REASON_LOST_OVERLAY: 536870912,
  REASON_LOST_TARGET: 512,
  REASON_MAINTENANCE: 1073741824,
  REASON_MATERIAL: 8,
  REASON_RDAMAGE: 32768,
  REASON_REDIRECT: 67108864,
  REASON_RELEASE: 2,
  REASON_REPLACE: 16777216,
  REASON_RETURN: 131072,
  REASON_REVEAL: 134217728,
  REASON_RITUAL: 1048576,
  REASON_RRECOVER: 65536,
  REASON_RULE: 1024,
  REASON_SPSUMMON: 2048,
  REASON_SUMMON: 16,
  REASON_SYNCHRO: 524288,
  REASON_TEMPORARY: 4,
  REASON_XYZ: 2097152,
  RETURN_TEMP_REMOVE_TO_FIELD: 1,
  RETURN_TRAP_MONSTER_TO_SZONE: 2,
  SEQ_DECKBOTTOM: 1,
  SEQ_DECKSHUFFLE: 2,
  SEQ_DECKTOP: 0,
  SIZE_AI_NAME: 128,
  SIZE_HINT_MSG: 1024,
  SIZE_MESSAGE_BUFFER: 8192,
  SIZE_RETURN_VALUE: 256,
  STATUS_ACTIVATE_DISABLED: 262144,
  STATUS_ACT_FROM_HAND: 134217728,
  STATUS_ATTACK_CANCELED: 2097152,
  STATUS_BATTLE_DESTROYED: 16384,
  STATUS_BATTLE_RESULT: 64,
  STATUS_CANNOT_CHANGE_FORM: 256,
  STATUS_CHAINING: 65536,
  STATUS_CONTINUOUS_POS: 33554432,
  STATUS_COPYING_EFFECT: 32768,
  STATUS_DESTROY_CONFIRMED: 4096,
  STATUS_DISABLED: 1,
  STATUS_EFFECT_ENABLED: 1024,
  STATUS_EFFECT_REPLACED: 524288,
  STATUS_FLIP_SUMMONING: 1048576,
  STATUS_FLIP_SUMMON_DISABLED: 2147483648,
  STATUS_FLIP_SUMMON_TURN: 536870912,
  STATUS_FORBIDDEN: 67108864,
  STATUS_INITIALIZING: 4194304,
  STATUS_JUST_POS: 16777216,
  STATUS_LEAVE_CONFIRMED: 8192,
  STATUS_NO_LEVEL: 32,
  STATUS_OPPO_BATTLE: 268435456,
  STATUS_PROC_COMPLETE: 8,
  STATUS_SET_TURN: 16,
  STATUS_SPSUMMON_STEP: 128,
  STATUS_SPSUMMON_TURN: 1073741824,
  STATUS_SUMMONING: 512,
  STATUS_SUMMON_DISABLED: 131072,
  STATUS_SUMMON_TURN: 2048,
  STATUS_TO_DISABLE: 4,
  STATUS_TO_ENABLE: 2,
  STATUS_TO_HAND_WITHOUT_CONFIRM: 8388608,
  STOC_CHANGE_SIDE: 7,
  STOC_CHAT: 25,
  STOC_CREATE_GAME: 17,
  STOC_DECK_COUNT: 9,
  STOC_DUEL_END: 22,
  STOC_DUEL_START: 21,
  STOC_ERROR_MSG: 2,
  STOC_FIELD_FINISH: 48,
  STOC_GAME_MSG: 1,
  STOC_HAND_RESULT: 5,
  STOC_HS_PLAYER_CHANGE: 33,
  STOC_HS_PLAYER_ENTER: 32,
  STOC_HS_WATCH_CHANGE: 34,
  STOC_JOIN_GAME: 18,
  STOC_LEAVE_GAME: 20,
  STOC_REPLAY: 23,
  STOC_SELECT_HAND: 3,
  STOC_SELECT_TP: 4,
  STOC_SRVPRO_ROOMLIST: 49,
  STOC_TEAMMATE_SURRENDER: 35,
  STOC_TIME_LIMIT: 24,
  STOC_TP_RESULT: 6,
  STOC_TYPE_CHANGE: 19,
  STOC_WAITING_SIDE: 8,
  TRUE: 1,
  TYPES_EXTRA_DECK: 75505728,
  TYPE_CONTINUOUS: 131072,
  TYPE_COUNTER: 1048576,
  TYPE_DUAL: 2048,
  TYPE_EFFECT: 32,
  TYPE_EQUIP: 262144,
  TYPE_FIELD: 524288,
  TYPE_FLIP: 2097152,
  TYPE_FUSION: 64,
  TYPE_LINK: 67108864,
  TYPE_MONSTER: 1,
  TYPE_NORMAL: 16,
  TYPE_PENDULUM: 16777216,
  TYPE_QUICKPLAY: 65536,
  TYPE_RITUAL: 128,
  TYPE_SPELL: 2,
  TYPE_SPIRIT: 512,
  TYPE_SPSUMMON: 33554432,
  TYPE_SYNCHRO: 8192,
  TYPE_TOKEN: 16384,
  TYPE_TOON: 4194304,
  TYPE_TRAP: 4,
  TYPE_TRAPMONSTER: 256,
  TYPE_TUNER: 4096,
  TYPE_UNION: 1024,
  TYPE_XYZ: 8388608
};
var SECOND_CODE_CARDS = /* @__PURE__ */ new Set([
  78734254,
  // CARD_MARINE_DOLPHIN
  13857930,
  // CARD_TWINKLE_MOSS
  1784686,
  // CARD_TIMAEUS
  11082056,
  // CARD_CRITIAS
  46232525
  // CARD_HERMOS
]);
function checkSetcode(setcode, value) {
  const settype = value & 4095;
  const setsubtype = value & 61440;
  return !!setcode && (setcode & 4095) === settype && (setcode & setsubtype) === setsubtype;
}
__name(checkSetcode, "checkSetcode");
var CardData = class extends PayloadBase {
  static {
    __name(this, "CardData");
  }
  /**
   * Check if this card belongs to a specific setcode
   * @param value The setcode value to check against
   * @returns true if the card belongs to the setcode
   */
  isSetCard(value) {
    for (const x of this.setcode) {
      if (!x) {
        return false;
      }
      if (checkSetcode(x, value)) {
        return true;
      }
    }
    return false;
  }
  getOriginalCode() {
    return this.alias ? this.alias : this.code;
  }
  getDuelCode() {
    return this.ruleCode ? this.ruleCode : this.getOriginalCode();
  }
  /**
   * Check if this card can be declared with the given opcode filter
   * @param opcode Array of opcodes that define the filter expression
   * @returns true if the card can be declared
   */
  isDeclarable(opcode) {
    if (this.alias) {
      return false;
    }
    const stack = [];
    for (const it of opcode) {
      switch (it) {
        case OcgcoreCommonConstants.OPCODE_ADD: {
          if (stack.length >= 2) {
            const rhs = stack.pop();
            const lhs = stack.pop();
            stack.push(lhs + rhs);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_SUB: {
          if (stack.length >= 2) {
            const rhs = stack.pop();
            const lhs = stack.pop();
            stack.push(lhs - rhs);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_MUL: {
          if (stack.length >= 2) {
            const rhs = stack.pop();
            const lhs = stack.pop();
            stack.push(lhs * rhs);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_DIV: {
          if (stack.length >= 2) {
            const rhs = stack.pop();
            const lhs = stack.pop();
            stack.push(rhs !== 0 ? Math.floor(lhs / rhs) : 0);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_AND: {
          if (stack.length >= 2) {
            const rhs = stack.pop();
            const lhs = stack.pop();
            stack.push(lhs && rhs ? 1 : 0);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_OR: {
          if (stack.length >= 2) {
            const rhs = stack.pop();
            const lhs = stack.pop();
            stack.push(lhs || rhs ? 1 : 0);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_NEG: {
          if (stack.length >= 1) {
            const val = stack.pop();
            stack.push(-val);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_NOT: {
          if (stack.length >= 1) {
            const val = stack.pop();
            stack.push(!val ? 1 : 0);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_ISCODE: {
          if (stack.length >= 1) {
            const code = stack.pop();
            stack.push(this.code === code ? 1 : 0);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_ISSETCARD: {
          if (stack.length >= 1) {
            const setCode = stack.pop();
            const res = this.isSetCard(setCode);
            stack.push(res ? 1 : 0);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_ISTYPE: {
          if (stack.length >= 1) {
            const val = stack.pop();
            stack.push(this.type & val ? 1 : 0);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_ISRACE: {
          if (stack.length >= 1) {
            const raceVal = stack.pop();
            stack.push(this.race & raceVal ? 1 : 0);
          }
          break;
        }
        case OcgcoreCommonConstants.OPCODE_ISATTRIBUTE: {
          if (stack.length >= 1) {
            const attributeVal = stack.pop();
            stack.push(this.attribute & attributeVal ? 1 : 0);
          }
          break;
        }
        default: {
          stack.push(it);
          break;
        }
      }
    }
    if (stack.length !== 1 || stack[0] === 0) {
      return false;
    }
    if (!SECOND_CODE_CARDS.has(this.code) && (this.ruleCode || this.type & OcgcoreCommonConstants.TYPE_TOKEN)) {
      return false;
    }
    return true;
  }
};
__decorateClass([
  BinaryField("u32", 0)
], CardData.prototype, "code", 2);
__decorateClass([
  BinaryField("u32", 4)
], CardData.prototype, "alias", 2);
__decorateClass([
  BinaryField("u16", 8, 16)
], CardData.prototype, "setcode", 2);
__decorateClass([
  BinaryField("u32", 40)
], CardData.prototype, "type", 2);
__decorateClass([
  BinaryField("u32", 44)
], CardData.prototype, "level", 2);
__decorateClass([
  BinaryField("u32", 48)
], CardData.prototype, "attribute", 2);
__decorateClass([
  BinaryField("u32", 52)
], CardData.prototype, "race", 2);
__decorateClass([
  BinaryField("i32", 56)
], CardData.prototype, "attack", 2);
__decorateClass([
  BinaryField("i32", 60)
], CardData.prototype, "defense", 2);
__decorateClass([
  BinaryField("u32", 64)
], CardData.prototype, "lscale", 2);
__decorateClass([
  BinaryField("u32", 68)
], CardData.prototype, "rscale", 2);
__decorateClass([
  BinaryField("u32", 72)
], CardData.prototype, "linkMarker", 2);
__decorateClass([
  BinaryField("u32", 76)
], CardData.prototype, "ruleCode", 2);
var LegacyPublicRevealViewSanitizeOptions = {
  stripRevealFlag: true,
  omitRevealField: true
};
function stripRevealFromPosition(position) {
  return position & ~OcgcoreCommonConstants.POS_REVEAL & 255;
}
__name(stripRevealFromPosition, "stripRevealFromPosition");
function decodePublicRevealPosition(target, rawPosition = target.position) {
  if (typeof rawPosition !== "number") {
    return target;
  }
  const position = rawPosition & 255;
  target.position = stripRevealFromPosition(position);
  if (position & OcgcoreCommonConstants.POS_REVEAL) {
    target.reveal = true;
  } else {
    delete target.reveal;
  }
  return target;
}
__name(decodePublicRevealPosition, "decodePublicRevealPosition");
function encodePublicRevealPosition(position, reveal) {
  const stripped = stripRevealFromPosition(position || 0);
  if (reveal === true) {
    return (stripped | OcgcoreCommonConstants.POS_REVEAL) & 255;
  }
  return stripped;
}
__name(encodePublicRevealPosition, "encodePublicRevealPosition");
function sanitizePublicRevealPositionForView(target, options = LegacyPublicRevealViewSanitizeOptions) {
  if (!target) {
    return target;
  }
  if (options.stripRevealFlag && typeof target.position === "number") {
    target.position = stripRevealFromPosition(target.position);
  }
  if (options.omitRevealField) {
    delete target.reveal;
  }
  return target;
}
__name(sanitizePublicRevealPositionForView, "sanitizePublicRevealPositionForView");
function shouldHideFacedownCode(position, reveal) {
  return !!(position && position & OcgcoreCommonConstants.POS_FACEDOWN && reveal !== true);
}
__name(shouldHideFacedownCode, "shouldHideFacedownCode");
var CardQuery_CardLocation = class {
  static {
    __name(this, "CardQuery_CardLocation");
  }
};
var CardQuery_Counter = class {
  static {
    __name(this, "CardQuery_Counter");
  }
};
var CardQuery = class {
  constructor() {
    this.flags = 0;
  }
  static {
    __name(this, "CardQuery");
  }
  fromPayload(data) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 0;
    this.flags = view.getInt32(offset, true) >>> 0;
    offset += 4;
    if (this.flags === 0) {
      this.empty = true;
      return this;
    }
    this.empty = false;
    if (this.flags & OcgcoreCommonConstants.QUERY_CODE) {
      this.code = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_POSITION) {
      const pdata = view.getUint32(offset, true);
      this.controller = pdata & 255;
      this.location = pdata >>> 8 & 255;
      this.sequence = pdata >>> 16 & 255;
      this.position = (pdata >>> 24 & 255) >>> 0;
      decodePublicRevealPosition(this);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_ALIAS) {
      this.alias = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_TYPE) {
      this.type = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_LEVEL) {
      this.level = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_RANK) {
      this.rank = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_ATTRIBUTE) {
      this.attribute = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_RACE) {
      this.race = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_ATTACK) {
      this.attack = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_DEFENSE) {
      this.defense = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_BASE_ATTACK) {
      this.baseAttack = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_BASE_DEFENSE) {
      this.baseDefense = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_REASON) {
      this.reason = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_REASON_CARD) {
      this.reasonCard = {
        controller: view.getUint8(offset),
        location: view.getUint8(offset + 1),
        sequence: view.getUint8(offset + 2),
        position: view.getUint8(offset + 3)
      };
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_EQUIP_CARD) {
      this.equipCard = {
        controller: view.getUint8(offset),
        location: view.getUint8(offset + 1),
        sequence: view.getUint8(offset + 2),
        position: view.getUint8(offset + 3)
      };
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_TARGET_CARD) {
      const count = view.getInt32(offset, true);
      offset += 4;
      this.targetCards = [];
      for (let i = 0; i < count; i++) {
        this.targetCards.push({
          controller: view.getUint8(offset),
          location: view.getUint8(offset + 1),
          sequence: view.getUint8(offset + 2),
          position: view.getUint8(offset + 3)
        });
        offset += 4;
      }
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_OVERLAY_CARD) {
      const count = view.getInt32(offset, true);
      offset += 4;
      this.overlayCards = [];
      for (let i = 0; i < count; i++) {
        this.overlayCards.push(view.getInt32(offset, true));
        offset += 4;
      }
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_COUNTERS) {
      const count = view.getInt32(offset, true);
      offset += 4;
      this.counters = [];
      for (let i = 0; i < count; i++) {
        this.counters.push({
          type: view.getUint16(offset, true),
          count: view.getUint16(offset + 2, true)
        });
        offset += 4;
      }
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_OWNER) {
      this.owner = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_STATUS) {
      this.status = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_LSCALE) {
      this.lscale = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_RSCALE) {
      this.rscale = view.getInt32(offset, true);
      offset += 4;
    }
    if (this.flags & OcgcoreCommonConstants.QUERY_LINK) {
      this.link = view.getInt32(offset, true);
      offset += 4;
      this.linkMarker = view.getInt32(offset, true);
      offset += 4;
    }
    return this;
  }
  toPayload() {
    return serializeCardQuery(this);
  }
};
function serializeCardQuery(card) {
  const source = card || {};
  const flags = source.flags || 0;
  let size = 4;
  if (flags & OcgcoreCommonConstants.QUERY_CODE) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_POSITION) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_ALIAS) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_TYPE) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_LEVEL) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_RANK) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_ATTRIBUTE) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_RACE) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_ATTACK) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_DEFENSE) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_BASE_ATTACK) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_BASE_DEFENSE) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_REASON) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_REASON_CARD) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_EQUIP_CARD) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_TARGET_CARD) {
    size += 4 + (source.targetCards?.length || 0) * 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_OVERLAY_CARD) {
    size += 4 + (source.overlayCards?.length || 0) * 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_COUNTERS) {
    size += 4 + (source.counters?.length || 0) * 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_OWNER) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_STATUS) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_LSCALE) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_RSCALE) size += 4;
  if (flags & OcgcoreCommonConstants.QUERY_LINK) size += 8;
  const result = new Uint8Array(size);
  const view = new DataView(result.buffer);
  let offset = 0;
  view.setInt32(offset, flags, true);
  offset += 4;
  if (source.empty || flags === 0) {
    return result;
  }
  if (flags & OcgcoreCommonConstants.QUERY_CODE) {
    view.setInt32(offset, source.code || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_POSITION) {
    const position = encodePublicRevealPosition(
      source.position,
      source.reveal
    );
    const pdata = (source.controller || 0) & 255 | ((source.location || 0) & 255) << 8 | ((source.sequence || 0) & 255) << 16 | (position & 255) << 24;
    view.setUint32(offset, pdata, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_ALIAS) {
    view.setInt32(offset, source.alias || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_TYPE) {
    view.setInt32(offset, source.type || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_LEVEL) {
    view.setInt32(offset, source.level || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_RANK) {
    view.setInt32(offset, source.rank || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_ATTRIBUTE) {
    view.setInt32(offset, source.attribute || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_RACE) {
    view.setInt32(offset, source.race || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_ATTACK) {
    view.setInt32(offset, source.attack || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_DEFENSE) {
    view.setInt32(offset, source.defense || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_BASE_ATTACK) {
    view.setInt32(offset, source.baseAttack || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_BASE_DEFENSE) {
    view.setInt32(offset, source.baseDefense || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_REASON) {
    view.setInt32(offset, source.reason || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_REASON_CARD) {
    const reasonCard = source.reasonCard || {
      controller: 0,
      location: 0,
      sequence: 0,
      position: 0
    };
    view.setUint8(offset, reasonCard.controller);
    view.setUint8(offset + 1, reasonCard.location);
    view.setUint8(offset + 2, reasonCard.sequence);
    view.setUint8(offset + 3, reasonCard.position || 0);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_EQUIP_CARD) {
    const equipCard = source.equipCard || {
      controller: 0,
      location: 0,
      sequence: 0,
      position: 0
    };
    view.setUint8(offset, equipCard.controller);
    view.setUint8(offset + 1, equipCard.location);
    view.setUint8(offset + 2, equipCard.sequence);
    view.setUint8(offset + 3, equipCard.position || 0);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_TARGET_CARD) {
    const targets = source.targetCards || [];
    view.setInt32(offset, targets.length, true);
    offset += 4;
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      view.setUint8(offset, target.controller);
      view.setUint8(offset + 1, target.location);
      view.setUint8(offset + 2, target.sequence);
      view.setUint8(offset + 3, target.position || 0);
      offset += 4;
    }
  }
  if (flags & OcgcoreCommonConstants.QUERY_OVERLAY_CARD) {
    const overlays = source.overlayCards || [];
    view.setInt32(offset, overlays.length, true);
    offset += 4;
    for (const card2 of overlays) {
      view.setInt32(offset, card2, true);
      offset += 4;
    }
  }
  if (flags & OcgcoreCommonConstants.QUERY_COUNTERS) {
    const counters = source.counters || [];
    view.setInt32(offset, counters.length, true);
    offset += 4;
    for (const counter of counters) {
      view.setUint16(offset, counter.type, true);
      view.setUint16(offset + 2, counter.count, true);
      offset += 4;
    }
  }
  if (flags & OcgcoreCommonConstants.QUERY_OWNER) {
    view.setInt32(offset, source.owner || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_STATUS) {
    view.setInt32(offset, source.status || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_LSCALE) {
    view.setInt32(offset, source.lscale || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_RSCALE) {
    view.setInt32(offset, source.rscale || 0, true);
    offset += 4;
  }
  if (flags & OcgcoreCommonConstants.QUERY_LINK) {
    view.setInt32(offset, source.link || 0, true);
    offset += 4;
    view.setInt32(offset, source.linkMarker || 0, true);
    offset += 4;
  }
  return new Uint8Array(view.buffer, view.byteOffset, offset);
}
__name(serializeCardQuery, "serializeCardQuery");
function parseCardQueryChunk(data, offset = 0, context = "CardQuery") {
  if (offset + 4 > data.length) {
    throw new Error(`${context} chunk header truncated`);
  }
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const length = view.getInt32(offset, true);
  if (length < 4) {
    throw new Error(`${context} invalid chunk length: ${length}`);
  }
  if (offset + length > data.length) {
    throw new Error(`${context} chunk payload truncated`);
  }
  const card = new CardQuery();
  card.queryLength = length;
  if (length === 4) {
    card.flags = 0;
    card.empty = true;
    return { card, length };
  }
  const payload = data.slice(offset + 4, offset + length);
  card.fromPayload(payload);
  return { card, length };
}
__name(parseCardQueryChunk, "parseCardQueryChunk");
function serializeCardQueryChunk(card) {
  const flags = card?.flags ?? 0;
  const queryLength = card?.queryLength;
  if (flags === 0 && card?.empty && (!queryLength || queryLength <= 4)) {
    return { length: 4, payload: new Uint8Array(0) };
  }
  if (flags === 0 && queryLength && queryLength > 4) {
    return { length: queryLength, payload: new Uint8Array(queryLength - 4) };
  }
  const payload = serializeCardQuery(card);
  const minimalLength = 4 + payload.length;
  if (queryLength && queryLength > minimalLength) {
    const padded = new Uint8Array(queryLength - 4);
    padded.set(payload, 0);
    return { length: queryLength, payload: padded };
  }
  return { length: minimalLength, payload };
}
__name(serializeCardQueryChunk, "serializeCardQueryChunk");
function inferCardQueryChunkLength(source) {
  if (!source) {
    return void 0;
  }
  if (typeof source.queryLength === "number" && source.queryLength >= 4) {
    return source.queryLength;
  }
  const flags = source.flags ?? 0;
  if (flags === 0 && source.empty) {
    return 4;
  }
  const payload = serializeCardQuery(source);
  return 4 + payload.length;
}
__name(inferCardQueryChunkLength, "inferCardQueryChunkLength");
function createClearedCardQuery(source) {
  const card = new CardQuery();
  card.flags = 0;
  card.empty = true;
  card.queryLength = inferCardQueryChunkLength(source);
  return card;
}
__name(createClearedCardQuery, "createClearedCardQuery");
function createCodeHiddenCardQuery(source) {
  const card = new CardQuery();
  card.flags = OcgcoreCommonConstants.QUERY_CODE;
  card.code = 0;
  card.empty = false;
  card.queryLength = inferCardQueryChunkLength(source);
  return card;
}
__name(createCodeHiddenCardQuery, "createCodeHiddenCardQuery");
function getCardQueryPosition(card) {
  if (!card) {
    return void 0;
  }
  return typeof card.position === "number" ? stripRevealFromPosition(card.position) : void 0;
}
__name(getCardQueryPosition, "getCardQueryPosition");
var YGOProProtoBase = class extends PayloadBase {
  static {
    __name(this, "YGOProProtoBase");
  }
  static {
    this.messageDirection = "";
  }
  get messageDirection() {
    return this.constructor.messageDirection;
  }
  /**
   * Serialize to full payload including header (length + identifier + body)
   * Format: [length 2 bytes LE][identifier 1 byte][body]
   * Length = 1 (identifier) + body.length
   */
  toFullPayload() {
    const body = this.toPayload();
    const length = 1 + body.length;
    const fullPayload = new Uint8Array(3 + body.length);
    fullPayload[0] = length & 255;
    fullPayload[1] = length >> 8 & 255;
    fullPayload[2] = this.identifier;
    fullPayload.set(body, 3);
    return fullPayload;
  }
  /**
   * Deserialize from full payload including header (length + identifier + body)
   * Format: [length 2 bytes LE][identifier 1 byte][body]
   * @param data - Full payload data
   * @returns this instance
   * @throws Error if data is too short or identifier mismatch
   */
  fromFullPayload(data) {
    if (data.length < 3) {
      throw new Error(
        `${this.messageDirection} payload too short: expected at least 3 bytes, got ${data.length}`
      );
    }
    const declaredLength = data[0] | data[1] << 8;
    const identifier = data[2];
    if (identifier !== this.identifier) {
      throw new Error(
        `${this.messageDirection} identifier mismatch: expected 0x${this.identifier.toString(16)}, got 0x${identifier.toString(16)}`
      );
    }
    const expectedTotalLength = 3 + declaredLength - 1;
    if (data.length < expectedTotalLength) {
      throw new Error(
        `${this.messageDirection} payload too short: declared length ${declaredLength} requires ${expectedTotalLength} bytes total, got ${data.length}`
      );
    }
    const bodyData = data.length > expectedTotalLength ? data.slice(3, expectedTotalLength) : data.slice(3);
    return this.fromPayload(bodyData);
  }
};
var YGOProCtosBase = class extends YGOProProtoBase {
  static {
    __name(this, "YGOProCtosBase");
  }
  static {
    this.messageDirection = "CTOS";
  }
};
var RegistryBase = class {
  constructor(payloadClass, options = {}) {
    this.payloadClass = payloadClass;
    this.options = options;
    this.protos = /* @__PURE__ */ new Map();
  }
  static {
    __name(this, "RegistryBase");
  }
  register(proto) {
    const identifier = proto.identifier;
    this.protos.set(identifier, proto);
  }
  get(identifier) {
    return this.protos.get(identifier);
  }
  getInstanceFromPayload(data) {
    const identifier = data[this.options.identifierOffset ?? 0];
    const proto = this.get(identifier);
    if (!proto) {
      return void 0;
    }
    return new proto().fromPayload(
      data.slice(this.options.dataOffset ?? 0)
    );
  }
  getInstancesFromPayload(data) {
    const instances = [];
    const identifierOffset = this.options.identifierOffset ?? 0;
    const dataOffset = this.options.dataOffset ?? 0;
    const minLength = Math.max(identifierOffset + 1, dataOffset);
    let remaining = data;
    while (remaining.length > 0) {
      if (remaining.length < minLength) {
        break;
      }
      try {
        const instance = this.getInstanceFromPayload(remaining);
        if (!instance) {
          break;
        }
        const consumed = dataOffset + instance.toPayload().length;
        if (consumed <= 0 || consumed > remaining.length) {
          break;
        }
        instances.push(instance);
        remaining = remaining.slice(consumed);
      } catch {
        break;
      }
    }
    return instances;
  }
};
var ProtoRegistryBase = class extends RegistryBase {
  static {
    __name(this, "ProtoRegistryBase");
  }
  constructor(payloadClass) {
    super(payloadClass, {
      identifierOffset: 2,
      dataOffset: 3
    });
  }
  getInstancesFromPayload(data) {
    const instances = [];
    let offset = 0;
    while (offset + 2 <= data.length) {
      const declaredLength = data[offset] | data[offset + 1] << 8;
      if (declaredLength <= 0) {
        break;
      }
      const packetLength = 2 + declaredLength;
      if (offset + packetLength > data.length) {
        break;
      }
      const chunk = data.slice(offset, offset + packetLength);
      const identifier = chunk[2];
      const proto = this.get(identifier);
      if (!proto) {
        break;
      }
      try {
        const instance = new proto().fromFullPayload(chunk);
        instances.push(instance);
      } catch {
        break;
      }
      offset += packetLength;
    }
    return instances;
  }
};
var YGOProCtosResponse = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosResponse");
  }
  static {
    this.identifier = 1;
  }
  fromPayload(data) {
    this.response = data;
    return this;
  }
  toPayload() {
    return this.response || new Uint8Array(0);
  }
};
var YGOProCtosUpdateDeck = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosUpdateDeck");
  }
  static {
    this.identifier = 2;
  }
  constructor() {
    super();
    this.deck = new YGOProDeck();
  }
  fromPayload(data) {
    this.deck = YGOProDeck.fromUpdateDeckPayload(data);
    return this;
  }
  toPayload() {
    return this.deck.toUpdateDeckPayload();
  }
  fromPartial(data) {
    if (data.deck) {
      this.deck = new YGOProDeck(data.deck);
    }
    return this;
  }
  copy() {
    const copied = new this.constructor();
    copied.deck = new YGOProDeck(this.deck);
    return copied;
  }
};
var YGOProCtosHandResult = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosHandResult");
  }
  static {
    this.identifier = 3;
  }
};
__decorateClass([
  BinaryField("u8", 0, void 0, { enum: HandResult })
], YGOProCtosHandResult.prototype, "res", 2);
var YGOProCtosTpResult = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosTpResult");
  }
  static {
    this.identifier = 4;
  }
};
__decorateClass([
  BinaryField("u8", 0, void 0, { enum: TurnPlayerResult })
], YGOProCtosTpResult.prototype, "res", 2);
var YGOProCtosPlayerInfo = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosPlayerInfo");
  }
  static {
    this.identifier = 16;
  }
};
__decorateClass([
  BinaryField("utf16", 0, 20)
], YGOProCtosPlayerInfo.prototype, "name", 2);
var YGOProCtosCreateGame = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosCreateGame");
  }
  static {
    this.identifier = 17;
  }
};
__decorateClass([
  BinaryField(() => HostInfo, 0)
], YGOProCtosCreateGame.prototype, "info", 2);
__decorateClass([
  BinaryField("utf16", 20, 20)
], YGOProCtosCreateGame.prototype, "name", 2);
__decorateClass([
  BinaryField("utf16", 60, 20)
], YGOProCtosCreateGame.prototype, "pass", 2);
var YGOProCtosJoinGame = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosJoinGame");
  }
  static {
    this.identifier = 18;
  }
};
__decorateClass([
  BinaryField("u16", 0)
], YGOProCtosJoinGame.prototype, "version", 2);
__decorateClass([
  BinaryField("u32", 4)
], YGOProCtosJoinGame.prototype, "gameid", 2);
__decorateClass([
  BinaryField("utf16", 8, 20)
], YGOProCtosJoinGame.prototype, "pass", 2);
var YGOProCtosLeaveGame = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosLeaveGame");
  }
  static {
    this.identifier = 19;
  }
};
var YGOProCtosSurrender = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosSurrender");
  }
  static {
    this.identifier = 20;
  }
};
var YGOProCtosTimeConfirm = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosTimeConfirm");
  }
  static {
    this.identifier = 21;
  }
};
var CTOS_CHAT_MAX_LENGTH = 256;
var YGOProCtosChat = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosChat");
  }
  static {
    this.identifier = 22;
  }
  static {
    this.MAX_LENGTH = CTOS_CHAT_MAX_LENGTH;
  }
  constructor() {
    super();
    this.msg = "";
  }
  fromPayload(data) {
    const decoder3 = new TextDecoder("utf-16le");
    this.msg = decoder3.decode(data).replace(/\0+$/, "");
    return this;
  }
  toPayload() {
    const text = this.msg.length > CTOS_CHAT_MAX_LENGTH ? this.msg.substring(0, CTOS_CHAT_MAX_LENGTH) : this.msg;
    const utf16 = new Uint16Array(text.length + 1);
    for (let i = 0; i < text.length; i++) {
      utf16[i] = text.charCodeAt(i);
    }
    utf16[text.length] = 0;
    const result = new Uint8Array(utf16.buffer);
    return result;
  }
  fromPartial(data) {
    if (data.msg !== void 0) {
      this.msg = data.msg;
    }
    return this;
  }
};
var CTOS_EXTERNAL_ADDRESS_MAX_HOSTNAME_LENGTH = 256;
var YGOProCtosExternalAddress = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosExternalAddress");
  }
  static {
    this.identifier = 23;
  }
  static {
    this.MAX_LENGTH = CTOS_EXTERNAL_ADDRESS_MAX_HOSTNAME_LENGTH;
  }
  static {
    this.MAX_HOSTNAME_LENGTH = CTOS_EXTERNAL_ADDRESS_MAX_HOSTNAME_LENGTH;
  }
  constructor() {
    super();
    this.real_ip = "0.0.0.0";
    this.hostname = "";
  }
  // Convert IPv4 string to uint32 (network byte order / big endian)
  ipToUint32(ip) {
    let ipv4 = ip;
    if (ip.startsWith("::ffff:")) {
      ipv4 = ip.substring(7);
    }
    const parts = ipv4.split(".");
    if (parts.length !== 4) {
      return 0;
    }
    const bytes = parts.map((p) => parseInt(p, 10));
    if (bytes.some((b) => isNaN(b) || b < 0 || b > 255)) {
      return 0;
    }
    return bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3];
  }
  // Convert uint32 (network byte order / big endian) to IPv4 string
  uint32ToIp(value) {
    const byte1 = value >>> 24 & 255;
    const byte2 = value >>> 16 & 255;
    const byte3 = value >>> 8 & 255;
    const byte4 = value & 255;
    return `${byte1}.${byte2}.${byte3}.${byte4}`;
  }
  fromPayload(data) {
    if (data.length < 4) {
      throw new Error("CTOS_EXTERNAL_ADDRESS data too short");
    }
    const ipUint32 = data[0] << 24 | data[1] << 16 | data[2] << 8 | data[3];
    this.real_ip = this.uint32ToIp(ipUint32);
    if (data.length > 4) {
      const decoder3 = new TextDecoder("utf-16le");
      this.hostname = decoder3.decode(data.slice(4)).replace(/\0+$/, "");
    } else {
      this.hostname = "";
    }
    return this;
  }
  toPayload() {
    const text = this.hostname.length > CTOS_EXTERNAL_ADDRESS_MAX_HOSTNAME_LENGTH ? this.hostname.substring(0, CTOS_EXTERNAL_ADDRESS_MAX_HOSTNAME_LENGTH) : this.hostname;
    const utf16 = new Uint16Array(text.length + 1);
    for (let i = 0; i < text.length; i++) {
      utf16[i] = text.charCodeAt(i);
    }
    utf16[text.length] = 0;
    const result = new Uint8Array(4 + utf16.byteLength);
    const ipUint32 = this.ipToUint32(this.real_ip);
    result[0] = ipUint32 >>> 24 & 255;
    result[1] = ipUint32 >>> 16 & 255;
    result[2] = ipUint32 >>> 8 & 255;
    result[3] = ipUint32 & 255;
    result.set(new Uint8Array(utf16.buffer), 4);
    return result;
  }
  fromPartial(data) {
    if (data.real_ip !== void 0) {
      this.real_ip = data.real_ip;
    }
    if (data.hostname !== void 0) {
      this.hostname = data.hostname;
    }
    return this;
  }
};
var YGOProCtosHsToDuelist = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosHsToDuelist");
  }
  static {
    this.identifier = 32;
  }
};
var YGOProCtosHsToObserver = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosHsToObserver");
  }
  static {
    this.identifier = 33;
  }
};
var YGOProCtosHsReady = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosHsReady");
  }
  static {
    this.identifier = 34;
  }
};
var YGOProCtosHsNotReady = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosHsNotReady");
  }
  static {
    this.identifier = 35;
  }
};
var YGOProCtosKick = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosKick");
  }
  static {
    this.identifier = 36;
  }
};
__decorateClass([
  BinaryField("u8", 0, void 0, { enum: NetPlayerType })
], YGOProCtosKick.prototype, "pos", 2);
var YGOProCtosHsStart = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosHsStart");
  }
  static {
    this.identifier = 37;
  }
};
var YGOProCtosRequestField = class extends YGOProCtosBase {
  static {
    __name(this, "YGOProCtosRequestField");
  }
  static {
    this.identifier = 48;
  }
};
var YGOProCtos = new ProtoRegistryBase(YGOProCtosBase);
YGOProCtos.register(YGOProCtosResponse);
YGOProCtos.register(YGOProCtosUpdateDeck);
YGOProCtos.register(YGOProCtosHandResult);
YGOProCtos.register(YGOProCtosTpResult);
YGOProCtos.register(YGOProCtosPlayerInfo);
YGOProCtos.register(YGOProCtosCreateGame);
YGOProCtos.register(YGOProCtosJoinGame);
YGOProCtos.register(YGOProCtosLeaveGame);
YGOProCtos.register(YGOProCtosSurrender);
YGOProCtos.register(YGOProCtosTimeConfirm);
YGOProCtos.register(YGOProCtosChat);
YGOProCtos.register(YGOProCtosExternalAddress);
YGOProCtos.register(YGOProCtosHsToDuelist);
YGOProCtos.register(YGOProCtosHsToObserver);
YGOProCtos.register(YGOProCtosHsReady);
YGOProCtos.register(YGOProCtosHsNotReady);
YGOProCtos.register(YGOProCtosKick);
YGOProCtos.register(YGOProCtosHsStart);
YGOProCtos.register(YGOProCtosRequestField);
var YGOProStocBase = class extends YGOProProtoBase {
  static {
    __name(this, "YGOProStocBase");
  }
  static {
    this.messageDirection = "STOC";
  }
};
var SEND_TO_ALL = [
  0,
  1,
  7
  /* OBSERVER */
];
var YGOProMsgBase = class extends PayloadBase {
  static {
    __name(this, "YGOProMsgBase");
  }
  fromPayload(data) {
    if (data.length < 1) {
      throw new Error("MSG data too short");
    }
    const msgType = data[0];
    if (msgType !== this.identifier) {
      throw new Error(
        `MSG type mismatch: expected ${this.identifier}, got ${msgType}`
      );
    }
    return super.fromPayload(data.slice(1));
  }
  toPayload() {
    const payload = super.toPayload();
    const result = new Uint8Array(1 + payload.length);
    result[0] = this.identifier;
    result.set(payload, 1);
    return result;
  }
  opponentView() {
    return this.copy();
  }
  teammateView() {
    return this.copy();
  }
  observerView() {
    return this.opponentView();
  }
  playerView(playerId) {
    if (playerId === 7) {
      return this.observerView();
    }
    if (typeof this["player"] === "number") {
      const selfPlayerId = this["player"];
      if (selfPlayerId === playerId) {
        return this.copy();
      }
      return this.opponentView();
    }
    return this.copy();
  }
  getSendTargets() {
    return SEND_TO_ALL;
  }
  getRequireRefreshZones() {
    return [];
  }
  getRequireRefreshCards() {
    return [];
  }
};
var YGOProMsgAddCounter = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgAddCounter");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_ADD_COUNTER;
  }
};
__decorateClass([
  BinaryField("u16", 0)
], YGOProMsgAddCounter.prototype, "counterType", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgAddCounter.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgAddCounter.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgAddCounter.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u16", 5)
], YGOProMsgAddCounter.prototype, "count", 2);
var YGOProMsgResponseBase = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgResponseBase");
  }
  defaultResponse() {
    return void 0;
  }
  responsePlayer() {
    return 0;
  }
  getSendTargets() {
    return [this.responsePlayer()];
  }
};
var YGOProMsgAnnounceAttrib = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgAnnounceAttrib");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_ANNOUNCE_ATTRIB;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(attributes) {
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setInt32(0, attributes, true);
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgAnnounceAttrib.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgAnnounceAttrib.prototype, "count", 2);
__decorateClass([
  BinaryField("u32", 2)
], YGOProMsgAnnounceAttrib.prototype, "availableAttributes", 2);
var YGOProMsgAnnounceCard = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgAnnounceCard");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_ANNOUNCE_CARD;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(cardCode) {
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setInt32(0, cardCode, true);
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgAnnounceCard.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgAnnounceCard.prototype, "count", 2);
__decorateClass([
  BinaryField("i32", 2, (obj) => obj.count)
], YGOProMsgAnnounceCard.prototype, "opcodes", 2);
var INDEX_RESPONSE_SYMBOL = /* @__PURE__ */ Symbol("IndexResponse");
var IndexResponse = /* @__PURE__ */ __name((index) => ({
  [INDEX_RESPONSE_SYMBOL]: true,
  index
}), "IndexResponse");
var isIndexResponse = /* @__PURE__ */ __name((obj) => {
  return obj != null && obj[INDEX_RESPONSE_SYMBOL] === true;
}, "isIndexResponse");
var YGOProMsgAnnounceNumber = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgAnnounceNumber");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_ANNOUNCE_NUMBER;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(option) {
    let index;
    if (isIndexResponse(option)) {
      index = option.index;
      if (index < 0 || index >= this.count) {
        throw new TypeError(`Index out of range: ${index}`);
      }
    } else {
      index = this.numbers.indexOf(option);
      if (index === -1) {
        throw new TypeError(`Number not found: ${option}`);
      }
    }
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setInt32(0, index, true);
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgAnnounceNumber.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgAnnounceNumber.prototype, "count", 2);
__decorateClass([
  BinaryField("i32", 2, (obj) => obj.count)
], YGOProMsgAnnounceNumber.prototype, "numbers", 2);
var YGOProMsgAnnounceRace = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgAnnounceRace");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_ANNOUNCE_RACE;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(races) {
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setInt32(0, races, true);
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgAnnounceRace.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgAnnounceRace.prototype, "count", 2);
__decorateClass([
  BinaryField("u32", 2)
], YGOProMsgAnnounceRace.prototype, "availableRaces", 2);
var YGOProMsgAttack_CardLocation = class {
  static {
    __name(this, "YGOProMsgAttack_CardLocation");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgAttack_CardLocation.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgAttack_CardLocation.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgAttack_CardLocation.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgAttack_CardLocation.prototype, "position", 2);
var YGOProMsgAttack = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgAttack");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_ATTACK;
  }
};
__decorateClass([
  BinaryField(() => YGOProMsgAttack_CardLocation, 0)
], YGOProMsgAttack.prototype, "attacker", 2);
__decorateClass([
  BinaryField(() => YGOProMsgAttack_CardLocation, 4)
], YGOProMsgAttack.prototype, "defender", 2);
var YGOProMsgAttackDisabled = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgAttackDisabled");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_ATTACK_DISABLED;
  }
};
var YGOProMsgBattle_CardLocation = class {
  static {
    __name(this, "YGOProMsgBattle_CardLocation");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgBattle_CardLocation.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgBattle_CardLocation.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgBattle_CardLocation.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgBattle_CardLocation.prototype, "position", 2);
var YGOProMsgBattle_CardStats = class {
  static {
    __name(this, "YGOProMsgBattle_CardStats");
  }
};
__decorateClass([
  BinaryField(() => YGOProMsgBattle_CardLocation, 0)
], YGOProMsgBattle_CardStats.prototype, "location", 2);
__decorateClass([
  BinaryField("i32", 4)
], YGOProMsgBattle_CardStats.prototype, "atk", 2);
__decorateClass([
  BinaryField("i32", 8)
], YGOProMsgBattle_CardStats.prototype, "def", 2);
var YGOProMsgBattle = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgBattle");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_BATTLE;
  }
};
__decorateClass([
  BinaryField(() => YGOProMsgBattle_CardStats, 0)
], YGOProMsgBattle.prototype, "attacker", 2);
__decorateClass([
  BinaryField("u8", 12)
], YGOProMsgBattle.prototype, "attackerBattleState", 2);
__decorateClass([
  BinaryField(() => YGOProMsgBattle_CardStats, 13)
], YGOProMsgBattle.prototype, "defender", 2);
__decorateClass([
  BinaryField("u8", 25)
], YGOProMsgBattle.prototype, "defenderBattleState", 2);
var YGOProMsgBecomeTarget = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgBecomeTarget");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_BECOME_TARGET;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgBecomeTarget.prototype, "count", 2);
__decorateClass([
  BinaryField("i32", 1, (obj) => obj.count)
], YGOProMsgBecomeTarget.prototype, "targets", 2);
var YGOProMsgCancelTarget_CardLocation = class {
  static {
    __name(this, "YGOProMsgCancelTarget_CardLocation");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgCancelTarget_CardLocation.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgCancelTarget_CardLocation.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgCancelTarget_CardLocation.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgCancelTarget_CardLocation.prototype, "position", 2);
var YGOProMsgCancelTarget = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgCancelTarget");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CANCEL_TARGET;
  }
};
__decorateClass([
  BinaryField(() => YGOProMsgCancelTarget_CardLocation, 0)
], YGOProMsgCancelTarget.prototype, "card1", 2);
__decorateClass([
  BinaryField(() => YGOProMsgCancelTarget_CardLocation, 4)
], YGOProMsgCancelTarget.prototype, "card2", 2);
var YGOProMsgCardHint = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgCardHint");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CARD_HINT;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgCardHint.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgCardHint.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgCardHint.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgCardHint.prototype, "subsequence", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgCardHint.prototype, "type", 2);
__decorateClass([
  BinaryField("i32", 5)
], YGOProMsgCardHint.prototype, "value", 2);
var YGOProMsgCardTarget_CardLocation = class {
  static {
    __name(this, "YGOProMsgCardTarget_CardLocation");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgCardTarget_CardLocation.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgCardTarget_CardLocation.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgCardTarget_CardLocation.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgCardTarget_CardLocation.prototype, "position", 2);
var YGOProMsgCardTarget = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgCardTarget");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CARD_TARGET;
  }
};
__decorateClass([
  BinaryField(() => YGOProMsgCardTarget_CardLocation, 0)
], YGOProMsgCardTarget.prototype, "card1", 2);
__decorateClass([
  BinaryField(() => YGOProMsgCardTarget_CardLocation, 4)
], YGOProMsgCardTarget.prototype, "card2", 2);
var YGOProMsgChainDisabled = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgChainDisabled");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CHAIN_DISABLED;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgChainDisabled.prototype, "chainCount", 2);
var OcgcoreScriptConstants = {
  ACTIVITY_ATTACK: 5,
  ACTIVITY_BATTLE_PHASE: 6,
  ACTIVITY_CHAIN: 7,
  ACTIVITY_FLIPSUMMON: 4,
  ACTIVITY_NORMALSUMMON: 2,
  ACTIVITY_SPSUMMON: 3,
  ACTIVITY_SUMMON: 1,
  ASSUME_ATTACK: 7,
  ASSUME_ATTRIBUTE: 5,
  ASSUME_CODE: 1,
  ASSUME_DEFENSE: 8,
  ASSUME_LEVEL: 3,
  ASSUME_RACE: 6,
  ASSUME_RANK: 4,
  ASSUME_TYPE: 2,
  ATTRIBUTE_ALL: 127,
  ATTRIBUTE_DARK: 32,
  ATTRIBUTE_DIVINE: 64,
  ATTRIBUTE_EARTH: 1,
  ATTRIBUTE_FIRE: 4,
  ATTRIBUTE_LIGHT: 16,
  ATTRIBUTE_WATER: 2,
  ATTRIBUTE_WIND: 8,
  CARD_MARINE_DOLPHIN: 78734254,
  CARD_QUESTION: 38723936,
  CARD_TWINKLE_MOSS: 13857930,
  CATEGORY_ANNOUNCE: 536870912,
  CATEGORY_ATKCHANGE: 2097152,
  CATEGORY_COIN: 16777216,
  CATEGORY_CONTROL: 8192,
  CATEGORY_COUNTER: 8388608,
  CATEGORY_DAMAGE: 524288,
  CATEGORY_DECKDES: 64,
  CATEGORY_DEFCHANGE: 4194304,
  CATEGORY_DESTROY: 1,
  CATEGORY_DICE: 33554432,
  CATEGORY_DISABLE: 16384,
  CATEGORY_DISABLE_SUMMON: 32768,
  CATEGORY_DRAW: 65536,
  CATEGORY_EQUIP: 262144,
  CATEGORY_FUSION_SUMMON: 1073741824,
  CATEGORY_GRAVE_ACTION: 2048,
  CATEGORY_GRAVE_SPSUMMON: 134217728,
  CATEGORY_HANDES: 17179869312,
  CATEGORY_HANDES_OPPO: 17179869184,
  CATEGORY_HANDES_SELF: 128,
  CATEGORY_LEAVE_GRAVE: 67108864,
  CATEGORY_MSET: 4294967296,
  CATEGORY_NEGATE: 268435456,
  CATEGORY_POSITION: 4096,
  CATEGORY_RECOVER: 1048576,
  CATEGORY_RELEASE: 2,
  CATEGORY_REMOVE: 4,
  CATEGORY_SEARCH: 131072,
  CATEGORY_SPECIAL_SUMMON: 512,
  CATEGORY_SSET: 8589934592,
  CATEGORY_SUMMON: 256,
  CATEGORY_TODECK: 16,
  CATEGORY_TOEXTRA: 2147483648,
  CATEGORY_TOGRAVE: 32,
  CATEGORY_TOHAND: 8,
  CATEGORY_TOKEN: 1024,
  CHAININFO_CHAIN_COUNT: 1,
  CHAININFO_CHAIN_ID: 2048,
  CHAININFO_DISABLE_PLAYER: 1024,
  CHAININFO_DISABLE_REASON: 512,
  CHAININFO_EXTTYPE: 8192,
  CHAININFO_TARGET_CARDS: 64,
  CHAININFO_TARGET_PARAM: 256,
  CHAININFO_TARGET_PLAYER: 128,
  CHAININFO_TRIGGERING_ATTACK: 4194304,
  CHAININFO_TRIGGERING_ATTRIBUTE: 1048576,
  CHAININFO_TRIGGERING_CODE: 32768,
  CHAININFO_TRIGGERING_CODE2: 65536,
  CHAININFO_TRIGGERING_CONTROLER: 8,
  CHAININFO_TRIGGERING_DEFENSE: 8388608,
  CHAININFO_TRIGGERING_EFFECT: 2,
  CHAININFO_TRIGGERING_LEVEL: 262144,
  CHAININFO_TRIGGERING_LOCATION: 16,
  CHAININFO_TRIGGERING_PLAYER: 4,
  CHAININFO_TRIGGERING_POSITION: 16384,
  CHAININFO_TRIGGERING_RACE: 2097152,
  CHAININFO_TRIGGERING_RANK: 524288,
  CHAININFO_TRIGGERING_SEQUENCE: 32,
  CHAININFO_TYPE: 4096,
  CHINT_ATTRIBUTE: 4,
  CHINT_CARD: 2,
  CHINT_DESC: 6,
  CHINT_NUMBER: 5,
  CHINT_RACE: 3,
  CHINT_TURN: 1,
  COUNTER_NEED_ENABLE: 8192,
  COUNTER_WITHOUT_PERMIT: 4096,
  DUEL_ATTACK_FIRST_TURN: 2,
  DUEL_OBSOLETE_RULING: 8,
  DUEL_OLD_REPLAY: 4,
  DUEL_PSEUDO_SHUFFLE: 16,
  DUEL_RETURN_DECK_TOP: 128,
  DUEL_REVEAL_DECK_SEQ: 256,
  DUEL_SIMPLE_AI: 64,
  DUEL_TAG_MODE: 32,
  DUEL_TEST_MODE: 1,
  EFFECT_ACTIVATE_COST: 90,
  EFFECT_ACTIVATION_COUNT_LIMIT: 367,
  EFFECT_ADD_ATTRIBUTE: 125,
  EFFECT_ADD_CODE: 113,
  EFFECT_ADD_EXTRA_TRIBUTE: 157,
  EFFECT_ADD_FUSION_ATTRIBUTE: 349,
  EFFECT_ADD_FUSION_CODE: 340,
  EFFECT_ADD_FUSION_SETCODE: 341,
  EFFECT_ADD_LINK_ATTRIBUTE: 356,
  EFFECT_ADD_LINK_CODE: 354,
  EFFECT_ADD_LINK_RACE: 357,
  EFFECT_ADD_LINK_SETCODE: 355,
  EFFECT_ADD_RACE: 120,
  EFFECT_ADD_SETCODE: 334,
  EFFECT_ADD_TYPE: 115,
  EFFECT_ALSO_BATTLE_DAMAGE: 207,
  EFFECT_ATTACK_ALL: 193,
  EFFECT_ATTACK_COST: 96,
  EFFECT_ATTACK_DISABLED: 197,
  EFFECT_AVOID_BATTLE_DAMAGE: 201,
  EFFECT_BATTLE_DAMAGE_TO_EFFECT: 205,
  EFFECT_BATTLE_DESTROY_REDIRECT: 204,
  EFFECT_BOTH_BATTLE_DAMAGE: 206,
  EFFECT_BP_TWICE: 296,
  EFFECT_CANNOT_ACTIVATE: 6,
  EFFECT_CANNOT_ATTACK: 85,
  EFFECT_CANNOT_ATTACK_ANNOUNCE: 86,
  EFFECT_CANNOT_BE_BATTLE_TARGET: 70,
  EFFECT_CANNOT_BE_EFFECT_TARGET: 71,
  EFFECT_CANNOT_BP: 185,
  EFFECT_CANNOT_CHANGE_CONTROL: 5,
  EFFECT_CANNOT_CHANGE_POSITION: 14,
  EFFECT_CANNOT_CHANGE_POS_E: 87,
  EFFECT_CANNOT_DIRECT_ATTACK: 73,
  EFFECT_CANNOT_DISABLE: 3,
  EFFECT_CANNOT_DISABLE_FLIP_SUMMON: 39,
  EFFECT_CANNOT_DISABLE_SPSUMMON: 27,
  EFFECT_CANNOT_DISABLE_SUMMON: 26,
  EFFECT_CANNOT_DISCARD_DECK: 56,
  EFFECT_CANNOT_DISCARD_HAND: 55,
  EFFECT_CANNOT_DISEFFECT: 13,
  EFFECT_CANNOT_DRAW: 25,
  EFFECT_CANNOT_EP: 187,
  EFFECT_CANNOT_FLIP_SUMMON: 21,
  EFFECT_CANNOT_INACTIVATE: 12,
  EFFECT_CANNOT_M2: 186,
  EFFECT_CANNOT_MSET: 23,
  EFFECT_CANNOT_PLACE_COUNTER: 58,
  EFFECT_CANNOT_RELEASE: 46,
  EFFECT_CANNOT_REMOVE: 67,
  EFFECT_CANNOT_SELECT_BATTLE_TARGET: 332,
  EFFECT_CANNOT_SELECT_EFFECT_TARGET: 333,
  EFFECT_CANNOT_SPECIAL_SUMMON: 22,
  EFFECT_CANNOT_SSET: 24,
  EFFECT_CANNOT_SUMMON: 20,
  EFFECT_CANNOT_TO_DECK: 66,
  EFFECT_CANNOT_TO_GRAVE: 68,
  EFFECT_CANNOT_TO_GRAVE_AS_COST: 59,
  EFFECT_CANNOT_TO_HAND: 65,
  EFFECT_CANNOT_TRIGGER: 7,
  EFFECT_CANNOT_TURN_SET: 69,
  EFFECT_CANNOT_USE_AS_COST: 57,
  EFFECT_CHAIN_MATERIAL: 231,
  EFFECT_CHANGE_ATTRIBUTE: 127,
  EFFECT_CHANGE_BATTLE_DAMAGE: 208,
  EFFECT_CHANGE_CODE: 114,
  EFFECT_CHANGE_DAMAGE: 82,
  EFFECT_CHANGE_ENVIRONMENT: 290,
  EFFECT_CHANGE_FUSION_ATTRIBUTE: 351,
  EFFECT_CHANGE_GRAVE_ATTRIBUTE: 365,
  EFFECT_CHANGE_GRAVE_RACE: 366,
  EFFECT_CHANGE_INVOLVING_BATTLE_DAMAGE: 314,
  EFFECT_CHANGE_LEVEL: 131,
  EFFECT_CHANGE_LSCALE: 135,
  EFFECT_CHANGE_RACE: 122,
  EFFECT_CHANGE_RANK: 133,
  EFFECT_CHANGE_RANK_FINAL: 315,
  EFFECT_CHANGE_RSCALE: 137,
  EFFECT_CHANGE_TYPE: 117,
  EFFECT_COUNT_CODE_CHAIN: 1073741824,
  EFFECT_COUNT_CODE_DUEL: 536870912,
  EFFECT_COUNT_CODE_OATH: 268435456,
  EFFECT_COUNT_CODE_SINGLE: 1,
  EFFECT_DECREASE_TRIBUTE: 151,
  EFFECT_DECREASE_TRIBUTE_SET: 152,
  EFFECT_DEFENSE_ATTACK: 190,
  EFFECT_DESTROY_REPLACE: 50,
  EFFECT_DESTROY_SUBSTITUTE: 45,
  EFFECT_DIRECT_ATTACK: 74,
  EFFECT_DISABLE: 2,
  EFFECT_DISABLE_CHAIN: 9,
  EFFECT_DISABLE_CHAIN_FIELD: 337,
  EFFECT_DISABLE_EFFECT: 8,
  EFFECT_DISABLE_FIELD: 260,
  EFFECT_DISABLE_TRAPMONSTER: 10,
  EFFECT_DISCARD_COST_CHANGE: 338,
  EFFECT_DIVINE_LIGHT: 38,
  EFFECT_DOUBLE_TRIBUTE: 150,
  EFFECT_DOUBLE_XMATERIAL: 375,
  EFFECT_DRAW_COUNT: 271,
  EFFECT_DUAL_STATUS: 75,
  EFFECT_DUAL_SUMMONABLE: 77,
  EFFECT_EQUIP_LIMIT: 76,
  EFFECT_EXTRA_ATTACK: 194,
  EFFECT_EXTRA_ATTACK_MONSTER: 346,
  EFFECT_EXTRA_FUSION_MATERIAL: 352,
  EFFECT_EXTRA_LINK_MATERIAL: 358,
  EFFECT_EXTRA_PENDULUM_SUMMON: 360,
  EFFECT_EXTRA_RELEASE: 153,
  EFFECT_EXTRA_RELEASE_NONSUM: 158,
  EFFECT_EXTRA_RELEASE_SUM: 155,
  EFFECT_EXTRA_SET_COUNT: 35,
  EFFECT_EXTRA_SUMMON_COUNT: 29,
  EFFECT_EXTRA_SYNCHRO_MATERIAL: 232,
  EFFECT_FIRST_ATTACK: 192,
  EFFECT_FLAG2_COF: 2,
  EFFECT_FLAG2_OPTION: 8,
  EFFECT_FLAG2_REPEAT_UPDATE: 1,
  EFFECT_FLAG2_WICKED: 4,
  EFFECT_FLAG_ABSOLUTE_TARGET: 64,
  EFFECT_FLAG_ACTIVATE_CONDITION: 536870912,
  EFFECT_FLAG_BOTH_SIDE: 4096,
  EFFECT_FLAG_CANNOT_DISABLE: 1024,
  EFFECT_FLAG_CANNOT_INACTIVATE: 33554432,
  EFFECT_FLAG_CAN_FORBIDDEN: 512,
  EFFECT_FLAG_CARD_TARGET: 16,
  EFFECT_FLAG_CLIENT_HINT: 67108864,
  EFFECT_FLAG_COIN: 4294967296,
  EFFECT_FLAG_CONTINUOUS_TARGET: 134217728,
  EFFECT_FLAG_COPY: 8192,
  EFFECT_FLAG_COUNT_LIMIT: 4,
  EFFECT_FLAG_CVAL_CHECK: 1073741824,
  EFFECT_FLAG_DAMAGE_CAL: 32768,
  EFFECT_FLAG_DAMAGE_STEP: 16384,
  EFFECT_FLAG_DELAY: 65536,
  EFFECT_FLAG_DICE: 8589934592,
  EFFECT_FLAG_EFFECT: 536870912,
  EFFECT_FLAG_EVENT_PLAYER: 8388608,
  EFFECT_FLAG_FIELD_ONLY: 8,
  EFFECT_FLAG_FUNC_VALUE: 2,
  EFFECT_FLAG_FUSION_SUMMON: 17179869184,
  EFFECT_FLAG_IGNORE_IMMUNE: 128,
  EFFECT_FLAG_IGNORE_RANGE: 32,
  EFFECT_FLAG_IMMEDIATELY_APPLY: 2147483648,
  EFFECT_FLAG_INITIAL: 1,
  EFFECT_FLAG_LIMIT_ZONE: 268435456,
  EFFECT_FLAG_NO_TURN_RESET: 4194304,
  EFFECT_FLAG_OATH: 524288,
  EFFECT_FLAG_OWNER_RELATE: 16777216,
  EFFECT_FLAG_PLAYER_TARGET: 2048,
  EFFECT_FLAG_REPEAT: 2097152,
  EFFECT_FLAG_SET_AVAILABLE: 256,
  EFFECT_FLAG_SINGLE_RANGE: 131072,
  EFFECT_FLAG_SPSUM_PARAM: 1048576,
  EFFECT_FLAG_UNCOPYABLE: 262144,
  EFFECT_FLIPSUMMON_COST: 93,
  EFFECT_FORBIDDEN: 292,
  EFFECT_FUSION_MATERIAL: 230,
  EFFECT_FUSION_SUBSTITUTE: 234,
  EFFECT_HAND_LIMIT: 270,
  EFFECT_HAND_SYNCHRO: 339,
  EFFECT_IGNORE_BATTLE_TARGET: 72,
  EFFECT_IMMUNE_EFFECT: 1,
  EFFECT_INDESTRUCTABLE: 40,
  EFFECT_INDESTRUCTABLE_BATTLE: 42,
  EFFECT_INDESTRUCTABLE_COUNT: 47,
  EFFECT_INDESTRUCTABLE_EFFECT: 41,
  EFFECT_KAISER_COLOSSEUM: 370,
  EFFECT_LEAVE_FIELD_REDIRECT: 60,
  EFFECT_LEFT_SPSUMMON_COUNT: 331,
  EFFECT_LIMIT_SET_PROC: 37,
  EFFECT_LIMIT_SPECIAL_SUMMON_POSITION: 368,
  EFFECT_LIMIT_SUMMON_PROC: 33,
  EFFECT_LPCOST_CHANGE: 170,
  EFFECT_LPCOST_REPLACE: 171,
  EFFECT_MATCH_KILL: 300,
  EFFECT_MATERIAL_CHECK: 251,
  EFFECT_MATERIAL_LIMIT: 361,
  EFFECT_MAX_MZONE: 263,
  EFFECT_MAX_SZONE: 264,
  EFFECT_MONSTER_SSET: 18,
  EFFECT_MSET_COST: 94,
  EFFECT_MUST_ATTACK: 191,
  EFFECT_MUST_ATTACK_MONSTER: 344,
  EFFECT_MUST_BE_ATTACKED: 195,
  EFFECT_MUST_BE_FMATERIAL: 316,
  EFFECT_MUST_BE_LMATERIAL: 318,
  EFFECT_MUST_BE_SMATERIAL: 312,
  EFFECT_MUST_BE_XMATERIAL: 317,
  EFFECT_MUST_USE_MZONE: 265,
  EFFECT_NECRO_VALLEY: 291,
  EFFECT_NECRO_VALLEY_IM: 293,
  EFFECT_NO_BATTLE_DAMAGE: 200,
  EFFECT_NO_EFFECT_DAMAGE: 335,
  EFFECT_OLDUNION_STATUS: 348,
  EFFECT_ONLY_ATTACK_MONSTER: 343,
  EFFECT_ONLY_BE_ATTACKED: 196,
  EFFECT_OVERLAY_RITUAL_MATERIAL: 364,
  EFFECT_PATRICIAN_OF_DARKNESS: 345,
  EFFECT_PIERCE: 203,
  EFFECT_PRE_MONSTER: 250,
  EFFECT_PUBLIC: 160,
  EFFECT_QP_ACT_IN_NTPHAND: 311,
  EFFECT_QP_ACT_IN_SET_TURN: 359,
  EFFECT_REFLECT_BATTLE_DAMAGE: 202,
  EFFECT_REFLECT_DAMAGE: 83,
  EFFECT_RELEASE_REPLACE: 51,
  EFFECT_REMAIN_FIELD: 17,
  EFFECT_REMOVE_ATTRIBUTE: 126,
  EFFECT_REMOVE_BRAINWASHING: 295,
  EFFECT_REMOVE_FUSION_ATTRIBUTE: 350,
  EFFECT_REMOVE_RACE: 121,
  EFFECT_REMOVE_REDIRECT: 64,
  EFFECT_REMOVE_TYPE: 116,
  EFFECT_REPLACE_DAMAGE: 371,
  EFFECT_REVERSE_DAMAGE: 80,
  EFFECT_REVERSE_DECK: 294,
  EFFECT_REVERSE_RECOVER: 81,
  EFFECT_REVERSE_UPDATE: 108,
  EFFECT_REVIVE_LIMIT: 31,
  EFFECT_RISE_TO_FULL_HEIGHT: 342,
  EFFECT_RITUAL_LEVEL_EX: 374,
  EFFECT_SELF_DESTROY: 141,
  EFFECT_SELF_TOGRAVE: 142,
  EFFECT_SEND_REPLACE: 52,
  EFFECT_SET_ATTACK: 101,
  EFFECT_SET_ATTACK_FINAL: 102,
  EFFECT_SET_BASE_ATTACK: 103,
  EFFECT_SET_BASE_ATTACK_FINAL: 111,
  EFFECT_SET_BASE_DEFENSE: 107,
  EFFECT_SET_BASE_DEFENSE_FINAL: 112,
  EFFECT_SET_BATTLE_ATTACK: 362,
  EFFECT_SET_BATTLE_DEFENSE: 363,
  EFFECT_SET_CONTROL: 4,
  EFFECT_SET_DEFENSE: 105,
  EFFECT_SET_DEFENSE_FINAL: 106,
  EFFECT_SET_POSITION: 140,
  EFFECT_SET_PROC: 36,
  EFFECT_SET_SUMMON_COUNT_LIMIT: 28,
  EFFECT_SKIP_BP: 183,
  EFFECT_SKIP_DP: 180,
  EFFECT_SKIP_M1: 182,
  EFFECT_SKIP_M2: 184,
  EFFECT_SKIP_SP: 181,
  EFFECT_SKIP_TURN: 188,
  EFFECT_SPIRIT_DONOT_RETURN: 280,
  EFFECT_SPIRIT_MAYNOT_RETURN: 281,
  EFFECT_SPSUMMON_CONDITION: 30,
  EFFECT_SPSUMMON_COST: 92,
  EFFECT_SPSUMMON_COUNT_LIMIT: 330,
  EFFECT_SPSUMMON_PROC: 34,
  EFFECT_SPSUMMON_PROC_G: 320,
  EFFECT_SSET_COST: 95,
  EFFECT_SUMMON_COST: 91,
  EFFECT_SUMMON_PROC: 32,
  EFFECT_SWAP_AD: 109,
  EFFECT_SWAP_BASE_AD: 110,
  EFFECT_SYNCHRO_CHECK: 310,
  EFFECT_SYNCHRO_LEVEL_EX: 373,
  EFFECT_TOSS_COIN_REPLACE: 220,
  EFFECT_TOSS_DICE_REPLACE: 221,
  EFFECT_TO_DECK_REDIRECT: 62,
  EFFECT_TO_GRAVE_REDIRECT: 63,
  EFFECT_TO_GRAVE_REDIRECT_CB: 313,
  EFFECT_TO_HAND_REDIRECT: 61,
  EFFECT_TRAP_ACT_IN_HAND: 15,
  EFFECT_TRAP_ACT_IN_SET_TURN: 16,
  EFFECT_TRIBUTE_LIMIT: 154,
  EFFECT_TRIPLE_TRIBUTE: 156,
  EFFECT_TUNER: 369,
  EFFECT_TUNER_MATERIAL_LIMIT: 353,
  EFFECT_TYPE_ACTIONS: 8,
  EFFECT_TYPE_ACTIVATE: 16,
  EFFECT_TYPE_CONTINUOUS: 2048,
  EFFECT_TYPE_EQUIP: 4,
  EFFECT_TYPE_FIELD: 2,
  EFFECT_TYPE_FLIP: 32,
  EFFECT_TYPE_GRANT: 8192,
  EFFECT_TYPE_IGNITION: 64,
  EFFECT_TYPE_QUICK_F: 1024,
  EFFECT_TYPE_QUICK_O: 256,
  EFFECT_TYPE_SINGLE: 1,
  EFFECT_TYPE_TARGET: 16384,
  EFFECT_TYPE_TRIGGER_F: 512,
  EFFECT_TYPE_TRIGGER_O: 128,
  EFFECT_TYPE_XMATERIAL: 4096,
  EFFECT_UNION_LIMIT: 78,
  EFFECT_UNION_STATUS: 347,
  EFFECT_UNIQUE_CHECK: 297,
  EFFECT_UNRELEASABLE_EFFECT: 48,
  EFFECT_UNRELEASABLE_NONSUM: 44,
  EFFECT_UNRELEASABLE_SUM: 43,
  EFFECT_UNSUMMONABLE_CARD: 336,
  EFFECT_UPDATE_ATTACK: 100,
  EFFECT_UPDATE_DEFENSE: 104,
  EFFECT_UPDATE_LEVEL: 130,
  EFFECT_UPDATE_LSCALE: 134,
  EFFECT_UPDATE_RANK: 132,
  EFFECT_UPDATE_RSCALE: 136,
  EFFECT_USE_EXTRA_MZONE: 261,
  EFFECT_USE_EXTRA_SZONE: 262,
  EFFECT_XYZ_MATERIAL: 233,
  EFFECT_XYZ_MIN_COUNT: 372,
  EVENT_ADD_COUNTER: 65536,
  EVENT_ADJUST: 1040,
  EVENT_ATTACK_ANNOUNCE: 1130,
  EVENT_ATTACK_DISABLED: 1142,
  EVENT_BATTLED: 1138,
  EVENT_BATTLE_CONFIRM: 1133,
  EVENT_BATTLE_DAMAGE: 1143,
  EVENT_BATTLE_DESTROYED: 1140,
  EVENT_BATTLE_DESTROYING: 1139,
  EVENT_BATTLE_END: 1137,
  EVENT_BATTLE_START: 1132,
  EVENT_BECOME_TARGET: 1028,
  EVENT_BE_BATTLE_TARGET: 1131,
  EVENT_BE_MATERIAL: 1108,
  EVENT_BE_PRE_MATERIAL: 1109,
  EVENT_BREAK_EFFECT: 1050,
  EVENT_CHAINING: 1027,
  EVENT_CHAIN_ACTIVATED: 1023,
  EVENT_CHAIN_ACTIVATING: 1021,
  EVENT_CHAIN_DISABLED: 1025,
  EVENT_CHAIN_END: 1026,
  EVENT_CHAIN_NEGATED: 1024,
  EVENT_CHAIN_SOLVED: 1022,
  EVENT_CHAIN_SOLVING: 1020,
  EVENT_CHANGE_POS: 1016,
  EVENT_CONTROL_CHANGED: 1120,
  EVENT_CUSTOM: 268435456,
  EVENT_DAMAGE: 1111,
  EVENT_DAMAGE_CALCULATING: 1135,
  EVENT_DAMAGE_STEP_END: 1141,
  EVENT_DESTROY: 1010,
  EVENT_DESTROYED: 1029,
  EVENT_DETACH_MATERIAL: 1202,
  EVENT_DISCARD: 1018,
  EVENT_DRAW: 1110,
  EVENT_EQUIP: 1121,
  EVENT_FLIP: 1001,
  EVENT_FLIP_SUMMON: 1104,
  EVENT_FLIP_SUMMON_NEGATED: 1115,
  EVENT_FLIP_SUMMON_SUCCESS: 1101,
  EVENT_FREE_CHAIN: 1002,
  EVENT_LEAVE_DECK: 1032,
  EVENT_LEAVE_FIELD: 1015,
  EVENT_LEAVE_FIELD_P: 1019,
  EVENT_LEAVE_GRAVE: 1031,
  EVENT_LEVEL_UP: 1200,
  EVENT_MOVE: 1030,
  EVENT_MSET: 1106,
  EVENT_PAY_LPCOST: 1201,
  EVENT_PHASE: 4096,
  EVENT_PHASE_START: 8192,
  EVENT_PREDRAW: 1113,
  EVENT_PRE_BATTLE_DAMAGE: 1136,
  EVENT_PRE_DAMAGE_CALCULATE: 1134,
  EVENT_RECOVER: 1112,
  EVENT_RELEASE: 1017,
  EVENT_REMOVE: 1011,
  EVENT_REMOVE_COUNTER: 131072,
  EVENT_RETURN_TO_GRAVE: 1203,
  EVENT_SPSUMMON: 1105,
  EVENT_SPSUMMON_NEGATED: 1116,
  EVENT_SPSUMMON_SUCCESS: 1102,
  EVENT_SPSUMMON_SUCCESS_G_P: 1117,
  EVENT_SSET: 1107,
  EVENT_STARTUP: 1e3,
  EVENT_SUMMON: 1103,
  EVENT_SUMMON_NEGATED: 1114,
  EVENT_SUMMON_SUCCESS: 1100,
  EVENT_TOSS_COIN: 1151,
  EVENT_TOSS_COIN_NEGATE: 1152,
  EVENT_TOSS_DICE: 1150,
  EVENT_TOSS_DICE_NEGATE: 1153,
  EVENT_TO_DECK: 1013,
  EVENT_TO_GRAVE: 1014,
  EVENT_TO_HAND: 1012,
  EVENT_TURN_END: 1210,
  FLAG_ID_ALLURE_QUEEN: 4,
  FLAG_ID_ARCANA_COIN: 5,
  FLAG_ID_CHAINING: 1,
  FLAG_ID_NO_NORMAL_DRAW: 3,
  FLAG_ID_REVERSAL_OF_FATE: 36690018,
  FLAG_ID_UNION: 2,
  GLOBALFLAG_BRAINWASHING_CHECK: 2,
  GLOBALFLAG_DECK_REVERSE_CHECK: 1,
  GLOBALFLAG_DELAYED_QUICKEFFECT: 8,
  GLOBALFLAG_DETACH_EVENT: 16,
  GLOBALFLAG_MUST_BE_SMATERIAL: 32,
  GLOBALFLAG_SCRAP_CHIMERA: 4,
  GLOBALFLAG_SELF_TOGRAVE: 256,
  GLOBALFLAG_SPSUMMON_COUNT: 64,
  GLOBALFLAG_SPSUMMON_ONCE: 512,
  GLOBALFLAG_TUNE_MAGICIAN: 1024,
  GLOBALFLAG_XMAT_COUNT_LIMIT: 128,
  HINGMSG_LVRANK: 567,
  HINGMSG_NUMBER: 565,
  HINTMSG_ATOHAND: 506,
  HINTMSG_ATTACK: 516,
  HINTMSG_ATTACKTARGET: 549,
  HINTMSG_ATTRIBUTE: 562,
  HINTMSG_CARDTYPE: 554,
  HINTMSG_CODE: 564,
  HINTMSG_COIN: 552,
  HINTMSG_CONFIRM: 526,
  HINTMSG_CONTROL: 520,
  HINTMSG_COUNTER: 572,
  HINTMSG_DEATTACHFROM: 532,
  HINTMSG_DEFENSE: 517,
  HINTMSG_DESREPLACE: 521,
  HINTMSG_DESTROY: 502,
  HINTMSG_DICE: 553,
  HINTMSG_DISABLE: 573,
  HINTMSG_DISABLEZONE: 570,
  HINTMSG_DISCARD: 501,
  HINTMSG_EFFECT: 550,
  HINTMSG_EQUIP: 518,
  HINTMSG_FACEDOWN: 515,
  HINTMSG_FACEDOWNATTACK: 524,
  HINTMSG_FACEDOWNDEFENSE: 525,
  HINTMSG_FACEUP: 514,
  HINTMSG_FACEUPATTACK: 522,
  HINTMSG_FACEUPDEFENSE: 523,
  HINTMSG_FIELD_FIRST: 575,
  HINTMSG_FMATERIAL: 511,
  HINTMSG_LMATERIAL: 533,
  HINTMSG_OPERATECARD: 574,
  HINTMSG_OPPO: 530,
  HINTMSG_OPTION: 555,
  HINTMSG_POSCHANGE: 528,
  HINTMSG_POSITION: 561,
  HINTMSG_RACE: 563,
  HINTMSG_RELEASE: 500,
  HINTMSG_REMOVE: 503,
  HINTMSG_REMOVEXYZ: 519,
  HINTMSG_RESOLVECARD: 568,
  HINTMSG_RESOLVEEFFECT: 556,
  HINTMSG_RTOHAND: 505,
  HINTMSG_SELECT: 560,
  HINTMSG_SELF: 529,
  HINTMSG_SET: 510,
  HINTMSG_SMATERIAL: 512,
  HINTMSG_SPSUMMON: 509,
  HINTMSG_SUMMON: 508,
  HINTMSG_TARGET: 551,
  HINTMSG_TODECK: 507,
  HINTMSG_TOFIELD: 527,
  HINTMSG_TOGRAVE: 504,
  HINTMSG_TOZONE: 571,
  HINTMSG_TRIBUTE: 531,
  HINTMSG_XMATERIAL: 513,
  HINTMSG_ZONE: 569,
  HINT_ATTRIB: 7,
  HINT_CARD: 10,
  HINT_CODE: 8,
  HINT_EFFECT: 5,
  HINT_EVENT: 1,
  HINT_MESSAGE: 2,
  HINT_NUMBER: 9,
  HINT_OPSELECTED: 4,
  HINT_RACE: 6,
  HINT_SELECTMSG: 3,
  HINT_ZONE: 11,
  LINK_MARKER_BOTTOM: 2,
  LINK_MARKER_BOTTOM_LEFT: 1,
  LINK_MARKER_BOTTOM_RIGHT: 4,
  LINK_MARKER_LEFT: 8,
  LINK_MARKER_RIGHT: 32,
  LINK_MARKER_TOP: 128,
  LINK_MARKER_TOP_LEFT: 64,
  LINK_MARKER_TOP_RIGHT: 256,
  LOCATION_DECK: 1,
  LOCATION_DECKBOT: 65537,
  LOCATION_DECKSHF: 131073,
  LOCATION_EXTRA: 64,
  LOCATION_FZONE: 256,
  LOCATION_GRAVE: 16,
  LOCATION_HAND: 2,
  LOCATION_MZONE: 4,
  LOCATION_ONFIELD: 12,
  LOCATION_OVERLAY: 128,
  LOCATION_PZONE: 512,
  LOCATION_REASON_CONTROL: 2,
  LOCATION_REASON_TOFIELD: 1,
  LOCATION_REMOVED: 32,
  LOCATION_SZONE: 8,
  MASTER_RULE3: 3,
  MASTER_RULE_2020: 5,
  MAX_COUNTER: 65535,
  MAX_ID: 268435455,
  MAX_PARAMETER: 65535,
  MAX_XYZ_LEVEL: 4095,
  MIN_ID: 128,
  NEW_MASTER_RULE: 4,
  OPCODE_ADD: 1073741824,
  OPCODE_AND: 1073741828,
  OPCODE_DIV: 1073741827,
  OPCODE_ISATTRIBUTE: 1073742084,
  OPCODE_ISCODE: 1073742080,
  OPCODE_ISRACE: 1073742083,
  OPCODE_ISSETCARD: 1073742081,
  OPCODE_ISTYPE: 1073742082,
  OPCODE_MUL: 1073741826,
  OPCODE_NEG: 1073741830,
  OPCODE_NOT: 1073741831,
  OPCODE_OR: 1073741829,
  OPCODE_SUB: 1073741825,
  PHASE_BATTLE: 128,
  PHASE_BATTLE_START: 8,
  PHASE_BATTLE_STEP: 16,
  PHASE_DAMAGE: 32,
  PHASE_DAMAGE_CAL: 64,
  PHASE_DRAW: 1,
  PHASE_END: 512,
  PHASE_MAIN1: 4,
  PHASE_MAIN2: 256,
  PHASE_STANDBY: 2,
  PLAYER_ALL: 3,
  PLAYER_NONE: 2,
  POS_ATTACK: 3,
  POS_DEFENSE: 12,
  POS_FACEDOWN: 10,
  POS_FACEDOWN_ATTACK: 2,
  POS_FACEDOWN_DEFENSE: 8,
  POS_FACEUP: 5,
  POS_FACEUP_ATTACK: 1,
  POS_FACEUP_DEFENSE: 4,
  RACE_ALL: 67108863,
  RACE_AQUA: 64,
  RACE_BEAST: 16384,
  RACE_BEASTWARRIOR: 32768,
  RACE_CREATORGOD: 4194304,
  RACE_CYBERSE: 16777216,
  RACE_DINOSAUR: 65536,
  RACE_DIVINE: 2097152,
  RACE_DRAGON: 8192,
  RACE_FAIRY: 4,
  RACE_FIEND: 8,
  RACE_FISH: 131072,
  RACE_ILLUSION: 33554432,
  RACE_INSECT: 2048,
  RACE_MACHINE: 32,
  RACE_PLANT: 1024,
  RACE_PSYCHO: 1048576,
  RACE_PYRO: 128,
  RACE_REPTILE: 524288,
  RACE_ROCK: 256,
  RACE_SEASERPENT: 262144,
  RACE_SPELLCASTER: 2,
  RACE_THUNDER: 4096,
  RACE_WARRIOR: 1,
  RACE_WINDBEAST: 512,
  RACE_WYRM: 8388608,
  RACE_ZOMBIE: 16,
  REASON_ACTION: 2147483648,
  REASON_ADJUST: 256,
  REASON_BATTLE: 32,
  REASON_COST: 128,
  REASON_DESTROY: 1,
  REASON_DISCARD: 16384,
  REASON_DISSUMMON: 4096,
  REASON_DRAW: 33554432,
  REASON_EFFECT: 64,
  REASON_FLIP: 8192,
  REASON_FUSION: 262144,
  REASON_LINK: 268435456,
  REASON_LOST_OVERLAY: 536870912,
  REASON_LOST_TARGET: 512,
  REASON_MAINTENANCE: 1073741824,
  REASON_MATERIAL: 8,
  REASON_RDAMAGE: 32768,
  REASON_REDIRECT: 67108864,
  REASON_RELEASE: 2,
  REASON_REPLACE: 16777216,
  REASON_RETURN: 131072,
  REASON_REVEAL: 134217728,
  REASON_RITUAL: 1048576,
  REASON_RRECOVER: 65536,
  REASON_RULE: 1024,
  REASON_SPSUMMON: 2048,
  REASON_SUMMON: 16,
  REASON_SYNCHRO: 524288,
  REASON_TEMPORARY: 4,
  REASON_XYZ: 2097152,
  RESETS_REDIRECT: 209584128,
  RESETS_STANDARD: 33423360,
  RESETS_WITHOUT_TEMP_REMOVE: 91095040,
  RESET_CARD: 8192,
  RESET_CHAIN: 2147483648,
  RESET_CODE: 16384,
  RESET_CONTROL: 33554432,
  RESET_COPY: 32768,
  RESET_DISABLE: 65536,
  RESET_EVENT: 4096,
  RESET_LEAVE: 8388608,
  RESET_MSCHANGE: 134217728,
  RESET_OPPO_TURN: 536870912,
  RESET_OVERLAY: 67108864,
  RESET_PHASE: 1073741824,
  RESET_REMOVE: 524288,
  RESET_SELF_TURN: 268435456,
  RESET_TEMP_REMOVE: 1048576,
  RESET_TODECK: 4194304,
  RESET_TOFIELD: 16777216,
  RESET_TOGRAVE: 262144,
  RESET_TOHAND: 2097152,
  RESET_TURN_SET: 131072,
  SELECT_HEADS: 60,
  SELECT_TAILS: 61,
  SEQ_DECKBOTTOM: 1,
  SEQ_DECKSHUFFLE: 2,
  SEQ_DECKTOP: 0,
  STATUS_ACTIVATE_DISABLED: 262144,
  STATUS_ACT_FROM_HAND: 134217728,
  STATUS_ATTACK_CANCELED: 2097152,
  STATUS_BATTLE_DESTROYED: 16384,
  STATUS_BATTLE_RESULT: 64,
  STATUS_CANNOT_CHANGE_FORM: 256,
  STATUS_CHAINING: 65536,
  STATUS_CONTINUOUS_POS: 33554432,
  STATUS_COPYING_EFFECT: 32768,
  STATUS_DESTROY_CONFIRMED: 4096,
  STATUS_DISABLED: 1,
  STATUS_EFFECT_ENABLED: 1024,
  STATUS_EFFECT_REPLACED: 524288,
  STATUS_FLIP_SUMMONING: 1048576,
  STATUS_FLIP_SUMMON_DISABLED: 2147483648,
  STATUS_FLIP_SUMMON_TURN: 536870912,
  STATUS_FORBIDDEN: 67108864,
  STATUS_INITIALIZING: 4194304,
  STATUS_JUST_POS: 16777216,
  STATUS_LEAVE_CONFIRMED: 8192,
  STATUS_NO_LEVEL: 32,
  STATUS_OPPO_BATTLE: 268435456,
  STATUS_PROC_COMPLETE: 8,
  STATUS_SET_TURN: 16,
  STATUS_SPSUMMON_STEP: 128,
  STATUS_SPSUMMON_TURN: 1073741824,
  STATUS_SUMMONING: 512,
  STATUS_SUMMON_DISABLED: 131072,
  STATUS_SUMMON_TURN: 2048,
  STATUS_TO_DISABLE: 4,
  STATUS_TO_ENABLE: 2,
  STATUS_TO_HAND_WITHOUT_CONFIRM: 8388608,
  SUMMON_INFO_ATTACK: 128,
  SUMMON_INFO_ATTRIBUTE: 32,
  SUMMON_INFO_CODE: 1,
  SUMMON_INFO_CODE2: 2,
  SUMMON_INFO_DEFENSE: 256,
  SUMMON_INFO_LEVEL: 8,
  SUMMON_INFO_RACE: 64,
  SUMMON_INFO_RANK: 16,
  SUMMON_INFO_REASON_EFFECT: 512,
  SUMMON_INFO_REASON_PLAYER: 1024,
  SUMMON_INFO_TYPE: 4,
  SUMMON_TYPE_ADVANCE: 285212672,
  SUMMON_TYPE_DUAL: 301989888,
  SUMMON_TYPE_FLIP: 536870912,
  SUMMON_TYPE_FUSION: 1124073472,
  SUMMON_TYPE_LINK: 1275068416,
  SUMMON_TYPE_NORMAL: 268435456,
  SUMMON_TYPE_PENDULUM: 1241513984,
  SUMMON_TYPE_RITUAL: 1157627904,
  SUMMON_TYPE_SPECIAL: 1073741824,
  SUMMON_TYPE_SYNCHRO: 1174405120,
  SUMMON_TYPE_XYZ: 1224736768,
  SUMMON_VALUE_ASSAULT_MODE: 21,
  SUMMON_VALUE_DARK_FUSION: 1124073494,
  SUMMON_VALUE_DARK_SANCTUARY: 18,
  SUMMON_VALUE_EVOLTILE: 16384,
  SUMMON_VALUE_FOSSIL_FUSION: 1124073495,
  SUMMON_VALUE_FUTURE_FUSION: 1124073496,
  SUMMON_VALUE_GLADIATOR: 8192,
  SUMMON_VALUE_LV: 4096,
  SUMMON_VALUE_MASK_CHANGE: 20,
  SUMMON_VALUE_MONSTER_REBORN: 19,
  SUMMON_VALUE_SELF: 1,
  SUMMON_VALUE_SYNCHRO_MATERIAL: 17,
  TIMINGS_CHECK_MONSTER: 448,
  TIMING_ATTACK: 4096,
  TIMING_BATTLED: 134217728,
  TIMING_BATTLE_END: 16,
  TIMING_BATTLE_PHASE: 16777216,
  TIMING_BATTLE_START: 8,
  TIMING_BATTLE_STEP_END: 67108864,
  TIMING_CHAIN_END: 32768,
  TIMING_DAMAGE: 131072,
  TIMING_DAMAGE_CAL: 16384,
  TIMING_DAMAGE_STEP: 8192,
  TIMING_DESTROY: 524288,
  TIMING_DRAW: 65536,
  TIMING_DRAW_PHASE: 1,
  TIMING_END_PHASE: 32,
  TIMING_EQUIP: 33554432,
  TIMING_FLIPSUMMON: 256,
  TIMING_MAIN_END: 4,
  TIMING_MSET: 512,
  TIMING_POS_CHANGE: 2048,
  TIMING_RECOVER: 262144,
  TIMING_REMOVE: 1048576,
  TIMING_SPSUMMON: 128,
  TIMING_SSET: 1024,
  TIMING_STANDBY_PHASE: 2,
  TIMING_SUMMON: 64,
  TIMING_TODECK: 4194304,
  TIMING_TOGRAVE: 8388608,
  TIMING_TOHAND: 2097152,
  TYPES_EFFECT_TRAP_MONSTER: 289,
  TYPES_NORMAL_TRAP_MONSTER: 273,
  TYPES_TOKEN_MONSTER: 16401,
  TYPE_CONTINUOUS: 131072,
  TYPE_COUNTER: 1048576,
  TYPE_DUAL: 2048,
  TYPE_EFFECT: 32,
  TYPE_EQUIP: 262144,
  TYPE_FIELD: 524288,
  TYPE_FLIP: 2097152,
  TYPE_FUSION: 64,
  TYPE_LINK: 67108864,
  TYPE_MONSTER: 1,
  TYPE_NORMAL: 16,
  TYPE_PENDULUM: 16777216,
  TYPE_QUICKPLAY: 65536,
  TYPE_RITUAL: 128,
  TYPE_SPELL: 2,
  TYPE_SPIRIT: 512,
  TYPE_SPSUMMON: 33554432,
  TYPE_SYNCHRO: 8192,
  TYPE_TOKEN: 16384,
  TYPE_TOON: 4194304,
  TYPE_TRAP: 4,
  TYPE_TRAPMONSTER: 256,
  TYPE_TUNER: 4096,
  TYPE_UNION: 1024,
  TYPE_XYZ: 8388608
};
var YGOProMsgChainEnd = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgChainEnd");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CHAIN_END;
  }
  getRequireRefreshZones() {
    const location = OcgcoreScriptConstants.LOCATION_MZONE | OcgcoreScriptConstants.LOCATION_SZONE | OcgcoreScriptConstants.LOCATION_HAND;
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
var YGOProMsgChainNegated = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgChainNegated");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CHAIN_NEGATED;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgChainNegated.prototype, "chainCount", 2);
var YGOProMsgChainSolved = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgChainSolved");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CHAIN_SOLVED;
  }
  getRequireRefreshZones() {
    const location = OcgcoreScriptConstants.LOCATION_MZONE | OcgcoreScriptConstants.LOCATION_SZONE | OcgcoreScriptConstants.LOCATION_HAND;
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgChainSolved.prototype, "chainCount", 2);
var YGOProMsgChainSolving = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgChainSolving");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CHAIN_SOLVING;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgChainSolving.prototype, "chainCount", 2);
var YGOProMsgChained = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgChained");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CHAINED;
  }
  getRequireRefreshZones() {
    const location = OcgcoreScriptConstants.LOCATION_MZONE | OcgcoreScriptConstants.LOCATION_SZONE | OcgcoreScriptConstants.LOCATION_HAND;
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgChained.prototype, "chainCount", 2);
var YGOProMsgChaining_CardLocation = class {
  static {
    __name(this, "YGOProMsgChaining_CardLocation");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgChaining_CardLocation.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgChaining_CardLocation.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgChaining_CardLocation.prototype, "sequence", 2);
var YGOProMsgChaining = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgChaining");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CHAINING;
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgChaining.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgChaining.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgChaining.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgChaining.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgChaining.prototype, "subsequence", 2);
__decorateClass([
  BinaryField(() => YGOProMsgChaining_CardLocation, 8)
], YGOProMsgChaining.prototype, "chainCardLocation", 2);
__decorateClass([
  BinaryField("i32", 11)
], YGOProMsgChaining.prototype, "desc", 2);
__decorateClass([
  BinaryField("u8", 15)
], YGOProMsgChaining.prototype, "chainCount", 2);
var YGOProMsgConfirmCards_CardInfo = class {
  static {
    __name(this, "YGOProMsgConfirmCards_CardInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgConfirmCards_CardInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgConfirmCards_CardInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgConfirmCards_CardInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgConfirmCards_CardInfo.prototype, "sequence", 2);
var YGOProMsgConfirmCards = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgConfirmCards");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CONFIRM_CARDS;
  }
  getSendTargets() {
    if (this.cards.length > 0 && this.cards[0].location === 1) {
      return [this.player];
    }
    return SEND_TO_ALL;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgConfirmCards.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgConfirmCards.prototype, "skipPanel", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgConfirmCards.prototype, "count", 2);
__decorateClass([
  BinaryField(() => YGOProMsgConfirmCards_CardInfo, 3, (obj) => obj.count)
], YGOProMsgConfirmCards.prototype, "cards", 2);
var YGOProMsgConfirmDeckTop_CardInfo = class {
  static {
    __name(this, "YGOProMsgConfirmDeckTop_CardInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgConfirmDeckTop_CardInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgConfirmDeckTop_CardInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgConfirmDeckTop_CardInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgConfirmDeckTop_CardInfo.prototype, "sequence", 2);
var YGOProMsgConfirmDeckTop = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgConfirmDeckTop");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CONFIRM_DECKTOP;
  }
  // MSG_CONFIRM_DECKTOP 在 single_duel.cpp 中不做遮掩，直接发给所有人
  // ocgcore 通过 0x80000000 标记控制公开状态
  // 因此使用基类的默认实现（不遮掩）
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgConfirmDeckTop.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgConfirmDeckTop.prototype, "count", 2);
__decorateClass([
  BinaryField(() => YGOProMsgConfirmDeckTop_CardInfo, 2, (obj) => obj.count)
], YGOProMsgConfirmDeckTop.prototype, "cards", 2);
var YGOProMsgConfirmExtraTop_CardInfo = class {
  static {
    __name(this, "YGOProMsgConfirmExtraTop_CardInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgConfirmExtraTop_CardInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgConfirmExtraTop_CardInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgConfirmExtraTop_CardInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgConfirmExtraTop_CardInfo.prototype, "sequence", 2);
var YGOProMsgConfirmExtraTop = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgConfirmExtraTop");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_CONFIRM_EXTRATOP;
  }
  // MSG_CONFIRM_EXTRATOP 在 single_duel.cpp 中不做遮掩，直接发给所有人
  // ocgcore 通过 0x80000000 标记控制公开状态
  // 因此使用基类的默认实现（不遮掩）
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgConfirmExtraTop.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgConfirmExtraTop.prototype, "count", 2);
__decorateClass([
  BinaryField(() => YGOProMsgConfirmExtraTop_CardInfo, 2, (obj) => obj.count)
], YGOProMsgConfirmExtraTop.prototype, "cards", 2);
var YGOProMsgDamage = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgDamage");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_DAMAGE;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgDamage.prototype, "player", 2);
__decorateClass([
  BinaryField("i32", 1)
], YGOProMsgDamage.prototype, "value", 2);
var YGOProMsgDamageStepEnd = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgDamageStepEnd");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_DAMAGE_STEP_END;
  }
  getRequireRefreshZones() {
    return [
      { player: 0, location: OcgcoreScriptConstants.LOCATION_MZONE },
      { player: 1, location: OcgcoreScriptConstants.LOCATION_MZONE }
    ];
  }
};
var YGOProMsgDamageStepStart = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgDamageStepStart");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_DAMAGE_STEP_START;
  }
  getRequireRefreshZones() {
    return [
      { player: 0, location: OcgcoreScriptConstants.LOCATION_MZONE },
      { player: 1, location: OcgcoreScriptConstants.LOCATION_MZONE }
    ];
  }
};
var YGOProMsgDeckTop = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgDeckTop");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_DECK_TOP;
  }
  // MSG_DECK_TOP 在 single_duel.cpp 中不做遮掩，直接发给所有人
  // ocgcore 通过 0x80000000 标记控制公开状态
  // 因此使用基类的默认实现（不遮掩）
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgDeckTop.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgDeckTop.prototype, "sequence", 2);
__decorateClass([
  BinaryField("i32", 2)
], YGOProMsgDeckTop.prototype, "code", 2);
var YGOProMsgDraw = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgDraw");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_DRAW;
  }
  // 对方视角需要隐藏抽到的卡（如果卡片标志位 0x80 未设置）
  opponentView() {
    const view = this.copy();
    view.cards = view.cards.map((card) => {
      if (!(card & 2147483648)) {
        return 0;
      }
      return card;
    });
    return view;
  }
  teammateView() {
    return this.opponentView();
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgDraw.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgDraw.prototype, "count", 2);
__decorateClass([
  BinaryField("i32", 2, (obj) => obj.count)
], YGOProMsgDraw.prototype, "cards", 2);
var YGOProMsgEquip_CardLocation = class {
  static {
    __name(this, "YGOProMsgEquip_CardLocation");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgEquip_CardLocation.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgEquip_CardLocation.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgEquip_CardLocation.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgEquip_CardLocation.prototype, "position", 2);
var YGOProMsgEquip = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgEquip");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_EQUIP;
  }
};
__decorateClass([
  BinaryField(() => YGOProMsgEquip_CardLocation, 0)
], YGOProMsgEquip.prototype, "equip", 2);
__decorateClass([
  BinaryField(() => YGOProMsgEquip_CardLocation, 4)
], YGOProMsgEquip.prototype, "target", 2);
var YGOProMsgFieldDisabled = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgFieldDisabled");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_FIELD_DISABLED;
  }
};
__decorateClass([
  BinaryField("u32", 0)
], YGOProMsgFieldDisabled.prototype, "disabledField", 2);
var YGOProMsgFlipSummoned = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgFlipSummoned");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_FLIPSUMMONED;
  }
  getRequireRefreshZones() {
    const location = OcgcoreScriptConstants.LOCATION_MZONE | OcgcoreScriptConstants.LOCATION_SZONE;
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
var YGOProMsgFlipSummoning = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgFlipSummoning");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_FLIPSUMMONING;
  }
  getRequireRefreshCards() {
    return [
      {
        player: this.controller,
        location: this.location,
        sequence: this.sequence
      }
    ];
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgFlipSummoning.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgFlipSummoning.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgFlipSummoning.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgFlipSummoning.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgFlipSummoning.prototype, "position", 2);
var YGOProMsgHandRes = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgHandRes");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_HAND_RES;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgHandRes.prototype, "result", 2);
var HINT_TYPES_SEND_TO_SELF = /* @__PURE__ */ new Set([1, 2, 3, 5]);
var HINT_TYPES_SEND_TO_OPPONENT = /* @__PURE__ */ new Set([4, 6, 7, 8, 9, 11]);
var YGOProMsgHint = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgHint");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_HINT;
  }
  getSendTargets() {
    if (HINT_TYPES_SEND_TO_SELF.has(this.type)) {
      return [this.player];
    }
    if (HINT_TYPES_SEND_TO_OPPONENT.has(this.type)) {
      return [
        1 - this.player,
        7
        /* OBSERVER */
      ];
    }
    return SEND_TO_ALL;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgHint.prototype, "type", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgHint.prototype, "player", 2);
__decorateClass([
  BinaryField("i32", 2)
], YGOProMsgHint.prototype, "desc", 2);
var YGOProMsgLpUpdate = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgLpUpdate");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_LPUPDATE;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgLpUpdate.prototype, "player", 2);
__decorateClass([
  BinaryField("i32", 1)
], YGOProMsgLpUpdate.prototype, "lp", 2);
var YGOProMsgMatchKill = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgMatchKill");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_MATCH_KILL;
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgMatchKill.prototype, "code", 2);
var YGOProMsgMissedEffect = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgMissedEffect");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_MISSED_EFFECT;
  }
  getSendTargets() {
    return [this.controller];
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgMissedEffect.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgMissedEffect.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgMissedEffect.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgMissedEffect.prototype, "position", 2);
__decorateClass([
  BinaryField("i32", 4)
], YGOProMsgMissedEffect.prototype, "code", 2);
var YGOProMsgMove_CardLocation = class {
  static {
    __name(this, "YGOProMsgMove_CardLocation");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgMove_CardLocation.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgMove_CardLocation.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgMove_CardLocation.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgMove_CardLocation.prototype, "position", 2);
var YGOProMsgMove = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgMove");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_MOVE;
  }
  fromPayload(data) {
    super.fromPayload(data);
    decodePublicRevealPosition(this.current);
    return this;
  }
  toPayload() {
    const payload = this.copy();
    payload.current.position = encodePublicRevealPosition(
      payload.current.position,
      payload.current.reveal
    );
    delete payload.current.reveal;
    return YGOProMsgBase.prototype.toPayload.call(payload);
  }
  viewCopy() {
    const view = this.copy();
    sanitizePublicRevealPositionForView(view.previous);
    sanitizePublicRevealPositionForView(view.current);
    return view;
  }
  opponentView() {
    const view = this.viewCopy();
    const cl = view.current.location;
    const cp = this.current.position;
    if (cl & (OcgcoreScriptConstants.LOCATION_GRAVE | OcgcoreScriptConstants.LOCATION_OVERLAY)) {
      return view;
    }
    if (cl & (OcgcoreScriptConstants.LOCATION_DECK | OcgcoreScriptConstants.LOCATION_HAND) || shouldHideFacedownCode(cp, this.current.reveal)) {
      view.code = 0;
    }
    return view;
  }
  teammateView() {
    return this.opponentView();
  }
  playerView(playerId) {
    if (playerId === 7) {
      return this.observerView();
    }
    if (playerId === this.current.controller) {
      return this.viewCopy();
    }
    return this.opponentView();
  }
  getRequireRefreshCards() {
    const current = this.current;
    const previous = this.previous;
    const shouldRefresh = current.location !== 0 && (current.location & OcgcoreScriptConstants.LOCATION_OVERLAY) === 0 && (current.location !== previous.location || current.controller !== previous.controller);
    if (!shouldRefresh) {
      return [];
    }
    return [
      {
        player: current.controller,
        location: current.location,
        sequence: current.sequence
      }
    ];
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgMove.prototype, "code", 2);
__decorateClass([
  BinaryField(() => YGOProMsgMove_CardLocation, 4)
], YGOProMsgMove.prototype, "previous", 2);
__decorateClass([
  BinaryField(() => YGOProMsgMove_CardLocation, 8)
], YGOProMsgMove.prototype, "current", 2);
__decorateClass([
  BinaryField("i32", 12)
], YGOProMsgMove.prototype, "reason", 2);
var YGOProMsgNewPhase = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgNewPhase");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_NEW_PHASE;
  }
  getRequireRefreshZones() {
    const location = OcgcoreScriptConstants.LOCATION_MZONE | OcgcoreScriptConstants.LOCATION_SZONE | OcgcoreScriptConstants.LOCATION_HAND;
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
__decorateClass([
  BinaryField("u16", 0)
], YGOProMsgNewPhase.prototype, "phase", 2);
var YGOProMsgNewTurn = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgNewTurn");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_NEW_TURN;
  }
  getRequireRefreshZones() {
    const location = OcgcoreScriptConstants.LOCATION_MZONE | OcgcoreScriptConstants.LOCATION_SZONE | OcgcoreScriptConstants.LOCATION_HAND;
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgNewTurn.prototype, "player", 2);
var YGOProMsgPayLpCost = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgPayLpCost");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_PAY_LPCOST;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgPayLpCost.prototype, "player", 2);
__decorateClass([
  BinaryField("i32", 1)
], YGOProMsgPayLpCost.prototype, "cost", 2);
var YGOProMsgPlayerHint = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgPlayerHint");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_PLAYER_HINT;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgPlayerHint.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgPlayerHint.prototype, "type", 2);
__decorateClass([
  BinaryField("i32", 2)
], YGOProMsgPlayerHint.prototype, "value", 2);
var YGOProMsgPosChange_CardLocation = class {
  static {
    __name(this, "YGOProMsgPosChange_CardLocation");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgPosChange_CardLocation.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgPosChange_CardLocation.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgPosChange_CardLocation.prototype, "sequence", 2);
var YGOProMsgPosChange = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgPosChange");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_POS_CHANGE;
  }
  getRequireRefreshCards() {
    const shouldRefresh = (this.previousPosition & OcgcoreCommonConstants.POS_FACEDOWN) !== 0 && (this.currentPosition & OcgcoreCommonConstants.POS_FACEUP) !== 0;
    if (!shouldRefresh) {
      return [];
    }
    return [
      {
        player: this.card.controller,
        location: this.card.location,
        sequence: this.card.sequence
      }
    ];
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgPosChange.prototype, "code", 2);
__decorateClass([
  BinaryField(() => YGOProMsgPosChange_CardLocation, 4)
], YGOProMsgPosChange.prototype, "card", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgPosChange.prototype, "previousPosition", 2);
__decorateClass([
  BinaryField("u8", 8)
], YGOProMsgPosChange.prototype, "currentPosition", 2);
var YGOProMsgRandomSelected = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgRandomSelected");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_RANDOM_SELECTED;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgRandomSelected.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgRandomSelected.prototype, "count", 2);
__decorateClass([
  BinaryField("i32", 2, (obj) => obj.count)
], YGOProMsgRandomSelected.prototype, "cards", 2);
var YGOProMsgRecover = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgRecover");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_RECOVER;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgRecover.prototype, "player", 2);
__decorateClass([
  BinaryField("i32", 1)
], YGOProMsgRecover.prototype, "value", 2);
var YGOProMsgReloadField_ZoneCard = class {
  static {
    __name(this, "YGOProMsgReloadField_ZoneCard");
  }
};
var YGOProMsgReloadField_PlayerInfo = class {
  static {
    __name(this, "YGOProMsgReloadField_PlayerInfo");
  }
};
var YGOProMsgReloadField_ChainInfo = class {
  static {
    __name(this, "YGOProMsgReloadField_ChainInfo");
  }
};
var YGOProMsgReloadField = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgReloadField");
  }
  static {
    this.identifier = 162;
  }
  fromPayload(data) {
    if (data.length < 1) {
      throw new Error("MSG data too short");
    }
    const msgType = data[0];
    if (msgType !== this.identifier) {
      throw new Error(
        `MSG type mismatch: expected ${this.identifier}, got ${msgType}`
      );
    }
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 1;
    this.duelRule = view.getUint8(offset++);
    this.players = [];
    for (let i = 0; i < 2; i++) {
      const player = {
        lp: view.getInt32(offset, true),
        mzone: [],
        szone: [],
        deckCount: 0,
        handCount: 0,
        graveCount: 0,
        removedCount: 0,
        extraCount: 0,
        extraPCount: 0
      };
      offset += 4;
      for (let seq = 0; seq < 7; seq++) {
        const occupied = view.getUint8(offset++);
        const card = { occupied };
        if (occupied) {
          card.position = view.getUint8(offset++);
          card.xyzCount = view.getUint8(offset++);
        }
        player.mzone.push(card);
      }
      for (let seq = 0; seq < 8; seq++) {
        const occupied = view.getUint8(offset++);
        const card = { occupied };
        if (occupied) {
          card.position = view.getUint8(offset++);
        }
        player.szone.push(card);
      }
      player.deckCount = view.getUint8(offset++);
      player.handCount = view.getUint8(offset++);
      player.graveCount = view.getUint8(offset++);
      player.removedCount = view.getUint8(offset++);
      player.extraCount = view.getUint8(offset++);
      player.extraPCount = view.getUint8(offset++);
      this.players.push(player);
    }
    const chainCount = view.getUint8(offset++);
    this.chains = [];
    for (let i = 0; i < chainCount; i++) {
      const chain = {
        code: view.getInt32(offset, true),
        chainCardController: view.getUint8(offset + 4),
        chainCardLocation: view.getUint8(offset + 5),
        chainCardSequence: view.getUint8(offset + 6),
        chainCardSubsequence: view.getUint8(offset + 7),
        triggerController: view.getUint8(offset + 8),
        triggerLocation: view.getUint8(offset + 9),
        triggerSequence: view.getUint8(offset + 10),
        desc: view.getInt32(offset + 11, true)
      };
      offset += 15;
      this.chains.push(chain);
    }
    return this;
  }
  toPayload() {
    let size = 1 + 1;
    for (const player of this.players) {
      size += 4;
      for (const card of player.mzone) {
        size += 1;
        if (card.occupied) {
          size += 2;
        }
      }
      for (const card of player.szone) {
        size += 1;
        if (card.occupied) {
          size += 1;
        }
      }
      size += 6;
    }
    size += 1;
    size += this.chains.length * 15;
    const result = new Uint8Array(size);
    const view = new DataView(result.buffer);
    let offset = 0;
    result[offset++] = this.identifier;
    result[offset++] = this.duelRule;
    for (const player of this.players) {
      view.setInt32(offset, player.lp, true);
      offset += 4;
      for (const card of player.mzone) {
        result[offset++] = card.occupied;
        if (card.occupied) {
          result[offset++] = card.position || 0;
          result[offset++] = card.xyzCount || 0;
        }
      }
      for (const card of player.szone) {
        result[offset++] = card.occupied;
        if (card.occupied) {
          result[offset++] = card.position || 0;
        }
      }
      result[offset++] = player.deckCount;
      result[offset++] = player.handCount;
      result[offset++] = player.graveCount;
      result[offset++] = player.removedCount;
      result[offset++] = player.extraCount;
      result[offset++] = player.extraPCount;
    }
    result[offset++] = this.chains.length;
    for (const chain of this.chains) {
      view.setInt32(offset, chain.code, true);
      result[offset + 4] = chain.chainCardController;
      result[offset + 5] = chain.chainCardLocation;
      result[offset + 6] = chain.chainCardSequence;
      result[offset + 7] = chain.chainCardSubsequence;
      result[offset + 8] = chain.triggerController;
      result[offset + 9] = chain.triggerLocation;
      result[offset + 10] = chain.triggerSequence;
      view.setInt32(offset + 11, chain.desc, true);
      offset += 15;
    }
    return result;
  }
};
var YGOProMsgRemoveCounter = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgRemoveCounter");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_REMOVE_COUNTER;
  }
};
__decorateClass([
  BinaryField("u16", 0)
], YGOProMsgRemoveCounter.prototype, "counterType", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgRemoveCounter.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgRemoveCounter.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgRemoveCounter.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u16", 5)
], YGOProMsgRemoveCounter.prototype, "count", 2);
var YGOProMsgResetTime = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgResetTime");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_RESET_TIME;
  }
  getSendTargets() {
    return [];
  }
};
__decorateClass([
  BinaryField("i8", 0)
], YGOProMsgResetTime.prototype, "player", 2);
__decorateClass([
  BinaryField("i16", 1)
], YGOProMsgResetTime.prototype, "time", 2);
var YGOProMsgRetry = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgRetry");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_RETRY;
  }
  getSendTargets() {
    return [];
  }
};
var YGOProMsgReverseDeck = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgReverseDeck");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_REVERSE_DECK;
  }
};
var YGOProMsgRockPaperScissors = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgRockPaperScissors");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_ROCK_PAPER_SCISSORS;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(choice) {
    if (choice < 1 || choice > 3) {
      throw new TypeError(
        `Invalid choice: ${choice}. Must be 1 (ROCK), 2 (SCISSORS), or 3 (PAPER)`
      );
    }
    const buffer = new Uint8Array(1);
    buffer[0] = choice;
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgRockPaperScissors.prototype, "player", 2);
var YGOProMsgSelectBattleCmd_ActivatableInfo = class {
  static {
    __name(this, "YGOProMsgSelectBattleCmd_ActivatableInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSelectBattleCmd_ActivatableInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectBattleCmd_ActivatableInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectBattleCmd_ActivatableInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectBattleCmd_ActivatableInfo.prototype, "sequence", 2);
__decorateClass([
  BinaryField("i32", 7)
], YGOProMsgSelectBattleCmd_ActivatableInfo.prototype, "desc", 2);
var YGOProMsgSelectBattleCmd_AttackableInfo = class {
  static {
    __name(this, "YGOProMsgSelectBattleCmd_AttackableInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSelectBattleCmd_AttackableInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectBattleCmd_AttackableInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectBattleCmd_AttackableInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectBattleCmd_AttackableInfo.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgSelectBattleCmd_AttackableInfo.prototype, "directAttack", 2);
var YGOProMsgSelectBattleCmd = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectBattleCmd");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_BATTLECMD;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(type, option) {
    let sequence;
    if (type === 0) {
      if (option == null) {
        throw new TypeError("Option required for ACTIVATE");
      }
      if (isIndexResponse(option)) {
        sequence = option.index;
        if (sequence < 0 || sequence >= this.activatableCount) {
          throw new TypeError(`Index out of range: ${sequence}`);
        }
      } else {
        const idx = this.activatableCards.findIndex(
          (card) => (option.code == null || card.code === option.code) && (option.controller == null || card.controller === option.controller) && (option.location == null || card.location === option.location) && (option.sequence == null || card.sequence === option.sequence) && (option.desc == null || card.desc === option.desc)
        );
        if (idx === -1) {
          throw new TypeError("Activatable card not found");
        }
        sequence = idx;
      }
    } else if (type === 1) {
      if (option == null) {
        throw new TypeError("Option required for ATTACK");
      }
      if (isIndexResponse(option)) {
        sequence = option.index;
        if (sequence < 0 || sequence >= this.attackableCount) {
          throw new TypeError(`Index out of range: ${sequence}`);
        }
      } else {
        const idx = this.attackableCards.findIndex(
          (card) => (option.code == null || card.code === option.code) && (option.controller == null || card.controller === option.controller) && (option.location == null || card.location === option.location) && (option.sequence == null || card.sequence === option.sequence)
        );
        if (idx === -1) {
          throw new TypeError("Attackable card not found");
        }
        sequence = idx;
      }
    } else if (type === 2) {
      if (this.canM2 === 0) {
        throw new TypeError("Cannot go to M2");
      }
      sequence = 0;
    } else if (type === 3) {
      if (this.canEp === 0) {
        throw new TypeError("Cannot go to EP");
      }
      sequence = 0;
    } else {
      throw new TypeError(`Unknown type: ${type}`);
    }
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setUint32(0, sequence << 16 | type, true);
    return buffer;
  }
  getRequireRefreshZones() {
    const location = OcgcoreScriptConstants.LOCATION_MZONE | OcgcoreScriptConstants.LOCATION_SZONE | OcgcoreScriptConstants.LOCATION_HAND;
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectBattleCmd.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSelectBattleCmd.prototype, "activatableCount", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectBattleCmd_ActivatableInfo,
    2,
    (obj) => obj.activatableCount
  )
], YGOProMsgSelectBattleCmd.prototype, "activatableCards", 2);
__decorateClass([
  BinaryField("u8", (obj) => {
    return 2 + obj.activatableCount * 11;
  })
], YGOProMsgSelectBattleCmd.prototype, "attackableCount", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectBattleCmd_AttackableInfo,
    (obj) => {
      return 3 + obj.activatableCount * 11;
    },
    (obj) => obj.attackableCount
  )
], YGOProMsgSelectBattleCmd.prototype, "attackableCards", 2);
__decorateClass([
  BinaryField("u8", (obj) => {
    return 3 + obj.activatableCount * 11 + obj.attackableCount * 8;
  })
], YGOProMsgSelectBattleCmd.prototype, "canM2", 2);
__decorateClass([
  BinaryField("u8", (obj) => {
    return 4 + obj.activatableCount * 11 + obj.attackableCount * 8;
  })
], YGOProMsgSelectBattleCmd.prototype, "canEp", 2);
var YGOProMsgSelectCard_CardInfo = class {
  static {
    __name(this, "YGOProMsgSelectCard_CardInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSelectCard_CardInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectCard_CardInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectCard_CardInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectCard_CardInfo.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgSelectCard_CardInfo.prototype, "subsequence", 2);
var YGOProMsgSelectCard = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectCard");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_CARD;
  }
  maskedView(playerId) {
    const view = this.copy();
    for (const card of view.cards || []) {
      if (card.controller !== playerId) {
        card.code = 0;
      }
    }
    return view;
  }
  playerView(playerId) {
    return this.maskedView(playerId);
  }
  responsePlayer() {
    return this.player;
  }
  defaultResponse() {
    if (this.cancelable === 0) {
      return void 0;
    }
    return this.prepareResponse(null);
  }
  prepareResponse(cardOptions) {
    if (cardOptions == null) {
      const buffer2 = new Uint8Array(4);
      const view = new DataView(buffer2.buffer);
      view.setInt32(0, -1, true);
      return buffer2;
    }
    const indices = [];
    const usedIndices = /* @__PURE__ */ new Set();
    for (const option of cardOptions) {
      let index;
      if (isIndexResponse(option)) {
        index = option.index;
        if (index < 0 || index >= this.count) {
          throw new TypeError(`Index out of range: ${index}`);
        }
      } else {
        index = this.cards.findIndex(
          (card, idx) => !usedIndices.has(idx) && (option.code == null || card.code === option.code) && (option.controller == null || card.controller === option.controller) && (option.location == null || card.location === option.location) && (option.sequence == null || card.sequence === option.sequence)
        );
        if (index === -1) {
          throw new TypeError("Card not found");
        }
      }
      indices.push(index);
      usedIndices.add(index);
    }
    const buffer = new Uint8Array(1 + indices.length);
    buffer[0] = indices.length;
    indices.forEach((idx, i) => {
      buffer[1 + i] = idx;
    });
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectCard.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSelectCard.prototype, "cancelable", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgSelectCard.prototype, "min", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgSelectCard.prototype, "max", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectCard.prototype, "count", 2);
__decorateClass([
  BinaryField(() => YGOProMsgSelectCard_CardInfo, 5, (obj) => obj.count)
], YGOProMsgSelectCard.prototype, "cards", 2);
var YGOProMsgSelectChain_ChainInfo = class {
  static {
    __name(this, "YGOProMsgSelectChain_ChainInfo");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectChain_ChainInfo.prototype, "edesc", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSelectChain_ChainInfo.prototype, "forced", 2);
__decorateClass([
  BinaryField("i32", 2)
], YGOProMsgSelectChain_ChainInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectChain_ChainInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgSelectChain_ChainInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 8)
], YGOProMsgSelectChain_ChainInfo.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 9)
], YGOProMsgSelectChain_ChainInfo.prototype, "subsequence", 2);
__decorateClass([
  BinaryField("i32", 10)
], YGOProMsgSelectChain_ChainInfo.prototype, "desc", 2);
var YGOProMsgSelectChain = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectChain");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_CHAIN;
  }
  responsePlayer() {
    return this.player;
  }
  defaultResponse() {
    const hasForced = this.chains.some((chain) => chain.forced !== 0);
    if (hasForced) {
      return void 0;
    }
    return this.prepareResponse(null);
  }
  prepareResponse(option) {
    let index;
    if (option == null) {
      index = -1;
    } else if (isIndexResponse(option)) {
      index = option.index;
      if (index < -1 || index >= this.count) {
        throw new TypeError(`Index out of range: ${index}`);
      }
    } else {
      index = this.chains.findIndex(
        (chain) => (option.code == null || chain.code === option.code) && (option.controller == null || chain.controller === option.controller) && (option.location == null || chain.location === option.location) && (option.sequence == null || chain.sequence === option.sequence) && (option.desc == null || chain.desc === option.desc)
      );
      if (index === -1) {
        throw new TypeError("Chain not found");
      }
    }
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setInt32(0, index, true);
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectChain.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSelectChain.prototype, "count", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgSelectChain.prototype, "specialCount", 2);
__decorateClass([
  BinaryField("i32", 3)
], YGOProMsgSelectChain.prototype, "hint0", 2);
__decorateClass([
  BinaryField("i32", 7)
], YGOProMsgSelectChain.prototype, "hint1", 2);
__decorateClass([
  BinaryField(() => YGOProMsgSelectChain_ChainInfo, 11, (obj) => obj.count)
], YGOProMsgSelectChain.prototype, "chains", 2);
var YGOProMsgSelectCounter_CardInfo = class {
  static {
    __name(this, "YGOProMsgSelectCounter_CardInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSelectCounter_CardInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectCounter_CardInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectCounter_CardInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectCounter_CardInfo.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u16", 7)
], YGOProMsgSelectCounter_CardInfo.prototype, "counterCount", 2);
var YGOProMsgSelectCounter = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectCounter");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_COUNTER;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(counterOptions) {
    const counterCounts = new Array(this.count).fill(0);
    for (const option of counterOptions) {
      let index;
      if (isIndexResponse(option.card)) {
        index = option.card.index;
        if (index < 0 || index >= this.count) {
          throw new TypeError(`Index out of range: ${index}`);
        }
      } else {
        const card = option.card;
        index = this.cards.findIndex(
          (card2) => (card2.code == null || card2.code === card2.code) && (card2.controller == null || card2.controller === card2.controller) && (card2.location == null || card2.location === card2.location) && (card2.sequence == null || card2.sequence === card2.sequence)
        );
        if (index === -1) {
          throw new TypeError("Card not found");
        }
      }
      counterCounts[index] = option.count;
    }
    const buffer = new Uint8Array(counterCounts.length * 2);
    const view = new DataView(buffer.buffer);
    counterCounts.forEach((count, i) => {
      view.setUint16(i * 2, count, true);
    });
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectCounter.prototype, "player", 2);
__decorateClass([
  BinaryField("u16", 1)
], YGOProMsgSelectCounter.prototype, "counterType", 2);
__decorateClass([
  BinaryField("u16", 3)
], YGOProMsgSelectCounter.prototype, "counterCount", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectCounter.prototype, "count", 2);
__decorateClass([
  BinaryField(() => YGOProMsgSelectCounter_CardInfo, 6, (obj) => obj.count)
], YGOProMsgSelectCounter.prototype, "cards", 2);
var YGOProMsgSelectPlaceCommon = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectPlaceCommon");
  }
  getSelectablePlaces() {
    const places = [];
    const mask = this.flag >>> 0;
    let pos = 0;
    for (const player of [this.player, 1 - this.player]) {
      for (const location of [
        OcgcoreScriptConstants.LOCATION_MZONE,
        OcgcoreScriptConstants.LOCATION_SZONE
      ]) {
        for (let sequence = 0; sequence < 8; sequence++) {
          if (!(mask & 1 << pos >>> 0)) {
            places.push({ player, location, sequence });
          }
          ++pos;
        }
      }
    }
    return places;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(places) {
    const buffer = new Uint8Array(places.length * 3);
    places.forEach((place, i) => {
      if (this.flag >>> 0 & 1 << (place.player === this.player ? 0 : 16) + (place.location === OcgcoreScriptConstants.LOCATION_MZONE ? 0 : 8) + place.sequence >>> 0) {
        throw new Error("Selected place is not available");
      }
      buffer[i * 3] = place.player;
      buffer[i * 3 + 1] = place.location;
      buffer[i * 3 + 2] = place.sequence;
    });
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectPlaceCommon.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSelectPlaceCommon.prototype, "count", 2);
__decorateClass([
  BinaryField("u32", 2)
], YGOProMsgSelectPlaceCommon.prototype, "flag", 2);
var YGOProMsgSelectDisField = class extends YGOProMsgSelectPlaceCommon {
  static {
    __name(this, "YGOProMsgSelectDisField");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_DISFIELD;
  }
};
var YGOProMsgSelectEffectYn = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectEffectYn");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_EFFECTYN;
  }
  responsePlayer() {
    return this.player;
  }
  defaultResponse() {
    return this.prepareResponse(false);
  }
  prepareResponse(yes) {
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setInt32(0, yes ? 1 : 0, true);
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectEffectYn.prototype, "player", 2);
__decorateClass([
  BinaryField("i32", 1)
], YGOProMsgSelectEffectYn.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectEffectYn.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectEffectYn.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgSelectEffectYn.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 8)
], YGOProMsgSelectEffectYn.prototype, "position", 2);
__decorateClass([
  BinaryField("i32", 9)
], YGOProMsgSelectEffectYn.prototype, "desc", 2);
var IdleCmdType = /* @__PURE__ */ ((IdleCmdType2) => {
  IdleCmdType2[IdleCmdType2["SUMMON"] = 0] = "SUMMON";
  IdleCmdType2[IdleCmdType2["SPSUMMON"] = 1] = "SPSUMMON";
  IdleCmdType2[IdleCmdType2["REPOS"] = 2] = "REPOS";
  IdleCmdType2[IdleCmdType2["MSET"] = 3] = "MSET";
  IdleCmdType2[IdleCmdType2["SSET"] = 4] = "SSET";
  IdleCmdType2[IdleCmdType2["ACTIVATE"] = 5] = "ACTIVATE";
  IdleCmdType2[IdleCmdType2["TO_BP"] = 6] = "TO_BP";
  IdleCmdType2[IdleCmdType2["TO_EP"] = 7] = "TO_EP";
  IdleCmdType2[IdleCmdType2["SHUFFLE"] = 8] = "SHUFFLE";
  return IdleCmdType2;
})(IdleCmdType || {});
var YGOProMsgSelectIdleCmd_SimpleCardInfo = class {
  static {
    __name(this, "YGOProMsgSelectIdleCmd_SimpleCardInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSelectIdleCmd_SimpleCardInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectIdleCmd_SimpleCardInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectIdleCmd_SimpleCardInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectIdleCmd_SimpleCardInfo.prototype, "sequence", 2);
var YGOProMsgSelectIdleCmd_ActivatableInfo = class {
  static {
    __name(this, "YGOProMsgSelectIdleCmd_ActivatableInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSelectIdleCmd_ActivatableInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectIdleCmd_ActivatableInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectIdleCmd_ActivatableInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectIdleCmd_ActivatableInfo.prototype, "sequence", 2);
__decorateClass([
  BinaryField("i32", 7)
], YGOProMsgSelectIdleCmd_ActivatableInfo.prototype, "desc", 2);
var YGOProMsgSelectIdleCmd = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectIdleCmd");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_IDLECMD;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(type, option) {
    let sequence;
    if (type === 0 || type === 1 || type === 2 || type === 3 || type === 4 || type === 5) {
      if (option == null) {
        throw new TypeError(`Option required for ${IdleCmdType[type]}`);
      }
      let cards;
      let maxCount;
      let typeName;
      if (type === 0) {
        cards = this.summonableCards;
        maxCount = this.summonableCount;
        typeName = "Summonable";
      } else if (type === 1) {
        cards = this.spSummonableCards;
        maxCount = this.spSummonableCount;
        typeName = "Special summonable";
      } else if (type === 2) {
        cards = this.reposableCards;
        maxCount = this.reposableCount;
        typeName = "Repositionable";
      } else if (type === 3) {
        cards = this.msetableCards;
        maxCount = this.msetableCount;
        typeName = "Monster settable";
      } else if (type === 4) {
        cards = this.ssetableCards;
        maxCount = this.ssetableCount;
        typeName = "Spell/Trap settable";
      } else {
        cards = this.activatableCards;
        maxCount = this.activatableCount;
        typeName = "Activatable";
      }
      if (isIndexResponse(option)) {
        sequence = option.index;
        if (sequence < 0 || sequence >= maxCount) {
          throw new TypeError(`Index out of range: ${sequence}`);
        }
      } else {
        const idx = cards.findIndex(
          (card) => (option.code == null || card.code === option.code) && (option.controller == null || card.controller === option.controller) && (option.location == null || card.location === option.location) && (option.sequence == null || card.sequence === option.sequence) && (option.desc == null || card.desc === option.desc)
        );
        if (idx === -1) {
          throw new TypeError(`${typeName} card not found`);
        }
        sequence = idx;
      }
    } else if (type === 6) {
      if (this.canBp === 0) {
        throw new TypeError("Cannot go to BP");
      }
      sequence = 0;
    } else if (type === 7) {
      if (this.canEp === 0) {
        throw new TypeError("Cannot go to EP");
      }
      sequence = 0;
    } else if (type === 8) {
      if (this.canShuffle === 0) {
        throw new TypeError("Cannot shuffle");
      }
      sequence = 0;
    } else {
      throw new TypeError(`Unknown type: ${type}`);
    }
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setUint32(0, sequence << 16 | type, true);
    return buffer;
  }
  getRequireRefreshZones() {
    const location = OcgcoreScriptConstants.LOCATION_MZONE | OcgcoreScriptConstants.LOCATION_SZONE | OcgcoreScriptConstants.LOCATION_HAND;
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectIdleCmd.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSelectIdleCmd.prototype, "summonableCount", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectIdleCmd_SimpleCardInfo,
    2,
    (obj) => obj.summonableCount
  )
], YGOProMsgSelectIdleCmd.prototype, "summonableCards", 2);
__decorateClass([
  BinaryField("u8", (obj) => 2 + obj.summonableCount * 7)
], YGOProMsgSelectIdleCmd.prototype, "spSummonableCount", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectIdleCmd_SimpleCardInfo,
    (obj) => 3 + obj.summonableCount * 7,
    (obj) => obj.spSummonableCount
  )
], YGOProMsgSelectIdleCmd.prototype, "spSummonableCards", 2);
__decorateClass([
  BinaryField(
    "u8",
    (obj) => 3 + obj.summonableCount * 7 + obj.spSummonableCount * 7
  )
], YGOProMsgSelectIdleCmd.prototype, "reposableCount", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectIdleCmd_SimpleCardInfo,
    (obj) => 4 + obj.summonableCount * 7 + obj.spSummonableCount * 7,
    (obj) => obj.reposableCount
  )
], YGOProMsgSelectIdleCmd.prototype, "reposableCards", 2);
__decorateClass([
  BinaryField(
    "u8",
    (obj) => 4 + obj.summonableCount * 7 + obj.spSummonableCount * 7 + obj.reposableCount * 7
  )
], YGOProMsgSelectIdleCmd.prototype, "msetableCount", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectIdleCmd_SimpleCardInfo,
    (obj) => 5 + obj.summonableCount * 7 + obj.spSummonableCount * 7 + obj.reposableCount * 7,
    (obj) => obj.msetableCount
  )
], YGOProMsgSelectIdleCmd.prototype, "msetableCards", 2);
__decorateClass([
  BinaryField(
    "u8",
    (obj) => 5 + obj.summonableCount * 7 + obj.spSummonableCount * 7 + obj.reposableCount * 7 + obj.msetableCount * 7
  )
], YGOProMsgSelectIdleCmd.prototype, "ssetableCount", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectIdleCmd_SimpleCardInfo,
    (obj) => 6 + obj.summonableCount * 7 + obj.spSummonableCount * 7 + obj.reposableCount * 7 + obj.msetableCount * 7,
    (obj) => obj.ssetableCount
  )
], YGOProMsgSelectIdleCmd.prototype, "ssetableCards", 2);
__decorateClass([
  BinaryField(
    "u8",
    (obj) => 6 + obj.summonableCount * 7 + obj.spSummonableCount * 7 + obj.reposableCount * 7 + obj.msetableCount * 7 + obj.ssetableCount * 7
  )
], YGOProMsgSelectIdleCmd.prototype, "activatableCount", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectIdleCmd_ActivatableInfo,
    (obj) => 7 + obj.summonableCount * 7 + obj.spSummonableCount * 7 + obj.reposableCount * 7 + obj.msetableCount * 7 + obj.ssetableCount * 7,
    (obj) => obj.activatableCount
  )
], YGOProMsgSelectIdleCmd.prototype, "activatableCards", 2);
__decorateClass([
  BinaryField(
    "u8",
    (obj) => 7 + obj.summonableCount * 7 + obj.spSummonableCount * 7 + obj.reposableCount * 7 + obj.msetableCount * 7 + obj.ssetableCount * 7 + obj.activatableCount * 11
  )
], YGOProMsgSelectIdleCmd.prototype, "canBp", 2);
__decorateClass([
  BinaryField(
    "u8",
    (obj) => 8 + obj.summonableCount * 7 + obj.spSummonableCount * 7 + obj.reposableCount * 7 + obj.msetableCount * 7 + obj.ssetableCount * 7 + obj.activatableCount * 11
  )
], YGOProMsgSelectIdleCmd.prototype, "canEp", 2);
__decorateClass([
  BinaryField(
    "u8",
    (obj) => 9 + obj.summonableCount * 7 + obj.spSummonableCount * 7 + obj.reposableCount * 7 + obj.msetableCount * 7 + obj.ssetableCount * 7 + obj.activatableCount * 11
  )
], YGOProMsgSelectIdleCmd.prototype, "canShuffle", 2);
var YGOProMsgSelectOption = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectOption");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_OPTION;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(option) {
    let index;
    if (isIndexResponse(option)) {
      index = option.index;
      if (index < 0 || index >= this.count) {
        throw new TypeError(`Index out of range: ${index}`);
      }
    } else {
      index = this.options.indexOf(option);
      if (index === -1) {
        throw new TypeError(`Option not found: ${option}`);
      }
    }
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setInt32(0, index, true);
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectOption.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSelectOption.prototype, "count", 2);
__decorateClass([
  BinaryField("i32", 2, (obj) => obj.count)
], YGOProMsgSelectOption.prototype, "options", 2);
var YGOProMsgSelectPlace = class extends YGOProMsgSelectPlaceCommon {
  static {
    __name(this, "YGOProMsgSelectPlace");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_PLACE;
  }
};
var YGOProMsgSelectPosition = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectPosition");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_POSITION;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(position) {
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setInt32(0, position, true);
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectPosition.prototype, "player", 2);
__decorateClass([
  BinaryField("i32", 1)
], YGOProMsgSelectPosition.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectPosition.prototype, "positions", 2);
var YGOProMsgSelectSum_CardInfo = class {
  static {
    __name(this, "YGOProMsgSelectSum_CardInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSelectSum_CardInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectSum_CardInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectSum_CardInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectSum_CardInfo.prototype, "sequence", 2);
__decorateClass([
  BinaryField("i32", 7)
], YGOProMsgSelectSum_CardInfo.prototype, "opParam", 2);
var YGOProMsgSelectSum = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectSum");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_SUM;
  }
  responsePlayer() {
    return this.player;
  }
  prepareResponse(cardOptions) {
    const indices = [];
    for (const option of cardOptions) {
      let index;
      if (isIndexResponse(option)) {
        index = option.index;
        if (index < 0 || index >= this.count) {
          throw new TypeError(`Index out of range: ${index}`);
        }
      } else {
        index = this.cards.findIndex(
          (card) => (option.code == null || card.code === option.code) && (option.controller == null || card.controller === option.controller) && (option.location == null || card.location === option.location) && (option.sequence == null || card.sequence === option.sequence)
        );
        if (index === -1) {
          throw new TypeError("Card not found");
        }
      }
      indices.push(index);
    }
    const buffer = new Uint8Array(1 + indices.length);
    buffer[0] = this.mustSelectCount + indices.length;
    indices.forEach((idx, i) => {
      buffer[1 + i] = idx;
    });
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectSum.prototype, "mode", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSelectSum.prototype, "player", 2);
__decorateClass([
  BinaryField("i32", 2)
], YGOProMsgSelectSum.prototype, "sumVal", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectSum.prototype, "min", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgSelectSum.prototype, "max", 2);
__decorateClass([
  BinaryField("u8", 8)
], YGOProMsgSelectSum.prototype, "mustSelectCount", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectSum_CardInfo,
    9,
    (obj) => obj.mustSelectCount
  )
], YGOProMsgSelectSum.prototype, "mustSelectCards", 2);
__decorateClass([
  BinaryField("u8", (obj) => {
    return 9 + obj.mustSelectCount * 11;
  })
], YGOProMsgSelectSum.prototype, "count", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectSum_CardInfo,
    (obj) => {
      return 10 + obj.mustSelectCount * 11;
    },
    (obj) => obj.count
  )
], YGOProMsgSelectSum.prototype, "cards", 2);
var YGOProMsgSelectTribute_CardInfo = class {
  static {
    __name(this, "YGOProMsgSelectTribute_CardInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSelectTribute_CardInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectTribute_CardInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectTribute_CardInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectTribute_CardInfo.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgSelectTribute_CardInfo.prototype, "releaseParam", 2);
var YGOProMsgSelectTribute = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectTribute");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_TRIBUTE;
  }
  maskedView(playerId) {
    const view = this.copy();
    for (const card of view.cards || []) {
      if (card.controller !== playerId) {
        card.code = 0;
      }
    }
    return view;
  }
  playerView(playerId) {
    return this.maskedView(playerId);
  }
  responsePlayer() {
    return this.player;
  }
  defaultResponse() {
    if (this.cancelable === 0) {
      return void 0;
    }
    return this.prepareResponse(null);
  }
  prepareResponse(cardOptions) {
    if (cardOptions == null) {
      const buffer2 = new Uint8Array(4);
      const view = new DataView(buffer2.buffer);
      view.setInt32(0, -1, true);
      return buffer2;
    }
    const indices = [];
    const usedIndices = /* @__PURE__ */ new Set();
    for (const option of cardOptions) {
      let index;
      if (isIndexResponse(option)) {
        index = option.index;
        if (index < 0 || index >= this.count) {
          throw new TypeError(`Index out of range: ${index}`);
        }
      } else {
        index = this.cards.findIndex(
          (card, idx) => !usedIndices.has(idx) && (option.code == null || card.code === option.code) && (option.controller == null || card.controller === option.controller) && (option.location == null || card.location === option.location) && (option.sequence == null || card.sequence === option.sequence)
        );
        if (index === -1) {
          throw new TypeError("Card not found");
        }
      }
      indices.push(index);
      usedIndices.add(index);
    }
    const buffer = new Uint8Array(1 + indices.length);
    buffer[0] = indices.length;
    indices.forEach((idx, i) => {
      buffer[1 + i] = idx;
    });
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectTribute.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSelectTribute.prototype, "cancelable", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgSelectTribute.prototype, "min", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgSelectTribute.prototype, "max", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectTribute.prototype, "count", 2);
__decorateClass([
  BinaryField(() => YGOProMsgSelectTribute_CardInfo, 5, (obj) => obj.count)
], YGOProMsgSelectTribute.prototype, "cards", 2);
var YGOProMsgSelectUnselectCard_CardInfo = class {
  static {
    __name(this, "YGOProMsgSelectUnselectCard_CardInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSelectUnselectCard_CardInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectUnselectCard_CardInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectUnselectCard_CardInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSelectUnselectCard_CardInfo.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgSelectUnselectCard_CardInfo.prototype, "subsequence", 2);
var YGOProMsgSelectUnselectCard = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectUnselectCard");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_UNSELECT_CARD;
  }
  maskedView(playerId) {
    const view = this.copy();
    for (const card of view.selectableCards || []) {
      if (card.controller !== playerId) {
        card.code = 0;
      }
    }
    for (const card of view.unselectableCards || []) {
      if (card.controller !== playerId) {
        card.code = 0;
      }
    }
    return view;
  }
  playerView(playerId) {
    return this.maskedView(playerId);
  }
  responsePlayer() {
    return this.player;
  }
  defaultResponse() {
    if (this.cancelable === 0 && this.finishable === 0) {
      return void 0;
    }
    return this.prepareResponse(null);
  }
  prepareResponse(cardOption) {
    if (cardOption == null) {
      const buffer2 = new Uint8Array(4);
      const view = new DataView(buffer2.buffer);
      view.setInt32(0, -1, true);
      return buffer2;
    }
    let index;
    if (isIndexResponse(cardOption)) {
      index = cardOption.index;
      const totalCount = this.selectableCount + this.unselectableCount;
      if (index < 0 || index >= totalCount) {
        throw new TypeError(`Index out of range: ${index}`);
      }
    } else {
      index = this.selectableCards.findIndex(
        (card) => (cardOption.code == null || card.code === cardOption.code) && (cardOption.controller == null || card.controller === cardOption.controller) && (cardOption.location == null || card.location === cardOption.location) && (cardOption.sequence == null || card.sequence === cardOption.sequence)
      );
      if (index === -1) {
        const unselectIndex = this.unselectableCards.findIndex(
          (card) => (cardOption.code == null || card.code === cardOption.code) && (cardOption.controller == null || card.controller === cardOption.controller) && (cardOption.location == null || card.location === cardOption.location) && (cardOption.sequence == null || card.sequence === cardOption.sequence)
        );
        if (unselectIndex === -1) {
          throw new TypeError("Card not found");
        }
        index = this.selectableCount + unselectIndex;
      }
    }
    const buffer = new Uint8Array(2);
    buffer[0] = 1;
    buffer[1] = index;
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectUnselectCard.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSelectUnselectCard.prototype, "finishable", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgSelectUnselectCard.prototype, "cancelable", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgSelectUnselectCard.prototype, "min", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSelectUnselectCard.prototype, "max", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSelectUnselectCard.prototype, "selectableCount", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectUnselectCard_CardInfo,
    6,
    (obj) => obj.selectableCount
  )
], YGOProMsgSelectUnselectCard.prototype, "selectableCards", 2);
__decorateClass([
  BinaryField("u8", (obj) => {
    return 6 + obj.selectableCount * 8;
  })
], YGOProMsgSelectUnselectCard.prototype, "unselectableCount", 2);
__decorateClass([
  BinaryField(
    () => YGOProMsgSelectUnselectCard_CardInfo,
    (obj) => {
      return 7 + obj.selectableCount * 8;
    },
    (obj) => obj.unselectableCount
  )
], YGOProMsgSelectUnselectCard.prototype, "unselectableCards", 2);
var YGOProMsgSelectYesNo = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSelectYesNo");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SELECT_YESNO;
  }
  responsePlayer() {
    return this.player;
  }
  defaultResponse() {
    return this.prepareResponse(false);
  }
  prepareResponse(yes) {
    const buffer = new Uint8Array(4);
    const view = new DataView(buffer.buffer);
    view.setInt32(0, yes ? 1 : 0, true);
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSelectYesNo.prototype, "player", 2);
__decorateClass([
  BinaryField("i32", 1)
], YGOProMsgSelectYesNo.prototype, "desc", 2);
var YGOProMsgSet = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgSet");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SET;
  }
  // MSG_SET 的 code 在常见网络转发路径会被置 0
  opponentView() {
    const view = this.copy();
    view.code = 0;
    return view;
  }
  teammateView() {
    const view = this.copy();
    view.code = 0;
    return view;
  }
  observerView() {
    const view = this.copy();
    view.code = 0;
    return view;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  playerView(playerId) {
    const view = this.copy();
    view.code = 0;
    return view;
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSet.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSet.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSet.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSet.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgSet.prototype, "position", 2);
var YGOProMsgShuffleDeck = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgShuffleDeck");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SHUFFLE_DECK;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgShuffleDeck.prototype, "player", 2);
var YGOProMsgShuffleExtra = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgShuffleExtra");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SHUFFLE_EXTRA;
  }
  // 对方视角需要隐藏额外卡组信息
  opponentView() {
    const view = this.copy();
    view.cards = view.cards.map(() => 0);
    return view;
  }
  teammateView() {
    return this.opponentView();
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgShuffleExtra.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgShuffleExtra.prototype, "count", 2);
__decorateClass([
  BinaryField("i32", 2, (obj) => obj.count)
], YGOProMsgShuffleExtra.prototype, "cards", 2);
var YGOProMsgShuffleHand = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgShuffleHand");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SHUFFLE_HAND;
  }
  // 对方视角需要隐藏手牌信息
  opponentView() {
    const view = this.copy();
    view.cards = view.cards.map(() => 0);
    return view;
  }
  teammateView() {
    return this.opponentView();
  }
  getRequireRefreshZones() {
    return [
      {
        player: this.player,
        location: OcgcoreScriptConstants.LOCATION_HAND
      }
    ];
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgShuffleHand.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgShuffleHand.prototype, "count", 2);
__decorateClass([
  BinaryField("i32", 2, (obj) => obj.count)
], YGOProMsgShuffleHand.prototype, "cards", 2);
var YGOProMsgShuffleSetCard_CardLocation = class {
  static {
    __name(this, "YGOProMsgShuffleSetCard_CardLocation");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgShuffleSetCard_CardLocation.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgShuffleSetCard_CardLocation.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgShuffleSetCard_CardLocation.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgShuffleSetCard_CardLocation.prototype, "position", 2);
var YGOProMsgShuffleSetCard_SetCardInfo = class {
  static {
    __name(this, "YGOProMsgShuffleSetCard_SetCardInfo");
  }
};
__decorateClass([
  BinaryField(() => YGOProMsgShuffleSetCard_CardLocation, 0)
], YGOProMsgShuffleSetCard_SetCardInfo.prototype, "oldLocation", 2);
__decorateClass([
  BinaryField(() => YGOProMsgShuffleSetCard_CardLocation, 4)
], YGOProMsgShuffleSetCard_SetCardInfo.prototype, "newLocation", 2);
var YGOProMsgShuffleSetCard = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgShuffleSetCard");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SHUFFLE_SET_CARD;
  }
  getRequireRefreshZones() {
    let location = 0;
    if (this.location === OcgcoreScriptConstants.LOCATION_MZONE) {
      location = OcgcoreScriptConstants.LOCATION_MZONE;
    }
    if (this.location === OcgcoreScriptConstants.LOCATION_SZONE) {
      location = OcgcoreScriptConstants.LOCATION_SZONE;
    }
    if (location === 0) {
      return [];
    }
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgShuffleSetCard.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgShuffleSetCard.prototype, "count", 2);
__decorateClass([
  BinaryField(() => YGOProMsgShuffleSetCard_SetCardInfo, 2, (obj) => obj.count)
], YGOProMsgShuffleSetCard.prototype, "cards", 2);
var YGOProMsgSortCard_CardInfo = class {
  static {
    __name(this, "YGOProMsgSortCard_CardInfo");
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSortCard_CardInfo.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSortCard_CardInfo.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSortCard_CardInfo.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSortCard_CardInfo.prototype, "sequence", 2);
var YGOProMsgSortCard = class extends YGOProMsgResponseBase {
  static {
    __name(this, "YGOProMsgSortCard");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SORT_CARD;
  }
  responsePlayer() {
    return this.player;
  }
  defaultResponse() {
    return this.prepareResponse(null);
  }
  prepareResponse(sortedOptions) {
    if (sortedOptions == null) {
      return new Uint8Array([255]);
    }
    const indices = [];
    const usedIndices = /* @__PURE__ */ new Set();
    for (const option of sortedOptions) {
      let index;
      if (isIndexResponse(option)) {
        index = option.index;
        if (index < 0 || index >= this.count) {
          throw new TypeError(`Index out of range: ${index}`);
        }
      } else {
        index = this.cards.findIndex(
          (card, idx) => !usedIndices.has(idx) && (option.code == null || card.code === option.code) && (option.controller == null || card.controller === option.controller) && (option.location == null || card.location === option.location) && (option.sequence == null || card.sequence === option.sequence)
        );
        if (index === -1) {
          throw new TypeError("Card not found");
        }
      }
      indices.push(index);
      usedIndices.add(index);
    }
    const buffer = new Uint8Array(indices.length);
    indices.forEach((idx, i) => {
      buffer[i] = idx;
    });
    return buffer;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSortCard.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSortCard.prototype, "count", 2);
__decorateClass([
  BinaryField(() => YGOProMsgSortCard_CardInfo, 2, (obj) => obj.count)
], YGOProMsgSortCard.prototype, "cards", 2);
var YGOProMsgSpSummoned = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgSpSummoned");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SPSUMMONED;
  }
  getRequireRefreshZones() {
    const location = OcgcoreScriptConstants.LOCATION_MZONE | OcgcoreScriptConstants.LOCATION_SZONE;
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
var YGOProMsgSpSummoning = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgSpSummoning");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SPSUMMONING;
  }
  fromPayload(data) {
    super.fromPayload(data);
    decodePublicRevealPosition(this);
    return this;
  }
  toPayload() {
    const payload = this.copy();
    payload.position = encodePublicRevealPosition(
      payload.position,
      payload.reveal
    );
    delete payload.reveal;
    return YGOProMsgBase.prototype.toPayload.call(payload);
  }
  viewCopy() {
    const view = this.copy();
    sanitizePublicRevealPositionForView(view);
    return view;
  }
  opponentView() {
    const view = this.viewCopy();
    if (shouldHideFacedownCode(this.position, this.reveal)) {
      view.code = 0;
    }
    return view;
  }
  teammateView() {
    return this.viewCopy();
  }
  playerView(playerId) {
    if (playerId === 7) {
      return this.observerView();
    }
    if (playerId === this.controller) {
      return this.viewCopy();
    }
    return this.opponentView();
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSpSummoning.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSpSummoning.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSpSummoning.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSpSummoning.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgSpSummoning.prototype, "position", 2);
var YGOProMsgStart_PlayerInfo = class {
  static {
    __name(this, "YGOProMsgStart_PlayerInfo");
  }
};
__decorateClass([
  BinaryField("u16", 0)
], YGOProMsgStart_PlayerInfo.prototype, "deckCount", 2);
__decorateClass([
  BinaryField("u16", 2)
], YGOProMsgStart_PlayerInfo.prototype, "extraCount", 2);
var YGOProMsgStart = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgStart");
  }
  static {
    this.identifier = 4;
  }
  /**
   * Get/Set player number (low 4 bits, 0-3)
   */
  get playerNumber() {
    return this.playerType & 15;
  }
  set playerNumber(value) {
    this.playerType = this.playerType & 240 | value & 15;
  }
  /**
   * Get/Set observer flag (high 4 bits, 0x00 or 0x10)
   */
  get observerFlag() {
    return this.playerType & 240;
  }
  set observerFlag(value) {
    this.playerType = this.playerType & 15 | value & 240;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgStart.prototype, "playerType", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgStart.prototype, "duelRule", 2);
__decorateClass([
  BinaryField("i32", 2)
], YGOProMsgStart.prototype, "startLp0", 2);
__decorateClass([
  BinaryField("i32", 6)
], YGOProMsgStart.prototype, "startLp1", 2);
__decorateClass([
  BinaryField(() => YGOProMsgStart_PlayerInfo, 10)
], YGOProMsgStart.prototype, "player0", 2);
__decorateClass([
  BinaryField(() => YGOProMsgStart_PlayerInfo, 14)
], YGOProMsgStart.prototype, "player1", 2);
var YGOProMsgSummoned = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgSummoned");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SUMMONED;
  }
  getRequireRefreshZones() {
    const location = OcgcoreScriptConstants.LOCATION_MZONE | OcgcoreScriptConstants.LOCATION_SZONE;
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
var YGOProMsgSummoning = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgSummoning");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SUMMONING;
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSummoning.prototype, "code", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgSummoning.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 5)
], YGOProMsgSummoning.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProMsgSummoning.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProMsgSummoning.prototype, "position", 2);
var YGOProMsgSwap_CardLocation = class {
  static {
    __name(this, "YGOProMsgSwap_CardLocation");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSwap_CardLocation.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgSwap_CardLocation.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgSwap_CardLocation.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgSwap_CardLocation.prototype, "position", 2);
var YGOProMsgSwap = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgSwap");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SWAP;
  }
  getRequireRefreshCards() {
    return [
      {
        player: this.card1.controller,
        location: this.card1.location,
        sequence: this.card1.sequence
      },
      {
        player: this.card2.controller,
        location: this.card2.location,
        sequence: this.card2.sequence
      }
    ];
  }
};
__decorateClass([
  BinaryField("i32", 0)
], YGOProMsgSwap.prototype, "code1", 2);
__decorateClass([
  BinaryField(() => YGOProMsgSwap_CardLocation, 4)
], YGOProMsgSwap.prototype, "card1", 2);
__decorateClass([
  BinaryField("i32", 8)
], YGOProMsgSwap.prototype, "code2", 2);
__decorateClass([
  BinaryField(() => YGOProMsgSwap_CardLocation, 12)
], YGOProMsgSwap.prototype, "card2", 2);
var YGOProMsgSwapGraveDeck = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgSwapGraveDeck");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_SWAP_GRAVE_DECK;
  }
  getRequireRefreshZones() {
    return [
      {
        player: this.player,
        location: OcgcoreScriptConstants.LOCATION_GRAVE
      }
    ];
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgSwapGraveDeck.prototype, "player", 2);
var YGOProMsgTagSwap = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgTagSwap");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_TAG_SWAP;
  }
  // 对方和队友视角需要隐藏手牌和额外卡组信息
  opponentView() {
    const view = this.copy();
    view.handCards = view.handCards.map((card) => {
      if (!(card & 2147483648)) {
        return 0;
      }
      return card;
    });
    view.extraCards = view.extraCards.map((card) => {
      if (!(card & 2147483648)) {
        return 0;
      }
      return card;
    });
    return view;
  }
  teammateView() {
    return this.opponentView();
  }
  getRequireRefreshZones() {
    const location = OcgcoreScriptConstants.LOCATION_MZONE | OcgcoreScriptConstants.LOCATION_SZONE | OcgcoreScriptConstants.LOCATION_HAND;
    return [
      { player: 0, location },
      { player: 1, location }
    ];
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgTagSwap.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgTagSwap.prototype, "mzoneCount", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgTagSwap.prototype, "extraCount", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgTagSwap.prototype, "pzoneCount", 2);
__decorateClass([
  BinaryField("u8", 4)
], YGOProMsgTagSwap.prototype, "handCount", 2);
__decorateClass([
  BinaryField("i32", 5)
], YGOProMsgTagSwap.prototype, "topCode", 2);
__decorateClass([
  BinaryField("i32", 9, (obj) => obj.handCount)
], YGOProMsgTagSwap.prototype, "handCards", 2);
__decorateClass([
  BinaryField("i32", (obj) => 9 + obj.handCount * 4, (obj) => obj.extraCount)
], YGOProMsgTagSwap.prototype, "extraCards", 2);
var YGOProMsgTossCoin = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgTossCoin");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_TOSS_COIN;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgTossCoin.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgTossCoin.prototype, "count", 2);
__decorateClass([
  BinaryField("u8", 2, (obj) => obj.count)
], YGOProMsgTossCoin.prototype, "results", 2);
var YGOProMsgTossDice = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgTossDice");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_TOSS_DICE;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgTossDice.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgTossDice.prototype, "count", 2);
__decorateClass([
  BinaryField("u8", 2, (obj) => obj.count)
], YGOProMsgTossDice.prototype, "results", 2);
var YGOProMsgUnequip_CardLocation = class {
  static {
    __name(this, "YGOProMsgUnequip_CardLocation");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgUnequip_CardLocation.prototype, "controller", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgUnequip_CardLocation.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProMsgUnequip_CardLocation.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u8", 3)
], YGOProMsgUnequip_CardLocation.prototype, "position", 2);
var YGOProMsgUnequip = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgUnequip");
  }
  static {
    this.identifier = 95;
  }
};
__decorateClass([
  BinaryField(() => YGOProMsgUnequip_CardLocation, 0)
], YGOProMsgUnequip.prototype, "card", 2);
var YGOProMsgUpdateCard = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgUpdateCard");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_UPDATE_CARD;
  }
  isOnFieldLocation() {
    return !!(this.location & OcgcoreScriptConstants.LOCATION_ONFIELD);
  }
  viewCopy() {
    const copy = this.copy();
    sanitizePublicRevealPositionForView(copy.card);
    return copy;
  }
  opponentView() {
    const copy = this.copy();
    const position = getCardQueryPosition(copy.card);
    const reveal = this.isOnFieldLocation() ? copy.card?.reveal : void 0;
    if (shouldHideFacedownCode(position, reveal)) {
      copy.card = createCodeHiddenCardQuery(copy.card);
    } else {
      sanitizePublicRevealPositionForView(copy.card);
    }
    return copy;
  }
  teammateView() {
    return this.viewCopy();
  }
  playerView(playerId) {
    if (playerId === 7) {
      return this.observerView();
    }
    if (this.controller === playerId) {
      return this.viewCopy();
    }
    return this.opponentView();
  }
  fromPayload(data) {
    if (data.length < 1) {
      throw new Error("MSG data too short");
    }
    const msgType = data[0];
    if (msgType !== this.identifier) {
      throw new Error(
        `MSG type mismatch: expected ${this.identifier}, got ${msgType}`
      );
    }
    if (data.length < 4) {
      throw new Error("MSG_UPDATE_CARD data too short");
    }
    this.controller = data[1];
    this.location = data[2];
    this.sequence = data[3];
    const queryDataWithLength = data.slice(4);
    const { card } = parseCardQueryChunk(
      queryDataWithLength,
      0,
      "MSG_UPDATE_CARD"
    );
    this.card = card;
    return this;
  }
  toPayload() {
    const chunk = serializeCardQueryChunk(this.card);
    const result = new Uint8Array(4 + chunk.length);
    const view = new DataView(result.buffer);
    result[0] = this.identifier;
    result[1] = this.controller;
    result[2] = this.location;
    result[3] = this.sequence;
    view.setInt32(4, chunk.length, true);
    if (chunk.payload.length > 0) {
      result.set(chunk.payload, 8);
    }
    return result;
  }
  getRequireRefreshCards() {
    return [
      {
        player: this.controller,
        location: this.location,
        sequence: this.sequence
      }
    ];
  }
};
var YGOProMsgUpdateData = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgUpdateData");
  }
  static {
    this.identifier = 6;
  }
  getFixedSlotCount() {
    if (this.location === OcgcoreScriptConstants.LOCATION_MZONE) {
      return 7;
    }
    if (this.location === OcgcoreScriptConstants.LOCATION_SZONE) {
      return 8;
    }
    return void 0;
  }
  shouldHideForOpponent(card) {
    const position = getCardQueryPosition(card);
    if (this.location === OcgcoreScriptConstants.LOCATION_GRAVE) {
      return false;
    }
    if (this.location === OcgcoreScriptConstants.LOCATION_HAND) {
      return !position || !(position & OcgcoreCommonConstants.POS_FACEUP);
    }
    const reveal = this.location & OcgcoreScriptConstants.LOCATION_ONFIELD ? card.reveal : void 0;
    return shouldHideFacedownCode(position, reveal);
  }
  shouldHideForTeammate(card) {
    const position = getCardQueryPosition(card);
    if (this.location === OcgcoreScriptConstants.LOCATION_MZONE || this.location === OcgcoreScriptConstants.LOCATION_SZONE || this.location === OcgcoreScriptConstants.LOCATION_REMOVED || this.location === OcgcoreScriptConstants.LOCATION_GRAVE) {
      return false;
    }
    if (this.location === OcgcoreScriptConstants.LOCATION_HAND) {
      return !position || !(position & OcgcoreCommonConstants.POS_FACEUP);
    }
    if (this.location === OcgcoreScriptConstants.LOCATION_EXTRA) {
      return !!(position && position & OcgcoreCommonConstants.POS_FACEDOWN);
    }
    return false;
  }
  opponentView() {
    const copy = this.copy();
    if (copy.cards) {
      copy.cards = copy.cards.map((card) => {
        if (this.shouldHideForOpponent(card)) {
          return createClearedCardQuery(card);
        }
        sanitizePublicRevealPositionForView(card);
        return card;
      });
    }
    return copy;
  }
  teammateView() {
    const copy = this.copy();
    if (copy.cards) {
      copy.cards = copy.cards.map((card) => {
        if (this.shouldHideForTeammate(card)) {
          return createClearedCardQuery(card);
        }
        sanitizePublicRevealPositionForView(card);
        return card;
      });
    }
    return copy;
  }
  playerView(playerId) {
    if (playerId === 7) {
      return this.observerView();
    }
    if (this.player === playerId) {
      const copy = this.copy();
      if (copy.cards) {
        copy.cards = copy.cards.map((card) => {
          sanitizePublicRevealPositionForView(card);
          return card;
        });
      }
      return copy;
    }
    return this.opponentView();
  }
  fromPayload(data) {
    if (data.length < 1) {
      throw new Error("MSG data too short");
    }
    const msgType = data[0];
    if (msgType !== this.identifier) {
      throw new Error(
        `MSG type mismatch: expected ${this.identifier}, got ${msgType}`
      );
    }
    if (data.length < 3) {
      throw new Error("MSG_UPDATE_DATA data too short");
    }
    this.player = data[1];
    this.location = data[2];
    this.cards = [];
    let offset = 3;
    while (offset < data.length) {
      const { card, length } = parseCardQueryChunk(
        data,
        offset,
        "MSG_UPDATE_DATA"
      );
      this.cards.push(card);
      offset += length;
    }
    return this;
  }
  toPayload() {
    const inputCards = this.cards || [];
    const fixedSlotCount = this.getFixedSlotCount();
    let cardsToEncode = inputCards;
    if (fixedSlotCount !== void 0) {
      if (inputCards.length > fixedSlotCount) {
        throw new Error(
          `MSG_UPDATE_DATA location ${this.location} expects at most ${fixedSlotCount} chunks, got ${inputCards.length}`
        );
      }
      if (inputCards.length < fixedSlotCount) {
        cardsToEncode = inputCards.slice();
        for (let i = inputCards.length; i < fixedSlotCount; i++) {
          cardsToEncode.push(createClearedCardQuery());
        }
      }
    }
    let totalSize = 3;
    const chunks = [];
    for (const card of cardsToEncode) {
      const chunk = serializeCardQueryChunk(card);
      chunks.push(chunk);
      totalSize += chunk.length;
    }
    const result = new Uint8Array(totalSize);
    const view = new DataView(result.buffer);
    let offset = 0;
    result[offset++] = this.identifier;
    result[offset++] = this.player;
    result[offset++] = this.location;
    for (const chunk of chunks) {
      view.setInt32(offset, chunk.length, true);
      offset += 4;
      if (chunk.payload.length > 0) {
        result.set(chunk.payload, offset);
        offset += chunk.payload.length;
      }
    }
    return result;
  }
};
var YGOProMsgWaiting = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgWaiting");
  }
  static {
    this.identifier = 3;
  }
  // MSG_WAITING
  getSendTargets() {
    return [];
  }
};
var YGOProMsgWin = class extends YGOProMsgBase {
  static {
    __name(this, "YGOProMsgWin");
  }
  static {
    this.identifier = OcgcoreCommonConstants.MSG_WIN;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProMsgWin.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProMsgWin.prototype, "type", 2);
var YGOProMessages = new RegistryBase(YGOProMsgBase);
YGOProMessages.register(YGOProMsgRetry);
YGOProMessages.register(YGOProMsgHint);
YGOProMessages.register(YGOProMsgWin);
YGOProMessages.register(YGOProMsgSelectBattleCmd);
YGOProMessages.register(YGOProMsgSelectIdleCmd);
YGOProMessages.register(YGOProMsgSelectEffectYn);
YGOProMessages.register(YGOProMsgSelectYesNo);
YGOProMessages.register(YGOProMsgSelectOption);
YGOProMessages.register(YGOProMsgSelectCard);
YGOProMessages.register(YGOProMsgSelectChain);
YGOProMessages.register(YGOProMsgSelectPlace);
YGOProMessages.register(YGOProMsgSelectPosition);
YGOProMessages.register(YGOProMsgSelectTribute);
YGOProMessages.register(YGOProMsgSelectCounter);
YGOProMessages.register(YGOProMsgSelectSum);
YGOProMessages.register(YGOProMsgSelectDisField);
YGOProMessages.register(YGOProMsgSortCard);
YGOProMessages.register(YGOProMsgSelectUnselectCard);
YGOProMessages.register(YGOProMsgConfirmDeckTop);
YGOProMessages.register(YGOProMsgConfirmCards);
YGOProMessages.register(YGOProMsgShuffleDeck);
YGOProMessages.register(YGOProMsgShuffleHand);
YGOProMessages.register(YGOProMsgSwapGraveDeck);
YGOProMessages.register(YGOProMsgShuffleExtra);
YGOProMessages.register(YGOProMsgShuffleSetCard);
YGOProMessages.register(YGOProMsgReverseDeck);
YGOProMessages.register(YGOProMsgDeckTop);
YGOProMessages.register(YGOProMsgNewTurn);
YGOProMessages.register(YGOProMsgNewPhase);
YGOProMessages.register(YGOProMsgConfirmExtraTop);
YGOProMessages.register(YGOProMsgMove);
YGOProMessages.register(YGOProMsgPosChange);
YGOProMessages.register(YGOProMsgSet);
YGOProMessages.register(YGOProMsgSwap);
YGOProMessages.register(YGOProMsgFieldDisabled);
YGOProMessages.register(YGOProMsgSummoning);
YGOProMessages.register(YGOProMsgSummoned);
YGOProMessages.register(YGOProMsgSpSummoning);
YGOProMessages.register(YGOProMsgSpSummoned);
YGOProMessages.register(YGOProMsgFlipSummoning);
YGOProMessages.register(YGOProMsgFlipSummoned);
YGOProMessages.register(YGOProMsgChaining);
YGOProMessages.register(YGOProMsgChained);
YGOProMessages.register(YGOProMsgChainSolving);
YGOProMessages.register(YGOProMsgChainSolved);
YGOProMessages.register(YGOProMsgChainEnd);
YGOProMessages.register(YGOProMsgChainNegated);
YGOProMessages.register(YGOProMsgChainDisabled);
YGOProMessages.register(YGOProMsgRandomSelected);
YGOProMessages.register(YGOProMsgBecomeTarget);
YGOProMessages.register(YGOProMsgDraw);
YGOProMessages.register(YGOProMsgDamage);
YGOProMessages.register(YGOProMsgRecover);
YGOProMessages.register(YGOProMsgEquip);
YGOProMessages.register(YGOProMsgUnequip);
YGOProMessages.register(YGOProMsgLpUpdate);
YGOProMessages.register(YGOProMsgCardTarget);
YGOProMessages.register(YGOProMsgCancelTarget);
YGOProMessages.register(YGOProMsgPayLpCost);
YGOProMessages.register(YGOProMsgAddCounter);
YGOProMessages.register(YGOProMsgRemoveCounter);
YGOProMessages.register(YGOProMsgAttack);
YGOProMessages.register(YGOProMsgBattle);
YGOProMessages.register(YGOProMsgAttackDisabled);
YGOProMessages.register(YGOProMsgDamageStepStart);
YGOProMessages.register(YGOProMsgDamageStepEnd);
YGOProMessages.register(YGOProMsgMissedEffect);
YGOProMessages.register(YGOProMsgTossCoin);
YGOProMessages.register(YGOProMsgTossDice);
YGOProMessages.register(YGOProMsgRockPaperScissors);
YGOProMessages.register(YGOProMsgHandRes);
YGOProMessages.register(YGOProMsgAnnounceRace);
YGOProMessages.register(YGOProMsgAnnounceAttrib);
YGOProMessages.register(YGOProMsgAnnounceCard);
YGOProMessages.register(YGOProMsgAnnounceNumber);
YGOProMessages.register(YGOProMsgCardHint);
YGOProMessages.register(YGOProMsgTagSwap);
YGOProMessages.register(YGOProMsgPlayerHint);
YGOProMessages.register(YGOProMsgMatchKill);
YGOProMessages.register(YGOProMsgResetTime);
YGOProMessages.register(YGOProMsgUpdateCard);
YGOProMessages.register(YGOProMsgWaiting);
YGOProMessages.register(YGOProMsgStart);
YGOProMessages.register(YGOProMsgUpdateData);
YGOProMessages.register(YGOProMsgReloadField);
var YGOProStocGameMsg = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocGameMsg");
  }
  static {
    this.identifier = 1;
  }
  fromPayload(data) {
    this.msg = YGOProMessages.getInstanceFromPayload(data);
    return this;
  }
  toPayload() {
    if (!this.msg) {
      return new Uint8Array(0);
    }
    return this.msg.toPayload();
  }
  fromPartial(data) {
    if (data.msg) {
      this.msg = data.msg.copy();
    }
    return this;
  }
};
var YGOProStocErrorMsg = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocErrorMsg");
  }
  static {
    this.identifier = 2;
  }
};
__decorateClass([
  BinaryField("u8", 0, void 0, { enum: ErrorMessageType })
], YGOProStocErrorMsg.prototype, "msg", 2);
__decorateClass([
  BinaryField("u32", 4)
], YGOProStocErrorMsg.prototype, "code", 2);
var YGOProStocSelectHand = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocSelectHand");
  }
  static {
    this.identifier = 3;
  }
};
var YGOProStocSelectTp = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocSelectTp");
  }
  static {
    this.identifier = 4;
  }
};
var YGOProStocHandResult = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocHandResult");
  }
  static {
    this.identifier = 5;
  }
};
__decorateClass([
  BinaryField("u8", 0, void 0, { enum: HandResult })
], YGOProStocHandResult.prototype, "res1", 2);
__decorateClass([
  BinaryField("u8", 1, void 0, { enum: HandResult })
], YGOProStocHandResult.prototype, "res2", 2);
var YGOProStocTpResult = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocTpResult");
  }
  static {
    this.identifier = 6;
  }
};
var YGOProStocChangeSide = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocChangeSide");
  }
  static {
    this.identifier = 7;
  }
};
var YGOProStocWaitingSide = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocWaitingSide");
  }
  static {
    this.identifier = 8;
  }
};
var YGOProStocDeckCount_DeckInfo = class {
  static {
    __name(this, "YGOProStocDeckCount_DeckInfo");
  }
};
__decorateClass([
  BinaryField("i16", 0)
], YGOProStocDeckCount_DeckInfo.prototype, "main", 2);
__decorateClass([
  BinaryField("i16", 2)
], YGOProStocDeckCount_DeckInfo.prototype, "extra", 2);
__decorateClass([
  BinaryField("i16", 4)
], YGOProStocDeckCount_DeckInfo.prototype, "side", 2);
var YGOProStocDeckCount = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocDeckCount");
  }
  static {
    this.identifier = 9;
  }
};
__decorateClass([
  BinaryField(() => YGOProStocDeckCount_DeckInfo, 0)
], YGOProStocDeckCount.prototype, "player0DeckCount", 2);
__decorateClass([
  BinaryField(() => YGOProStocDeckCount_DeckInfo, 6)
], YGOProStocDeckCount.prototype, "player1DeckCount", 2);
var YGOProStocCreateGame = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocCreateGame");
  }
  static {
    this.identifier = 17;
  }
};
__decorateClass([
  BinaryField("u32", 0)
], YGOProStocCreateGame.prototype, "gameid", 2);
var YGOProStocJoinGame = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocJoinGame");
  }
  static {
    this.identifier = 18;
  }
};
__decorateClass([
  BinaryField(() => HostInfo, 0)
], YGOProStocJoinGame.prototype, "info", 2);
var YGOProStocTypeChange = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocTypeChange");
  }
  static {
    this.identifier = 19;
  }
  /**
   * Get/Set player position (low 4 bits, 0-7)
   */
  get playerPosition() {
    return this.type & 15;
  }
  set playerPosition(value) {
    this.type = this.type & 240 | value & 15;
  }
  /**
   * Get/Set host flag (high 4 bits)
   * Returns true if this player is the host
   */
  get isHost() {
    return (this.type >> 4 & 15) !== 0;
  }
  set isHost(value) {
    if (value) {
      this.type = this.type & 15 | 16;
    } else {
      this.type = this.type & 15;
    }
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProStocTypeChange.prototype, "type", 2);
var YGOProStocLeaveGame = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocLeaveGame");
  }
  static {
    this.identifier = 20;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProStocLeaveGame.prototype, "pos", 2);
var YGOProStocDuelStart = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocDuelStart");
  }
  static {
    this.identifier = 21;
  }
};
var YGOProStocDuelEnd = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocDuelEnd");
  }
  static {
    this.identifier = 22;
  }
};
var YGOProStocReplay = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocReplay");
  }
  static {
    this.identifier = 23;
  }
  constructor() {
    super();
    this.replay = new YGOProYrp();
  }
  fromPayload(data) {
    this.replay = new YGOProYrp().fromYrp(data);
    return this;
  }
  toPayload() {
    return this.replay.toYrp();
  }
  fromPartial(data) {
    if (data.replay) {
      this.replay = new YGOProYrp(data.replay);
    }
    return this;
  }
  copy() {
    const copied = new this.constructor();
    copied.replay = new YGOProYrp(this.replay);
    return copied;
  }
};
var YGOProStocTimeLimit = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocTimeLimit");
  }
  static {
    this.identifier = 24;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProStocTimeLimit.prototype, "player", 2);
__decorateClass([
  BinaryField("u16", 2)
], YGOProStocTimeLimit.prototype, "left_time", 2);
var STOC_CHAT_MAX_LENGTH = 256;
var YGOProStocChat = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocChat");
  }
  static {
    this.identifier = 25;
  }
  static {
    this.MAX_LENGTH = STOC_CHAT_MAX_LENGTH;
  }
  constructor() {
    super();
    this.player_type = 0;
    this.msg = "";
  }
  fromPayload(data) {
    if (data.length < 2) {
      throw new Error("STOC_CHAT data too short");
    }
    this.player_type = data[0] | data[1] << 8;
    if (data.length > 2) {
      const decoder3 = new TextDecoder("utf-16le");
      this.msg = decoder3.decode(data.slice(2)).replace(/\0+$/, "");
    } else {
      this.msg = "";
    }
    return this;
  }
  toPayload() {
    const text = this.msg.length > STOC_CHAT_MAX_LENGTH ? this.msg.substring(0, STOC_CHAT_MAX_LENGTH) : this.msg;
    const utf16 = new Uint16Array(text.length + 1);
    for (let i = 0; i < text.length; i++) {
      utf16[i] = text.charCodeAt(i);
    }
    utf16[text.length] = 0;
    const result = new Uint8Array(2 + utf16.byteLength);
    result[0] = this.player_type & 255;
    result[1] = this.player_type >> 8 & 255;
    result.set(new Uint8Array(utf16.buffer), 2);
    return result;
  }
  fromPartial(data) {
    if (data.player_type !== void 0) {
      this.player_type = data.player_type;
    }
    if (data.msg !== void 0) {
      this.msg = data.msg;
    }
    return this;
  }
};
var YGOProStocHsPlayerEnter = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocHsPlayerEnter");
  }
  static {
    this.identifier = 32;
  }
  // 1 byte padding (note: actual size is 41 bytes, not 42 - workaround in original code)
};
__decorateClass([
  BinaryField("utf16", 0, 20)
], YGOProStocHsPlayerEnter.prototype, "name", 2);
__decorateClass([
  BinaryField("u8", 40)
], YGOProStocHsPlayerEnter.prototype, "pos", 2);
var YGOProStocHsPlayerChange = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocHsPlayerChange");
  }
  static {
    this.identifier = 33;
  }
  /**
   * Get/Set player state (low 4 bits)
   * Can be a PlayerChangeState enum value or a player position (0-7) for position changes
   */
  get playerState() {
    return this.status & 15;
  }
  set playerState(value) {
    this.status = this.status & 240 | value & 15;
  }
  /**
   * Get/Set player position (high 4 bits, 0-3)
   */
  get playerPosition() {
    return this.status >> 4 & 15;
  }
  set playerPosition(value) {
    this.status = this.status & 15 | (value & 15) << 4;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProStocHsPlayerChange.prototype, "status", 2);
var YGOProStocHsWatchChange = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocHsWatchChange");
  }
  static {
    this.identifier = 34;
  }
};
__decorateClass([
  BinaryField("u16", 0)
], YGOProStocHsWatchChange.prototype, "watch_count", 2);
var YGOProStocTeammateSurrender = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocTeammateSurrender");
  }
  static {
    this.identifier = 35;
  }
};
var YGOProStocFieldFinish = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocFieldFinish");
  }
  static {
    this.identifier = 48;
  }
};
var SrvproRoomInfo = class {
  static {
    __name(this, "SrvproRoomInfo");
  }
};
__decorateClass([
  BinaryField("utf8", 0, 64)
], SrvproRoomInfo.prototype, "roomname", 2);
__decorateClass([
  BinaryField("u8", 64, void 0, { enum: RoomStatus })
], SrvproRoomInfo.prototype, "room_status", 2);
__decorateClass([
  BinaryField("i8", 65)
], SrvproRoomInfo.prototype, "room_duel_count", 2);
__decorateClass([
  BinaryField("i8", 66)
], SrvproRoomInfo.prototype, "room_turn_count", 2);
__decorateClass([
  BinaryField("utf8", 67, 128)
], SrvproRoomInfo.prototype, "player1", 2);
__decorateClass([
  BinaryField("i8", 195)
], SrvproRoomInfo.prototype, "player1_score", 2);
__decorateClass([
  BinaryField("i32", 196)
], SrvproRoomInfo.prototype, "player1_lp", 2);
__decorateClass([
  BinaryField("utf8", 200, 128)
], SrvproRoomInfo.prototype, "player2", 2);
__decorateClass([
  BinaryField("i8", 328)
], SrvproRoomInfo.prototype, "player2_score", 2);
__decorateClass([
  BinaryField("i32", 329)
], SrvproRoomInfo.prototype, "player2_lp", 2);
var YGOProStocSrvproRoomlist = class extends YGOProStocBase {
  static {
    __name(this, "YGOProStocSrvproRoomlist");
  }
  static {
    this.identifier = 49;
  }
};
__decorateClass([
  BinaryField("u16", 0)
], YGOProStocSrvproRoomlist.prototype, "count", 2);
__decorateClass([
  BinaryField(() => SrvproRoomInfo, 2, (obj) => obj.count)
], YGOProStocSrvproRoomlist.prototype, "rooms", 2);
var YGOProStoc = new ProtoRegistryBase(YGOProStocBase);
YGOProStoc.register(YGOProStocGameMsg);
YGOProStoc.register(YGOProStocErrorMsg);
YGOProStoc.register(YGOProStocSelectHand);
YGOProStoc.register(YGOProStocSelectTp);
YGOProStoc.register(YGOProStocHandResult);
YGOProStoc.register(YGOProStocTpResult);
YGOProStoc.register(YGOProStocChangeSide);
YGOProStoc.register(YGOProStocWaitingSide);
YGOProStoc.register(YGOProStocDeckCount);
YGOProStoc.register(YGOProStocCreateGame);
YGOProStoc.register(YGOProStocJoinGame);
YGOProStoc.register(YGOProStocTypeChange);
YGOProStoc.register(YGOProStocLeaveGame);
YGOProStoc.register(YGOProStocDuelStart);
YGOProStoc.register(YGOProStocDuelEnd);
YGOProStoc.register(YGOProStocReplay);
YGOProStoc.register(YGOProStocTimeLimit);
YGOProStoc.register(YGOProStocChat);
YGOProStoc.register(YGOProStocHsPlayerEnter);
YGOProStoc.register(YGOProStocHsPlayerChange);
YGOProStoc.register(YGOProStocHsWatchChange);
YGOProStoc.register(YGOProStocTeammateSurrender);
YGOProStoc.register(YGOProStocFieldFinish);
YGOProStoc.register(YGOProStocSrvproRoomlist);
function viewOf(bytes) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}
__name(viewOf, "viewOf");
function checkInteger(value, min, max, field) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${field} must be an integer in [${min}, ${max}]`);
  }
}
__name(checkInteger, "checkInteger");
function joinBytes(parts) {
  const result = new Uint8Array(
    parts.reduce((sum, part) => sum + part.length, 0)
  );
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}
__name(joinBytes, "joinBytes");
var utf8Encoder = new TextEncoder();
var utf8Decoder = new TextDecoder("utf-8", {
  fatal: true,
  ignoreBOM: true
});
function copyPacketField(value) {
  if (Array.isArray(value)) return value.map(copyPacketField);
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(
      value.buffer,
      value.byteOffset,
      value.byteLength
    ).slice();
  }
  return value;
}
__name(copyPacketField, "copyPacketField");
var YGOProAngelusBase = class extends PayloadBase {
  constructor() {
    super(...arguments);
    this.requestId = 0;
  }
  static {
    __name(this, "YGOProAngelusBase");
  }
  fromPartial(data) {
    const fields = Object.entries(data).map(([key, value]) => [
      key,
      copyPacketField(value)
    ]);
    return Object.assign(this, Object.fromEntries(fields));
  }
  // The decorators describe the fixed prefix. Variable data starts immediately
  // after the last decorated field. An ordinary fixed-size packet ends there.
  readTail(tail) {
    if (tail.length)
      throw new Error("Unexpected trailing Angelus payload bytes");
  }
  writeTail() {
    return new Uint8Array(0);
  }
  validateFields() {
  }
  fromPayload(body) {
    const Packet = this.constructor;
    const parsed = new Packet();
    parsed.requestId = this.requestId;
    const consumed = fillBinaryFields(parsed, body);
    parsed.validateFields();
    parsed.readTail(body.subarray(consumed));
    return Object.assign(this, parsed);
  }
  toPayload() {
    this.validateFields();
    const prefix = toBinaryFields(this);
    const tail = this.writeTail();
    return tail.length ? joinBytes([prefix, tail]) : prefix;
  }
  checkRequestId(id) {
    checkInteger(id, 1, 4294967295, "requestId");
  }
  fromFullPayload(data) {
    if (data.length < 5) throw new Error("Truncated Angelus header");
    if (data[0] !== this.identifier) throw new Error("Angelus opcode mismatch");
    const id = viewOf(data).getUint32(1, true);
    this.checkRequestId(id);
    this.fromPayload(data.subarray(5));
    this.requestId = id;
    return this;
  }
  toFullPayload() {
    this.checkRequestId(this.requestId);
    const body = this.toPayload();
    const packet = new Uint8Array(5 + body.length);
    packet[0] = this.identifier;
    viewOf(packet).setUint32(1, this.requestId, true);
    packet.set(body, 5);
    return packet;
  }
};
var YGOProAngelusCtosBase = class _YGOProAngelusCtosBase extends YGOProAngelusBase {
  static {
    __name(this, "YGOProAngelusCtosBase");
  }
  static {
    this.messageDirection = "CTOS";
  }
  get messageDirection() {
    return _YGOProAngelusCtosBase.messageDirection;
  }
};
function visitRegistry(raw, visitor) {
  const view = viewOf(raw);
  for (let offset = 0; offset < raw.length; ) {
    if (raw.length - offset < 4)
      throw new Error("Truncated registry entry header");
    const keyLength = view.getUint16(offset, true);
    const valueLength = view.getUint16(offset + 2, true);
    const keyStart = offset + 4;
    const valueStart = keyStart + keyLength;
    offset = valueStart + valueLength;
    if (offset > raw.length) throw new Error("Truncated registry entry data");
    visitor?.(
      raw.subarray(keyStart, valueStart),
      raw.subarray(valueStart, offset)
    );
  }
}
__name(visitRegistry, "visitRegistry");
function decodeRegistry(raw) {
  const entries = /* @__PURE__ */ Object.create(null);
  visitRegistry(raw, (key, value) => {
    entries[utf8Decoder.decode(key)] = utf8Decoder.decode(value);
  });
  return entries;
}
__name(decodeRegistry, "decodeRegistry");
function encodeRegistry(entries) {
  const parts = [];
  for (const [key, value] of Object.entries(entries)) {
    const keyBytes = utf8Encoder.encode(key);
    const valueBytes = utf8Encoder.encode(value);
    checkInteger(keyBytes.length, 0, 65535, "registry key length");
    checkInteger(valueBytes.length, 0, 65535, "registry value length");
    const header = new Uint8Array(4);
    const view = viewOf(header);
    view.setUint16(0, keyBytes.length, true);
    view.setUint16(2, valueBytes.length, true);
    parts.push(header, keyBytes, valueBytes);
  }
  return joinBytes(parts);
}
__name(encodeRegistry, "encodeRegistry");
var YGOProAngelusStart = class extends YGOProAngelusCtosBase {
  constructor() {
    super(...arguments);
    this.seed = Array(8).fill(0);
    this.duelRule = 0;
    this.flags = 0;
    this.startLp = 0;
    this.startHand = 0;
    this.drawCount = 0;
    this.decks = [[], []];
    this.registry = new Uint8Array(0);
  }
  static {
    __name(this, "YGOProAngelusStart");
  }
  static {
    this.identifier = 1;
  }
  get deckCount() {
    return this.flags & 1 ? 4 : 2;
  }
  /** Supply each player's main and extra cards in live deck order. */
  setDecks(decks) {
    this.decks = decks.map(({ main, extra }) => [...main, ...extra]);
    return this;
  }
  /** YRP stores each zone in native insertion order. Keep the seat order. */
  setReplayDecks(decks) {
    this.decks = decks.map(
      ({ main, extra }) => main.slice().reverse().concat(extra.slice().reverse())
    );
    return this;
  }
  validateFields() {
    if (this.seed.length !== 8) throw new Error("START requires 8 seed words");
    for (const word of this.seed)
      checkInteger(word, 0, 4294967295, "seed word");
    checkInteger(this.duelRule, 0, 255, "duelRule");
    checkInteger(this.flags, 0, 3, "flags");
    checkInteger(this.startLp, -2147483648, 2147483647, "startLp");
    checkInteger(this.startHand, 0, 255, "startHand");
    checkInteger(this.drawCount, 0, 255, "drawCount");
  }
  readTail(tail) {
    const view = viewOf(tail);
    const decks = [];
    let offset = 0;
    for (let player = 0; player < this.deckCount; player++) {
      const count = view.getUint8(offset++);
      const deck = [];
      for (let i = 0; i < count; i++) {
        deck.push(view.getUint32(offset, true));
        offset += 4;
      }
      decks.push(deck);
    }
    const registry = tail.subarray(offset);
    visitRegistry(registry);
    this.decks = decks;
    this.registry = registry;
  }
  writeTail() {
    if (this.decks.length !== this.deckCount)
      throw new Error("Wrong number of START decks");
    visitRegistry(this.registry);
    const decks = this.decks.map((cards) => {
      checkInteger(cards.length, 0, 255, "deck count");
      const bytes = new Uint8Array(1 + cards.length * 4);
      const view = viewOf(bytes);
      bytes[0] = cards.length;
      for (const [index, code] of cards.entries()) {
        checkInteger(code, 0, 4294967295, "card code");
        view.setUint32(1 + 4 * index, code, true);
      }
      return bytes;
    });
    return joinBytes([...decks, this.registry]);
  }
  decodeRegistry() {
    return decodeRegistry(this.registry);
  }
  setRegistry(entries) {
    this.registry = encodeRegistry(entries);
    return this;
  }
};
__decorateClass([
  BinaryField("u32", 0, 8)
], YGOProAngelusStart.prototype, "seed", 2);
__decorateClass([
  BinaryField("u8", 32)
], YGOProAngelusStart.prototype, "duelRule", 2);
__decorateClass([
  BinaryField("u8", 33)
], YGOProAngelusStart.prototype, "flags", 2);
__decorateClass([
  BinaryField("i32", 34)
], YGOProAngelusStart.prototype, "startLp", 2);
__decorateClass([
  BinaryField("u8", 38)
], YGOProAngelusStart.prototype, "startHand", 2);
__decorateClass([
  BinaryField("u8", 39)
], YGOProAngelusStart.prototype, "drawCount", 2);
var YGOProAngelusProcess = class extends YGOProAngelusCtosBase {
  static {
    __name(this, "YGOProAngelusProcess");
  }
  static {
    this.identifier = 2;
  }
};
var YGOProAngelusResponse = class extends YGOProAngelusCtosBase {
  constructor() {
    super(...arguments);
    this.response = new Uint8Array(0);
  }
  static {
    __name(this, "YGOProAngelusResponse");
  }
  static {
    this.identifier = 3;
  }
  fromPayload(data) {
    checkInteger(data.length, 1, 255, "response length");
    this.response = data;
    return this;
  }
  toPayload() {
    checkInteger(this.response.length, 1, 255, "response length");
    return this.response;
  }
};
var YGOProAngelusQueryCard = class extends YGOProAngelusCtosBase {
  constructor() {
    super(...arguments);
    this.player = 0;
    this.location = 0;
    this.sequence = 0;
    this.queryFlag = 0;
    this.useCache = 0;
  }
  static {
    __name(this, "YGOProAngelusQueryCard");
  }
  static {
    this.identifier = 4;
  }
  validateFields() {
    checkInteger(this.player, 0, 1, "player");
    checkInteger(this.location, 0, 255, "location");
    checkInteger(this.sequence, 0, 255, "sequence");
    checkInteger(this.queryFlag, 0, 4294967295, "queryFlag");
    checkInteger(this.useCache, 0, 1, "useCache");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProAngelusQueryCard.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProAngelusQueryCard.prototype, "location", 2);
__decorateClass([
  BinaryField("u8", 2)
], YGOProAngelusQueryCard.prototype, "sequence", 2);
__decorateClass([
  BinaryField("u32", 3)
], YGOProAngelusQueryCard.prototype, "queryFlag", 2);
__decorateClass([
  BinaryField("u8", 7)
], YGOProAngelusQueryCard.prototype, "useCache", 2);
var YGOProAngelusQueryFieldCard = class extends YGOProAngelusCtosBase {
  constructor() {
    super(...arguments);
    this.player = 0;
    this.location = 0;
    this.queryFlag = 0;
    this.useCache = 0;
  }
  static {
    __name(this, "YGOProAngelusQueryFieldCard");
  }
  static {
    this.identifier = 5;
  }
  validateFields() {
    checkInteger(this.player, 0, 1, "player");
    checkInteger(this.location, 0, 255, "location");
    checkInteger(this.queryFlag, 0, 4294967295, "queryFlag");
    checkInteger(this.useCache, 0, 1, "useCache");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProAngelusQueryFieldCard.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProAngelusQueryFieldCard.prototype, "location", 2);
__decorateClass([
  BinaryField("u32", 2)
], YGOProAngelusQueryFieldCard.prototype, "queryFlag", 2);
__decorateClass([
  BinaryField("u8", 6)
], YGOProAngelusQueryFieldCard.prototype, "useCache", 2);
var YGOProAngelusQueryFieldInfo = class extends YGOProAngelusCtosBase {
  static {
    __name(this, "YGOProAngelusQueryFieldInfo");
  }
  static {
    this.identifier = 6;
  }
};
var YGOProAngelusQueryFieldCount = class extends YGOProAngelusCtosBase {
  constructor() {
    super(...arguments);
    this.player = 0;
    this.location = 0;
  }
  static {
    __name(this, "YGOProAngelusQueryFieldCount");
  }
  static {
    this.identifier = 7;
  }
  validateFields() {
    checkInteger(this.player, 0, 1, "player");
    checkInteger(this.location, 0, 255, "location");
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProAngelusQueryFieldCount.prototype, "player", 2);
__decorateClass([
  BinaryField("u8", 1)
], YGOProAngelusQueryFieldCount.prototype, "location", 2);
var YGOProAngelusFinish = class extends YGOProAngelusCtosBase {
  static {
    __name(this, "YGOProAngelusFinish");
  }
  static {
    this.identifier = 8;
  }
};
var AngelusRegistry = class extends RegistryBase {
  static {
    __name(this, "AngelusRegistry");
  }
  register(Packet) {
    if (!(Packet.prototype instanceof this.payloadClass)) {
      throw new TypeError("Angelus packet belongs to a different direction");
    }
    super.register(Packet);
  }
  getInstanceFromPayload(data) {
    if (!data.length) throw new Error("Missing Angelus opcode");
    const Packet = this.get(data[0]);
    if (!Packet) return void 0;
    return new Packet().fromFullPayload(data);
  }
  // A WS application message always contains exactly one packet.
  getInstancesFromPayload(data) {
    const packet = this.getInstanceFromPayload(data);
    return packet ? [packet] : [];
  }
};
var YGOProAngelusCtos = new AngelusRegistry(YGOProAngelusCtosBase);
YGOProAngelusCtos.register(YGOProAngelusStart);
YGOProAngelusCtos.register(YGOProAngelusProcess);
YGOProAngelusCtos.register(YGOProAngelusResponse);
YGOProAngelusCtos.register(YGOProAngelusQueryCard);
YGOProAngelusCtos.register(YGOProAngelusQueryFieldCard);
YGOProAngelusCtos.register(YGOProAngelusQueryFieldInfo);
YGOProAngelusCtos.register(YGOProAngelusQueryFieldCount);
YGOProAngelusCtos.register(YGOProAngelusFinish);
var YGOProAngelusStocBase = class _YGOProAngelusStocBase extends YGOProAngelusBase {
  static {
    __name(this, "YGOProAngelusStocBase");
  }
  static {
    this.messageDirection = "STOC";
  }
  get messageDirection() {
    return _YGOProAngelusStocBase.messageDirection;
  }
};
var YGOProAngelusStartOk = class extends YGOProAngelusStocBase {
  static {
    __name(this, "YGOProAngelusStartOk");
  }
  static {
    this.identifier = 129;
  }
};
function readMessage(bytes, framed) {
  const Message = YGOProMessages.get(bytes[0]);
  if (!Message) throw new Error(`Unknown MSG identifier: ${bytes[0]}`);
  if (!framed && Message === YGOProMsgUpdateData) {
    throw new Error("MSG_UPDATE_DATA requires an explicit message boundary");
  }
  const message = new Message().fromPayload(bytes);
  let length;
  if (message instanceof YGOProMsgUpdateCard) {
    length = 4 + viewOf(bytes).getInt32(4, true);
  } else if (message instanceof YGOProMsgUpdateData) {
    length = bytes.length;
  } else {
    length = message.toPayload().length;
  }
  checkInteger(length, 1, Math.min(bytes.length, 65535), "MSG length");
  if (framed && length !== bytes.length) throw new Error("MSG length mismatch");
  return { message, length };
}
__name(readMessage, "readMessage");
function controlStatus(message) {
  if (message instanceof YGOProMsgWin) return 2;
  if (message instanceof YGOProMsgRetry) return 3;
  if (message instanceof YGOProMsgResponseBase) return 1;
  return 0;
}
__name(controlStatus, "controlStatus");
var YGOProAngelusProcessResult = class extends YGOProAngelusStocBase {
  constructor() {
    super(...arguments);
    this.status = 0;
    this.messages = [];
  }
  static {
    __name(this, "YGOProAngelusProcessResult");
  }
  static {
    this.identifier = 130;
  }
  validateFields() {
    checkInteger(this.status, 0, 3, "process result status");
  }
  readTail(tail) {
    const messages = [];
    const view = viewOf(tail);
    for (let offset = 0; offset < tail.length; ) {
      const length = view.getUint16(offset, true);
      offset += 2;
      if (!length || offset + length > tail.length)
        throw new Error("Invalid framed MSG length");
      messages.push(tail.subarray(offset, offset + length));
      offset += length;
    }
    this.messages = messages;
  }
  writeTail() {
    let size = 0;
    for (const bytes of this.messages) {
      checkInteger(bytes.length, 1, 65535, "MSG length");
      size += 2 + bytes.length;
    }
    const tail = new Uint8Array(size);
    const view = viewOf(tail);
    let offset = 0;
    for (const bytes of this.messages) {
      view.setUint16(offset, bytes.length, true);
      tail.set(bytes, offset + 2);
      offset += 2 + bytes.length;
    }
    return tail;
  }
  decodeMessages() {
    return this.messages.map((bytes) => readMessage(bytes, true).message);
  }
  fromOcgcorePayload(raw) {
    const messages = [];
    let status = 0;
    for (let offset = 0; offset < raw.length; ) {
      const { message, length } = readMessage(raw.subarray(offset), false);
      messages.push(raw.subarray(offset, offset + length));
      if (status === 0) status = controlStatus(message);
      offset += length;
    }
    this.messages = messages;
    this.status = status;
    return this;
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProAngelusProcessResult.prototype, "status", 2);
var YGOProAngelusResponseOk = class extends YGOProAngelusStocBase {
  static {
    __name(this, "YGOProAngelusResponseOk");
  }
  static {
    this.identifier = 131;
  }
};
var YGOProAngelusQueryCardResult = class extends YGOProAngelusStocBase {
  constructor() {
    super(...arguments);
    this.raw = new Uint8Array(0);
  }
  static {
    __name(this, "YGOProAngelusQueryCardResult");
  }
  static {
    this.identifier = 132;
  }
  fromPayload(data) {
    this.raw = data;
    return this;
  }
  toPayload() {
    return this.raw;
  }
};
var YGOProAngelusQueryFieldCardResult = class extends YGOProAngelusStocBase {
  constructor() {
    super(...arguments);
    this.raw = new Uint8Array(0);
  }
  static {
    __name(this, "YGOProAngelusQueryFieldCardResult");
  }
  static {
    this.identifier = 133;
  }
  fromPayload(data) {
    this.raw = data;
    return this;
  }
  toPayload() {
    return this.raw;
  }
};
var YGOProAngelusQueryFieldInfoResult = class extends YGOProAngelusStocBase {
  constructor() {
    super(...arguments);
    this.raw = new Uint8Array(0);
  }
  static {
    __name(this, "YGOProAngelusQueryFieldInfoResult");
  }
  static {
    this.identifier = 134;
  }
  fromPayload(data) {
    this.raw = data;
    return this;
  }
  toPayload() {
    return this.raw;
  }
};
var YGOProAngelusQueryFieldCountResult = class extends YGOProAngelusStocBase {
  constructor() {
    super(...arguments);
    this.count = 0;
  }
  static {
    __name(this, "YGOProAngelusQueryFieldCountResult");
  }
  static {
    this.identifier = 135;
  }
  validateFields() {
    checkInteger(this.count, 0, 4294967295, "count");
  }
};
__decorateClass([
  BinaryField("u32", 0)
], YGOProAngelusQueryFieldCountResult.prototype, "count", 2);
var YGOProAngelusFinishOk = class extends YGOProAngelusStocBase {
  constructor() {
    super(...arguments);
    this.registry = new Uint8Array(0);
  }
  static {
    __name(this, "YGOProAngelusFinishOk");
  }
  static {
    this.identifier = 136;
  }
  fromPayload(data) {
    visitRegistry(data);
    this.registry = data;
    return this;
  }
  toPayload() {
    visitRegistry(this.registry);
    return this.registry;
  }
  decodeRegistry() {
    return decodeRegistry(this.registry);
  }
  setRegistry(entries) {
    this.registry = encodeRegistry(entries);
    return this;
  }
};
var YGOProAngelusCoreMessage = class extends YGOProAngelusStocBase {
  constructor() {
    super(...arguments);
    this.type = 0;
    this.message = "";
  }
  static {
    __name(this, "YGOProAngelusCoreMessage");
  }
  static {
    this.identifier = 144;
  }
  checkRequestId(id) {
    checkInteger(id, 0, 0, "CORE_MESSAGE requestId");
  }
  validateFields() {
    checkInteger(this.type, 0, 1, "type");
  }
  readTail(tail) {
    this.message = utf8Decoder.decode(tail);
  }
  writeTail() {
    return utf8Encoder.encode(this.message);
  }
};
__decorateClass([
  BinaryField("u8", 0)
], YGOProAngelusCoreMessage.prototype, "type", 2);
var YGOProAngelusError = class extends YGOProAngelusStocBase {
  constructor() {
    super(...arguments);
    this.code = 1;
    this.message = "";
  }
  static {
    __name(this, "YGOProAngelusError");
  }
  static {
    this.identifier = 255;
  }
  validateFields() {
    checkInteger(this.code, 1, 4, "code");
  }
  readTail(tail) {
    this.message = utf8Decoder.decode(tail);
  }
  writeTail() {
    return utf8Encoder.encode(this.message);
  }
};
__decorateClass([
  BinaryField("u16", 0)
], YGOProAngelusError.prototype, "code", 2);
var YGOProAngelusStoc = new AngelusRegistry(YGOProAngelusStocBase);
YGOProAngelusStoc.register(YGOProAngelusStartOk);
YGOProAngelusStoc.register(YGOProAngelusProcessResult);
YGOProAngelusStoc.register(YGOProAngelusResponseOk);
YGOProAngelusStoc.register(YGOProAngelusQueryCardResult);
YGOProAngelusStoc.register(YGOProAngelusQueryFieldCardResult);
YGOProAngelusStoc.register(YGOProAngelusQueryFieldInfoResult);
YGOProAngelusStoc.register(YGOProAngelusQueryFieldCountResult);
YGOProAngelusStoc.register(YGOProAngelusFinishOk);
YGOProAngelusStoc.register(YGOProAngelusCoreMessage);
YGOProAngelusStoc.register(YGOProAngelusError);

// node_modules/nfkit/dist/index.mjs
var makeArray = (value) => {
  return Array.isArray(value) ? value : [value];
};

// node_modules/ygopro-cdb-encode/dist/index.mjs
function isSqlJsStatic(value) {
  return !!value && typeof value.Database === "function";
}
var SETCODE_BITS = 64;
var SETCODE_CHUNKS = SETCODE_BITS / 16;
var MIN_SAFE_BIGINT = BigInt(Number.MIN_SAFE_INTEGER);
var MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);
function normalizeSetcodeValue(value) {
  if (typeof value === "bigint") {
    return value;
  }
  if (typeof value === "string") {
    return BigInt(value);
  }
  if (!Number.isFinite(value)) {
    return 0n;
  }
  return BigInt(Math.trunc(value));
}
function toNumberArrayFromSetcode(value) {
  let raw = BigInt.asUintN(SETCODE_BITS, normalizeSetcodeValue(value));
  const list = [];
  while (raw !== 0n && list.length < SETCODE_CHUNKS) {
    const chunk = raw & 0xffffn;
    if (chunk !== 0n) {
      list.push(Number(chunk));
    }
    raw >>= 16n;
  }
  return list;
}
function toSetcodeFromNumberArray(list) {
  let raw = 0n;
  const length = Math.min(list.length, SETCODE_CHUNKS);
  for (let i = 0; i < length; i++) {
    const chunk = BigInt(list[i] ?? 0) & 0xffffn;
    raw |= chunk << BigInt(16 * i);
  }
  return BigInt.asUintN(SETCODE_BITS, raw);
}
function toSqliteIntegerFromSetcode(value) {
  const raw = BigInt.asUintN(SETCODE_BITS, normalizeSetcodeValue(value));
  const signed = BigInt.asIntN(SETCODE_BITS, raw);
  if (MIN_SAFE_BIGINT <= signed && signed <= MAX_SAFE_BIGINT) {
    return Number(signed);
  }
  return signed.toString();
}
var STRING_SLOTS = 16;
var CardDataEntry = class extends CardData {
  constructor() {
    super(...arguments);
    this.ot = 0;
    this.category = 0;
    this.name = "";
    this.desc = "";
    this.strings = Array(STRING_SLOTS).fill("");
  }
  fromPartial(data) {
    super.fromPartial(data);
    const ot = data.ot ?? 0;
    const category = data.category ?? 0;
    const name = data.name ?? "";
    const desc = data.desc ?? "";
    const input = data.strings ?? [];
    const strings = Array(STRING_SLOTS).fill("");
    for (let i = 0; i < STRING_SLOTS && i < input.length; i++) {
      const value = input[i];
      strings[i] = value != null ? String(value) : "";
    }
    this.ot = ot;
    this.category = category;
    this.name = name;
    this.desc = desc;
    this.strings = strings;
    return this;
  }
  fromSqljsRow(row) {
    const type = (row.type ?? 0) >>> 0;
    const attack = row.atk ?? 0;
    let defense = row.def ?? 0;
    let linkMarker = 0;
    if ((type & OcgcoreCommonConstants.TYPE_LINK) >>> 0 !== 0) {
      linkMarker = defense;
      defense = 0;
    }
    const levelRaw = (row.level ?? 0) >>> 0;
    const level = (levelRaw & 255) >>> 0;
    const lscale = (levelRaw >>> 24 & 255) >>> 0;
    const rscale = (levelRaw >>> 16 & 255) >>> 0;
    const code = row.id;
    let alias = row.alias ?? 0;
    let ruleCode = 0;
    if (code === 5405695) {
      ruleCode = alias;
      alias = 0;
    } else if (alias && !(type & OcgcoreCommonConstants.TYPE_TOKEN)) {
      const CARD_ARTWORK_VERSIONS_OFFSET = 20;
      const isAlternative = alias && alias < code + CARD_ARTWORK_VERSIONS_OFFSET && code < alias + CARD_ARTWORK_VERSIONS_OFFSET;
      if (!isAlternative) {
        ruleCode = alias;
        alias = 0;
      }
    }
    Object.assign(this, {
      code,
      ot: row.ot ?? 0,
      alias,
      setcode: toNumberArrayFromSetcode(row.setcode ?? 0),
      type,
      level,
      attribute: (row.attribute ?? 0) >>> 0,
      race: (row.race ?? 0) >>> 0,
      attack,
      defense,
      lscale,
      rscale,
      linkMarker,
      ruleCode,
      category: row.category ?? 0,
      name: row.name ?? "",
      desc: row.desc ?? "",
      strings: [
        row.str1 ?? "",
        row.str2 ?? "",
        row.str3 ?? "",
        row.str4 ?? "",
        row.str5 ?? "",
        row.str6 ?? "",
        row.str7 ?? "",
        row.str8 ?? "",
        row.str9 ?? "",
        row.str10 ?? "",
        row.str11 ?? "",
        row.str12 ?? "",
        row.str13 ?? "",
        row.str14 ?? "",
        row.str15 ?? "",
        row.str16 ?? ""
      ]
    });
    return this;
  }
  toSqljsRow() {
    const type = this.type >>> 0;
    const isLink = (type & OcgcoreCommonConstants.TYPE_LINK) >>> 0 !== 0;
    const attack = this.attack ?? 0;
    const defense = isLink ? this.linkMarker ?? 0 : this.defense ?? 0;
    const level = (this.level ?? 0) & 255 | ((this.rscale ?? 0) & 255) << 16 | ((this.lscale ?? 0) & 255) << 24;
    const dbAlias = this.alias || this.ruleCode || 0;
    const strings = this.strings ?? [];
    const getString = (index) => {
      const value = strings[index];
      return value != null ? String(value) : "";
    };
    return {
      datas: {
        id: this.code ?? 0,
        ot: this.ot ?? 0,
        alias: dbAlias,
        setcode: toSetcodeFromNumberArray(this.setcode ?? []),
        type,
        atk: attack,
        def: defense,
        level,
        race: this.race ?? 0,
        attribute: this.attribute ?? 0,
        category: this.category ?? 0
      },
      texts: {
        id: this.code ?? 0,
        name: this.name ?? "",
        desc: this.desc ?? "",
        str1: getString(0),
        str2: getString(1),
        str3: getString(2),
        str4: getString(3),
        str5: getString(4),
        str6: getString(5),
        str7: getString(6),
        str8: getString(7),
        str9: getString(8),
        str10: getString(9),
        str11: getString(10),
        str12: getString(11),
        str13: getString(12),
        str14: getString(13),
        str15: getString(14),
        str16: getString(15)
      }
    };
  }
};
var TEXT_FIELDS = [
  "name",
  "desc",
  "str1",
  "str2",
  "str3",
  "str4",
  "str5",
  "str6",
  "str7",
  "str8",
  "str9",
  "str10",
  "str11",
  "str12",
  "str13",
  "str14",
  "str15",
  "str16"
];
var isFindOperator = (value) => {
  return !!value && typeof value === "object" && "__op" in value;
};
var isPlainValue = (value) => value === null || value === void 0 || !isFindOperator(value);
var areAllPlainValues = (values) => values.every((value) => isPlainValue(value));
var allPlainValuesEqual = (values) => {
  if (values.length <= 1) return true;
  const first = values[0];
  return values.every((value) => value === first);
};
var isTextKey = (key) => TEXT_FIELDS.includes(key);
var TYPE_LINK = OcgcoreCommonConstants.TYPE_LINK >>> 0;
var getColumnExpr = (key, options) => {
  switch (key) {
    case "code":
      return "datas.id";
    case "level":
      return "(datas.level & 255)";
    case "rawLevel":
      return "datas.level";
    case "lscale":
      return "((datas.level >> 24) & 255)";
    case "rscale":
      return "((datas.level >> 16) & 255)";
    case "linkMarker":
      return `CASE WHEN (datas.type & ${TYPE_LINK}) != 0 THEN datas.def ELSE NULL END`;
    case "rawDefense":
      return "datas.def";
    case "defense":
      return `CASE WHEN (datas.type & ${TYPE_LINK}) != 0 THEN NULL ELSE datas.def END`;
    default:
      if (options?.noTexts && isTextKey(key)) {
        throw new Error(
          `Text field "${String(key)}" is not available in noTexts mode`
        );
      }
      return isTextKey(key) ? `texts.${String(key)}` : `datas.${String(key)}`;
  }
};
var addParam = (ctx, value) => {
  const key = `p${ctx.nextParamId++}`;
  ctx.params[key] = value;
  return `:${key}`;
};
var buildPredicate = (column, value, ctx) => {
  if (isFindOperator(value)) {
    const op = value.__op;
    switch (op) {
      case "Not": {
        if (value.value === void 0) return "1=1";
        if (value.value === null) {
          return `${column} IS NOT NULL`;
        }
        if (isFindOperator(value.value)) {
          switch (value.value.__op) {
            case "Not":
              return buildPredicate(column, value.value.value, ctx);
            /* 
            // it's not same in SQL so we don't do this optimization
            case 'LessThan':
              return buildPredicate(
                column,
                {
                  __op: 'MoreThanOrEqual',
                  value: value.value.value,
                },
                ctx,
              );
            case 'MoreThan':
              return buildPredicate(
                column,
                {
                  __op: 'LessThanOrEqual',
                  value: value.value.value,
                },
                ctx,
              );
            case 'LessThanOrEqual':
              return buildPredicate(
                column,
                {
                  __op: 'MoreThan',
                  value: value.value.value,
                },
                ctx,
              );
            case 'MoreThanOrEqual':
              return buildPredicate(
                column,
                {
                  __op: 'LessThan',
                  value: value.value.value,
                },
                ctx,
              );*/
            default:
              break;
          }
        }
        if (isPlainValue(value.value)) {
          const param2 = addParam(ctx, value.value);
          return `${column} != ${param2}`;
        }
        const inner = buildPredicate(column, value.value, ctx);
        return `NOT (${inner})`;
      }
      case "LessThan": {
        const param2 = addParam(ctx, value.value);
        return `${column} < ${param2}`;
      }
      case "MoreThan": {
        const param2 = addParam(ctx, value.value);
        return `${column} > ${param2}`;
      }
      case "LessThanOrEqual": {
        const param2 = addParam(ctx, value.value);
        return `${column} <= ${param2}`;
      }
      case "MoreThanOrEqual": {
        const param2 = addParam(ctx, value.value);
        return `${column} >= ${param2}`;
      }
      case "HasBit": {
        const param2 = addParam(ctx, value.value);
        return `${column} & ${param2} != 0`;
      }
      case "HasAllBits": {
        const param2 = addParam(ctx, value.value);
        return `${column} & ${param2} = ${param2}`;
      }
      case "And": {
        const values = value.values ?? [];
        if (values.length === 0) return "1=1";
        if (areAllPlainValues(values)) {
          if (!allPlainValuesEqual(values)) {
            return "1=0";
          }
          return buildPredicate(column, values[0], ctx);
        }
        return values.map((item) => `(${buildPredicate(column, item, ctx)})`).join(" AND ");
      }
      case "Or": {
        const values = value.values ?? [];
        if (values.length === 0) return "1=0";
        if (areAllPlainValues(values)) {
          if (values.length === 1) {
            return buildPredicate(column, values[0], ctx);
          }
          const params = values.map((item) => addParam(ctx, item));
          return `${column} IN (${params.join(", ")})`;
        }
        return values.map((item) => `(${buildPredicate(column, item, ctx)})`).join(" OR ");
      }
      default:
        return "1=1";
    }
  }
  if (value === null) {
    return `${column} IS NULL`;
  }
  const param = addParam(ctx, value);
  return `${column} = ${param}`;
};
function buildCdbFilterStmt(filter, options) {
  const clauses = [];
  const ctx = {
    params: {},
    nextParamId: 0
  };
  for (const [rawKey, value] of Object.entries(filter)) {
    if (value === void 0) continue;
    const key = rawKey;
    const column = getColumnExpr(key, options);
    clauses.push(buildPredicate(column, value, ctx));
  }
  return { stmt: clauses.join(" AND "), params: ctx.params };
}
function normalizeCdbParams(params) {
  const result = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0) continue;
    const normalizedKey = key.startsWith(":") || key.startsWith("$") || key.startsWith("@") ? key : `:${key}`;
    if (typeof value === "bigint") {
      if (value <= BigInt(Number.MAX_SAFE_INTEGER)) {
        result[normalizedKey] = Number(value);
      } else {
        result[normalizedKey] = value.toString();
      }
    } else {
      result[normalizedKey] = value;
    }
  }
  return result;
}
var SELECT_STMT_WITH_TEXTS = "SELECT datas.id, datas.ot, datas.alias, CAST(datas.setcode AS TEXT) AS setcode, datas.type, datas.atk, datas.def, datas.level, datas.race, datas.attribute, datas.category, texts.name, texts.desc, texts.str1, texts.str2, texts.str3, texts.str4, texts.str5, texts.str6, texts.str7, texts.str8, texts.str9, texts.str10, texts.str11, texts.str12, texts.str13, texts.str14, texts.str15, texts.str16 FROM datas INNER JOIN texts ON datas.id = texts.id";
var SELECT_STMT_NO_TEXTS = "SELECT datas.id, datas.ot, datas.alias, CAST(datas.setcode AS TEXT) AS setcode, datas.type, datas.atk, datas.def, datas.level, datas.race, datas.attribute, datas.category FROM datas";
var CREATE_TABLE_STMT = "CREATE TABLE datas(id integer primary key,ot integer,alias integer,setcode integer,type integer,atk integer,def integer,level integer,race integer,attribute integer,category integer);CREATE TABLE texts(id integer primary key,name text,desc text,str1 text,str2 text,str3 text,str4 text,str5 text,str6 text,str7 text,str8 text,str9 text,str10 text,str11 text,str12 text,str13 text,str14 text,str15 text,str16 text);";
var CREATE_TEXTS_TABLE_STMT = "CREATE TABLE IF NOT EXISTS texts(id integer primary key,name text,desc text,str1 text,str2 text,str3 text,str4 text,str5 text,str6 text,str7 text,str8 text,str9 text,str10 text,str11 text,str12 text,str13 text,str14 text,str15 text,str16 text);";
var DROP_TEXTS_TABLE_STMT = "DROP TABLE IF EXISTS texts";
var INSERT_EMPTY_TEXTS_FROM_DATAS_STMT = "INSERT OR IGNORE INTO texts(id,name,desc,str1,str2,str3,str4,str5,str6,str7,str8,str9,str10,str11,str12,str13,str14,str15,str16) SELECT datas.id,'' AS name,'' AS desc,'' AS str1,'' AS str2,'' AS str3,'' AS str4,'' AS str5,'' AS str6,'' AS str7,'' AS str8,'' AS str9,'' AS str10,'' AS str11,'' AS str12,'' AS str13,'' AS str14,'' AS str15,'' AS str16 FROM datas";
var INSERT_DATAS_STMT = "INSERT OR REPLACE INTO datas(id,ot,alias,setcode,type,atk,def,level,race,attribute,category) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
var INSERT_TEXTS_STMT = "INSERT OR REPLACE INTO texts(id,name,desc,str1,str2,str3,str4,str5,str6,str7,str8,str9,str10,str11,str12,str13,str14,str15,str16) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
var YGOProCdb = class _YGOProCdb {
  constructor(sqljsStaticOrDb) {
    this._noTexts = false;
    if (sqljsStaticOrDb instanceof _YGOProCdb) {
      this.SQL = sqljsStaticOrDb.SQL;
      this.db = sqljsStaticOrDb.db;
      this._noTexts = sqljsStaticOrDb._noTexts;
    } else if (isSqlJsStatic(sqljsStaticOrDb)) {
      this.SQL = sqljsStaticOrDb;
      this.db = new this.SQL.Database();
      this.db.exec(CREATE_TABLE_STMT);
    } else {
      this.SQL = void 0;
      this.db = sqljsStaticOrDb;
    }
  }
  get database() {
    if (!this.db) {
      if (!this.SQL) {
        throw new Error(
          "Database is not initialized and SqlJsStatic is not available"
        );
      }
      this.db = new this.SQL.Database();
      this.db.exec(CREATE_TABLE_STMT);
    }
    return this.db;
  }
  from(db) {
    if (this.db) {
      this.finalize();
    }
    if (db instanceof Uint8Array) {
      if (!this.SQL) {
        throw new Error(
          "SqlJsStatic is required to create a database from Uint8Array"
        );
      }
      this.db = new this.SQL.Database(db);
    } else {
      this.db = db;
    }
    return this;
  }
  noTexts(value = true) {
    this._noTexts = value;
    if (value) {
      this.database.exec(DROP_TEXTS_TABLE_STMT);
    } else {
      this.database.exec(CREATE_TEXTS_TABLE_STMT);
      this.database.exec(INSERT_EMPTY_TEXTS_FROM_DATAS_STMT);
    }
    return this;
  }
  addCard(card) {
    const cards = makeArray(card);
    const stmtDatas = this.database.prepare(INSERT_DATAS_STMT);
    const stmtTexts = this._noTexts ? void 0 : this.database.prepare(INSERT_TEXTS_STMT);
    try {
      for (const c of cards) {
        const row = c.toSqljsRow();
        const datas = row.datas;
        const texts = row.texts;
        stmtDatas.run([
          datas.id,
          datas.ot,
          datas.alias,
          toSqliteIntegerFromSetcode(datas.setcode),
          datas.type,
          datas.atk,
          datas.def,
          datas.level,
          datas.race,
          datas.attribute,
          datas.category
        ]);
        if (stmtTexts) {
          stmtTexts.run([
            texts.id,
            texts.name,
            texts.desc,
            texts.str1,
            texts.str2,
            texts.str3,
            texts.str4,
            texts.str5,
            texts.str6,
            texts.str7,
            texts.str8,
            texts.str9,
            texts.str10,
            texts.str11,
            texts.str12,
            texts.str13,
            texts.str14,
            texts.str15,
            texts.str16
          ]);
        }
      }
    } finally {
      stmtDatas.free();
      stmtTexts?.free();
    }
    return this;
  }
  find(...args) {
    const results = Array.from(
      this.step(...args)
    );
    this.resolveRuleCode(results);
    return results;
  }
  *step(...args) {
    const { stmt, params } = this.resolveQueryArgs(args);
    const where = stmt ? ` WHERE ${stmt}` : "";
    const sql = `${this._noTexts ? SELECT_STMT_NO_TEXTS : SELECT_STMT_WITH_TEXTS}${where}`;
    const query = this.database.prepare(sql);
    try {
      query.bind(normalizeCdbParams(params));
      while (query.step()) {
        const row = query.getAsObject();
        yield new CardDataEntry().fromSqljsRow(row);
      }
    } finally {
      query.free();
    }
  }
  resolveQueryArgs(args) {
    let stmt = "";
    let params = {};
    if (args.length === 0) {
      return { stmt, params };
    }
    if (typeof args[0] === "string") {
      stmt = args[0];
      params = args[1] ?? {};
      if (this._noTexts && /\btexts\./i.test(stmt)) {
        throw new Error("texts table is not available in noTexts mode");
      }
      return { stmt, params };
    }
    const filter = args[0];
    const built = buildCdbFilterStmt(filter, { noTexts: this._noTexts });
    return {
      stmt: built.stmt,
      params: built.params
    };
  }
  resolveRuleCode(cards) {
    const needsResolve = cards.filter(
      (c) => !c.ruleCode && c.alias && !(c.type & OcgcoreCommonConstants.TYPE_TOKEN)
    );
    if (needsResolve.length === 0) return;
    const aliasIds = needsResolve.map((c) => c.alias);
    const placeholders = aliasIds.map(() => "?").join(",");
    const sql = `SELECT id, alias, type FROM datas WHERE id IN (${placeholders})`;
    const query = this.database.prepare(sql);
    const aliasToRuleCode = /* @__PURE__ */ new Map();
    try {
      query.bind(aliasIds);
      while (query.step()) {
        const row = query.getAsObject();
        const code = row.id;
        const alias = row.alias ?? 0;
        const type = (row.type ?? 0) >>> 0;
        let ruleCode = 0;
        if (code === 5405695) {
          ruleCode = alias;
        } else if (alias && !(type & OcgcoreCommonConstants.TYPE_TOKEN)) {
          const CARD_ARTWORK_VERSIONS_OFFSET = 20;
          const isAlternative = alias && alias < code + CARD_ARTWORK_VERSIONS_OFFSET && code < alias + CARD_ARTWORK_VERSIONS_OFFSET;
          if (!isAlternative) {
            ruleCode = alias;
          }
        }
        aliasToRuleCode.set(code, ruleCode);
      }
    } finally {
      query.free();
    }
    for (const card of needsResolve) {
      const ruleCode = aliasToRuleCode.get(card.alias);
      if (ruleCode) {
        card.ruleCode = ruleCode;
      }
    }
    return cards;
  }
  findOne(...args) {
    if (args.length === 0) {
      return this.find("1=1 LIMIT 1")[0];
    }
    if (typeof args[0] === "string") {
      const base = args[0];
      const params = args[1];
      const stmt2 = /\blimit\b/i.test(base) ? base : `${base} LIMIT 1`;
      return this.find(stmt2, params)[0];
    }
    const filter = args[0];
    const built = buildCdbFilterStmt(filter, { noTexts: this._noTexts });
    const stmt = built.stmt ? `${built.stmt} LIMIT 1` : "1=1 LIMIT 1";
    return this.find(stmt, built.params)[0];
  }
  findById(id) {
    return this.findOne("datas.id = :id", { id });
  }
  export() {
    return this.database.export();
  }
  finalize() {
    this.database.close();
    this.db = void 0;
  }
};

// node_modules/koishipro-core.js/dist/vendor/wasm_esm/libocgcore.mjs
var createOcgcore = (() => {
  var _scriptDir = import.meta.url;
  return (function(createOcgcore2) {
    createOcgcore2 = createOcgcore2 || {};
    var Module = typeof createOcgcore2 != "undefined" ? createOcgcore2 : {};
    var readyPromiseResolve, readyPromiseReject;
    Module["ready"] = new Promise(function(resolve, reject) {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var moduleOverrides = Object.assign({}, Module);
    var arguments_ = [];
    var thisProgram = "./this.program";
    var quit_ = (status, toThrow) => {
      throw toThrow;
    };
    var ENVIRONMENT_IS_WEB = typeof window == "object";
    var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
    var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
    var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
    var scriptDirectory = "";
    function locateFile(path) {
      if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var read_, readAsync, readBinary, setWindowTitle;
    function logExceptionOnExit(e) {
      if (e instanceof ExitStatus) return;
      let toLog = e;
      err("exiting due to exception: " + toLog);
    }
    var fs;
    var nodePath;
    var requireNodeFS;
    if (ENVIRONMENT_IS_NODE) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = __require("path").dirname(scriptDirectory) + "/";
      } else {
        scriptDirectory = __dirname + "/";
      }
      requireNodeFS = () => {
        if (!nodePath) {
          fs = __require("fs");
          nodePath = __require("path");
        }
      };
      read_ = function shell_read(filename, binary) {
        requireNodeFS();
        filename = nodePath["normalize"](filename);
        return fs.readFileSync(filename, binary ? void 0 : "utf8");
      };
      readBinary = (filename) => {
        var ret = read_(filename, true);
        if (!ret.buffer) {
          ret = new Uint8Array(ret);
        }
        return ret;
      };
      readAsync = (filename, onload, onerror) => {
        requireNodeFS();
        filename = nodePath["normalize"](filename);
        fs.readFile(filename, function(err2, data) {
          if (err2) onerror(err2);
          else onload(data.buffer);
        });
      };
      if (process["argv"].length > 1) {
        thisProgram = process["argv"][1].replace(/\\/g, "/");
      }
      arguments_ = process["argv"].slice(2);
      process["on"]("uncaughtException", function(ex) {
        if (!(ex instanceof ExitStatus)) {
          throw ex;
        }
      });
      process["on"]("unhandledRejection", function(reason) {
        throw reason;
      });
      quit_ = (status, toThrow) => {
        if (keepRuntimeAlive()) {
          process["exitCode"] = status;
          throw toThrow;
        }
        logExceptionOnExit(toThrow);
        process["exit"](status);
      };
      Module["inspect"] = function() {
        return "[Emscripten Module object]";
      };
    } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir;
      }
      if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
      } else {
        scriptDirectory = "";
      }
      {
        read_ = (url) => {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          xhr.send(null);
          return xhr.responseText;
        };
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = (url) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.responseType = "arraybuffer";
            xhr.send(null);
            return new Uint8Array(
              /** @type{!ArrayBuffer} */
              xhr.response
            );
          };
        }
        readAsync = (url, onload, onerror) => {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = () => {
            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
              onload(xhr.response);
              return;
            }
            onerror();
          };
          xhr.onerror = onerror;
          xhr.send(null);
        };
      }
      setWindowTitle = (title) => document.title = title;
    } else {
    }
    var out = Module["print"] || console.log.bind(console);
    var err = Module["printErr"] || console.warn.bind(console);
    Object.assign(Module, moduleOverrides);
    moduleOverrides = null;
    if (Module["arguments"]) arguments_ = Module["arguments"];
    if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
    if (Module["quit"]) quit_ = Module["quit"];
    var STACK_ALIGN = 16;
    var POINTER_SIZE = 4;
    function getNativeTypeSize(type) {
      switch (type) {
        case "i1":
        case "i8":
          return 1;
        case "i16":
          return 2;
        case "i32":
          return 4;
        case "i64":
          return 8;
        case "float":
          return 4;
        case "double":
          return 8;
        default: {
          if (type[type.length - 1] === "*") {
            return POINTER_SIZE;
          } else if (type[0] === "i") {
            const bits = Number(type.substr(1));
            assert(bits % 8 === 0, "getNativeTypeSize invalid bits " + bits + ", type " + type);
            return bits / 8;
          } else {
            return 0;
          }
        }
      }
    }
    function warnOnce(text) {
      if (!warnOnce.shown) warnOnce.shown = {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    }
    function convertJsFunctionToWasm(func, sig) {
      if (typeof WebAssembly.Function == "function") {
        var typeNames = {
          "i": "i32",
          "j": "i64",
          "f": "f32",
          "d": "f64"
        };
        var type = {
          parameters: [],
          results: sig[0] == "v" ? [] : [typeNames[sig[0]]]
        };
        for (var i = 1; i < sig.length; ++i) {
          type.parameters.push(typeNames[sig[i]]);
        }
        return new WebAssembly.Function(type, func);
      }
      var typeSection = [
        1,
        // id: section,
        0,
        // length: 0 (placeholder)
        1,
        // count: 1
        96
        // form: func
      ];
      var sigRet = sig.slice(0, 1);
      var sigParam = sig.slice(1);
      var typeCodes = {
        "i": 127,
        // i32
        "j": 126,
        // i64
        "f": 125,
        // f32
        "d": 124
        // f64
      };
      typeSection.push(sigParam.length);
      for (var i = 0; i < sigParam.length; ++i) {
        typeSection.push(typeCodes[sigParam[i]]);
      }
      if (sigRet == "v") {
        typeSection.push(0);
      } else {
        typeSection = typeSection.concat([1, typeCodes[sigRet]]);
      }
      typeSection[1] = typeSection.length - 2;
      var bytes = new Uint8Array([
        0,
        97,
        115,
        109,
        // magic ("\0asm")
        1,
        0,
        0,
        0
        // version: 1
      ].concat(typeSection, [
        2,
        7,
        // import section
        // (import "e" "f" (func 0 (type 0)))
        1,
        1,
        101,
        1,
        102,
        0,
        0,
        7,
        5,
        // export section
        // (export "f" (func 0 (type 0)))
        1,
        1,
        102,
        0,
        0
      ]));
      var module2 = new WebAssembly.Module(bytes);
      var instance = new WebAssembly.Instance(module2, {
        "e": {
          "f": func
        }
      });
      var wrappedFunc = instance.exports["f"];
      return wrappedFunc;
    }
    var freeTableIndexes = [];
    var functionsInTableMap;
    function getEmptyTableSlot() {
      if (freeTableIndexes.length) {
        return freeTableIndexes.pop();
      }
      try {
        wasmTable.grow(1);
      } catch (err2) {
        if (!(err2 instanceof RangeError)) {
          throw err2;
        }
        throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
      }
      return wasmTable.length - 1;
    }
    function updateTableMap(offset, count) {
      for (var i = offset; i < offset + count; i++) {
        var item = getWasmTableEntry(i);
        if (item) {
          functionsInTableMap.set(item, i);
        }
      }
    }
    function addFunction(func, sig) {
      if (!functionsInTableMap) {
        functionsInTableMap = /* @__PURE__ */ new WeakMap();
        updateTableMap(0, wasmTable.length);
      }
      if (functionsInTableMap.has(func)) {
        return functionsInTableMap.get(func);
      }
      var ret = getEmptyTableSlot();
      try {
        setWasmTableEntry(ret, func);
      } catch (err2) {
        if (!(err2 instanceof TypeError)) {
          throw err2;
        }
        var wrapped = convertJsFunctionToWasm(func, sig);
        setWasmTableEntry(ret, wrapped);
      }
      functionsInTableMap.set(func, ret);
      return ret;
    }
    function removeFunction(index) {
      functionsInTableMap.delete(getWasmTableEntry(index));
      freeTableIndexes.push(index);
    }
    var tempRet0 = 0;
    var setTempRet0 = (value) => {
      tempRet0 = value;
    };
    var getTempRet0 = () => tempRet0;
    var wasmBinary;
    if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
    var noExitRuntime = Module["noExitRuntime"] || false;
    if (typeof WebAssembly != "object") {
      abort("no native wasm support detected");
    }
    function setValue(ptr, value, type = "i8", noSafe) {
      if (type.charAt(type.length - 1) === "*") type = "i32";
      switch (type) {
        case "i1":
          HEAP8[ptr >> 0] = value;
          break;
        case "i8":
          HEAP8[ptr >> 0] = value;
          break;
        case "i16":
          HEAP16[ptr >> 1] = value;
          break;
        case "i32":
          HEAP32[ptr >> 2] = value;
          break;
        case "i64":
          tempI64 = [value >>> 0, (tempDouble = value, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
          break;
        case "float":
          HEAPF32[ptr >> 2] = value;
          break;
        case "double":
          HEAPF64[ptr >> 3] = value;
          break;
        default:
          abort("invalid type for setValue: " + type);
      }
    }
    function getValue(ptr, type = "i8", noSafe) {
      if (type.charAt(type.length - 1) === "*") type = "i32";
      switch (type) {
        case "i1":
          return HEAP8[ptr >> 0];
        case "i8":
          return HEAP8[ptr >> 0];
        case "i16":
          return HEAP16[ptr >> 1];
        case "i32":
          return HEAP32[ptr >> 2];
        case "i64":
          return HEAP32[ptr >> 2];
        case "float":
          return HEAPF32[ptr >> 2];
        case "double":
          return Number(HEAPF64[ptr >> 3]);
        default:
          abort("invalid type for getValue: " + type);
      }
      return null;
    }
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    function assert(condition, text) {
      if (!condition) {
        abort(text);
      }
    }
    function getCFunc(ident) {
      var func = Module["_" + ident];
      return func;
    }
    function ccall(ident, returnType, argTypes, args, opts) {
      var toC = {
        "string": function(str) {
          var ret2 = 0;
          if (str !== null && str !== void 0 && str !== 0) {
            var len = (str.length << 2) + 1;
            ret2 = stackAlloc(len);
            stringToUTF8(str, ret2, len);
          }
          return ret2;
        },
        "array": function(arr) {
          var ret2 = stackAlloc(arr.length);
          writeArrayToMemory(arr, ret2);
          return ret2;
        }
      };
      function convertReturnValue(ret2) {
        if (returnType === "string") return UTF8ToString(ret2);
        if (returnType === "boolean") return Boolean(ret2);
        return ret2;
      }
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var ret = func.apply(null, cArgs);
      function onDone(ret2) {
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret2);
      }
      ret = onDone(ret);
      return ret;
    }
    function cwrap(ident, returnType, argTypes, opts) {
      argTypes = argTypes || [];
      var numericArgs = argTypes.every(function(type) {
        return type === "number";
      });
      var numericRet = returnType !== "string";
      if (numericRet && numericArgs && !opts) {
        return getCFunc(ident);
      }
      return function() {
        return ccall(ident, returnType, argTypes, arguments, opts);
      };
    }
    var ALLOC_NORMAL = 0;
    var ALLOC_STACK = 1;
    function allocate(slab, allocator) {
      var ret;
      if (allocator == ALLOC_STACK) {
        ret = stackAlloc(slab.length);
      } else {
        ret = _malloc(slab.length);
      }
      if (!slab.subarray && !slab.slice) {
        slab = new Uint8Array(slab);
      }
      HEAPU8.set(slab, ret);
      return ret;
    }
    var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : void 0;
    function UTF8ArrayToString(heap, idx, maxBytesToRead) {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(heap.subarray(idx, endPtr));
      } else {
        var str = "";
        while (idx < endPtr) {
          var u0 = heap[idx++];
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue;
          }
          var u1 = heap[idx++] & 63;
          if ((u0 & 224) == 192) {
            str += String.fromCharCode((u0 & 31) << 6 | u1);
            continue;
          }
          var u2 = heap[idx++] & 63;
          if ((u0 & 240) == 224) {
            u0 = (u0 & 15) << 12 | u1 << 6 | u2;
          } else {
            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heap[idx++] & 63;
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0);
          } else {
            var ch = u0 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
          }
        }
      }
      return str;
    }
    function UTF8ToString(ptr, maxBytesToRead) {
      ;
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
    }
    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0))
        return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = 65536 + ((u & 1023) << 10) | u1 & 1023;
        }
        if (u <= 127) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 192 | u >> 6;
          heap[outIdx++] = 128 | u & 63;
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 224 | u >> 12;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        } else {
          if (outIdx + 3 >= endIdx) break;
          heap[outIdx++] = 240 | u >> 18;
          heap[outIdx++] = 128 | u >> 12 & 63;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }
    function lengthBytesUTF8(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
        if (u <= 127) ++len;
        else if (u <= 2047) len += 2;
        else if (u <= 65535) len += 3;
        else len += 4;
      }
      return len;
    }
    function AsciiToString(ptr) {
      var str = "";
      while (1) {
        var ch = HEAPU8[ptr++ >> 0];
        if (!ch) return str;
        str += String.fromCharCode(ch);
      }
    }
    function stringToAscii(str, outPtr) {
      return writeAsciiToMemory(str, outPtr, false);
    }
    var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : void 0;
    function UTF16ToString(ptr, maxBytesToRead) {
      var endPtr = ptr;
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
      endPtr = idx << 1;
      if (endPtr - ptr > 32 && UTF16Decoder) {
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
      } else {
        var str = "";
        for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
          var codeUnit = HEAP16[ptr + i * 2 >> 1];
          if (codeUnit == 0) break;
          str += String.fromCharCode(codeUnit);
        }
        return str;
      }
    }
    function stringToUTF16(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === void 0) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 2) return 0;
      maxBytesToWrite -= 2;
      var startPtr = outPtr;
      var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
      for (var i = 0; i < numCharsToWrite; ++i) {
        var codeUnit = str.charCodeAt(i);
        HEAP16[outPtr >> 1] = codeUnit;
        outPtr += 2;
      }
      HEAP16[outPtr >> 1] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF16(str) {
      return str.length * 2;
    }
    function UTF32ToString(ptr, maxBytesToRead) {
      var i = 0;
      var str = "";
      while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[ptr + i * 4 >> 2];
        if (utf32 == 0) break;
        ++i;
        if (utf32 >= 65536) {
          var ch = utf32 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    }
    function stringToUTF32(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === void 0) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
        }
        HEAP32[outPtr >> 2] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      HEAP32[outPtr >> 2] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF32(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
        len += 4;
      }
      return len;
    }
    function allocateUTF8(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = _malloc(size);
      if (ret) stringToUTF8Array(str, HEAP8, ret, size);
      return ret;
    }
    function allocateUTF8OnStack(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8Array(str, HEAP8, ret, size);
      return ret;
    }
    function writeStringToMemory(string, buffer2, dontAddNull) {
      warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
      var lastChar, end;
      if (dontAddNull) {
        end = buffer2 + lengthBytesUTF8(string);
        lastChar = HEAP8[end];
      }
      stringToUTF8(string, buffer2, Infinity);
      if (dontAddNull) HEAP8[end] = lastChar;
    }
    function writeArrayToMemory(array, buffer2) {
      HEAP8.set(array, buffer2);
    }
    function writeAsciiToMemory(str, buffer2, dontAddNull) {
      for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer2++ >> 0] = str.charCodeAt(i);
      }
      if (!dontAddNull) HEAP8[buffer2 >> 0] = 0;
    }
    var HEAP, buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    function updateGlobalBufferAndViews(buf) {
      buffer = buf;
      Module["HEAP8"] = HEAP8 = new Int8Array(buf);
      Module["HEAP16"] = HEAP16 = new Int16Array(buf);
      Module["HEAP32"] = HEAP32 = new Int32Array(buf);
      Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
      Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
      Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
      Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
      Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
    }
    var TOTAL_STACK = 5242880;
    var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
    var wasmTable;
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATEXIT__ = [];
    var __ATPOSTRUN__ = [];
    var runtimeInitialized = false;
    var runtimeExited = false;
    var runtimeKeepaliveCounter = 0;
    function keepRuntimeAlive() {
      return noExitRuntime || runtimeKeepaliveCounter > 0;
    }
    function preRun() {
      if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
          addOnPreRun(Module["preRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      runtimeInitialized = true;
      if (!Module["noFSInit"] && !FS.init.initialized)
        FS.init();
      FS.ignorePermissions = false;
      TTY.init();
      callRuntimeCallbacks(__ATINIT__);
    }
    function exitRuntime() {
      ___funcs_on_exit();
      callRuntimeCallbacks(__ATEXIT__);
      FS.quit();
      TTY.shutdown();
      runtimeExited = true;
    }
    function postRun() {
      if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
          addOnPostRun(Module["postRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    function addOnExit(cb) {
      __ATEXIT__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var runDependencyWatcher = null;
    var dependenciesFulfilled = null;
    function getUniqueRunDependency(id) {
      return id;
    }
    function addRunDependency(id) {
      runDependencies++;
      if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
      }
    }
    function removeRunDependency(id) {
      runDependencies--;
      if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
      }
      if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    Module["preloadedImages"] = {};
    Module["preloadedAudios"] = {};
    function abort(what) {
      {
        if (Module["onAbort"]) {
          Module["onAbort"](what);
        }
      }
      what = "Aborted(" + what + ")";
      err(what);
      ABORT = true;
      EXITSTATUS = 1;
      what += ". Build with -s ASSERTIONS=1 for more info.";
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    var dataURIPrefix = "data:application/octet-stream;base64,";
    function isDataURI(filename) {
      return filename.startsWith(dataURIPrefix);
    }
    function isFileURI(filename) {
      return filename.startsWith("file://");
    }
    var wasmBinaryFile;
    if (Module["locateFile"]) {
      wasmBinaryFile = "libocgcore.wasm";
      if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile(wasmBinaryFile);
      }
    } else {
      wasmBinaryFile = new URL("libocgcore.wasm", import.meta.url).toString();
    }
    function getBinary(file) {
      try {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
          return readBinary(file);
        } else {
          throw "both async and sync fetching of the wasm failed";
        }
      } catch (err2) {
        abort(err2);
      }
    }
    function getBinaryPromise() {
      if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch == "function") {
          return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function(response) {
            if (!response["ok"]) {
              throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
            }
            return response["arrayBuffer"]();
          }).catch(function() {
            return getBinary(wasmBinaryFile);
          });
        }
      }
      return Promise.resolve().then(function() {
        return getBinary(wasmBinaryFile);
      });
    }
    function createWasm() {
      var info = {
        "env": asmLibraryArg,
        "wasi_snapshot_preview1": asmLibraryArg
      };
      function receiveInstance(instance, module2) {
        var exports2 = instance.exports;
        Module["asm"] = exports2;
        wasmMemory = Module["asm"]["memory"];
        updateGlobalBufferAndViews(wasmMemory.buffer);
        wasmTable = Module["asm"]["__indirect_function_table"];
        addOnInit(Module["asm"]["__wasm_call_ctors"]);
        removeRunDependency("wasm-instantiate");
      }
      addRunDependency("wasm-instantiate");
      function receiveInstantiationResult(result) {
        receiveInstance(result["instance"]);
      }
      function instantiateArrayBuffer(receiver) {
        return getBinaryPromise().then(function(binary) {
          return WebAssembly.instantiate(binary, info);
        }).then(function(instance) {
          return instance;
        }).then(receiver, function(reason) {
          err("failed to asynchronously prepare wasm: " + reason);
          abort(reason);
        });
      }
      function instantiateAsync() {
        if (!wasmBinary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(wasmBinaryFile) && typeof fetch == "function") {
          return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function(response) {
            var result = WebAssembly.instantiateStreaming(response, info);
            return result.then(
              receiveInstantiationResult,
              function(reason) {
                err("wasm streaming compile failed: " + reason);
                err("falling back to ArrayBuffer instantiation");
                return instantiateArrayBuffer(receiveInstantiationResult);
              }
            );
          });
        } else {
          return instantiateArrayBuffer(receiveInstantiationResult);
        }
      }
      if (Module["instantiateWasm"]) {
        try {
          var exports = Module["instantiateWasm"](info, receiveInstance);
          return exports;
        } catch (e) {
          err("Module.instantiateWasm callback failed with error: " + e);
          return false;
        }
      }
      instantiateAsync().catch(readyPromiseReject);
      return {};
    }
    var tempDouble;
    var tempI64;
    var ASM_CONSTS = {};
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
          callback(Module);
          continue;
        }
        var func = callback.func;
        if (typeof func == "number") {
          if (callback.arg === void 0) {
            getWasmTableEntry(func)();
          } else {
            getWasmTableEntry(func)(callback.arg);
          }
        } else {
          func(callback.arg === void 0 ? null : callback.arg);
        }
      }
    }
    function withStackSave(f) {
      var stack = stackSave();
      var ret = f();
      stackRestore(stack);
      return ret;
    }
    function demangle(func) {
      return func;
    }
    function demangleAll(text) {
      var regex = /\b_Z[\w\d_]+/g;
      return text.replace(
        regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : y + " [" + x + "]";
        }
      );
    }
    var wasmTableMirror = [];
    function getWasmTableEntry(funcPtr) {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      return func;
    }
    function handleException(e) {
      if (e instanceof ExitStatus || e == "unwind") {
        return EXITSTATUS;
      }
      quit_(1, e);
    }
    function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        try {
          throw new Error();
        } catch (e) {
          error = e;
        }
        if (!error.stack) {
          return "(no stack trace available)";
        }
      }
      return error.stack.toString();
    }
    function setWasmTableEntry(idx, func) {
      wasmTable.set(idx, func);
      wasmTableMirror[idx] = func;
    }
    function stackTrace() {
      var js = jsStackTrace();
      if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
      return demangleAll(js);
    }
    var _emscripten_get_now;
    if (ENVIRONMENT_IS_NODE) {
      _emscripten_get_now = () => {
        var t = process["hrtime"]();
        return t[0] * 1e3 + t[1] / 1e6;
      };
    } else _emscripten_get_now = () => performance.now();
    ;
    var _emscripten_get_now_is_monotonic = true;
    ;
    function setErrNo(value) {
      HEAP32[___errno_location() >> 2] = value;
      return value;
    }
    function _clock_gettime(clk_id, tp) {
      var now;
      if (clk_id === 0) {
        now = Date.now();
      } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
        now = _emscripten_get_now();
      } else {
        setErrNo(28);
        return -1;
      }
      HEAP32[tp >> 2] = now / 1e3 | 0;
      HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
      return 0;
    }
    function ___clock_gettime(a0, a1) {
      return _clock_gettime(a0, a1);
    }
    function ___cxa_allocate_exception(size) {
      return _malloc(size + 16) + 16;
    }
    function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 16;
      this.set_type = function(type) {
        HEAP32[this.ptr + 4 >> 2] = type;
      };
      this.get_type = function() {
        return HEAP32[this.ptr + 4 >> 2];
      };
      this.set_destructor = function(destructor) {
        HEAP32[this.ptr + 8 >> 2] = destructor;
      };
      this.get_destructor = function() {
        return HEAP32[this.ptr + 8 >> 2];
      };
      this.set_refcount = function(refcount) {
        HEAP32[this.ptr >> 2] = refcount;
      };
      this.set_caught = function(caught) {
        caught = caught ? 1 : 0;
        HEAP8[this.ptr + 12 >> 0] = caught;
      };
      this.get_caught = function() {
        return HEAP8[this.ptr + 12 >> 0] != 0;
      };
      this.set_rethrown = function(rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[this.ptr + 13 >> 0] = rethrown;
      };
      this.get_rethrown = function() {
        return HEAP8[this.ptr + 13 >> 0] != 0;
      };
      this.init = function(type, destructor) {
        this.set_type(type);
        this.set_destructor(destructor);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
      };
      this.add_ref = function() {
        var value = HEAP32[this.ptr >> 2];
        HEAP32[this.ptr >> 2] = value + 1;
      };
      this.release_ref = function() {
        var prev = HEAP32[this.ptr >> 2];
        HEAP32[this.ptr >> 2] = prev - 1;
        return prev === 1;
      };
    }
    var exceptionLast = 0;
    var uncaughtExceptionCount = 0;
    function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      info.init(type, destructor);
      exceptionLast = ptr;
      uncaughtExceptionCount++;
      throw ptr;
    }
    var PATH = { splitPath: function(filename) {
      var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      return splitPathRe.exec(filename).slice(1);
    }, normalizeArray: function(parts, allowAboveRoot) {
      var up = 0;
      for (var i = parts.length - 1; i >= 0; i--) {
        var last = parts[i];
        if (last === ".") {
          parts.splice(i, 1);
        } else if (last === "..") {
          parts.splice(i, 1);
          up++;
        } else if (up) {
          parts.splice(i, 1);
          up--;
        }
      }
      if (allowAboveRoot) {
        for (; up; up--) {
          parts.unshift("..");
        }
      }
      return parts;
    }, normalize: function(path) {
      var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
      path = PATH.normalizeArray(path.split("/").filter(function(p) {
        return !!p;
      }), !isAbsolute).join("/");
      if (!path && !isAbsolute) {
        path = ".";
      }
      if (path && trailingSlash) {
        path += "/";
      }
      return (isAbsolute ? "/" : "") + path;
    }, dirname: function(path) {
      var result = PATH.splitPath(path), root = result[0], dir = result[1];
      if (!root && !dir) {
        return ".";
      }
      if (dir) {
        dir = dir.substr(0, dir.length - 1);
      }
      return root + dir;
    }, basename: function(path) {
      if (path === "/") return "/";
      path = PATH.normalize(path);
      path = path.replace(/\/$/, "");
      var lastSlash = path.lastIndexOf("/");
      if (lastSlash === -1) return path;
      return path.substr(lastSlash + 1);
    }, extname: function(path) {
      return PATH.splitPath(path)[3];
    }, join: function() {
      var paths = Array.prototype.slice.call(arguments, 0);
      return PATH.normalize(paths.join("/"));
    }, join2: function(l, r) {
      return PATH.normalize(l + "/" + r);
    } };
    function getRandomDevice() {
      if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
        var randomBuffer = new Uint8Array(1);
        return function() {
          crypto.getRandomValues(randomBuffer);
          return randomBuffer[0];
        };
      } else if (ENVIRONMENT_IS_NODE) {
        try {
          var crypto_module = __require("crypto");
          return function() {
            return crypto_module["randomBytes"](1)[0];
          };
        } catch (e) {
        }
      }
      return function() {
        abort("randomDevice");
      };
    }
    var PATH_FS = { resolve: function() {
      var resolvedPath = "", resolvedAbsolute = false;
      for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = i >= 0 ? arguments[i] : FS.cwd();
        if (typeof path != "string") {
          throw new TypeError("Arguments to path.resolve must be strings");
        } else if (!path) {
          return "";
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = path.charAt(0) === "/";
      }
      resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function(p) {
        return !!p;
      }), !resolvedAbsolute).join("/");
      return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    }, relative: function(from, to) {
      from = PATH_FS.resolve(from).substr(1);
      to = PATH_FS.resolve(to).substr(1);
      function trim(arr) {
        var start = 0;
        for (; start < arr.length; start++) {
          if (arr[start] !== "") break;
        }
        var end = arr.length - 1;
        for (; end >= 0; end--) {
          if (arr[end] !== "") break;
        }
        if (start > end) return [];
        return arr.slice(start, end - start + 1);
      }
      var fromParts = trim(from.split("/"));
      var toParts = trim(to.split("/"));
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      }
      var outputParts = [];
      for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push("..");
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join("/");
    } };
    var TTY = { ttys: [], init: function() {
    }, shutdown: function() {
    }, register: function(dev, ops) {
      TTY.ttys[dev] = { input: [], output: [], ops };
      FS.registerDevice(dev, TTY.stream_ops);
    }, stream_ops: { open: function(stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    }, close: function(stream) {
      stream.tty.ops.flush(stream.tty);
    }, flush: function(stream) {
      stream.tty.ops.flush(stream.tty);
    }, read: function(stream, buffer2, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === void 0 && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === void 0) break;
        bytesRead++;
        buffer2[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now();
      }
      return bytesRead;
    }, write: function(stream, buffer2, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer2[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.timestamp = Date.now();
      }
      return i;
    } }, default_tty_ops: { get_char: function(tty) {
      if (!tty.input.length) {
        var result = null;
        if (ENVIRONMENT_IS_NODE) {
          var BUFSIZE = 256;
          var buf = Buffer.alloc(BUFSIZE);
          var bytesRead = 0;
          try {
            bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1);
          } catch (e) {
            if (e.toString().includes("EOF")) bytesRead = 0;
            else throw e;
          }
          if (bytesRead > 0) {
            result = buf.slice(0, bytesRead).toString("utf-8");
          } else {
            result = null;
          }
        } else if (typeof window != "undefined" && typeof window.prompt == "function") {
          result = window.prompt("Input: ");
          if (result !== null) {
            result += "\n";
          }
        } else if (typeof readline == "function") {
          result = readline();
          if (result !== null) {
            result += "\n";
          }
        }
        if (!result) {
          return null;
        }
        tty.input = intArrayFromString(result, true);
      }
      return tty.input.shift();
    }, put_char: function(tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    }, flush: function(tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    } }, default_tty1_ops: { put_char: function(tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    }, flush: function(tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    } } };
    function zeroMemory(address, size) {
      HEAPU8.fill(0, address, address + size);
    }
    function alignMemory(size, alignment) {
      return Math.ceil(size / alignment) * alignment;
    }
    function mmapAlloc(size) {
      abort();
    }
    var MEMFS = { ops_table: null, mount: function(mount) {
      return MEMFS.createNode(null, "/", 16384 | 511, 0);
    }, createNode: function(parent, name, mode, dev) {
      if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
        throw new FS.ErrnoError(63);
      }
      if (!MEMFS.ops_table) {
        MEMFS.ops_table = {
          dir: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              lookup: MEMFS.node_ops.lookup,
              mknod: MEMFS.node_ops.mknod,
              rename: MEMFS.node_ops.rename,
              unlink: MEMFS.node_ops.unlink,
              rmdir: MEMFS.node_ops.rmdir,
              readdir: MEMFS.node_ops.readdir,
              symlink: MEMFS.node_ops.symlink
            },
            stream: {
              llseek: MEMFS.stream_ops.llseek
            }
          },
          file: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr
            },
            stream: {
              llseek: MEMFS.stream_ops.llseek,
              read: MEMFS.stream_ops.read,
              write: MEMFS.stream_ops.write,
              allocate: MEMFS.stream_ops.allocate,
              mmap: MEMFS.stream_ops.mmap,
              msync: MEMFS.stream_ops.msync
            }
          },
          link: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              readlink: MEMFS.node_ops.readlink
            },
            stream: {}
          },
          chrdev: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr
            },
            stream: FS.chrdev_stream_ops
          }
        };
      }
      var node = FS.createNode(parent, name, mode, dev);
      if (FS.isDir(node.mode)) {
        node.node_ops = MEMFS.ops_table.dir.node;
        node.stream_ops = MEMFS.ops_table.dir.stream;
        node.contents = {};
      } else if (FS.isFile(node.mode)) {
        node.node_ops = MEMFS.ops_table.file.node;
        node.stream_ops = MEMFS.ops_table.file.stream;
        node.usedBytes = 0;
        node.contents = null;
      } else if (FS.isLink(node.mode)) {
        node.node_ops = MEMFS.ops_table.link.node;
        node.stream_ops = MEMFS.ops_table.link.stream;
      } else if (FS.isChrdev(node.mode)) {
        node.node_ops = MEMFS.ops_table.chrdev.node;
        node.stream_ops = MEMFS.ops_table.chrdev.stream;
      }
      node.timestamp = Date.now();
      if (parent) {
        parent.contents[name] = node;
        parent.timestamp = node.timestamp;
      }
      return node;
    }, getFileDataAsTypedArray: function(node) {
      if (!node.contents) return new Uint8Array(0);
      if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
      return new Uint8Array(node.contents);
    }, expandFileStorage: function(node, newCapacity) {
      var prevCapacity = node.contents ? node.contents.length : 0;
      if (prevCapacity >= newCapacity) return;
      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
      newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
      if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
      var oldContents = node.contents;
      node.contents = new Uint8Array(newCapacity);
      if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
    }, resizeFileStorage: function(node, newSize) {
      if (node.usedBytes == newSize) return;
      if (newSize == 0) {
        node.contents = null;
        node.usedBytes = 0;
      } else {
        var oldContents = node.contents;
        node.contents = new Uint8Array(newSize);
        if (oldContents) {
          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
        }
        node.usedBytes = newSize;
      }
    }, node_ops: { getattr: function(node) {
      var attr = {};
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.timestamp);
      attr.mtime = new Date(node.timestamp);
      attr.ctime = new Date(node.timestamp);
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    }, setattr: function(node, attr) {
      if (attr.mode !== void 0) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== void 0) {
        node.timestamp = attr.timestamp;
      }
      if (attr.size !== void 0) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    }, lookup: function(parent, name) {
      throw FS.genericErrors[44];
    }, mknod: function(parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    }, rename: function(old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
        }
        if (new_node) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
      }
      delete old_node.parent.contents[old_node.name];
      old_node.parent.timestamp = Date.now();
      old_node.name = new_name;
      new_dir.contents[new_name] = old_node;
      new_dir.timestamp = old_node.parent.timestamp;
      old_node.parent = new_dir;
    }, unlink: function(parent, name) {
      delete parent.contents[name];
      parent.timestamp = Date.now();
    }, rmdir: function(parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.timestamp = Date.now();
    }, readdir: function(node) {
      var entries = [".", ".."];
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue;
        }
        entries.push(key);
      }
      return entries;
    }, symlink: function(parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    }, readlink: function(node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    } }, stream_ops: { read: function(stream, buffer2, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        buffer2.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0; i < size; i++) buffer2[offset + i] = contents[position + i];
      }
      return size;
    }, write: function(stream, buffer2, offset, length, position, canOwn) {
      if (buffer2.buffer === HEAP8.buffer) {
        canOwn = false;
      }
      if (!length) return 0;
      var node = stream.node;
      node.timestamp = Date.now();
      if (buffer2.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer2.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer2.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer2.subarray(offset, offset + length), position);
          return length;
        }
      }
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer2.subarray) {
        node.contents.set(buffer2.subarray(offset, offset + length), position);
      } else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer2[offset + i];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    }, llseek: function(stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    }, allocate: function(stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    }, mmap: function(stream, address, length, position, prot, flags) {
      if (address !== 0) {
        throw new FS.ErrnoError(28);
      }
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      if (!(flags & 2) && contents.buffer === buffer) {
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        if (position > 0 || position + length < contents.length) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length);
          } else {
            contents = Array.prototype.slice.call(contents, position, position + length);
          }
        }
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        HEAP8.set(contents, ptr);
      }
      return { ptr, allocated };
    }, msync: function(stream, buffer2, offset, length, mmapFlags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (mmapFlags & 2) {
        return 0;
      }
      var bytesWritten = MEMFS.stream_ops.write(stream, buffer2, 0, length, offset, false);
      return 0;
    } } };
    function asyncLoad(url, onload, onerror, noRunDep) {
      var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
      readAsync(url, function(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
        onload(new Uint8Array(arrayBuffer));
        if (dep) removeRunDependency(dep);
      }, function(event) {
        if (onerror) {
          onerror();
        } else {
          throw 'Loading data file "' + url + '" failed.';
        }
      });
      if (dep) addRunDependency(dep);
    }
    var FS = { root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: false, ignorePermissions: true, ErrnoError: null, genericErrors: {}, filesystems: null, syncFSRequests: 0, lookupPath: (path, opts = {}) => {
      path = PATH_FS.resolve(FS.cwd(), path);
      if (!path) return { path: "", node: null };
      var defaults = {
        follow_mount: true,
        recurse_count: 0
      };
      for (var key in defaults) {
        if (opts[key] === void 0) {
          opts[key] = defaults[key];
        }
      }
      if (opts.recurse_count > 8) {
        throw new FS.ErrnoError(32);
      }
      var parts = PATH.normalizeArray(path.split("/").filter((p) => !!p), false);
      var current = FS.root;
      var current_path = "/";
      for (var i = 0; i < parts.length; i++) {
        var islast = i === parts.length - 1;
        if (islast && opts.parent) {
          break;
        }
        current = FS.lookupNode(current, parts[i]);
        current_path = PATH.join2(current_path, parts[i]);
        if (FS.isMountpoint(current)) {
          if (!islast || islast && opts.follow_mount) {
            current = current.mounted.root;
          }
        }
        if (!islast || opts.follow) {
          var count = 0;
          while (FS.isLink(current.mode)) {
            var link = FS.readlink(current_path);
            current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
            var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
            current = lookup.node;
            if (count++ > 40) {
              throw new FS.ErrnoError(32);
            }
          }
        }
      }
      return { path: current_path, node: current };
    }, getPath: (node) => {
      var path;
      while (true) {
        if (FS.isRoot(node)) {
          var mount = node.mount.mountpoint;
          if (!path) return mount;
          return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
        }
        path = path ? node.name + "/" + path : node.name;
        node = node.parent;
      }
    }, hashName: (parentid, name) => {
      var hash = 0;
      for (var i = 0; i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
      }
      return (parentid + hash >>> 0) % FS.nameTable.length;
    }, hashAddNode: (node) => {
      var hash = FS.hashName(node.parent.id, node.name);
      node.name_next = FS.nameTable[hash];
      FS.nameTable[hash] = node;
    }, hashRemoveNode: (node) => {
      var hash = FS.hashName(node.parent.id, node.name);
      if (FS.nameTable[hash] === node) {
        FS.nameTable[hash] = node.name_next;
      } else {
        var current = FS.nameTable[hash];
        while (current) {
          if (current.name_next === node) {
            current.name_next = node.name_next;
            break;
          }
          current = current.name_next;
        }
      }
    }, lookupNode: (parent, name) => {
      var errCode = FS.mayLookup(parent);
      if (errCode) {
        throw new FS.ErrnoError(errCode, parent);
      }
      var hash = FS.hashName(parent.id, name);
      for (var node = FS.nameTable[hash]; node; node = node.name_next) {
        var nodeName = node.name;
        if (node.parent.id === parent.id && nodeName === name) {
          return node;
        }
      }
      return FS.lookup(parent, name);
    }, createNode: (parent, name, mode, rdev) => {
      var node = new FS.FSNode(parent, name, mode, rdev);
      FS.hashAddNode(node);
      return node;
    }, destroyNode: (node) => {
      FS.hashRemoveNode(node);
    }, isRoot: (node) => {
      return node === node.parent;
    }, isMountpoint: (node) => {
      return !!node.mounted;
    }, isFile: (mode) => {
      return (mode & 61440) === 32768;
    }, isDir: (mode) => {
      return (mode & 61440) === 16384;
    }, isLink: (mode) => {
      return (mode & 61440) === 40960;
    }, isChrdev: (mode) => {
      return (mode & 61440) === 8192;
    }, isBlkdev: (mode) => {
      return (mode & 61440) === 24576;
    }, isFIFO: (mode) => {
      return (mode & 61440) === 4096;
    }, isSocket: (mode) => {
      return (mode & 49152) === 49152;
    }, flagModes: { "r": 0, "r+": 2, "w": 577, "w+": 578, "a": 1089, "a+": 1090 }, modeStringToFlags: (str) => {
      var flags = FS.flagModes[str];
      if (typeof flags == "undefined") {
        throw new Error("Unknown file open mode: " + str);
      }
      return flags;
    }, flagsToPermissionString: (flag) => {
      var perms = ["r", "w", "rw"][flag & 3];
      if (flag & 512) {
        perms += "w";
      }
      return perms;
    }, nodePermissions: (node, perms) => {
      if (FS.ignorePermissions) {
        return 0;
      }
      if (perms.includes("r") && !(node.mode & 292)) {
        return 2;
      } else if (perms.includes("w") && !(node.mode & 146)) {
        return 2;
      } else if (perms.includes("x") && !(node.mode & 73)) {
        return 2;
      }
      return 0;
    }, mayLookup: (dir) => {
      var errCode = FS.nodePermissions(dir, "x");
      if (errCode) return errCode;
      if (!dir.node_ops.lookup) return 2;
      return 0;
    }, mayCreate: (dir, name) => {
      try {
        var node = FS.lookupNode(dir, name);
        return 20;
      } catch (e) {
      }
      return FS.nodePermissions(dir, "wx");
    }, mayDelete: (dir, name, isdir) => {
      var node;
      try {
        node = FS.lookupNode(dir, name);
      } catch (e) {
        return e.errno;
      }
      var errCode = FS.nodePermissions(dir, "wx");
      if (errCode) {
        return errCode;
      }
      if (isdir) {
        if (!FS.isDir(node.mode)) {
          return 54;
        }
        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
          return 10;
        }
      } else {
        if (FS.isDir(node.mode)) {
          return 31;
        }
      }
      return 0;
    }, mayOpen: (node, flags) => {
      if (!node) {
        return 44;
      }
      if (FS.isLink(node.mode)) {
        return 32;
      } else if (FS.isDir(node.mode)) {
        if (FS.flagsToPermissionString(flags) !== "r" || // opening for write
        flags & 512) {
          return 31;
        }
      }
      return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
    }, MAX_OPEN_FDS: 4096, nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
      for (var fd = fd_start; fd <= fd_end; fd++) {
        if (!FS.streams[fd]) {
          return fd;
        }
      }
      throw new FS.ErrnoError(33);
    }, getStream: (fd) => FS.streams[fd], createStream: (stream, fd_start, fd_end) => {
      if (!FS.FSStream) {
        FS.FSStream = /** @constructor */
        function() {
        };
        FS.FSStream.prototype = {
          object: {
            get: function() {
              return this.node;
            },
            set: function(val) {
              this.node = val;
            }
          },
          isRead: {
            get: function() {
              return (this.flags & 2097155) !== 1;
            }
          },
          isWrite: {
            get: function() {
              return (this.flags & 2097155) !== 0;
            }
          },
          isAppend: {
            get: function() {
              return this.flags & 1024;
            }
          }
        };
      }
      stream = Object.assign(new FS.FSStream(), stream);
      var fd = FS.nextfd(fd_start, fd_end);
      stream.fd = fd;
      FS.streams[fd] = stream;
      return stream;
    }, closeStream: (fd) => {
      FS.streams[fd] = null;
    }, chrdev_stream_ops: { open: (stream) => {
      var device = FS.getDevice(stream.node.rdev);
      stream.stream_ops = device.stream_ops;
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
    }, llseek: () => {
      throw new FS.ErrnoError(70);
    } }, major: (dev) => dev >> 8, minor: (dev) => dev & 255, makedev: (ma, mi) => ma << 8 | mi, registerDevice: (dev, ops) => {
      FS.devices[dev] = { stream_ops: ops };
    }, getDevice: (dev) => FS.devices[dev], getMounts: (mount) => {
      var mounts = [];
      var check = [mount];
      while (check.length) {
        var m = check.pop();
        mounts.push(m);
        check.push.apply(check, m.mounts);
      }
      return mounts;
    }, syncfs: (populate, callback) => {
      if (typeof populate == "function") {
        callback = populate;
        populate = false;
      }
      FS.syncFSRequests++;
      if (FS.syncFSRequests > 1) {
        err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
      }
      var mounts = FS.getMounts(FS.root.mount);
      var completed = 0;
      function doCallback(errCode) {
        FS.syncFSRequests--;
        return callback(errCode);
      }
      function done(errCode) {
        if (errCode) {
          if (!done.errored) {
            done.errored = true;
            return doCallback(errCode);
          }
          return;
        }
        if (++completed >= mounts.length) {
          doCallback(null);
        }
      }
      ;
      mounts.forEach((mount) => {
        if (!mount.type.syncfs) {
          return done(null);
        }
        mount.type.syncfs(mount, populate, done);
      });
    }, mount: (type, opts, mountpoint) => {
      var root = mountpoint === "/";
      var pseudo = !mountpoint;
      var node;
      if (root && FS.root) {
        throw new FS.ErrnoError(10);
      } else if (!root && !pseudo) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        mountpoint = lookup.path;
        node = lookup.node;
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        if (!FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
      }
      var mount = {
        type,
        opts,
        mountpoint,
        mounts: []
      };
      var mountRoot = type.mount(mount);
      mountRoot.mount = mount;
      mount.root = mountRoot;
      if (root) {
        FS.root = mountRoot;
      } else if (node) {
        node.mounted = mount;
        if (node.mount) {
          node.mount.mounts.push(mount);
        }
      }
      return mountRoot;
    }, unmount: (mountpoint) => {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
      if (!FS.isMountpoint(lookup.node)) {
        throw new FS.ErrnoError(28);
      }
      var node = lookup.node;
      var mount = node.mounted;
      var mounts = FS.getMounts(mount);
      Object.keys(FS.nameTable).forEach((hash) => {
        var current = FS.nameTable[hash];
        while (current) {
          var next = current.name_next;
          if (mounts.includes(current.mount)) {
            FS.destroyNode(current);
          }
          current = next;
        }
      });
      node.mounted = null;
      var idx = node.mount.mounts.indexOf(mount);
      node.mount.mounts.splice(idx, 1);
    }, lookup: (parent, name) => {
      return parent.node_ops.lookup(parent, name);
    }, mknod: (path, mode, dev) => {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      if (!name || name === "." || name === "..") {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.mayCreate(parent, name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.mknod) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.mknod(parent, name, mode, dev);
    }, create: (path, mode) => {
      mode = mode !== void 0 ? mode : 438;
      mode &= 4095;
      mode |= 32768;
      return FS.mknod(path, mode, 0);
    }, mkdir: (path, mode) => {
      mode = mode !== void 0 ? mode : 511;
      mode &= 511 | 512;
      mode |= 16384;
      return FS.mknod(path, mode, 0);
    }, mkdirTree: (path, mode) => {
      var dirs = path.split("/");
      var d = "";
      for (var i = 0; i < dirs.length; ++i) {
        if (!dirs[i]) continue;
        d += "/" + dirs[i];
        try {
          FS.mkdir(d, mode);
        } catch (e) {
          if (e.errno != 20) throw e;
        }
      }
    }, mkdev: (path, mode, dev) => {
      if (typeof dev == "undefined") {
        dev = mode;
        mode = 438;
      }
      mode |= 8192;
      return FS.mknod(path, mode, dev);
    }, symlink: (oldpath, newpath) => {
      if (!PATH_FS.resolve(oldpath)) {
        throw new FS.ErrnoError(44);
      }
      var lookup = FS.lookupPath(newpath, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var newname = PATH.basename(newpath);
      var errCode = FS.mayCreate(parent, newname);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.symlink) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.symlink(parent, newname, oldpath);
    }, rename: (old_path, new_path) => {
      var old_dirname = PATH.dirname(old_path);
      var new_dirname = PATH.dirname(new_path);
      var old_name = PATH.basename(old_path);
      var new_name = PATH.basename(new_path);
      var lookup, old_dir, new_dir;
      lookup = FS.lookupPath(old_path, { parent: true });
      old_dir = lookup.node;
      lookup = FS.lookupPath(new_path, { parent: true });
      new_dir = lookup.node;
      if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
      if (old_dir.mount !== new_dir.mount) {
        throw new FS.ErrnoError(75);
      }
      var old_node = FS.lookupNode(old_dir, old_name);
      var relative = PATH_FS.relative(old_path, new_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(28);
      }
      relative = PATH_FS.relative(new_path, old_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(55);
      }
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {
      }
      if (old_node === new_node) {
        return;
      }
      var isdir = FS.isDir(old_node.mode);
      var errCode = FS.mayDelete(old_dir, old_name, isdir);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!old_dir.node_ops.rename) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
        throw new FS.ErrnoError(10);
      }
      if (new_dir !== old_dir) {
        errCode = FS.nodePermissions(old_dir, "w");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      FS.hashRemoveNode(old_node);
      try {
        old_dir.node_ops.rename(old_node, new_dir, new_name);
      } catch (e) {
        throw e;
      } finally {
        FS.hashAddNode(old_node);
      }
    }, rmdir: (path) => {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, true);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.rmdir) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.rmdir(parent, name);
      FS.destroyNode(node);
    }, readdir: (path) => {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      if (!node.node_ops.readdir) {
        throw new FS.ErrnoError(54);
      }
      return node.node_ops.readdir(node);
    }, unlink: (path) => {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, false);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.unlink) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.unlink(parent, name);
      FS.destroyNode(node);
    }, readlink: (path) => {
      var lookup = FS.lookupPath(path);
      var link = lookup.node;
      if (!link) {
        throw new FS.ErrnoError(44);
      }
      if (!link.node_ops.readlink) {
        throw new FS.ErrnoError(28);
      }
      return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
    }, stat: (path, dontFollow) => {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      var node = lookup.node;
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (!node.node_ops.getattr) {
        throw new FS.ErrnoError(63);
      }
      return node.node_ops.getattr(node);
    }, lstat: (path) => {
      return FS.stat(path, true);
    }, chmod: (path, mode, dontFollow) => {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, {
        mode: mode & 4095 | node.mode & ~4095,
        timestamp: Date.now()
      });
    }, lchmod: (path, mode) => {
      FS.chmod(path, mode, true);
    }, fchmod: (fd, mode) => {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      FS.chmod(stream.node, mode);
    }, chown: (path, uid, gid, dontFollow) => {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, {
        timestamp: Date.now()
        // we ignore the uid / gid for now
      });
    }, lchown: (path, uid, gid) => {
      FS.chown(path, uid, gid, true);
    }, fchown: (fd, uid, gid) => {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      FS.chown(stream.node, uid, gid);
    }, truncate: (path, len) => {
      if (len < 0) {
        throw new FS.ErrnoError(28);
      }
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isDir(node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!FS.isFile(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.nodePermissions(node, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      node.node_ops.setattr(node, {
        size: len,
        timestamp: Date.now()
      });
    }, ftruncate: (fd, len) => {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(28);
      }
      FS.truncate(stream.node, len);
    }, utime: (path, atime, mtime) => {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      node.node_ops.setattr(node, {
        timestamp: Math.max(atime, mtime)
      });
    }, open: (path, flags, mode, fd_start, fd_end) => {
      if (path === "") {
        throw new FS.ErrnoError(44);
      }
      flags = typeof flags == "string" ? FS.modeStringToFlags(flags) : flags;
      mode = typeof mode == "undefined" ? 438 : mode;
      if (flags & 64) {
        mode = mode & 4095 | 32768;
      } else {
        mode = 0;
      }
      var node;
      if (typeof path == "object") {
        node = path;
      } else {
        path = PATH.normalize(path);
        try {
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 131072)
          });
          node = lookup.node;
        } catch (e) {
        }
      }
      var created = false;
      if (flags & 64) {
        if (node) {
          if (flags & 128) {
            throw new FS.ErrnoError(20);
          }
        } else {
          node = FS.mknod(path, mode, 0);
          created = true;
        }
      }
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (FS.isChrdev(node.mode)) {
        flags &= ~512;
      }
      if (flags & 65536 && !FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
      if (!created) {
        var errCode = FS.mayOpen(node, flags);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      if (flags & 512) {
        FS.truncate(node, 0);
      }
      flags &= ~(128 | 512 | 131072);
      var stream = FS.createStream({
        node,
        path: FS.getPath(node),
        // we want the absolute path to the node
        flags,
        seekable: true,
        position: 0,
        stream_ops: node.stream_ops,
        // used by the file family libc calls (fopen, fwrite, ferror, etc.)
        ungotten: [],
        error: false
      }, fd_start, fd_end);
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
      if (Module["logReadFiles"] && !(flags & 1)) {
        if (!FS.readFiles) FS.readFiles = {};
        if (!(path in FS.readFiles)) {
          FS.readFiles[path] = 1;
        }
      }
      return stream;
    }, close: (stream) => {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (stream.getdents) stream.getdents = null;
      try {
        if (stream.stream_ops.close) {
          stream.stream_ops.close(stream);
        }
      } catch (e) {
        throw e;
      } finally {
        FS.closeStream(stream.fd);
      }
      stream.fd = null;
    }, isClosed: (stream) => {
      return stream.fd === null;
    }, llseek: (stream, offset, whence) => {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (!stream.seekable || !stream.stream_ops.llseek) {
        throw new FS.ErrnoError(70);
      }
      if (whence != 0 && whence != 1 && whence != 2) {
        throw new FS.ErrnoError(28);
      }
      stream.position = stream.stream_ops.llseek(stream, offset, whence);
      stream.ungotten = [];
      return stream.position;
    }, read: (stream, buffer2, offset, length, position) => {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.read) {
        throw new FS.ErrnoError(28);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesRead = stream.stream_ops.read(stream, buffer2, offset, length, position);
      if (!seeking) stream.position += bytesRead;
      return bytesRead;
    }, write: (stream, buffer2, offset, length, position, canOwn) => {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.write) {
        throw new FS.ErrnoError(28);
      }
      if (stream.seekable && stream.flags & 1024) {
        FS.llseek(stream, 0, 2);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesWritten = stream.stream_ops.write(stream, buffer2, offset, length, position, canOwn);
      if (!seeking) stream.position += bytesWritten;
      return bytesWritten;
    }, allocate: (stream, offset, length) => {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (offset < 0 || length <= 0) {
        throw new FS.ErrnoError(28);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (!stream.stream_ops.allocate) {
        throw new FS.ErrnoError(138);
      }
      stream.stream_ops.allocate(stream, offset, length);
    }, mmap: (stream, address, length, position, prot, flags) => {
      if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
        throw new FS.ErrnoError(2);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(2);
      }
      if (!stream.stream_ops.mmap) {
        throw new FS.ErrnoError(43);
      }
      return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
    }, msync: (stream, buffer2, offset, length, mmapFlags) => {
      if (!stream || !stream.stream_ops.msync) {
        return 0;
      }
      return stream.stream_ops.msync(stream, buffer2, offset, length, mmapFlags);
    }, munmap: (stream) => 0, ioctl: (stream, cmd, arg) => {
      if (!stream.stream_ops.ioctl) {
        throw new FS.ErrnoError(59);
      }
      return stream.stream_ops.ioctl(stream, cmd, arg);
    }, readFile: (path, opts = {}) => {
      opts.flags = opts.flags || 0;
      opts.encoding = opts.encoding || "binary";
      if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
        throw new Error('Invalid encoding type "' + opts.encoding + '"');
      }
      var ret;
      var stream = FS.open(path, opts.flags);
      var stat = FS.stat(path);
      var length = stat.size;
      var buf = new Uint8Array(length);
      FS.read(stream, buf, 0, length, 0);
      if (opts.encoding === "utf8") {
        ret = UTF8ArrayToString(buf, 0);
      } else if (opts.encoding === "binary") {
        ret = buf;
      }
      FS.close(stream);
      return ret;
    }, writeFile: (path, data, opts = {}) => {
      opts.flags = opts.flags || 577;
      var stream = FS.open(path, opts.flags, opts.mode);
      if (typeof data == "string") {
        var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
        var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
        FS.write(stream, buf, 0, actualNumBytes, void 0, opts.canOwn);
      } else if (ArrayBuffer.isView(data)) {
        FS.write(stream, data, 0, data.byteLength, void 0, opts.canOwn);
      } else {
        throw new Error("Unsupported data type");
      }
      FS.close(stream);
    }, cwd: () => FS.currentPath, chdir: (path) => {
      var lookup = FS.lookupPath(path, { follow: true });
      if (lookup.node === null) {
        throw new FS.ErrnoError(44);
      }
      if (!FS.isDir(lookup.node.mode)) {
        throw new FS.ErrnoError(54);
      }
      var errCode = FS.nodePermissions(lookup.node, "x");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      FS.currentPath = lookup.path;
    }, createDefaultDirectories: () => {
      FS.mkdir("/tmp");
      FS.mkdir("/home");
      FS.mkdir("/home/web_user");
    }, createDefaultDevices: () => {
      FS.mkdir("/dev");
      FS.registerDevice(FS.makedev(1, 3), {
        read: () => 0,
        write: (stream, buffer2, offset, length, pos) => length
      });
      FS.mkdev("/dev/null", FS.makedev(1, 3));
      TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
      TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
      FS.mkdev("/dev/tty", FS.makedev(5, 0));
      FS.mkdev("/dev/tty1", FS.makedev(6, 0));
      var random_device = getRandomDevice();
      FS.createDevice("/dev", "random", random_device);
      FS.createDevice("/dev", "urandom", random_device);
      FS.mkdir("/dev/shm");
      FS.mkdir("/dev/shm/tmp");
    }, createSpecialDirectories: () => {
      FS.mkdir("/proc");
      var proc_self = FS.mkdir("/proc/self");
      FS.mkdir("/proc/self/fd");
      FS.mount({
        mount: () => {
          var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
          node.node_ops = {
            lookup: (parent, name) => {
              var fd = +name;
              var stream = FS.getStream(fd);
              if (!stream) throw new FS.ErrnoError(8);
              var ret = {
                parent: null,
                mount: { mountpoint: "fake" },
                node_ops: { readlink: () => stream.path }
              };
              ret.parent = ret;
              return ret;
            }
          };
          return node;
        }
      }, {}, "/proc/self/fd");
    }, createStandardStreams: () => {
      if (Module["stdin"]) {
        FS.createDevice("/dev", "stdin", Module["stdin"]);
      } else {
        FS.symlink("/dev/tty", "/dev/stdin");
      }
      if (Module["stdout"]) {
        FS.createDevice("/dev", "stdout", null, Module["stdout"]);
      } else {
        FS.symlink("/dev/tty", "/dev/stdout");
      }
      if (Module["stderr"]) {
        FS.createDevice("/dev", "stderr", null, Module["stderr"]);
      } else {
        FS.symlink("/dev/tty1", "/dev/stderr");
      }
      var stdin = FS.open("/dev/stdin", 0);
      var stdout = FS.open("/dev/stdout", 1);
      var stderr = FS.open("/dev/stderr", 1);
    }, ensureErrnoError: () => {
      if (FS.ErrnoError) return;
      FS.ErrnoError = /** @this{Object} */
      function ErrnoError(errno, node) {
        this.node = node;
        this.setErrno = /** @this{Object} */
        function(errno2) {
          this.errno = errno2;
        };
        this.setErrno(errno);
        this.message = "FS error";
      };
      FS.ErrnoError.prototype = new Error();
      FS.ErrnoError.prototype.constructor = FS.ErrnoError;
      [44].forEach((code) => {
        FS.genericErrors[code] = new FS.ErrnoError(code);
        FS.genericErrors[code].stack = "<generic error, no stack>";
      });
    }, staticInit: () => {
      FS.ensureErrnoError();
      FS.nameTable = new Array(4096);
      FS.mount(MEMFS, {}, "/");
      FS.createDefaultDirectories();
      FS.createDefaultDevices();
      FS.createSpecialDirectories();
      FS.filesystems = {
        "MEMFS": MEMFS
      };
    }, init: (input, output, error) => {
      FS.init.initialized = true;
      FS.ensureErrnoError();
      Module["stdin"] = input || Module["stdin"];
      Module["stdout"] = output || Module["stdout"];
      Module["stderr"] = error || Module["stderr"];
      FS.createStandardStreams();
    }, quit: () => {
      FS.init.initialized = false;
      ___stdio_exit();
      for (var i = 0; i < FS.streams.length; i++) {
        var stream = FS.streams[i];
        if (!stream) {
          continue;
        }
        FS.close(stream);
      }
    }, getMode: (canRead, canWrite) => {
      var mode = 0;
      if (canRead) mode |= 292 | 73;
      if (canWrite) mode |= 146;
      return mode;
    }, findObject: (path, dontResolveLastLink) => {
      var ret = FS.analyzePath(path, dontResolveLastLink);
      if (ret.exists) {
        return ret.object;
      } else {
        return null;
      }
    }, analyzePath: (path, dontResolveLastLink) => {
      try {
        var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        path = lookup.path;
      } catch (e) {
      }
      var ret = {
        isRoot: false,
        exists: false,
        error: 0,
        name: null,
        path: null,
        object: null,
        parentExists: false,
        parentPath: null,
        parentObject: null
      };
      try {
        var lookup = FS.lookupPath(path, { parent: true });
        ret.parentExists = true;
        ret.parentPath = lookup.path;
        ret.parentObject = lookup.node;
        ret.name = PATH.basename(path);
        lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        ret.exists = true;
        ret.path = lookup.path;
        ret.object = lookup.node;
        ret.name = lookup.node.name;
        ret.isRoot = lookup.path === "/";
      } catch (e) {
        ret.error = e.errno;
      }
      ;
      return ret;
    }, createPath: (parent, path, canRead, canWrite) => {
      parent = typeof parent == "string" ? parent : FS.getPath(parent);
      var parts = path.split("/").reverse();
      while (parts.length) {
        var part = parts.pop();
        if (!part) continue;
        var current = PATH.join2(parent, part);
        try {
          FS.mkdir(current);
        } catch (e) {
        }
        parent = current;
      }
      return current;
    }, createFile: (parent, name, properties, canRead, canWrite) => {
      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
      var mode = FS.getMode(canRead, canWrite);
      return FS.create(path, mode);
    }, createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
      var path = name;
      if (parent) {
        parent = typeof parent == "string" ? parent : FS.getPath(parent);
        path = name ? PATH.join2(parent, name) : parent;
      }
      var mode = FS.getMode(canRead, canWrite);
      var node = FS.create(path, mode);
      if (data) {
        if (typeof data == "string") {
          var arr = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
          data = arr;
        }
        FS.chmod(node, mode | 146);
        var stream = FS.open(node, 577);
        FS.write(stream, data, 0, data.length, 0, canOwn);
        FS.close(stream);
        FS.chmod(node, mode);
      }
      return node;
    }, createDevice: (parent, name, input, output) => {
      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
      var mode = FS.getMode(!!input, !!output);
      if (!FS.createDevice.major) FS.createDevice.major = 64;
      var dev = FS.makedev(FS.createDevice.major++, 0);
      FS.registerDevice(dev, {
        open: (stream) => {
          stream.seekable = false;
        },
        close: (stream) => {
          if (output && output.buffer && output.buffer.length) {
            output(10);
          }
        },
        read: (stream, buffer2, offset, length, pos) => {
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = input();
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === void 0 && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === void 0) break;
            bytesRead++;
            buffer2[offset + i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },
        write: (stream, buffer2, offset, length, pos) => {
          for (var i = 0; i < length; i++) {
            try {
              output(buffer2[offset + i]);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }
      });
      return FS.mkdev(path, mode, dev);
    }, forceLoadFile: (obj) => {
      if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
      if (typeof XMLHttpRequest != "undefined") {
        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
      } else if (read_) {
        try {
          obj.contents = intArrayFromString(read_(obj.url), true);
          obj.usedBytes = obj.contents.length;
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
      } else {
        throw new Error("Cannot load without read() or XMLHttpRequest.");
      }
    }, createLazyFile: (parent, name, url, canRead, canWrite) => {
      function LazyUint8Array() {
        this.lengthKnown = false;
        this.chunks = [];
      }
      LazyUint8Array.prototype.get = /** @this{Object} */
      function LazyUint8Array_get(idx) {
        if (idx > this.length - 1 || idx < 0) {
          return void 0;
        }
        var chunkOffset = idx % this.chunkSize;
        var chunkNum = idx / this.chunkSize | 0;
        return this.getter(chunkNum)[chunkOffset];
      };
      LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
        this.getter = getter;
      };
      LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
        var xhr = new XMLHttpRequest();
        xhr.open("HEAD", url, false);
        xhr.send(null);
        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
        var datalength = Number(xhr.getResponseHeader("Content-length"));
        var header;
        var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
        var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
        var chunkSize = 1024 * 1024;
        if (!hasByteServing) chunkSize = datalength;
        var doXHR = (from, to) => {
          if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
          if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
          var xhr2 = new XMLHttpRequest();
          xhr2.open("GET", url, false);
          if (datalength !== chunkSize) xhr2.setRequestHeader("Range", "bytes=" + from + "-" + to);
          xhr2.responseType = "arraybuffer";
          if (xhr2.overrideMimeType) {
            xhr2.overrideMimeType("text/plain; charset=x-user-defined");
          }
          xhr2.send(null);
          if (!(xhr2.status >= 200 && xhr2.status < 300 || xhr2.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr2.status);
          if (xhr2.response !== void 0) {
            return new Uint8Array(
              /** @type{Array<number>} */
              xhr2.response || []
            );
          } else {
            return intArrayFromString(xhr2.responseText || "", true);
          }
        };
        var lazyArray2 = this;
        lazyArray2.setDataGetter((chunkNum) => {
          var start = chunkNum * chunkSize;
          var end = (chunkNum + 1) * chunkSize - 1;
          end = Math.min(end, datalength - 1);
          if (typeof lazyArray2.chunks[chunkNum] == "undefined") {
            lazyArray2.chunks[chunkNum] = doXHR(start, end);
          }
          if (typeof lazyArray2.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
          return lazyArray2.chunks[chunkNum];
        });
        if (usesGzip || !datalength) {
          chunkSize = datalength = 1;
          datalength = this.getter(0).length;
          chunkSize = datalength;
          out("LazyFiles on gzip forces download of the whole file when length is accessed");
        }
        this._length = datalength;
        this._chunkSize = chunkSize;
        this.lengthKnown = true;
      };
      if (typeof XMLHttpRequest != "undefined") {
        if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
        var lazyArray = new LazyUint8Array();
        Object.defineProperties(lazyArray, {
          length: {
            get: (
              /** @this{Object} */
              function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._length;
              }
            )
          },
          chunkSize: {
            get: (
              /** @this{Object} */
              function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._chunkSize;
              }
            )
          }
        });
        var properties = { isDevice: false, contents: lazyArray };
      } else {
        var properties = { isDevice: false, url };
      }
      var node = FS.createFile(parent, name, properties, canRead, canWrite);
      if (properties.contents) {
        node.contents = properties.contents;
      } else if (properties.url) {
        node.contents = null;
        node.url = properties.url;
      }
      Object.defineProperties(node, {
        usedBytes: {
          get: (
            /** @this {FSNode} */
            function() {
              return this.contents.length;
            }
          )
        }
      });
      var stream_ops = {};
      var keys = Object.keys(node.stream_ops);
      keys.forEach((key) => {
        var fn = node.stream_ops[key];
        stream_ops[key] = function forceLoadLazyFile() {
          FS.forceLoadFile(node);
          return fn.apply(null, arguments);
        };
      });
      stream_ops.read = (stream, buffer2, offset, length, position) => {
        FS.forceLoadFile(node);
        var contents = stream.node.contents;
        if (position >= contents.length)
          return 0;
        var size = Math.min(contents.length - position, length);
        if (contents.slice) {
          for (var i = 0; i < size; i++) {
            buffer2[offset + i] = contents[position + i];
          }
        } else {
          for (var i = 0; i < size; i++) {
            buffer2[offset + i] = contents.get(position + i);
          }
        }
        return size;
      };
      node.stream_ops = stream_ops;
      return node;
    }, createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency("cp " + fullname);
      function processData(byteArray) {
        function finish(byteArray2) {
          if (preFinish) preFinish();
          if (!dontCreateFile) {
            FS.createDataFile(parent, name, byteArray2, canRead, canWrite, canOwn);
          }
          if (onload) onload();
          removeRunDependency(dep);
        }
        if (Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
          if (onerror) onerror();
          removeRunDependency(dep);
        })) {
          return;
        }
        finish(byteArray);
      }
      addRunDependency(dep);
      if (typeof url == "string") {
        asyncLoad(url, (byteArray) => processData(byteArray), onerror);
      } else {
        processData(url);
      }
    }, indexedDB: () => {
      return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    }, DB_NAME: () => {
      return "EM_FS_" + window.location.pathname;
    }, DB_VERSION: 20, DB_STORE_NAME: "FILE_DATA", saveFilesToDB: (paths, onload, onerror) => {
      onload = onload || (() => {
      });
      onerror = onerror || (() => {
      });
      var indexedDB = FS.indexedDB();
      try {
        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
      } catch (e) {
        return onerror(e);
      }
      openRequest.onupgradeneeded = () => {
        out("creating db");
        var db = openRequest.result;
        db.createObjectStore(FS.DB_STORE_NAME);
      };
      openRequest.onsuccess = () => {
        var db = openRequest.result;
        var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
        var files = transaction.objectStore(FS.DB_STORE_NAME);
        var ok = 0, fail = 0, total = paths.length;
        function finish() {
          if (fail == 0) onload();
          else onerror();
        }
        paths.forEach((path) => {
          var putRequest = files.put(FS.analyzePath(path).object.contents, path);
          putRequest.onsuccess = () => {
            ok++;
            if (ok + fail == total) finish();
          };
          putRequest.onerror = () => {
            fail++;
            if (ok + fail == total) finish();
          };
        });
        transaction.onerror = onerror;
      };
      openRequest.onerror = onerror;
    }, loadFilesFromDB: (paths, onload, onerror) => {
      onload = onload || (() => {
      });
      onerror = onerror || (() => {
      });
      var indexedDB = FS.indexedDB();
      try {
        var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
      } catch (e) {
        return onerror(e);
      }
      openRequest.onupgradeneeded = onerror;
      openRequest.onsuccess = () => {
        var db = openRequest.result;
        try {
          var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
        } catch (e) {
          onerror(e);
          return;
        }
        var files = transaction.objectStore(FS.DB_STORE_NAME);
        var ok = 0, fail = 0, total = paths.length;
        function finish() {
          if (fail == 0) onload();
          else onerror();
        }
        paths.forEach((path) => {
          var getRequest = files.get(path);
          getRequest.onsuccess = () => {
            if (FS.analyzePath(path).exists) {
              FS.unlink(path);
            }
            FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
            ok++;
            if (ok + fail == total) finish();
          };
          getRequest.onerror = () => {
            fail++;
            if (ok + fail == total) finish();
          };
        });
        transaction.onerror = onerror;
      };
      openRequest.onerror = onerror;
    } };
    var SYSCALLS = { DEFAULT_POLLMASK: 5, calculateAt: function(dirfd, path, allowEmpty) {
      if (path[0] === "/") {
        return path;
      }
      var dir;
      if (dirfd === -100) {
        dir = FS.cwd();
      } else {
        var dirstream = FS.getStream(dirfd);
        if (!dirstream) throw new FS.ErrnoError(8);
        dir = dirstream.path;
      }
      if (path.length == 0) {
        if (!allowEmpty) {
          throw new FS.ErrnoError(44);
          ;
        }
        return dir;
      }
      return PATH.join2(dir, path);
    }, doStat: function(func, path, buf) {
      try {
        var stat = func(path);
      } catch (e) {
        if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
          return -54;
        }
        throw e;
      }
      HEAP32[buf >> 2] = stat.dev;
      HEAP32[buf + 4 >> 2] = 0;
      HEAP32[buf + 8 >> 2] = stat.ino;
      HEAP32[buf + 12 >> 2] = stat.mode;
      HEAP32[buf + 16 >> 2] = stat.nlink;
      HEAP32[buf + 20 >> 2] = stat.uid;
      HEAP32[buf + 24 >> 2] = stat.gid;
      HEAP32[buf + 28 >> 2] = stat.rdev;
      HEAP32[buf + 32 >> 2] = 0;
      tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
      HEAP32[buf + 48 >> 2] = 4096;
      HEAP32[buf + 52 >> 2] = stat.blocks;
      HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
      HEAP32[buf + 60 >> 2] = 0;
      HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
      HEAP32[buf + 68 >> 2] = 0;
      HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
      HEAP32[buf + 76 >> 2] = 0;
      tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
      return 0;
    }, doMsync: function(addr, stream, len, flags, offset) {
      var buffer2 = HEAPU8.slice(addr, addr + len);
      FS.msync(stream, buffer2, offset, len, flags);
    }, doMkdir: function(path, mode) {
      path = PATH.normalize(path);
      if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
      FS.mkdir(path, mode, 0);
      return 0;
    }, doMknod: function(path, mode, dev) {
      switch (mode & 61440) {
        case 32768:
        case 8192:
        case 24576:
        case 4096:
        case 49152:
          break;
        default:
          return -28;
      }
      FS.mknod(path, mode, dev);
      return 0;
    }, doReadlink: function(path, buf, bufsize) {
      if (bufsize <= 0) return -28;
      var ret = FS.readlink(path);
      var len = Math.min(bufsize, lengthBytesUTF8(ret));
      var endChar = HEAP8[buf + len];
      stringToUTF8(ret, buf, bufsize + 1);
      HEAP8[buf + len] = endChar;
      return len;
    }, doAccess: function(path, amode) {
      if (amode & ~7) {
        return -28;
      }
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      if (!node) {
        return -44;
      }
      var perms = "";
      if (amode & 4) perms += "r";
      if (amode & 2) perms += "w";
      if (amode & 1) perms += "x";
      if (perms && FS.nodePermissions(node, perms)) {
        return -2;
      }
      return 0;
    }, doDup: function(path, flags, suggestFD) {
      var suggest = FS.getStream(suggestFD);
      if (suggest) FS.close(suggest);
      return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
    }, doReadv: function(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAP32[iov + i * 8 >> 2];
        var len = HEAP32[iov + (i * 8 + 4) >> 2];
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break;
      }
      return ret;
    }, doWritev: function(stream, iov, iovcnt, offset) {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAP32[iov + i * 8 >> 2];
        var len = HEAP32[iov + (i * 8 + 4) >> 2];
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
      }
      return ret;
    }, varargs: void 0, get: function() {
      SYSCALLS.varargs += 4;
      var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
      return ret;
    }, getStr: function(ptr) {
      var ret = UTF8ToString(ptr);
      return ret;
    }, getStreamFromFD: function(fd) {
      var stream = FS.getStream(fd);
      if (!stream) throw new FS.ErrnoError(8);
      return stream;
    }, get64: function(low, high) {
      return low;
    } };
    function ___syscall_dup3(fd, suggestFD, flags) {
      try {
        var old = SYSCALLS.getStreamFromFD(fd);
        if (old.fd === suggestFD) return -28;
        return SYSCALLS.doDup(old.path, old.flags, suggestFD);
      } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
      }
    }
    function ___syscall_fcntl64(fd, cmd, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
          case 0: {
            var arg = SYSCALLS.get();
            if (arg < 0) {
              return -28;
            }
            var newStream;
            newStream = FS.open(stream.path, stream.flags, 0, arg);
            return newStream.fd;
          }
          case 1:
          case 2:
            return 0;
          // FD_CLOEXEC makes no sense for a single process.
          case 3:
            return stream.flags;
          case 4: {
            var arg = SYSCALLS.get();
            stream.flags |= arg;
            return 0;
          }
          case 5: {
            var arg = SYSCALLS.get();
            var offset = 0;
            HEAP16[arg + offset >> 1] = 2;
            return 0;
          }
          case 6:
          case 7:
            return 0;
          // Pretend that the locking is successful.
          case 16:
          case 8:
            return -28;
          // These are for sockets. We don't have them fully implemented yet.
          case 9:
            setErrNo(28);
            return -1;
          default: {
            return -28;
          }
        }
      } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
      }
    }
    function ___syscall_ioctl(fd, op, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (op) {
          case 21509:
          case 21505: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21510:
          case 21511:
          case 21512:
          case 21506:
          case 21507:
          case 21508: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21519: {
            if (!stream.tty) return -59;
            var argp = SYSCALLS.get();
            HEAP32[argp >> 2] = 0;
            return 0;
          }
          case 21520: {
            if (!stream.tty) return -59;
            return -28;
          }
          case 21531: {
            var argp = SYSCALLS.get();
            return FS.ioctl(stream, op, argp);
          }
          case 21523: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21524: {
            if (!stream.tty) return -59;
            return 0;
          }
          default:
            abort("bad ioctl syscall " + op);
        }
      } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
      }
    }
    function ___syscall_open(path, flags, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var pathname = SYSCALLS.getStr(path);
        var mode = varargs ? SYSCALLS.get() : 0;
        var stream = FS.open(pathname, flags, mode);
        return stream.fd;
      } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
      }
    }
    function ___syscall_unlink(path) {
      try {
        path = SYSCALLS.getStr(path);
        FS.unlink(path);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return -e.errno;
      }
    }
    function __emscripten_throw_longjmp() {
      throw Infinity;
    }
    function _abort() {
      abort("");
    }
    function _clock() {
      if (_clock.start === void 0) _clock.start = Date.now();
      return (Date.now() - _clock.start) * (1e6 / 1e3) | 0;
    }
    function _emscripten_force_exit(status) {
      noExitRuntime = false;
      runtimeKeepaliveCounter = 0;
      exit(status);
    }
    function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }
    function _emscripten_get_heap_max() {
      return 2147483648;
    }
    function emscripten_realloc_buffer(size) {
      try {
        wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1;
      } catch (e) {
      }
    }
    function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      var maxHeapSize = _emscripten_get_heap_max();
      if (requestedSize > maxHeapSize) {
        return false;
      }
      let alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
          return true;
        }
      }
      return false;
    }
    function _fd_close(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return e.errno;
      }
    }
    function _fd_read(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = SYSCALLS.doReadv(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return e.errno;
      }
    }
    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var HIGH_OFFSET = 4294967296;
        var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
        var DOUBLE_LIMIT = 9007199254740992;
        if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
          return -61;
        }
        FS.llseek(stream, offset, whence);
        tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return e.errno;
      }
    }
    function _fd_write(fd, iov, iovcnt, pnum) {
      try {
        ;
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = SYSCALLS.doWritev(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) throw e;
        return e.errno;
      }
    }
    function _getTempRet0() {
      return getTempRet0();
    }
    function _setTempRet0(val) {
      setTempRet0(val);
    }
    function _time(ptr) {
      ;
      var ret = Date.now() / 1e3 | 0;
      if (ptr) {
        HEAP32[ptr >> 2] = ret;
      }
      return ret;
    }
    var FSNode = (
      /** @constructor */
      function(parent, name, mode, rdev) {
        if (!parent) {
          parent = this;
        }
        this.parent = parent;
        this.mount = parent.mount;
        this.mounted = null;
        this.id = FS.nextInode++;
        this.name = name;
        this.mode = mode;
        this.node_ops = {};
        this.stream_ops = {};
        this.rdev = rdev;
      }
    );
    var readMode = 292 | 73;
    var writeMode = 146;
    Object.defineProperties(FSNode.prototype, {
      read: {
        get: (
          /** @this{FSNode} */
          function() {
            return (this.mode & readMode) === readMode;
          }
        ),
        set: (
          /** @this{FSNode} */
          function(val) {
            val ? this.mode |= readMode : this.mode &= ~readMode;
          }
        )
      },
      write: {
        get: (
          /** @this{FSNode} */
          function() {
            return (this.mode & writeMode) === writeMode;
          }
        ),
        set: (
          /** @this{FSNode} */
          function(val) {
            val ? this.mode |= writeMode : this.mode &= ~writeMode;
          }
        )
      },
      isFolder: {
        get: (
          /** @this{FSNode} */
          function() {
            return FS.isDir(this.mode);
          }
        )
      },
      isDevice: {
        get: (
          /** @this{FSNode} */
          function() {
            return FS.isChrdev(this.mode);
          }
        )
      }
    });
    FS.FSNode = FSNode;
    FS.staticInit();
    ;
    var ASSERTIONS = false;
    function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
      if (dontAddNull) u8array.length = numBytesWritten;
      return u8array;
    }
    function intArrayToString(array) {
      var ret = [];
      for (var i = 0; i < array.length; i++) {
        var chr = array[i];
        if (chr > 255) {
          if (ASSERTIONS) {
            assert(false, "Character code " + chr + " (" + String.fromCharCode(chr) + ")  at offset " + i + " not in 0x00-0xFF.");
          }
          chr &= 255;
        }
        ret.push(String.fromCharCode(chr));
      }
      return ret.join("");
    }
    var asmLibraryArg = {
      "__clock_gettime": ___clock_gettime,
      "__cxa_allocate_exception": ___cxa_allocate_exception,
      "__cxa_throw": ___cxa_throw,
      "__syscall_dup3": ___syscall_dup3,
      "__syscall_fcntl64": ___syscall_fcntl64,
      "__syscall_ioctl": ___syscall_ioctl,
      "__syscall_open": ___syscall_open,
      "__syscall_unlink": ___syscall_unlink,
      "_emscripten_throw_longjmp": __emscripten_throw_longjmp,
      "abort": _abort,
      "clock": _clock,
      "emscripten_force_exit": _emscripten_force_exit,
      "emscripten_memcpy_big": _emscripten_memcpy_big,
      "emscripten_resize_heap": _emscripten_resize_heap,
      "fd_close": _fd_close,
      "fd_read": _fd_read,
      "fd_seek": _fd_seek,
      "fd_write": _fd_write,
      "getTempRet0": _getTempRet0,
      "invoke_vii": invoke_vii,
      "setTempRet0": _setTempRet0,
      "time": _time
    };
    var asm = createWasm();
    var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
      return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["__wasm_call_ctors"]).apply(null, arguments);
    };
    var _ocgcore_shutdown = Module["_ocgcore_shutdown"] = function() {
      return (_ocgcore_shutdown = Module["_ocgcore_shutdown"] = Module["asm"]["ocgcore_shutdown"]).apply(null, arguments);
    };
    var _set_script_reader = Module["_set_script_reader"] = function() {
      return (_set_script_reader = Module["_set_script_reader"] = Module["asm"]["set_script_reader"]).apply(null, arguments);
    };
    var _set_card_reader = Module["_set_card_reader"] = function() {
      return (_set_card_reader = Module["_set_card_reader"] = Module["asm"]["set_card_reader"]).apply(null, arguments);
    };
    var _set_message_handler = Module["_set_message_handler"] = function() {
      return (_set_message_handler = Module["_set_message_handler"] = Module["asm"]["set_message_handler"]).apply(null, arguments);
    };
    var _default_script_reader = Module["_default_script_reader"] = function() {
      return (_default_script_reader = Module["_default_script_reader"] = Module["asm"]["default_script_reader"]).apply(null, arguments);
    };
    var _create_duel = Module["_create_duel"] = function() {
      return (_create_duel = Module["_create_duel"] = Module["asm"]["create_duel"]).apply(null, arguments);
    };
    var _create_duel_ex = Module["_create_duel_ex"] = function() {
      return (_create_duel_ex = Module["_create_duel_ex"] = Module["asm"]["create_duel_ex"]).apply(null, arguments);
    };
    var _create_duel_v2 = Module["_create_duel_v2"] = function() {
      return (_create_duel_v2 = Module["_create_duel_v2"] = Module["asm"]["create_duel_v2"]).apply(null, arguments);
    };
    var _create_duel_v2_ex = Module["_create_duel_v2_ex"] = function() {
      return (_create_duel_v2_ex = Module["_create_duel_v2_ex"] = Module["asm"]["create_duel_v2_ex"]).apply(null, arguments);
    };
    var _start_duel = Module["_start_duel"] = function() {
      return (_start_duel = Module["_start_duel"] = Module["asm"]["start_duel"]).apply(null, arguments);
    };
    var _end_duel = Module["_end_duel"] = function() {
      return (_end_duel = Module["_end_duel"] = Module["asm"]["end_duel"]).apply(null, arguments);
    };
    var _set_player_info = Module["_set_player_info"] = function() {
      return (_set_player_info = Module["_set_player_info"] = Module["asm"]["set_player_info"]).apply(null, arguments);
    };
    var _get_log_message = Module["_get_log_message"] = function() {
      return (_get_log_message = Module["_get_log_message"] = Module["asm"]["get_log_message"]).apply(null, arguments);
    };
    var _get_message = Module["_get_message"] = function() {
      return (_get_message = Module["_get_message"] = Module["asm"]["get_message"]).apply(null, arguments);
    };
    var _process = Module["_process"] = function() {
      return (_process = Module["_process"] = Module["asm"]["process"]).apply(null, arguments);
    };
    var _new_card = Module["_new_card"] = function() {
      return (_new_card = Module["_new_card"] = Module["asm"]["new_card"]).apply(null, arguments);
    };
    var _new_tag_card = Module["_new_tag_card"] = function() {
      return (_new_tag_card = Module["_new_tag_card"] = Module["asm"]["new_tag_card"]).apply(null, arguments);
    };
    var _query_card = Module["_query_card"] = function() {
      return (_query_card = Module["_query_card"] = Module["asm"]["query_card"]).apply(null, arguments);
    };
    var _query_field_count = Module["_query_field_count"] = function() {
      return (_query_field_count = Module["_query_field_count"] = Module["asm"]["query_field_count"]).apply(null, arguments);
    };
    var _query_field_card = Module["_query_field_card"] = function() {
      return (_query_field_card = Module["_query_field_card"] = Module["asm"]["query_field_card"]).apply(null, arguments);
    };
    var _query_field_info = Module["_query_field_info"] = function() {
      return (_query_field_info = Module["_query_field_info"] = Module["asm"]["query_field_info"]).apply(null, arguments);
    };
    var _set_responsei = Module["_set_responsei"] = function() {
      return (_set_responsei = Module["_set_responsei"] = Module["asm"]["set_responsei"]).apply(null, arguments);
    };
    var _set_responseb = Module["_set_responseb"] = function() {
      return (_set_responseb = Module["_set_responseb"] = Module["asm"]["set_responseb"]).apply(null, arguments);
    };
    var _preload_script = Module["_preload_script"] = function() {
      return (_preload_script = Module["_preload_script"] = Module["asm"]["preload_script"]).apply(null, arguments);
    };
    var _get_registry_value = Module["_get_registry_value"] = function() {
      return (_get_registry_value = Module["_get_registry_value"] = Module["asm"]["get_registry_value"]).apply(null, arguments);
    };
    var _set_registry_value = Module["_set_registry_value"] = function() {
      return (_set_registry_value = Module["_set_registry_value"] = Module["asm"]["set_registry_value"]).apply(null, arguments);
    };
    var _get_registry_keys = Module["_get_registry_keys"] = function() {
      return (_get_registry_keys = Module["_get_registry_keys"] = Module["asm"]["get_registry_keys"]).apply(null, arguments);
    };
    var _clear_registry = Module["_clear_registry"] = function() {
      return (_clear_registry = Module["_clear_registry"] = Module["asm"]["clear_registry"]).apply(null, arguments);
    };
    var _dump_registry = Module["_dump_registry"] = function() {
      return (_dump_registry = Module["_dump_registry"] = Module["asm"]["dump_registry"]).apply(null, arguments);
    };
    var _load_registry = Module["_load_registry"] = function() {
      return (_load_registry = Module["_load_registry"] = Module["asm"]["load_registry"]).apply(null, arguments);
    };
    var _get_lua_coverage_dump_size = Module["_get_lua_coverage_dump_size"] = function() {
      return (_get_lua_coverage_dump_size = Module["_get_lua_coverage_dump_size"] = Module["asm"]["get_lua_coverage_dump_size"]).apply(null, arguments);
    };
    var _dump_lua_coverage = Module["_dump_lua_coverage"] = function() {
      return (_dump_lua_coverage = Module["_dump_lua_coverage"] = Module["asm"]["dump_lua_coverage"]).apply(null, arguments);
    };
    var _get_all_lua_coverages_dump_size = Module["_get_all_lua_coverages_dump_size"] = function() {
      return (_get_all_lua_coverages_dump_size = Module["_get_all_lua_coverages_dump_size"] = Module["asm"]["get_all_lua_coverages_dump_size"]).apply(null, arguments);
    };
    var _dump_all_lua_coverages = Module["_dump_all_lua_coverages"] = function() {
      return (_dump_all_lua_coverages = Module["_dump_all_lua_coverages"] = Module["asm"]["dump_all_lua_coverages"]).apply(null, arguments);
    };
    var _clear_lua_coverage = Module["_clear_lua_coverage"] = function() {
      return (_clear_lua_coverage = Module["_clear_lua_coverage"] = Module["asm"]["clear_lua_coverage"]).apply(null, arguments);
    };
    var _clear_all_lua_coverages = Module["_clear_all_lua_coverages"] = function() {
      return (_clear_all_lua_coverages = Module["_clear_all_lua_coverages"] = Module["asm"]["clear_all_lua_coverages"]).apply(null, arguments);
    };
    var ___errno_location = Module["___errno_location"] = function() {
      return (___errno_location = Module["___errno_location"] = Module["asm"]["__errno_location"]).apply(null, arguments);
    };
    var _free = Module["_free"] = function() {
      return (_free = Module["_free"] = Module["asm"]["free"]).apply(null, arguments);
    };
    var _malloc = Module["_malloc"] = function() {
      return (_malloc = Module["_malloc"] = Module["asm"]["malloc"]).apply(null, arguments);
    };
    var _saveSetjmp = Module["_saveSetjmp"] = function() {
      return (_saveSetjmp = Module["_saveSetjmp"] = Module["asm"]["saveSetjmp"]).apply(null, arguments);
    };
    var ___stdio_exit = Module["___stdio_exit"] = function() {
      return (___stdio_exit = Module["___stdio_exit"] = Module["asm"]["__stdio_exit"]).apply(null, arguments);
    };
    var ___funcs_on_exit = Module["___funcs_on_exit"] = function() {
      return (___funcs_on_exit = Module["___funcs_on_exit"] = Module["asm"]["__funcs_on_exit"]).apply(null, arguments);
    };
    var _setThrew = Module["_setThrew"] = function() {
      return (_setThrew = Module["_setThrew"] = Module["asm"]["setThrew"]).apply(null, arguments);
    };
    var stackSave = Module["stackSave"] = function() {
      return (stackSave = Module["stackSave"] = Module["asm"]["stackSave"]).apply(null, arguments);
    };
    var stackRestore = Module["stackRestore"] = function() {
      return (stackRestore = Module["stackRestore"] = Module["asm"]["stackRestore"]).apply(null, arguments);
    };
    var stackAlloc = Module["stackAlloc"] = function() {
      return (stackAlloc = Module["stackAlloc"] = Module["asm"]["stackAlloc"]).apply(null, arguments);
    };
    var dynCall_jiji = Module["dynCall_jiji"] = function() {
      return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["dynCall_jiji"]).apply(null, arguments);
    };
    function invoke_vii(index, a1, a2) {
      var sp = stackSave();
      try {
        getWasmTableEntry(index)(a1, a2);
      } catch (e) {
        stackRestore(sp);
        if (e !== e + 0) throw e;
        _setThrew(1, 0);
      }
    }
    Module["ccall"] = ccall;
    Module["cwrap"] = cwrap;
    Module["addFunction"] = addFunction;
    Module["removeFunction"] = removeFunction;
    var calledRun;
    function ExitStatus(status) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + status + ")";
      this.status = status;
    }
    var calledMain = false;
    dependenciesFulfilled = function runCaller() {
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller;
    };
    function run(args) {
      args = args || arguments_;
      if (runDependencies > 0) {
        return;
      }
      preRun();
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module["calledRun"] = true;
        if (ABORT) return;
        initRuntime();
        readyPromiseResolve(Module);
        if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
        postRun();
      }
      if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function() {
          setTimeout(function() {
            Module["setStatus"]("");
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    Module["run"] = run;
    function exit(status, implicit) {
      EXITSTATUS = status;
      if (keepRuntimeAlive()) {
      } else {
        exitRuntime();
      }
      procExit(status);
    }
    function procExit(code) {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        if (Module["onExit"]) Module["onExit"](code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    }
    if (Module["preInit"]) {
      if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
      while (Module["preInit"].length > 0) {
        Module["preInit"].pop()();
      }
    }
    run();
    return createOcgcore2.ready;
  });
})();
var libocgcore_default = createOcgcore;

// node_modules/koishipro-core.js/dist/index.mjs
var import_jszip = __toESM(require_jszip_min(), 1);
var import_jszip2 = __toESM(require_jszip_min(), 1);
var __defProp3 = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp3(target, name, { get: all[name], enumerable: true });
};
var vendor_exports = {};
__export(vendor_exports, {
  OcgcoreCommonConstants: () => OcgcoreCommonConstants,
  OcgcoreScriptConstants: () => OcgcoreScriptConstants
});
var MESSAGE_BUFFER_SIZE = OcgcoreCommonConstants.SIZE_MESSAGE_BUFFER;
var RETURN_BUFFER_SIZE = OcgcoreCommonConstants.SIZE_RETURN_VALUE;
var QUERY_BUFFER_SIZE = 262144;
var REGISTRY_BUFFER_SIZE = 8192;
var LEN_HEADER = 8;
function readU16(buf, offset) {
  return new DataView(buf.buffer, buf.byteOffset, buf.byteLength).getUint16(
    offset,
    true
  );
}
function readI32(buf, offset) {
  return new DataView(buf.buffer, buf.byteOffset, buf.byteLength).getInt32(
    offset,
    true
  );
}
var encoder = new TextEncoder();
var decoder = new TextDecoder("utf-8");
function decodeUtf82(value) {
  return decoder.decode(value);
}
function parseCardQuery(raw, length) {
  if (length <= LEN_HEADER) {
    return null;
  }
  const payload = raw.subarray(4, length);
  return new CardQuery().fromPayload(payload);
}
function parseFieldCardQuery(raw, length) {
  const cards = [];
  let offset = 0;
  while (offset + 4 <= length) {
    const chunkLen = readI32(raw, offset);
    if (chunkLen <= 0) {
      break;
    }
    const end = Math.min(length, offset + chunkLen);
    if (chunkLen <= LEN_HEADER) {
      const emptyCard = new CardQuery();
      emptyCard.flags = 0;
      emptyCard.empty = true;
      cards.push(emptyCard);
    } else {
      const payload = raw.subarray(offset + 4, end);
      cards.push(new CardQuery().fromPayload(payload));
    }
    offset += chunkLen;
  }
  return cards;
}
function parseFieldInfo(raw) {
  return new YGOProMsgReloadField().fromPayload(raw);
}
function parseRegistryKeys(raw) {
  const keys = [];
  let offset = 0;
  while (offset + 2 <= raw.length) {
    const len = readU16(raw, offset);
    offset += 2;
    if (offset + len > raw.length) {
      break;
    }
    const keyBytes = raw.subarray(offset, offset + len);
    offset += len;
    keys.push(decodeUtf82(keyBytes));
  }
  return keys;
}
function parseRegistryDump(raw) {
  const entries = [];
  let offset = 0;
  while (offset + 4 <= raw.length) {
    const keyLen = readU16(raw, offset);
    const valLen = readU16(raw, offset + 2);
    offset += 4;
    if (offset + keyLen + valLen > raw.length) {
      break;
    }
    const keyBytes = raw.subarray(offset, offset + keyLen);
    offset += keyLen;
    const valueBytes = raw.subarray(offset, offset + valLen);
    offset += valLen;
    const entry = {
      key: decodeUtf82(keyBytes),
      value: valueBytes
    };
    entry.valueText = decodeUtf82(valueBytes);
    entries.push(entry);
  }
  return entries;
}
function normalizeStartDuelOptions(options) {
  if (typeof options === "number") {
    return options;
  }
  const duelRule = options.rule ?? 0;
  let duelOptions = options.options ?? 0;
  if (options.flags?.length) {
    for (const flag of options.flags) {
      duelOptions = (duelOptions | flag) >>> 0;
    }
  }
  return ((duelRule & 65535) << 16 | duelOptions & 65535) >>> 0;
}
var OCGCORE_DUEL_SNAPSHOT_VERSION = 1;
var SNAPSHOT_MAGIC = new Uint8Array([
  75,
  79,
  67,
  71,
  83,
  78,
  80,
  49
]);
var HEADER_SIZE = SNAPSHOT_MAGIC.length + 4;
var encoder2 = new TextEncoder();
var decoder2 = new TextDecoder("utf-8");
function encodeOcgcoreDuelSnapshot(metadata, memory) {
  if (metadata.memoryByteLength !== memory.byteLength) {
    throw new Error("Invalid ocgcore duel snapshot: memory length mismatch");
  }
  const metadataBytes = encoder2.encode(JSON.stringify(metadata));
  const output = new Uint8Array(
    HEADER_SIZE + metadataBytes.byteLength + memory.byteLength
  );
  output.set(SNAPSHOT_MAGIC, 0);
  new DataView(output.buffer, output.byteOffset, output.byteLength).setUint32(
    SNAPSHOT_MAGIC.length,
    metadataBytes.byteLength,
    true
  );
  output.set(metadataBytes, HEADER_SIZE);
  output.set(memory, HEADER_SIZE + metadataBytes.byteLength);
  return output;
}
var normalizeLuaCoverageName = (name) => {
  let normalized = name.startsWith("@") ? name.slice(1) : name;
  normalized = normalized.replace(/\\/g, "/");
  if (normalized.startsWith("./script/")) {
    return normalized.slice("./script/".length);
  }
  if (normalized.startsWith("script/")) {
    return normalized.slice("script/".length);
  }
  if (normalized.startsWith("./")) {
    return normalized.slice("./".length);
  }
  return normalized;
};
var toLuaLineCoverage = (file, hits) => {
  const coveredLines = Object.keys(hits).map((line) => Number(line)).sort((left, right) => left - right);
  return { file, hits, coveredLines };
};
var parseLuaCoveragePairs = (file, raw) => {
  if (raw.byteLength % 8 !== 0) {
    throw new Error("Invalid Lua coverage dump.");
  }
  const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
  const hits = {};
  for (let offset = 0; offset < view.byteLength; offset += 8) {
    const line = view.getUint32(offset, true);
    const hitCount = view.getUint32(offset + 4, true);
    hits[line] = hitCount;
  }
  return toLuaLineCoverage(file, hits);
};
var parseAllLuaCoverages = (raw) => {
  const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
  const decoder3 = new TextDecoder("utf-8");
  let offset = 0;
  const requireBytes = (count) => {
    if (offset + count > view.byteLength) {
      throw new Error("Invalid Lua coverage dump.");
    }
  };
  const readUint16 = () => {
    requireBytes(2);
    const value = view.getUint16(offset, true);
    offset += 2;
    return value;
  };
  const readUint32 = () => {
    requireBytes(4);
    const value = view.getUint32(offset, true);
    offset += 4;
    return value;
  };
  const fileCount = readUint32();
  const coverages = {};
  for (let i = 0; i < fileCount; i++) {
    const nameLength = readUint16();
    requireBytes(nameLength);
    const file = decoder3.decode(raw.subarray(offset, offset + nameLength));
    offset += nameLength;
    const recordCount = readUint32();
    const hits = {};
    for (let j = 0; j < recordCount; j++) {
      const line = readUint32();
      const hitCount = readUint32();
      hits[line] = hitCount;
    }
    coverages[file] = toLuaLineCoverage(file, hits);
  }
  if (offset !== view.byteLength) {
    throw new Error("Invalid Lua coverage dump.");
  }
  return coverages;
};
var OcgcoreDuel = class _OcgcoreDuel {
  constructor(ocgcoreWrapper, duelPtr, snapshotState) {
    this.ocgcoreWrapper = ocgcoreWrapper;
    this.duelPtr = duelPtr;
    this.returnPtr = 0;
    this.receivePtr = 0;
    this.ended = false;
    if (snapshotState) {
      this.returnPtr = snapshotState.returnPtr;
      this.receivePtr = snapshotState.receivePtr;
    } else {
      this.returnPtr = this.ocgcoreWrapper.malloc(_OcgcoreDuel.RETURN_SIZE);
      this.receivePtr = this.ocgcoreWrapper.malloc(_OcgcoreDuel.RECEIVE_SIZE);
    }
  }
  static {
    this.RECEIVE_SIZE = Math.max(
      MESSAGE_BUFFER_SIZE,
      QUERY_BUFFER_SIZE,
      REGISTRY_BUFFER_SIZE
    );
  }
  static {
    this.RETURN_SIZE = RETURN_BUFFER_SIZE;
  }
  static {
    this.EMPTY_RETURN_BUFFER = new Uint8Array(
      _OcgcoreDuel.RETURN_SIZE
    );
  }
  startDuel(options) {
    const optionValue = normalizeStartDuelOptions(options);
    this.ocgcoreWrapper.ocgcoreModule._start_duel(this.duelPtr, optionValue);
  }
  endDuel() {
    if (this.ended) return;
    this.ended = true;
    this.ocgcoreWrapper.ocgcoreModule._end_duel(this.duelPtr);
    if (this.returnPtr) {
      this.ocgcoreWrapper.free(this.returnPtr);
      this.returnPtr = 0;
    }
    if (this.receivePtr) {
      this.ocgcoreWrapper.free(this.receivePtr);
      this.receivePtr = 0;
    }
    this.ocgcoreWrapper.forgetDuel(this.duelPtr);
  }
  snapshot() {
    if (this.ended) {
      throw new Error("Cannot snapshot an ended ocgcore duel");
    }
    this.ocgcoreWrapper.assertCanSnapshot();
    const memory = this.ocgcoreWrapper.snapshotHeap();
    return encodeOcgcoreDuelSnapshot(
      {
        version: OCGCORE_DUEL_SNAPSHOT_VERSION,
        memoryByteLength: memory.byteLength,
        duel: {
          duelPtr: this.duelPtr,
          returnPtr: this.returnPtr,
          receivePtr: this.receivePtr
        },
        wrapper: this.ocgcoreWrapper.getSnapshotState()
      },
      memory
    );
  }
  setPlayerInfo(info) {
    this.ocgcoreWrapper.ocgcoreModule._set_player_info(
      this.duelPtr,
      info.player,
      info.lp,
      info.startHand,
      info.drawCount
    );
  }
  _getLogMessage(bufPtr) {
    return this.ocgcoreWrapper.ocgcoreModule._get_log_message(
      this.duelPtr,
      bufPtr
    );
  }
  getMessage(length) {
    this.ocgcoreWrapper.ocgcoreModule._get_message(
      this.duelPtr,
      this.receivePtr
    );
    const raw = this.ocgcoreWrapper.copyHeap(this.receivePtr, length);
    return { length, raw };
  }
  process(parseOptions) {
    const result = this.ocgcoreWrapper.ocgcoreModule._process(this.duelPtr);
    const length = (result & 268435455) >>> 0;
    const status = (result >>> 28 & 15) >>> 0;
    const messageData = this.getMessage(length);
    let parsedMessages;
    if (!parseOptions?.noParse && messageData.raw.length > 0) {
      try {
        parsedMessages = YGOProMessages.getInstancesFromPayload(
          messageData.raw
        );
      } catch {
      }
    }
    const parsedMessage = parsedMessages && parsedMessages.length > 0 ? parsedMessages[parsedMessages.length - 1] : void 0;
    return {
      length: messageData.length,
      raw: messageData.raw,
      status,
      message: parsedMessage,
      messages: parsedMessages
    };
  }
  splitProcessResult(res) {
    if (!res.messages || res.messages.length <= 1) {
      return [res];
    }
    const messageCount = res.messages.length;
    return res.messages.map((message, index) => {
      const raw = message.toPayload();
      return {
        ...res,
        length: raw.length,
        raw,
        status: index === messageCount - 1 ? res.status : 0,
        message,
        messages: [message]
      };
    });
  }
  *advance(advancor) {
    while (true) {
      const processedResults = this.splitProcessResult(this.process());
      for (const res of processedResults) {
        yield res;
        const { message } = res;
        if (res.status === 2 || message instanceof YGOProMsgRetry) {
          return;
        }
        if (message instanceof YGOProMsgResponseBase) {
          const response = advancor?.(message);
          if (!response) {
            return;
          }
          this.setResponse(response);
        }
      }
    }
  }
  newCard(card) {
    this.ocgcoreWrapper.ocgcoreModule._new_card(
      this.duelPtr,
      card.code,
      card.owner,
      card.player,
      card.location,
      card.sequence,
      card.position
    );
  }
  newTagCard(card) {
    this.ocgcoreWrapper.ocgcoreModule._new_tag_card(
      this.duelPtr,
      card.code,
      card.owner,
      card.location
    );
  }
  queryCard(query, parseOptions) {
    const length = this.ocgcoreWrapper.ocgcoreModule._query_card(
      this.duelPtr,
      query.player,
      query.location,
      query.sequence,
      query.queryFlag,
      this.receivePtr,
      query.useCache ?? 0
    );
    const raw = this.ocgcoreWrapper.copyHeap(this.receivePtr, length);
    const card = parseOptions?.noParse ? void 0 : length <= LEN_HEADER ? null : parseCardQuery(raw, length);
    return { length, raw, card };
  }
  queryFieldCount(query) {
    return this.ocgcoreWrapper.ocgcoreModule._query_field_count(
      this.duelPtr,
      query.player,
      query.location
    );
  }
  queryFieldCard(query, parseOptions) {
    const length = this.ocgcoreWrapper.ocgcoreModule._query_field_card(
      this.duelPtr,
      query.player,
      query.location,
      query.queryFlag,
      this.receivePtr,
      query.useCache ?? 0
    );
    const raw = this.ocgcoreWrapper.copyHeap(this.receivePtr, length);
    const cards = parseOptions?.noParse ? void 0 : parseFieldCardQuery(raw, length);
    return { length, raw, cards };
  }
  queryFieldInfo(parseOptions) {
    const length = this.ocgcoreWrapper.ocgcoreModule._query_field_info(
      this.duelPtr,
      this.receivePtr
    );
    const raw = this.ocgcoreWrapper.copyHeap(this.receivePtr, length);
    const field = parseOptions?.noParse ? void 0 : parseFieldInfo(raw);
    return { length, raw, field };
  }
  setResponseInt(value) {
    this.ocgcoreWrapper.ocgcoreModule._set_responsei(this.duelPtr, value);
  }
  setResponse(response) {
    if (typeof response === "number") {
      this.setResponseInt(response);
      return;
    }
    this.ocgcoreWrapper.setHeap(
      this.returnPtr,
      _OcgcoreDuel.EMPTY_RETURN_BUFFER
    );
    this.ocgcoreWrapper.setHeap(
      this.returnPtr,
      response.subarray(0, _OcgcoreDuel.RETURN_SIZE)
    );
    this.ocgcoreWrapper.ocgcoreModule._set_responseb(
      this.duelPtr,
      this.returnPtr
    );
  }
  preloadScript(scriptPath) {
    this.ocgcoreWrapper.useTmpData(
      (ptr) => this.ocgcoreWrapper.ocgcoreModule._preload_script(this.duelPtr, ptr),
      scriptPath
    );
  }
  getRegistryValue(key) {
    const length = this.ocgcoreWrapper.useTmpData(
      (keyPtr) => this.ocgcoreWrapper.ocgcoreModule._get_registry_value(
        this.duelPtr,
        keyPtr,
        this.receivePtr
      ),
      key
    );
    const raw = this.ocgcoreWrapper.copyHeap(
      this.receivePtr,
      Math.max(0, length)
    );
    const value = raw;
    const text = length >= 0 ? decodeUtf82(raw) : void 0;
    return { length, raw, value, text };
  }
  setRegistryValue(key, value) {
    this.ocgcoreWrapper.useTmpData(
      (keyPtr, valuePtr) => this.ocgcoreWrapper.ocgcoreModule._set_registry_value(
        this.duelPtr,
        keyPtr,
        valuePtr
      ),
      key,
      value
    );
  }
  getRegistryKeys() {
    const length = this.ocgcoreWrapper.ocgcoreModule._get_registry_keys(
      this.duelPtr,
      this.receivePtr
    );
    const raw = this.ocgcoreWrapper.copyHeap(
      this.receivePtr,
      Math.max(0, length)
    );
    const keys = length >= 0 ? parseRegistryKeys(raw) : [];
    return { length, raw, keys };
  }
  clearRegistry() {
    this.ocgcoreWrapper.ocgcoreModule._clear_registry(this.duelPtr);
  }
  dumpRegistry() {
    const length = this.ocgcoreWrapper.ocgcoreModule._dump_registry(
      this.duelPtr,
      this.receivePtr
    );
    const raw = this.ocgcoreWrapper.copyHeap(
      this.receivePtr,
      Math.max(0, length)
    );
    const dict = {};
    if (length > 0) {
      const entries = parseRegistryDump(raw);
      for (const entry of entries) {
        if (entry.valueText !== void 0) {
          dict[entry.key] = entry.valueText;
        }
      }
    }
    return { length, raw, dict };
  }
  loadRegistry(input) {
    if (input instanceof Uint8Array) {
      this.ocgcoreWrapper.useTmpData(
        (ptr) => this.ocgcoreWrapper.ocgcoreModule._load_registry(
          this.duelPtr,
          ptr,
          input.length
        ),
        input
      );
    } else {
      for (const [key, value] of Object.entries(input)) {
        this.setRegistryValue(key, value);
      }
    }
  }
  getLuaCoverage(name) {
    const normalizedName = normalizeLuaCoverageName(name);
    const size = this.ocgcoreWrapper.useTmpData(
      (namePtr) => this.ocgcoreWrapper.ocgcoreModule._get_lua_coverage_dump_size(
        this.duelPtr,
        namePtr
      ),
      name
    );
    if (size <= 0) {
      return toLuaLineCoverage(normalizedName, {});
    }
    const ptr = this.ocgcoreWrapper.malloc(size);
    try {
      const written = this.ocgcoreWrapper.useTmpData(
        (namePtr) => this.ocgcoreWrapper.ocgcoreModule._dump_lua_coverage(
          this.duelPtr,
          namePtr,
          ptr,
          size
        ),
        name
      );
      if (written !== size) {
        throw new Error("Lua coverage dump size changed while reading.");
      }
      const raw = this.ocgcoreWrapper.copyHeap(ptr, size);
      return parseLuaCoveragePairs(normalizedName, raw);
    } finally {
      this.ocgcoreWrapper.free(ptr);
    }
  }
  getAllLuaCoverages() {
    const size = this.ocgcoreWrapper.ocgcoreModule._get_all_lua_coverages_dump_size(
      this.duelPtr
    );
    if (size <= 0) {
      return {};
    }
    const ptr = this.ocgcoreWrapper.malloc(size);
    try {
      const written = this.ocgcoreWrapper.ocgcoreModule._dump_all_lua_coverages(
        this.duelPtr,
        ptr,
        size
      );
      if (written !== size) {
        throw new Error("Lua coverage dump size changed while reading.");
      }
      const raw = this.ocgcoreWrapper.copyHeap(ptr, size);
      return parseAllLuaCoverages(raw);
    } finally {
      this.ocgcoreWrapper.free(ptr);
    }
  }
  clearLuaCoverage(name) {
    this.ocgcoreWrapper.useTmpData(
      (namePtr) => this.ocgcoreWrapper.ocgcoreModule._clear_lua_coverage(
        this.duelPtr,
        namePtr
      ),
      name
    );
    return this;
  }
  clearAllLuaCoverages() {
    this.ocgcoreWrapper.ocgcoreModule._clear_all_lua_coverages(this.duelPtr);
    return this;
  }
};
var EXTRA_SETCODE = /* @__PURE__ */ new Map([
  [8512558, [143, 84, 89, 130, 314]],
  [55088578, [143, 84, 89, 130, 314]]
]);
function applyCardSpecials(cardId, data) {
  const setcode = EXTRA_SETCODE.get(cardId);
  if (!setcode) {
    return data;
  }
  return {
    ...data,
    setcode: [...setcode]
  };
}
var OcgcoreWrapper = class {
  constructor(ocgcoreModule, options) {
    this.ocgcoreModule = ocgcoreModule;
    this.scriptBufferPtr = 0;
    this.scriptBufferSize = 0;
    this.logBufferPtr = 0;
    this.logBufferSize = 0;
    this.tmpStringBufferPtr = 0;
    this.tmpStringBufferSize = 0;
    this.scriptReaderFunc = 0;
    this.cardReaderFunc = 0;
    this.messageHandlerFunc = 0;
    this.scriptReaders = [];
    this.cardReaders = [];
    this.messageHandlers = [];
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder("utf-8");
    this.duels = /* @__PURE__ */ new Map();
    this.callbackDepth = 0;
    this._heapView = new DataView(ocgcoreModule.HEAPU8.buffer);
    this.scriptBufferSize = options?.scriptBufferSize ?? 1048576;
    this.logBufferSize = options?.logBufferSize ?? 1024;
    this.scriptReaderFunc = this.createFunction(
      (scriptPtr, lenPtr) => this.runInCallback(() => {
        const scriptPath = this.getUTF8String(scriptPtr);
        const content = this.readScript(scriptPath);
        if (content == null) {
          return 0;
        }
        if (!this.scriptBufferPtr) {
          this.scriptBufferPtr = this.ocgcoreModule._malloc(
            this.scriptBufferSize
          );
        }
        const bytes = content;
        if (bytes.length > this.scriptBufferSize) {
          this.ocgcoreModule._free(this.scriptBufferPtr);
          this.scriptBufferPtr = this.ocgcoreModule._malloc(bytes.length);
          this.scriptBufferSize = bytes.length;
        }
        this.heapU8.set(bytes, this.scriptBufferPtr);
        this.heapView.setInt32(lenPtr, bytes.length, true);
        return this.scriptBufferPtr;
      }),
      "iii"
    );
    this.ocgcoreModule._set_script_reader(this.scriptReaderFunc);
    this.cardReaderFunc = this.createFunction(
      (cardId, cardDataPtr) => this.runInCallback(() => {
        const data = this.readCard(cardId);
        if (!data) {
          return 0;
        }
        const buf = data.toPayload();
        this.heapU8.set(buf, cardDataPtr);
        return 0;
      }),
      "iii"
    );
    this.ocgcoreModule._set_card_reader(this.cardReaderFunc);
    this.messageHandlerFunc = this.createFunction(
      (duelPtr, messageType) => this.runInCallback(() => {
        if (!this.logBufferPtr) {
          this.logBufferPtr = this.ocgcoreModule._malloc(this.logBufferSize);
        }
        this.ocgcoreModule._get_log_message(duelPtr, this.logBufferPtr);
        const message = this.getUTF8String(this.logBufferPtr);
        const type = messageType === 2 ? "DebugMessage" : "ScriptError";
        const duel = this.getOrCreateDuel(duelPtr);
        this.handleMessage(duel, message, type);
      }),
      "iii"
    );
    this.ocgcoreModule._set_message_handler(this.messageHandlerFunc);
  }
  get heapU8() {
    if (!this.ocgcoreModule) {
      throw new Error("Ocgcore module has been finalized");
    }
    return this.ocgcoreModule.HEAPU8;
  }
  get heapView() {
    const heapU8 = this.heapU8;
    if (this._heapView.buffer !== heapU8.buffer) {
      this._heapView = new DataView(heapU8.buffer);
    }
    return this._heapView;
  }
  readScript(scriptPath) {
    let content;
    for (const reader of this.scriptReaders) {
      try {
        content = this.applyCallback(reader, scriptPath);
      } catch {
        content = null;
      }
      if (content != null) {
        break;
      }
    }
    return typeof content === "string" ? this.encoder.encode(content) : content ?? null;
  }
  readCard(cardId) {
    let data;
    for (const reader of this.cardReaders) {
      try {
        data = this.applyCallback(reader, cardId);
      } catch {
        data = null;
      }
      if (data) {
        break;
      }
    }
    if (!data) {
      return null;
    }
    const patched = applyCardSpecials(cardId, data);
    if (patched instanceof CardDataEntry) {
      return patched;
    }
    return new CardDataEntry().fromPartial(patched);
  }
  handleMessage(duel, message, type) {
    for (const handler of this.messageHandlers) {
      try {
        this.applyCallback(handler, duel, message, type);
      } catch {
      }
    }
  }
  getUTF8String(ptr) {
    const heapU8 = this.heapU8;
    let length = 0;
    while (heapU8[ptr + length] !== 0) {
      length++;
    }
    return this.decoder.decode(heapU8.subarray(ptr, ptr + length));
  }
  setHeap(ptr, data) {
    this.heapU8.set(data, ptr);
  }
  copyHeap(ptr, length) {
    return this.heapU8.slice(ptr, ptr + length);
  }
  snapshotHeap() {
    return this.heapU8.slice();
  }
  useTmpData(cb, ...args) {
    const encoded = args.map(
      (item) => typeof item === "string" ? this.encoder.encode(item) : item
    );
    const totalLength = encoded.reduce(
      (acc, bytes) => acc + bytes.length + 1,
      0
    );
    if (totalLength > this.tmpStringBufferSize) {
      if (this.tmpStringBufferPtr) {
        this.ocgcoreModule._free(this.tmpStringBufferPtr);
      }
      this.tmpStringBufferPtr = this.ocgcoreModule._malloc(totalLength);
      this.tmpStringBufferSize = totalLength;
    }
    let offset = 0;
    const heapU8 = this.heapU8;
    const ptrs = encoded.map((bytes) => {
      const ptr = this.tmpStringBufferPtr + offset;
      heapU8.set(bytes, ptr);
      heapU8[ptr + bytes.length] = 0;
      offset += bytes.length + 1;
      return ptr;
    });
    return cb(...ptrs);
  }
  createFunction(fn, signature) {
    return this.ocgcoreModule.addFunction(fn, signature);
  }
  addFunction(fn, signature) {
    return this.ocgcoreModule.addFunction(fn, signature);
  }
  removeFunction(index) {
    this.ocgcoreModule.removeFunction(index);
  }
  createDuel(seed, createFlags = 0) {
    const duelPtr = createFlags ? this.ocgcoreModule._create_duel_ex(seed, createFlags) : this.ocgcoreModule._create_duel(seed);
    return this.getOrCreateDuel(duelPtr);
  }
  createDuelV2(seedSequence, createFlags = 0) {
    const count = seedSequence.length;
    const byteLength = count * 4;
    const ptr = this.ocgcoreModule._malloc(byteLength);
    try {
      const view = new Uint32Array(this.heapU8.buffer, ptr, count);
      for (let i = 0; i < count; i++) {
        view[i] = seedSequence[i] >>> 0;
      }
      const duelPtr = createFlags ? this.ocgcoreModule._create_duel_v2_ex(ptr, createFlags) : this.ocgcoreModule._create_duel_v2(ptr);
      return this.getOrCreateDuel(duelPtr);
    } finally {
      this.ocgcoreModule._free(ptr);
    }
  }
  _defaultScriptReader(namePtr, dataPtr) {
    return this.ocgcoreModule._default_script_reader(namePtr, dataPtr);
  }
  malloc(size) {
    return this.ocgcoreModule._malloc(size);
  }
  free(ptr) {
    this.ocgcoreModule._free(ptr);
  }
  _stdioExit() {
    this.ocgcoreModule.___stdio_exit();
  }
  setScriptReader(reader, reset = false) {
    if (reset) {
      this.scriptReaders = [];
    }
    this.scriptReaders.push(reader);
    return this;
  }
  setCardReader(reader, reset = false) {
    if (reset) {
      this.cardReaders = [];
    }
    this.cardReaders.push(reader);
    return this;
  }
  setMessageHandler(handler, reset = false) {
    if (reset) {
      this.messageHandlers = [];
    }
    this.messageHandlers.push(handler);
    return this;
  }
  getOrCreateDuel(duelPtr) {
    const existing = this.duels.get(duelPtr);
    if (existing) {
      return existing;
    }
    const duel = new OcgcoreDuel(this, duelPtr);
    this.duels.set(duelPtr, duel);
    return duel;
  }
  attachDuel(duelPtr, snapshotState) {
    if (snapshotState.duelPtr !== duelPtr) {
      throw new Error("Cannot attach ocgcore duel: snapshot pointer mismatch");
    }
    const existing = this.duels.get(duelPtr);
    if (existing) {
      return existing;
    }
    const duel = new OcgcoreDuel(this, duelPtr, snapshotState);
    this.duels.set(duelPtr, duel);
    return duel;
  }
  forgetDuel(duelPtr) {
    this.duels.delete(duelPtr);
  }
  getSnapshotState() {
    return {
      scriptBufferPtr: this.scriptBufferPtr,
      scriptBufferSize: this.scriptBufferSize,
      logBufferPtr: this.logBufferPtr,
      logBufferSize: this.logBufferSize,
      tmpStringBufferPtr: this.tmpStringBufferPtr,
      tmpStringBufferSize: this.tmpStringBufferSize
    };
  }
  restoreSnapshotState(state) {
    this.scriptBufferPtr = state.scriptBufferPtr;
    this.scriptBufferSize = state.scriptBufferSize;
    this.logBufferPtr = state.logBufferPtr;
    this.logBufferSize = state.logBufferSize;
    this.tmpStringBufferPtr = state.tmpStringBufferPtr;
    this.tmpStringBufferSize = state.tmpStringBufferSize;
  }
  assertCanSnapshot() {
    if (this.callbackDepth > 0) {
      throw new Error(
        "Cannot snapshot an ocgcore duel while an ocgcore callback is running"
      );
    }
  }
  runInCallback(fn) {
    this.callbackDepth++;
    try {
      return fn();
    } finally {
      this.callbackDepth--;
    }
  }
  finalize() {
    if (!this.ocgcoreModule) return;
    for (const duel of this.duels.values()) {
      try {
        duel.endDuel();
      } catch {
      }
    }
    this.duels.clear();
    for (const reader of this.scriptReaders) {
      this.finalizeCallback(reader);
    }
    for (const reader of this.cardReaders) {
      this.finalizeCallback(reader);
    }
    for (const handler of this.messageHandlers) {
      this.finalizeCallback(handler);
    }
    if (this.scriptReaderFunc) {
      this.ocgcoreModule.removeFunction(this.scriptReaderFunc);
      this.scriptReaderFunc = 0;
    }
    if (this.cardReaderFunc) {
      this.ocgcoreModule.removeFunction(this.cardReaderFunc);
      this.cardReaderFunc = 0;
    }
    if (this.messageHandlerFunc) {
      this.ocgcoreModule.removeFunction(this.messageHandlerFunc);
      this.messageHandlerFunc = 0;
    }
    if (this.scriptBufferPtr) {
      this.ocgcoreModule._free(this.scriptBufferPtr);
      this.scriptBufferPtr = 0;
      this.scriptBufferSize = 0;
    }
    if (this.logBufferPtr) {
      this.ocgcoreModule._free(this.logBufferPtr);
      this.logBufferPtr = 0;
      this.logBufferSize = 0;
    }
    if (this.tmpStringBufferPtr) {
      this.ocgcoreModule._free(this.tmpStringBufferPtr);
      this.tmpStringBufferPtr = 0;
      this.tmpStringBufferSize = 0;
    }
    try {
      this.ocgcoreModule._ocgcore_shutdown?.(0);
    } catch {
    }
    this.ocgcoreModule = void 0;
  }
  applyCallback(cb, ...args) {
    if (typeof cb === "function") {
      return cb(...args);
    }
    return cb.apply(...args);
  }
  finalizeCallback(cb) {
    if (typeof cb === "function") {
      return;
    }
    try {
      cb.finalize?.();
    } catch {
    }
  }
};
function normalizeOcgcoreFactory(mod) {
  const typed = mod;
  if (typeof typed === "function") {
    return typed;
  }
  if (typed && typeof typed.default === "function") {
    return typed.default;
  }
  throw new Error("Invalid ocgcore factory module");
}
async function loadOcgcoreFactory() {
  return normalizeOcgcoreFactory(libocgcore_default);
}
async function createOcgcoreWrapper(options = {}) {
  const moduleInstance = await createOcgcoreModule(options);
  return new OcgcoreWrapper(moduleInstance);
}
async function createOcgcoreModule(options = {}) {
  const factory = await loadOcgcoreFactory();
  const overrides = {
    ...options.moduleOverrides
  };
  if (overrides.quit == null) {
    overrides.quit = () => {
    };
  }
  if (options.wasmBinary) {
    overrides.wasmBinary = options.wasmBinary;
  }
  if (options.locateFile) {
    overrides.locateFile = options.locateFile;
  }
  return factory(overrides);
}
var SCRIPT_PREFIX = "./script/";
function normalizePath(input) {
  let path = input.replace(/\\/g, "/");
  if (path.startsWith(SCRIPT_PREFIX)) {
    path = path.slice(SCRIPT_PREFIX.length);
  }
  return path;
}
function buildCandidates(filename) {
  const entries = [
    filename,
    `specials/${filename}`,
    `expansions/script/${filename}`,
    `script/${filename}`
  ];
  const candidates = [];
  for (const entry of entries) {
    candidates.push(entry);
    if (!entry.startsWith("./")) {
      const dotEntry = entry.startsWith("/") ? `./${entry.slice(1)}` : `./${entry}`;
      candidates.push(dotEntry);
    }
  }
  return candidates;
}
function MapScriptReader(...maps) {
  return (path) => {
    const filename = normalizePath(path);
    if (!filename.toLowerCase().endsWith(".lua")) {
      return null;
    }
    const candidates = buildCandidates(filename);
    for (const candidate of candidates) {
      for (const map of maps) {
        if (map.has(candidate)) {
          return map.get(candidate) ?? null;
        }
      }
    }
    return null;
  };
}
function normalizeZipEntryName(name) {
  const normalized = name.replace(/\\/g, "/").replace(/^\.?\//, "");
  const names = /* @__PURE__ */ new Set();
  names.add(normalized);
  if (normalized.startsWith("script/")) {
    names.add(normalized.slice("script/".length));
  }
  return Array.from(names);
}
async function ZipScriptReader(...inputs) {
  const maps = await Promise.all(
    inputs.map(async (data) => {
      const zip = await import_jszip.default.loadAsync(data);
      const map = /* @__PURE__ */ new Map();
      const entries = Object.values(zip.files);
      await Promise.all(
        entries.map(async (entry) => {
          if (entry.dir) {
            return;
          }
          if (!entry.name.toLowerCase().endsWith(".lua")) {
            return;
          }
          const content = await entry.async("uint8array");
          for (const name of normalizeZipEntryName(entry.name)) {
            map.set(name, content);
          }
        })
      );
      return map;
    })
  );
  return MapScriptReader(...maps);
}
function createReader(dbs) {
  const brokenDbIndexes = /* @__PURE__ */ new Set();
  return (cardId) => {
    let data;
    for (let i = 0; i < dbs.length; i++) {
      if (brokenDbIndexes.has(i)) {
        continue;
      }
      try {
        data = dbs[i].findById(cardId);
      } catch {
        brokenDbIndexes.add(i);
        continue;
      }
      if (data) {
        break;
      }
    }
    if (!data) {
      return null;
    }
    if (data.alias && !data.ruleCode && !(data.type & OcgcoreCommonConstants.TYPE_TOKEN)) {
      for (let i = 0; i < dbs.length; i++) {
        if (brokenDbIndexes.has(i)) {
          continue;
        }
        try {
          dbs[i].resolveRuleCode([data]);
        } catch {
          brokenDbIndexes.add(i);
          continue;
        }
        if (data.ruleCode) {
          break;
        }
      }
    }
    return data;
  };
}
function isSqlJsStatic2(value) {
  return !!value && typeof value.Database === "function";
}
function SqljsCardReader(first, ...rest) {
  if (isSqlJsStatic2(first)) {
    const sqljs = first;
    const owned = [];
    const dbs2 = rest.map((item) => {
      if (item instanceof YGOProCdb) {
        return item;
      }
      if (item instanceof Uint8Array) {
        const cdb = new YGOProCdb(sqljs).from(item);
        owned.push(cdb);
        return cdb;
      }
      return new YGOProCdb(item);
    });
    owned.forEach((db) => db.noTexts());
    const reader = createReader(dbs2);
    return {
      apply: reader,
      finalize: () => {
        for (const db of owned) {
          try {
            db.finalize();
          } catch {
          }
        }
      }
    };
  }
  const inputs = [first, ...rest];
  const dbs = inputs.map((item) => {
    if (item instanceof YGOProCdb) {
      return item;
    }
    if (item instanceof Uint8Array) {
      throw new Error(
        "SqlJsStatic is required to create database from Uint8Array"
      );
    }
    return new YGOProCdb(item);
  });
  return createReader(dbs);
}
var { LOCATION_DECK, LOCATION_EXTRA, POS_FACEDOWN_DEFENSE } = OcgcoreScriptConstants;
var { LOCATION_DECK: LOCATION_DECK2, POS_FACEUP_ATTACK } = OcgcoreScriptConstants;
if (typeof globalThis !== "undefined" && !globalThis.Buffer) {
  globalThis.Buffer = import_buffer.Buffer;
}

// src/constants.js
var K = vendor_exports.OcgcoreScriptConstants;
var C = vendor_exports.OcgcoreCommonConstants;
var LOC = { DECK: 1, HAND: 2, MZONE: 4, SZONE: 8, GRAVE: 16, REMOVED: 32, EXTRA: 64, OVERLAY: 128 };
var POS = { FU_ATK: 1, FD_ATK: 2, FU_DEF: 4, FD_DEF: 8 };
var QUERY = C.QUERY_CODE | C.QUERY_POSITION | C.QUERY_ATTACK | C.QUERY_DEFENSE | C.QUERY_TYPE | C.QUERY_LEVEL | C.QUERY_RANK | C.QUERY_LINK | C.QUERY_OVERLAY_CARD;
var PHASES = {
  1: "Draw Phase",
  2: "Standby Phase",
  4: "Main Phase 1",
  8: "Battle Phase",
  16: "Battle Phase",
  32: "Battle Phase",
  64: "Battle Phase",
  128: "Battle Phase",
  256: "Main Phase 2",
  512: "End Phase"
};

// src/bot.js
var Bot = class {
  constructor(game) {
    this.g = game;
    this.tried = /* @__PURE__ */ new Set();
    this.actions = 0;
    this.turn = -1;
  }
  respond(m) {
    const g = this.g, kind = m.constructor.name.replace("YGOProMsg", "");
    if (g.turn !== this.turn) {
      this.turn = g.turn;
      this.actions = 0;
    }
    const mine = (c) => c.controller === g.bot;
    switch (kind) {
      case "SelectIdleCmd": {
        this.actions++;
        const busy = this.actions > 40;
        const fresh = m.activatableCards.findIndex((c) => !this.tried.has(`${g.turn}:${c.code}:${c.desc}`));
        if (fresh >= 0 && !busy) {
          const c = m.activatableCards[fresh];
          this.tried.add(`${g.turn}:${c.code}:${c.desc}`);
          return m.prepareResponse(5, IndexResponse(fresh));
        }
        if (m.spSummonableCards.length && !busy) return m.prepareResponse(1, IndexResponse(0));
        const atk = (c) => g.engine.stats.get(c.code) ?? 0;
        const best = m.summonableCards.map((c, i) => ({ i, a: atk(c) })).filter((x) => x.a >= 1e3).sort((x, y) => y.a - x.a)[0];
        if (best && !busy) return m.prepareResponse(0, IndexResponse(best.i));
        const trap = m.ssetableCards.findIndex(() => true);
        if (trap >= 0 && !busy && this.actions < 30) return m.prepareResponse(4, IndexResponse(trap));
        if (m.canBp && g.turn > 1) return m.prepareResponse(6);
        return m.prepareResponse(7);
      }
      case "SelectBattleCmd":
        if (m.attackableCards.length && this.actions++ < 60) return m.prepareResponse(1, IndexResponse(0));
        return m.prepareResponse(m.canM2 ? 2 : 3);
      case "SelectChain":
        return m.prepareResponse(m.chains.length ? IndexResponse(0) : null);
      // interruptions dès que possible
      case "SelectEffectYn":
      case "SelectYesNo":
        return m.prepareResponse(true);
      case "SelectOption":
        return m.prepareResponse(0);
      case "SelectPosition":
        return m.prepareResponse(m.positions & POS.FU_ATK ? POS.FU_ATK : m.positions & POS.FU_DEF ? POS.FU_DEF : m.positions & -m.positions);
      case "SelectCard":
      case "SelectTribute": {
        const order = m.cards.map((c, i) => ({ i, c, v: mine(c) ? -this.power(c) : this.power(c) })).sort((a, b) => b.v - a.v);
        return m.prepareResponse(order.slice(0, Math.max(1, m.min)).map((o) => IndexResponse(o.i)));
      }
      case "SelectSum": {
        const total = m.sumVal, pick = [];
        let s = 0;
        for (let i = 0; i < m.cards.length && s < total; i++) {
          pick.push(i);
          s += m.cards[i].opParam & 65535;
        }
        return m.prepareResponse(pick.map((i) => IndexResponse(i)));
      }
      case "SelectUnselectCard":
        if (m.finishable) return m.prepareResponse(null);
        return m.prepareResponse(IndexResponse(0));
      case "SelectPlace":
      case "SelectDisfield": {
        const places = m.getSelectablePlaces();
        const own = places.filter((p) => p.player === g.bot);
        const list = (kind === "SelectPlace" && own.length ? own : places).slice(0, m.count || 1);
        return m.prepareResponse(list);
      }
      case "SelectCounter":
        return m.prepareResponse([{ card: IndexResponse(0), count: m.counterCount }]);
      case "AnnounceRace":
        return m.prepareResponse(m.availableRaces & -m.availableRaces);
      case "AnnounceAttrib":
        return m.prepareResponse(m.availableAttributes & -m.availableAttributes);
      case "AnnounceNumber":
        return m.prepareResponse(0);
      case "AnnounceCard":
        return m.prepareResponse(14558127);
      // Floraison de Cendres : nom souvent pertinent
      case "RockPaperScissors":
        return m.prepareResponse(1 + this.g.turn % 3);
      // déterministe (retour arrière)
      default:
        return m.defaultResponse ? m.defaultResponse() : void 0;
    }
  }
  power(c) {
    try {
      const r = this.g.duel.queryCard({ player: c.controller, location: c.location, sequence: c.sequence, queryFlag: C.QUERY_ATTACK });
      return r.card ? r.card.attack || 0 : 0;
    } catch {
      return 0;
    }
  }
};

// src/questions.js
function effectInfo(T, c) {
  const name = T.desc(c.desc, c.code);
  const generic = name === `Effet de ${T.name(Math.floor(c.desc / 16))}`;
  return { name: generic ? `Effet ${c.desc % 16 + 1}` : name, text: T.effectText(c.desc, c.code) };
}
function repos(game, c) {
  let pos = 0;
  try {
    pos = game.duel.queryCard({ player: c.controller, location: c.location, sequence: c.sequence, queryFlag: C.QUERY_POSITION }).card.position;
  } catch {
  }
  if (pos & POS.FD_DEF) return "Invocation Flip (face recto en attaque)";
  if (pos & POS.FU_DEF) return "Passer en Position d'Attaque";
  if (pos & POS.FU_ATK) return "Passer en Position de D\xE9fense";
  return "Changer de position";
}
function triggerText(T, m) {
  const found = T.effectText(m.desc, m.code);
  if (found) return found;
  const list = T.effects(m.code);
  const triggers = list.filter((p) => /^(Si|Lorsque|Quand|Durant) [^:]*:/.test(p));
  const self2 = triggers.filter((p) => /^(Si|Lorsque|Quand) cette carte/.test(p));
  return triggers.length === 1 ? triggers[0] : self2.length === 1 ? self2[0] : list.join("\n\n");
}
function question(game, m) {
  const T = game.T;
  const kind = m.constructor.name.replace("YGOProMsg", "");
  const key = (c) => `${c.controller}:${c.location}:${c.sequence}`;
  const hint = game.hint;
  game.hint = "";
  switch (kind) {
    case "SelectIdleCmd":
    case "SelectBattleCmd": {
      const acts = [];
      const add = (list, label, type) => (list || []).forEach((c, i) => acts.push({
        key: key(c),
        code: c.code,
        label: typeof label === "function" ? label(c) : label,
        effect: isEffect(type) ? effectInfo(T, c) : null,
        response: m.prepareResponse(type, IndexResponse(i))
      }));
      const effect = (c) => `Activer : ${T.desc(c.desc, c.code)}`;
      const isEffect = (type) => kind === "SelectIdleCmd" ? type === 5 : type === 0;
      if (kind === "SelectIdleCmd") {
        add(m.summonableCards, "Invocation Normale", 0);
        add(m.spSummonableCards, "Invocation Sp\xE9ciale", 1);
        add(m.reposableCards, (c) => repos(game, c), 2);
        add(m.msetableCards, "Poser face verso", 3);
        add(m.ssetableCards, "Poser", 4);
        add(m.activatableCards, effect, 5);
      } else {
        add(m.activatableCards, effect, 0);
        add(m.attackableCards, (c) => c.directAttack ? "Attaquer (attaque directe possible)" : "Attaquer", 1);
      }
      const buttons = [];
      if (kind === "SelectIdleCmd" && m.canBp) buttons.push({ label: "Battle Phase", response: m.prepareResponse(6) });
      if (kind === "SelectBattleCmd" && m.canM2) buttons.push({ label: "Main Phase 2", response: m.prepareResponse(2) });
      if (m.canEp) buttons.push({ label: "Fin du tour", main: true, response: m.prepareResponse(kind === "SelectIdleCmd" ? 7 : 3) });
      return { kind: "actions", actions: acts, buttons };
    }
    case "SelectChain": {
      if (!m.chains.length) return null;
      const forced = m.chains.some((c) => c.forced);
      return {
        kind: "actions",
        chain: true,
        actions: m.chains.map((c, i) => ({
          key: key(c),
          code: c.code,
          label: `Activer : ${T.desc(c.desc, c.code)}`,
          effect: effectInfo(T, c),
          response: m.prepareResponse(IndexResponse(i))
        })),
        buttons: forced ? [] : [{ label: "Ne rien activer", main: true, response: m.prepareResponse(null) }]
      };
    }
    case "SelectEffectYn":
      return {
        kind: "yesno",
        title: `Activer l'effet de \xAB ${T.name(m.code)} \xBB ?`,
        text: triggerText(T, m),
        code: m.code,
        yes: m.prepareResponse(true),
        no: m.prepareResponse(false)
      };
    case "SelectYesNo":
      return { kind: "yesno", title: T.desc(m.desc).replace(/[%ls]/g, "cette carte"), text: "", yes: m.prepareResponse(true), no: m.prepareResponse(false) };
    case "SelectOption":
      return { kind: "choose", title: hint || "Choisis une option", options: m.options.map((d, i) => ({ label: T.desc(d), response: m.prepareResponse(i) })), cancel: null };
    case "SelectPosition": {
      const opts = [[POS.FU_ATK, "Attaque, face recto"], [POS.FD_ATK, "Attaque, face verso"], [POS.FU_DEF, "D\xE9fense, face recto"], [POS.FD_DEF, "D\xE9fense, face verso"]].filter(([bit]) => m.positions & bit).map(([bit, label]) => ({ label, response: m.prepareResponse(bit) }));
      return { kind: "choose", title: `Position de \xAB ${T.name(m.code)} \xBB`, code: m.code, options: opts, cancel: null };
    }
    case "SelectCard":
    case "SelectTribute":
    case "SelectSum": {
      const cards = m.cards.map((c) => ({ key: key(c), code: c.code, controller: c.controller, location: c.location }));
      const must = kind === "SelectSum" ? (m.mustSelectCards || []).map((c) => T.name(c.code)) : [];
      return {
        kind: "cards",
        title: hint || (kind === "SelectTribute" ? T.desc(500) : "S\xE9lectionne des cartes"),
        min: m.min,
        max: m.max,
        cards,
        sum: kind === "SelectSum" ? m.sumVal : null,
        must,
        build: (idx) => m.prepareResponse(idx.map((i) => IndexResponse(i))),
        cancel: m.cancelable ? m.prepareResponse(null) : null,
        escape: m.cancelable ? m.prepareResponse(null) : null
        // Échap : renoncer à jouer la carte
      };
    }
    case "SelectUnselectCard": {
      const cards = m.selectableCards.map((c) => ({ key: key(c), code: c.code, controller: c.controller, location: c.location }));
      return {
        kind: "cards",
        title: hint || "S\xE9lectionne une carte",
        min: 1,
        max: 1,
        cards,
        step: true,
        chosen: m.unselectableCards.map((c) => T.name(c.code)),
        build: (idx) => m.prepareResponse(IndexResponse(idx[0])),
        cancel: m.finishable || m.cancelable ? m.prepareResponse(null) : null,
        cancelLabel: m.finishable ? "Terminer la s\xE9lection" : "Annuler",
        escape: m.cancelable && !m.finishable ? m.prepareResponse(null) : null
        // jamais « terminer » par Échap
      };
    }
    case "SelectPlace":
    case "SelectDisfield": {
      const places = m.getSelectablePlaces();
      const title = kind === "SelectPlace" ? T.desc(569).replace("[%ls]", hint.startsWith("\xAB") ? hint : "la carte") : T.desc(570);
      return {
        kind: "place",
        title,
        count: m.count || 1,
        places,
        build: (list) => m.prepareResponse(list)
      };
    }
    case "AnnounceRace":
    case "AnnounceAttrib": {
      const bits = kind === "AnnounceRace" ? m.availableRaces : m.availableAttributes;
      const base = kind === "AnnounceRace" ? 1020 : 1010;
      const opts = [];
      for (let i = 0; i < 26; i++) if (bits & 1 << i) opts.push({ label: T.desc(base + i), response: m.prepareResponse(1 << i) });
      return { kind: "choose", title: hint || T.desc(kind === "AnnounceRace" ? 563 : 562), options: opts, cancel: null };
    }
    case "AnnounceNumber":
      return { kind: "choose", title: hint || T.desc(565), options: m.numbers.map((n, i) => ({ label: String(n), response: m.prepareResponse(i) })), cancel: null };
    case "AnnounceCard":
      return { kind: "announce", title: hint || T.desc(564), names: game.engine.names, build: (code) => m.prepareResponse(code) };
    default:
      return null;
  }
}

// src/texts.js
var norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
var stems = (s) => (norm(s).match(/[a-z]{4,}/g) || []).map((w) => w.slice(0, 5));
function makeTexts(engine, myNames = {}) {
  const name = (code) => myNames[code] || (engine.texts.get(code) || [])[1] || `#${code}`;
  const desc = (d, code) => {
    if (engine.texts.has(d)) return `\xAB ${name(d)} \xBB`;
    if (d >= 1e4) {
      const row = engine.texts.get(Math.floor(d / 16));
      const s = row && row[3 + d % 16];
      if (s) return s;
      return code ? `Effet de ${name(Math.floor(d / 16))}` : "Effet";
    }
    return engine.system.get(d) || (d ? `Option ${d}` : "Activer l'effet");
  };
  const effects = (code) => {
    const text = (engine.texts.get(code) || [])[2] || "";
    const out = [];
    text.split(/\r?\n/).forEach((line, i) => {
      const t = line.trim();
      if (!t || i === 0 && line.includes("	")) return;
      if (out.length && /^Vous ne pouvez (utiliser|activer)/.test(t)) out[out.length - 1] += " " + t;
      else out.push(t);
    });
    return out;
  };
  const effectText = (d, code) => {
    const list = effects(code);
    if (list.length === 1) return list[0];
    if (d < 1e4 || Math.floor(d / 16) !== code) return null;
    const n = d % 16, label = (engine.texts.get(code) || [])[3 + n] || "";
    const keys = stems(label).filter((w) => !["effet", "activ"].includes(w));
    const active = list.filter((p) => /[:;]/.test(p));
    if (!keys.length) return active[n] || null;
    const scores = list.map((p) => {
      const ws = new Set(stems(p));
      return keys.filter((k) => ws.has(k)).length;
    });
    const best = Math.max(...scores);
    return best > 0 && scores.filter((s) => s === best).length === 1 ? list[scores.indexOf(best)] : active[n] || null;
  };
  return { name, desc, effects, effectText };
}

// src/game.js
var Game = class {
  // replay : tes réponses d'une partie précédente, rejouées sans rien te demander (retour arrière : le moteur et le
  // bot étant déterministes, la même graine et les mêmes réponses redonnent exactement la même partie)
  constructor(engine, { me, bot, seed, meFirst, names, botName, replay = [] }) {
    this.replay = [...replay];
    this.fast = replay.length > 0;
    this.answers = [];
    this.engine = engine;
    this.botName = botName || "L'adversaire";
    this.T = makeTexts(engine, names);
    this.me = meFirst ? 0 : 1;
    this.bot = 1 - this.me;
    this.log = [];
    this.over = null;
    this.turn = 0;
    this.turnPlayer = 0;
    this.phase = "";
    this.hint = "";
    this.stopped = false;
    let a = seed >>> 0 || 1;
    const rand = () => {
      a = a * 1664525 + 1013904223 >>> 0;
      return a / 4294967296;
    };
    const shuffle = (l) => {
      l = [...l];
      for (let i = l.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [l[i], l[j]] = [l[j], l[i]];
      }
      return l;
    };
    const duel = this.duel = engine.wrapper.createDuel(seed >>> 0);
    for (const p of [0, 1]) duel.setPlayerInfo({ player: p, lp: 8e3, startHand: 5, drawCount: 1 });
    for (const [p, d] of [[this.me, me], [this.bot, bot]]) {
      for (const code of shuffle(d.main)) duel.newCard({ code, owner: p, player: p, location: LOC.DECK, sequence: 0, position: POS.FD_DEF });
      for (const code of d.extra) duel.newCard({ code, owner: p, player: p, location: LOC.EXTRA, sequence: 0, position: POS.FD_DEF });
    }
    this.botBrain = new Bot(this);
  }
  who(p) {
    return p === this.me ? "me" : "bot";
  }
  say(p, text, tone = "") {
    this.log.push({ who: p === void 0 || p === null ? null : this.who(p), text, tone, turn: this.turn });
  }
  // État complet du terrain, interrogé auprès du moteur (rien n'est déduit des messages).
  field() {
    const d = this.duel;
    const side = (p) => {
      const q = (loc) => d.queryFieldCard({ player: p, location: loc, queryFlag: QUERY }).cards.map((c, i) => c && !c.empty ? { ...c, sequence: c.sequence ?? i, key: `${p}:${loc}:${c.sequence ?? i}` } : null);
      const info = d.queryFieldInfo().field.players[p];
      return {
        lp: info.lp,
        hand: q(LOC.HAND),
        mzone: q(LOC.MZONE),
        szone: q(LOC.SZONE),
        grave: q(LOC.GRAVE),
        removed: q(LOC.REMOVED),
        extra: q(LOC.EXTRA),
        deck: info.deckCount
      };
    };
    return {
      me: side(this.me),
      bot: side(this.bot),
      turn: this.turn,
      phase: this.phase,
      turnPlayer: this.who(this.turnPlayer),
      over: this.over,
      log: this.log
    };
  }
  // Boucle principale : ui.prompt(question) -> Promise<réponse> ; ui.update(état) après chaque étape.
  async run(ui) {
    this.duel.startDuel({ rule: 5 });
    let last = null;
    while (!this.over && !this.stopped) {
      const res = this.duel.process();
      const messages = res.messages || (res.message ? [res.message] : []);
      let botActed = false;
      for (const m of messages) {
        const kind = m.constructor.name.replace("YGOProMsg", "");
        if (kind === "Retry") {
          this.say(this.me, "Choix refus\xE9 par les r\xE8gles : recommence.", "warn");
          if (last) await this.answer(last, ui);
          continue;
        }
        this.event(kind, m);
        if (m instanceof YGOProMsgResponseBase) {
          last = m;
          botActed = m.responsePlayer() === this.bot;
          await this.answer(m, ui);
        }
      }
      if (res.status === 2) break;
      if (this.fast) continue;
      ui.update(this.field(), botActed);
      if (botActed) await ui.pause();
    }
    ui.update(this.field(), false);
  }
  async answer(m, ui) {
    const p = m.responsePlayer();
    let response;
    if (p === this.bot) {
      response = this.botBrain.respond(m);
    } else {
      const q = question(this, m);
      if (q) {
        if (this.replay.length) response = this.replay.shift();
        else {
          this.fast = false;
          response = await ui.prompt(q, this.field());
        }
        this.answers.push({ response, action: q.kind === "actions" });
      }
    }
    if (!response) response = m.defaultResponse ? m.defaultResponse() : m.prepareResponse(null);
    this.duel.setResponse(response);
  }
  // Réponses à rejouer pour revenir juste avant ta dernière action en phase (invocation, activation, attaque…) ;
  // null s'il n'y en a pas encore.
  undoPoint() {
    for (let i = this.answers.length - 1; i >= 0; i--) if (this.answers[i].action) return this.answers.slice(0, i).map((a) => a.response);
    return null;
  }
  // ------------------------------------------------------------------ journal
  event(kind, m) {
    const T = this.T, me = this.me;
    const who = (p) => p === me ? "Tu" : this.botName;
    switch (kind) {
      case "NewTurn":
        this.turn += 1;
        this.turnPlayer = m.player;
        this.say(null, `Tour ${this.turn} : ${m.player === me ? "\xE0 toi de jouer" : "au tour de l'adversaire (" + this.botName + ")"}.`, "turn");
        break;
      case "NewPhase":
        this.phase = PHASES[m.phase] || this.phase;
        break;
      case "Hint":
        if (m.type === 3) this.hint = T.desc(m.desc);
        break;
      case "Draw":
        if (m.player === me) this.say(me, `Tu pioches ${(m.cards || []).map((c) => `\xAB ${T.name(c & 2147483647)} \xBB`).join(", ") || m.count + " carte(s)"}.`);
        else this.say(m.player, `${this.botName} pioche ${m.count} carte(s).`);
        break;
      case "Summoning":
        this.say(m.controller, `${m.controller === me ? "Tu invoques" : this.botName + " invoque"} normalement \xAB ${T.name(m.code)} \xBB.`);
        break;
      case "SpSummoning":
        this.say(m.controller, `Invocation Sp\xE9ciale de \xAB ${T.name(m.code)} \xBB.`);
        break;
      case "FlipSummoning":
        this.say(m.controller, `Invocation Flip de \xAB ${T.name(m.code)} \xBB.`);
        break;
      case "Set":
        break;
      case "Move":
        this.move(m);
        break;
      case "Chaining": {
        const what = T.desc(m.desc, m.code);
        const named = m.desc >= 1e4 && !what.startsWith("\xAB") && !["Effet", "Activer", "Activer l'effet"].includes(what) && what !== `Effet de ${T.name(Math.floor(m.desc / 16))}` ? ` : ${what}` : "";
        this.say(m.controller, `${who(m.controller)} ${m.controller === me ? "actives" : "active"} \xAB ${T.name(m.code)} \xBB${named}${m.chainCount > 1 ? ` (maillon ${m.chainCount})` : ""}${m.controller !== me && this.turnPlayer === me ? " pendant ton tour" : ""}.`, m.controller === me ? "" : "bot");
        break;
      }
      case "ChainNegated":
      case "ChainDisabled":
        this.say(null, `Le maillon ${m.chainCount} est annul\xE9.`, "cut");
        break;
      case "Damage":
        this.say(m.player, `${m.player === me ? "Tu perds" : this.botName + " perd"} ${m.value} PV.`, "cut");
        break;
      case "PayLpCost":
        this.say(m.player, `${m.player === me ? "Tu paies" : this.botName + " paie"} ${m.cost} PV.`);
        break;
      case "Recover":
        this.say(m.player, `${m.player === me ? "Tu gagnes" : this.botName + " gagne"} ${m.value} PV.`, "good");
        break;
      case "Attack": {
        const a = m.attacker || {}, t = m.defender || {};
        const code = (x) => this.codeAt(x);
        this.say(a.controller, `\xAB ${T.name(code(a))} \xBB attaque ${t && t.location ? "\xAB " + T.name(code(t)) + " \xBB" : "directement"}.`);
        break;
      }
      case "Win":
        this.over = m.player === me ? "Victoire !" : `D\xE9faite : ${this.botName} gagne.`;
        this.say(null, this.over, m.player === me ? "good" : "cut");
        break;
      default:
        break;
    }
  }
  // Journal des déplacements qui comptent : destructions, envois au Cimetière, bannissements, recherches.
  move(m) {
    const T = this.T, from = m.previous || {}, to = m.current || {}, me = this.me;
    if (!m.code || from.location === to.location) return;
    const name = `\xAB ${T.name(m.code)} \xBB`;
    const field = (l) => l === LOC.MZONE || l === LOC.SZONE;
    const r = m.reason || 0;
    if (field(from.location) && to.location === LOC.GRAVE) {
      if (r & 1) this.say(from.controller, `${name} est d\xE9truit${r & 32 ? " au combat" : ""}.`, "cut");
      else if (!(r & 8)) this.say(from.controller, `${name} est envoy\xE9 au Cimeti\xE8re.`);
    } else if (to.location === LOC.REMOVED && from.location !== LOC.OVERLAY) {
      this.say(from.controller, `${name} est banni.`);
    } else if (from.location === LOC.DECK && to.location === LOC.HAND) {
      this.say(to.controller, `${to.controller === me ? "Tu ajoutes" : this.botName + " ajoute"} ${to.controller === me ? name : "une carte"} \xE0 ${to.controller === me ? "ta" : "sa"} main depuis le Deck.`);
    } else if (from.location === LOC.DECK && to.location === LOC.GRAVE && !(r & 128)) {
      this.say(from.controller, `${name} est envoy\xE9 du Deck au Cimeti\xE8re.`);
    } else if (field(from.location) && to.location === LOC.HAND) {
      this.say(from.controller, `${name} retourne dans la main.`);
    } else if (to.location === LOC.SZONE && from.location !== LOC.HAND && !field(from.location)) {
      this.say(to.controller, `${name} est plac\xE9${from.location === LOC.EXTRA ? " depuis l'Extra Deck" : ""} dans la Zone Magie & Pi\xE8ge${to.sequence === 5 ? " (Terrain)" : ""}.`);
    }
  }
  codeAt(x) {
    try {
      const r = this.duel.queryCard({ player: x.controller, location: x.location, sequence: x.sequence, queryFlag: C.QUERY_CODE });
      return r.card ? r.card.code : 0;
    } catch {
      return 0;
    }
  }
};

// src/loader.js
var import_sql_wasm_browser = __toESM(require_sql_wasm_browser());
async function loadEngine(base) {
  const get = async (file, type) => {
    const r = await fetch(base + file);
    if (!r.ok) throw new Error(`${file} : ${r.status}`);
    return r[type]();
  };
  const [wasm, sqlWasm, scripts, cdb, strings] = await Promise.all([
    get("libocgcore.wasm", "arrayBuffer"),
    get("sql-wasm-browser.wasm", "arrayBuffer"),
    get("data/script.zip", "arrayBuffer"),
    get("data/cards.cdb", "arrayBuffer"),
    get("data/strings.conf", "text")
  ]);
  const wrapper = await createOcgcoreWrapper({ wasmBinary: new Uint8Array(wasm) });
  wrapper.setScriptReader(await ZipScriptReader(new Uint8Array(scripts)), true);
  const SQL = await (0, import_sql_wasm_browser.default)({ wasmBinary: new Uint8Array(sqlWasm) });
  const db = new SQL.Database(new Uint8Array(cdb));
  wrapper.setCardReader(SqljsCardReader(db));
  const errors = [];
  wrapper.setMessageHandler((_d, msg, type) => {
    if (type === 1) errors.push(msg);
  }, true);
  const texts = /* @__PURE__ */ new Map();
  for (const row of db.exec("SELECT * FROM texts")[0].values) texts.set(row[0], row);
  const system = /* @__PURE__ */ new Map();
  for (const line of strings.split(/\r?\n/)) {
    const m = line.match(/^!system (\d+) (.*)$/);
    if (m) system.set(+m[1], m[2]);
  }
  const names = db.exec("SELECT id, name FROM texts")[0].values;
  const stats = new Map(db.exec("SELECT id, atk FROM datas")[0].values);
  return { wrapper, texts, system, errors, names, stats };
}
export {
  C,
  Game,
  K,
  LOC,
  POS,
  loadEngine,
  makeTexts
};
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

jszip/dist/jszip.min.js:
  (*!
  
  JSZip v3.10.2 - A JavaScript class for generating and reading zip files
  <http://stuartk.com/jszip>
  
  (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
  Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.
  
  JSZip uses the library pako released under the MIT license :
  https://github.com/nodeca/pako/blob/main/LICENSE
  *)

@cjser/lzma1/lib/index.js:
  (**
   * @license
   * Copyright Filip Seman
   * SPDX-License-Identifier: MIT
   *)
*/
