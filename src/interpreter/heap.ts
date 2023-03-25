class Heap {
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

  // heap words without payload (literal values)
  static NullTag = [1, 0, 1, 0, 0, 0]
  static UnassignedTag = [1, 0, 1, 1, 0, 0]
  static UndefinedTag = [1, 1, 0, 0, 0, 0]

  // heap nodes with child nodes
  static BlockframeTag = [1, 1, 0, 1, 0, 0]
  static CallframeTag = [1, 1, 1, 0, 0, 0]
  static ClosureTag = [0, 0, 0, 1, 0, 0]
  static FrameTag = [0, 0, 1, 0, 0, 0]
  static EnvironmentTag = [0, 0, 1, 1, 0, 0]
  static PairTag = [0, 1, 0, 0, 0, 0]

  // heap words with payload
  static BuiltinTag = [0, 1, 0, 1, 0, 0]
  static AddressTag = [0, 1, 1, 0, 0, 0]

  // the first 13 bits of a NaN word are
  // needed to make the word a NaN. The
  // subsequent bits are used as tags

  static NaNTagOffset = 13

  constructor(megaBytes: number) {
    const data = new ArrayBuffer(Heap.Mega * megaBytes)
    this.view = new DataView(data)
    this.free = 0
  }

  static testNanBoxing() {
    const in_word = NaN

    // place a NaN in a buffer and set its last bit
    const in_buffer = new ArrayBuffer(8)
    const in_view = new DataView(in_buffer)
    in_view.setFloat64(0, in_word)
    in_view.setUint8(7, 0 | (1 << 0))

    // get the "flagged" NaN out of the buffer
    const out_word = in_view.getFloat64(0)

    // display the last byte of the "flagged" NaN
    const out_buffer = new ArrayBuffer(8)
    const out_view = new DataView(out_buffer)
    out_view.setFloat64(0, out_word)
    return ((out_view.getUint8(7) >> 0) & 1) == 1
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

  heapDisplay() {
    console.log('heap:')
    for (let i = 0; i < this.free; i++) {
      console.log(i, this.getWordAtIndex(i), Heap.wordToString(this.getWordAtIndex(i)))
    }
  }

  getWordAtIndex(index: number) {
    return this.view.getFloat64(index * Heap.WordSize)
  }

  setWordAtIndex(index: number, x: number) {
    return this.view.setFloat64(index * Heap.WordSize, x)
  }

  setTaggedNaNAtIndex(index: number, tag: number[]) {
    const the_NaN = this.makeTaggedNaN(tag)
    this.setWordAtIndex(index, the_NaN)
  }

  // some magic bit manipulation: in view v,
  // set bit at index i to 1, where 0 <= i < 64
  static setBit(x: DataView, i: number) {
    const byte_index = Math.floor(i / 8)
    const current_byte = x.getUint8(byte_index)
    const bit_index = 7 - (i % 8)
    x.setUint8(byte_index, current_byte | (1 << bit_index))
  }

  // some more magic bit manipulation: in view v,
  // set bit at index i to 1, where 0 <= i < 64
  static unsetBit(x: DataView, i: number) {
    const byte_index = Math.floor(i / 8)
    const current_byte = x.getUint8(byte_index)
    const bit_index = 7 - (i % 8)
    x.setUint8(byte_index, current_byte & ~(1 << bit_index))
  }

  // returns a NaN that is tagged as specified
  makeTaggedNaN(tag: number[]) {
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, NaN)
    for (let i = 0; i < tag.length; i++) {
      tag[i] ? Heap.setBit(view, Heap.NaNTagOffset + i) : Heap.unsetBit(view, Heap.NaNTagOffset + i)
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
      answer &&= Heap.getBit(view, Heap.NaNTagOffset + i) === tag[i]
    }
    return answer
  }

  // check if word x is tagged with any non-zero tag
  isTagged(x: number) {
    return isNaN(x) && !this.checkTag(x, Heap.NaNTag)
  }

  // numbers include the untagged NaN
  isNumber(x: number) {
    return typeof x == 'number' && !this.isTagged(x)
  }

  // literal values are encoded with NaNs
  // as follows

  Null = this.makeTaggedNaN(Heap.NullTag)
  isNull(x: number) {
    return this.checkTag(x, Heap.NullTag)
  }
  // TODO: is this necessary??
  Unassigned = this.makeTaggedNaN(Heap.UnassignedTag)
  isUnassigned(x: number) {
    return this.checkTag(x, Heap.UnassignedTag)
  }

  Undefined = this.makeTaggedNaN(Heap.UndefinedTag)
  isUndefined(x: number) {
    return this.checkTag(x, Heap.UndefinedTag)
  }

  // heap addresses: index encoded
  // as payload of heap word (using NaN-boxing)

  isAddress(x: number) {
    return this.checkTag(x, Heap.AddressTag)
  }

  // the function returns a heap word that
  // encodes the heap index using the right-most 32 bits.
  // note that this limits the heap size to 4 Terabytes.
  makeAddress(index: number) {
    const address = this.makeTaggedNaN(Heap.AddressTag)
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, address)
    view.setInt32(4, index)
    return view.getFloat64(0)
  }

  // retrieve heap index from Address
  getIndexFromAddress(address: number) {
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, address)
    return view.getInt32(4)
  }

  // access the heap with a given address
  addressDeref(address: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(address))
  }

  // builtins: builtin id is encoded
  // as payload of heap word (using NaN-boxing)

  isBuiltin(x: number) {
    return this.checkTag(x, Heap.BuiltinTag)
  }

  // the function returns a heap word that
  // encodes the index using the right-most 32 bits
  makeBuiltin(id: number) {
    const address = this.makeTaggedNaN(Heap.BuiltinTag)
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, address)
    view.setInt32(4, id)
    return view.getFloat64(0)
  }

  // retrieve the heap index from Address
  getIdFromBuiltin(builtin: number) {
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    view.setFloat64(0, builtin)
    return view.getInt32(4)
  }

  // TODO: complete this when other functions migrate finish
  // wordToCValue = (x: number) =>
  //   // Heap.isUndefined(x)
  //   //   ? '<undefined>'
  //   Heap.isUnassigned(x)
  //     ? '<unassigned>'
  //     : Heap.isNull(x)
  //     ? 'NULL'
  //     : // : is_Pair(x)
  //     // ? [word_to_JS_value(heap_get_head(x)), word_to_JS_value(heap_get_tail(x))]
  //     Heap.isAddress(x)
  //     ? String(this.wordToCValue(this.addressDeref(x)))
  //     : Heap.isClosure(x)
  //     ? '<closure>'
  //     : Heap.isBuiltin(x)
  //     ? '<builtin>'
  //     : String(isNaN(x))
  //     ? Heap.wordToString(x)
  //     : String(x)

  // closure

  static ClosurePcOffset = 1 // TODO: no pc in explicit control. check this?
  static ClosureArityOffset = 2
  static ClosureEnvironmentOffset = 3
  static ClosureSize = 4

  allocateClosure(pc: number, arity: number, env: number) {
    const closure_index = this.free
    this.free += Heap.ClosureSize
    this.setTaggedNaNAtIndex(closure_index, Heap.ClosureTag)
    this.setWordAtIndex(closure_index + Heap.ClosurePcOffset, pc)
    this.setWordAtIndex(closure_index + Heap.ClosureArityOffset, arity)
    this.setWordAtIndex(closure_index + Heap.ClosureEnvironmentOffset, env)
    return this.makeAddress(closure_index)
  }

  getClosurePc(address: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(address) + Heap.ClosurePcOffset)
  }

  getClosureArity(address: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(address) + Heap.ClosureArityOffset)
  }

  getClosureEnvironment(address: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(address) + Heap.ClosureEnvironmentOffset)
  }

  isClosure(x: number) {
    return this.checkTag(x, Heap.AddressTag) && this.checkTag(this.addressDeref(x), Heap.ClosureTag)
  }

  // block frame

  static BlockframeEnvironmentOffset = 1
  static BlockframeSize = 2

  allocateBlockframe(env: number) {
    const frameIndex = this.free
    this.free += Heap.BlockframeSize
    this.setTaggedNaNAtIndex(frameIndex, Heap.BlockframeTag)
    this.setWordAtIndex(frameIndex + Heap.BlockframeEnvironmentOffset, env)
    return this.makeAddress(frameIndex)
  }

  getBlockgrameEnvironment(address: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(address) + Heap.BlockframeEnvironmentOffset)
  }

  isBlockframe(x: number) {
    return (
      this.checkTag(x, Heap.AddressTag) && this.checkTag(this.addressDeref(x), Heap.BlockframeTag)
    )
  }

  // call frame

  static CallframeEnvironmentOffset = 1
  static CallframePcOffset = 2
  static CallframeSize = 3

  allocateCallframe(env: number, pc: number) {
    const frameIndex = this.free
    this.free += Heap.CallframeSize
    this.setTaggedNaNAtIndex(frameIndex, Heap.CallframeTag)
    this.setWordAtIndex(frameIndex + Heap.CallframeEnvironmentOffset, env)
    this.setWordAtIndex(frameIndex + Heap.CallframePcOffset, pc)
    return this.makeAddress(frameIndex)
  }

  getCallframeEnvironment(address: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(address) + Heap.CallframeEnvironmentOffset)
  }

  getCallframePc(address: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(address) + Heap.CallframePcOffset)
  }
  isCallframe(x: number) {
    return (
      this.checkTag(x, Heap.AddressTag) && this.checkTag(this.addressDeref(x), Heap.CallframeTag)
    )
  }

  // environment frame

  static FrameSizeOffset = 1
  static FrameValuesOffset = 2

  // size is number of words to be reserved
  // for values
  heap_allocate_Frame(size: number) {
    const frameIndex = this.free
    this.free += Heap.FrameValuesOffset + size
    this.setTaggedNaNAtIndex(frameIndex, Heap.FrameTag)
    this.setWordAtIndex(frameIndex + Heap.FrameSizeOffset, size)
    return this.makeAddress(frameIndex)
  }

  getFrameSize(frameAddress: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(frameAddress) + Heap.FrameSizeOffset)
  }

  getFrameValue(frameAddress: number, valueIndex: number) {
    return this.getWordAtIndex(
      this.getIndexFromAddress(frameAddress) + Heap.FrameValuesOffset + valueIndex
    )
  }

  setFrameValue(frameAddress: number, valueIndex: number, value: number) {
    this.setWordAtIndex(
      this.getIndexFromAddress(frameAddress) + Heap.FrameValuesOffset + valueIndex,
      value
    )
  }

  frameDisplay(frameAddress: number) {
    console.log('Frame:')
    const size = this.getFrameSize(frameAddress)
    console.log('frame size:', size)
    for (let i = 0; i < size; i++) {
      console.log('value index:', i)
      const value = this.getFrameValue(frameAddress, i)
      console.log('value:', value)
      console.log('value word:', Heap.wordToString(value))
    }
  }

  // environment

  // environments are heap nodes that contain
  // addresses of frames
  static EnvironmentSizeOffset = 1
  static EnvironmentFramesOffset = 2

  allocateEnvironment(size: number) {
    const env_index = this.free
    this.free += Heap.EnvironmentFramesOffset + size
    this.setTaggedNaNAtIndex(env_index, Heap.EnvironmentTag)
    this.setWordAtIndex(env_index + Heap.EnvironmentSizeOffset, size)
    return this.makeAddress(env_index)
  }

  // TODO: check where is this used in interpreter
  // heap_empty_Environment = this.allocateEnvironment(0)

  getEnvironmentSize(envAddress: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(envAddress) + Heap.EnvironmentSizeOffset)
  }

  // access environment given by address
  // using a "position", i.e. a pair of
  // frame index and value index
  // TODO: no such thing as "instr.pos" or valueIndex in explicit control eval? check how to impl this
  getEnvironmentValue(envAddress: number, position: number[]) {
    const [frameIndex, valueIndex] = position
    const frameAddress = this.getWordAtIndex(
      this.getIndexFromAddress(envAddress) + Heap.EnvironmentFramesOffset + frameIndex
    )
    return this.getFrameValue(frameAddress, valueIndex)
  }

  setEnvironmentValue(envAddress: number, position: number[], value: number) {
    const [frameIndex, valueIndex] = position
    const frameAddress = this.getWordAtIndex(
      this.getIndexFromAddress(envAddress) + Heap.EnvironmentFramesOffset + frameIndex
    )
    this.setFrameValue(frameAddress, valueIndex, value)
  }

  // get the whole frame at given frame index
  getEnvironmentFrame(envAddress: number, frameIndex: number) {
    return this.getWordAtIndex(
      this.getIndexFromAddress(envAddress) + Heap.EnvironmentFramesOffset + frameIndex
    )
  }
  // set the whole frame at given frame index
  setEnvironmentFrame(envAddress: number, frameIndex: number, frame: number) {
    return this.setWordAtIndex(
      this.getIndexFromAddress(envAddress) + Heap.EnvironmentFramesOffset + frameIndex,
      frame
    )
  }
  // extend a given environment by a new frame:
  // create a new environment that is bigger by 1
  // frame slot than the given environment.
  // copy the frame address to the new environment.
  // enter the address of the new frame to end
  // of the new environment
  environmentExtend(frameAddress: number, envAddress: number) {
    const old_size = this.getEnvironmentSize(envAddress)
    const newEnvAddress = this.allocateEnvironment(old_size + 1)
    let i
    for (i = 0; i < old_size; i++) {
      this.setEnvironmentFrame(newEnvAddress, i, this.getEnvironmentFrame(envAddress, i))
    }
    this.setEnvironmentFrame(newEnvAddress, i, frameAddress)
    return newEnvAddress
  }

  // for debuggging: display environment
  environmentDisplay(envAddress: number) {
    const size = this.getEnvironmentSize(envAddress)
    console.log('Environment:')
    console.log('environment size:', size)
    for (let i = 0; i < size; i++) {
      console.log('frame index:', i)
      const frame = this.getEnvironmentFrame(envAddress, i)
      this.frameDisplay(frame)
    }
  }
}
