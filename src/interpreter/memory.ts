export class Memory {
  static WordSize = 8
  static Mega = 2 ** 20
  view: DataView
  free: number

  // primitive values

  // primitive values are represented by words that meet
  // the IEEE 754 representation of NaN ("not-a-number").
  // Within the NaN value, we encode the type of the value
  // using a tag, from bit 13 to bit 18, using the following
  // scheme.

  static NaNTag = [0, 0, 0, 0, 0, 0]

  // memory words without payload (literal values)
  static NullTag = [1, 0, 1, 0, 0, 0]
  static UnassignedTag = [1, 0, 1, 1, 0, 0]
  static UndefinedTag = [1, 1, 0, 0, 0, 0]

  // memory nodes with child nodes
  static BlockframeTag = [1, 1, 0, 1, 0, 0]
  static CallframeTag = [1, 1, 1, 0, 0, 0]
  static ClosureTag = [0, 0, 0, 1, 0, 0]
  static FrameTag = [0, 0, 1, 0, 0, 0]
  static EnvironmentTag = [0, 0, 1, 1, 0, 0]
  static PairTag = [0, 1, 0, 0, 0, 0]

  // memory words with payload
  static BuiltinTag = [0, 1, 0, 1, 0, 0]
  static AddressTag = [0, 1, 1, 0, 0, 0]

  // the first 13 bits of a NaN word are
  // needed to make the word a NaN. The
  // subsequent bits are used as tags

  static NaNTagOffset = 13

  constructor(megaBytes: number) {
    const data = new ArrayBuffer(Memory.Mega * megaBytes)
    this.view = new DataView(data)
    this.free = 0
  }

  static testNanBoxing() {
    const inWord = NaN

    // place a NaN in a buffer and set its last bit
    const inBuffer = new ArrayBuffer(8)
    const inView = new DataView(inBuffer)
    inView.setFloat64(0, inWord)
    inView.setUint8(7, 0 | (1 << 0))

    // get the "flagged" NaN out of the buffer
    const outWord = inView.getFloat64(0)

    // display the last byte of the "flagged" NaN
    const outBuffer = new ArrayBuffer(8)
    const outView = new DataView(outBuffer)
    outView.setFloat64(0, outWord)
    return ((outView.getUint8(7) >> 0) & 1) == 1
    // the result is 1 in Chrome (for nan boxing to work)
  }

  static wordToString(word: number) {
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, word)
    let binStr = ''
    for (let i = 0; i < 8; i++) {
      binStr += ('00000000' + view.getUint8(i).toString(2)).slice(-8) + ' '
    }
    return binStr
  }

  display() {
    console.log('Memory:')
    this.displayMemoryLayout()
  }

  protected displayMemoryLayout() {
    for (let i = 0; i < this.free; i++) {
      console.log(i, this.getWordAtIndex(i), Memory.wordToString(this.getWordAtIndex(i)))
    }
  }

  getWordAtIndex(index: number) {
    return this.view.getFloat64(index * Memory.WordSize)
  }

  setWordAtIndex(index: number, x: number) {
    return this.view.setFloat64(index * Memory.WordSize, x)
  }

  setTaggedNaNAtIndex(index: number, tag: number[]) {
    const theNaN = this.makeTaggedNaN(tag)
    this.setWordAtIndex(index, theNaN)
  }

  // some magic bit manipulation: in view v,
  // set bit at index i to 1, where 0 <= i < 64
  static setBit(x: DataView, i: number) {
    const byteIndex = Math.floor(i / 8)
    const currentByte = x.getUint8(byteIndex)
    const bitIndex = 7 - (i % 8)
    x.setUint8(byteIndex, currentByte | (1 << bitIndex))
  }

  // some more magic bit manipulation: in view v,
  // set bit at index i to 1, where 0 <= i < 64
  static unsetBit(x: DataView, i: number) {
    const byteIndex = Math.floor(i / 8)
    const currentByte = x.getUint8(byteIndex)
    const bitIndex = 7 - (i % 8)
    x.setUint8(byteIndex, currentByte & ~(1 << bitIndex))
  }

  // returns a NaN that is tagged as specified
  makeTaggedNaN(tag: number[]) {
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, NaN)
    for (let i = 0; i < tag.length; i++) {
      tag[i]
        ? Memory.setBit(view, Memory.NaNTagOffset + i)
        : Memory.unsetBit(view, Memory.NaNTagOffset + i)
    }
    return view.getFloat64(0)
  }

  // get bit at position i from view v
  static getBit(v: DataView, i: number) {
    const byteIndex = Math.floor(i / 8)
    const bitIndex = 7 - (i % 8)
    return (v.getUint8(byteIndex) >> bitIndex) & 1
  }

  // check that word x is a NaN tagged as specified
  checkTag(x: number, tag: number[]) {
    if (!isNaN(x)) return false
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, x)
    let answer = true
    for (let i = 0; i < tag.length; i++) {
      answer &&= Memory.getBit(view, Memory.NaNTagOffset + i) === tag[i]
    }
    return answer
  }

  // check if word x is tagged with any non-zero tag
  isTagged(x: number) {
    return isNaN(x) && !this.checkTag(x, Memory.NaNTag)
  }

  // numbers include the untagged NaN
  isNumber(x: number) {
    return typeof x == 'number' && !this.isTagged(x)
  }

  // literal values are encoded with NaNs
  // as follows

  Null = this.makeTaggedNaN(Memory.NullTag)
  isNull(x: number) {
    return this.checkTag(x, Memory.NullTag)
  }
  // TODO: check if this is necessary when handling declarator-only situation
  Unassigned = this.makeTaggedNaN(Memory.UnassignedTag)
  isUnassigned(x: number) {
    return this.checkTag(x, Memory.UnassignedTag)
  }

  Undefined = this.makeTaggedNaN(Memory.UndefinedTag)
  isUndefined(x: number) {
    return this.checkTag(x, Memory.UndefinedTag)
  }

  // memory addresses: index encoded
  // as payload of memory word (using NaN-boxing)

  isAddress(x: number) {
    return this.checkTag(x, Memory.AddressTag)
  }

  // the function returns a memory word that
  // encodes the memory index using the right-most 32 bits.
  // note that this limits the memory size to 4 Terabytes.
  makeAddress(index: number) {
    const address = this.makeTaggedNaN(Memory.AddressTag)
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, address)
    view.setInt32(4, index)
    return view.getFloat64(0)
  }

  // retrieve memory index from Address
  getIndexFromAddress(address: number) {
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, address)
    return view.getInt32(4)
  }

  // access the memory with a given address
  addressDeref(address: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(address))
  }

  // builtins: builtin id is encoded
  // as payload of memory word (using NaN-boxing)

  isBuiltin(x: number) {
    return this.checkTag(x, Memory.BuiltinTag)
  }

  // the function returns a memory word that
  // encodes the index using the right-most 32 bits
  makeBuiltin(id: number) {
    const address = this.makeTaggedNaN(Memory.BuiltinTag)
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, address)
    view.setInt32(4, id)
    return view.getFloat64(0)
  }

  // retrieve the memory index from Address
  getIdFromBuiltin(builtin: number) {
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, builtin)
    return view.getInt32(4)
  }

  isClosure(x: number) {
    return this.checkTag(x, Memory.ClosureTag)
  }

  wordToCValue(x: number): string {
    return this.isUndefined(x)
      ? '<undefined>'
      : this.isUnassigned(x)
      ? '<unassigned>'
      : this.isNull(x)
      ? 'NULL'
      : this.isAddress(x)
      ? String(this.wordToCValue(this.addressDeref(x)))
      : this.isClosure(x)
      ? '<closure>'
      : this.isBuiltin(x)
      ? '<builtin>'
      : String(isNaN(x))
      ? Memory.wordToString(x)
      : String(x)
  }
}
