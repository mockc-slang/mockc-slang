import { Memory } from './memory'

export class RuntimeStack extends Memory {
  display() {
    console.log('RTS:')
    this.displayMemoryLayout()
  }

  // closure

  static ClosurePcOffset = 1 // TODO: no pc in explicit control. check this?
  static ClosureArityOffset = 2
  static ClosureEnvironmentOffset = 3
  static ClosureSize = 4

  allocateClosure(pc: number, arity: number, env: number) {
    const closure_index = this.free
    this.free += RuntimeStack.ClosureSize
    this.setTaggedNaNAtIndex(closure_index, RuntimeStack.ClosureTag)
    this.setWordAtIndex(closure_index + RuntimeStack.ClosurePcOffset, pc)
    this.setWordAtIndex(closure_index + RuntimeStack.ClosureArityOffset, arity)
    this.setWordAtIndex(closure_index + RuntimeStack.ClosureEnvironmentOffset, env)
    return this.makeAddress(closure_index)
  }

  getClosurePc(address: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(address) + RuntimeStack.ClosurePcOffset)
  }

  getClosureArity(address: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(address) + RuntimeStack.ClosureArityOffset)
  }

  getClosureEnvironment(address: number) {
    return this.getWordAtIndex(
      this.getIndexFromAddress(address) + RuntimeStack.ClosureEnvironmentOffset
    )
  }

  // block frame

  static BlockframeEnvironmentOffset = 1
  static BlockframeSize = 2

  allocateBlockframe(env: number) {
    const frameIndex = this.free
    this.free += RuntimeStack.BlockframeSize
    this.setTaggedNaNAtIndex(frameIndex, RuntimeStack.BlockframeTag)
    this.setWordAtIndex(frameIndex + RuntimeStack.BlockframeEnvironmentOffset, env)
    return this.makeAddress(frameIndex)
  }

  getBlockgrameEnvironment(address: number) {
    return this.getWordAtIndex(
      this.getIndexFromAddress(address) + RuntimeStack.BlockframeEnvironmentOffset
    )
  }

  isBlockframe(x: number) {
    return (
      this.checkTag(x, RuntimeStack.AddressTag) &&
      this.checkTag(this.addressDeref(x), RuntimeStack.BlockframeTag)
    )
  }

  // call frame

  static CallframeEnvironmentOffset = 1
  static CallframePcOffset = 2
  static CallframeSize = 3

  allocateCallframe(env: number, pc: number) {
    const frameIndex = this.free
    this.free += RuntimeStack.CallframeSize
    this.setTaggedNaNAtIndex(frameIndex, RuntimeStack.CallframeTag)
    this.setWordAtIndex(frameIndex + RuntimeStack.CallframeEnvironmentOffset, env)
    this.setWordAtIndex(frameIndex + RuntimeStack.CallframePcOffset, pc)
    return this.makeAddress(frameIndex)
  }

  getCallframeEnvironment(address: number) {
    return this.getWordAtIndex(
      this.getIndexFromAddress(address) + RuntimeStack.CallframeEnvironmentOffset
    )
  }

  getCallframePc(address: number) {
    return this.getWordAtIndex(this.getIndexFromAddress(address) + RuntimeStack.CallframePcOffset)
  }
  isCallframe(x: number) {
    return (
      this.checkTag(x, RuntimeStack.AddressTag) &&
      this.checkTag(this.addressDeref(x), RuntimeStack.CallframeTag)
    )
  }

  // environment frame

  static FrameSizeOffset = 1
  static FrameValuesOffset = 2

  // size is number of words to be reserved
  // for values
  allocateFrame(size: number) {
    const frameIndex = this.free
    this.free += RuntimeStack.FrameValuesOffset + size
    this.setTaggedNaNAtIndex(frameIndex, RuntimeStack.FrameTag)
    this.setWordAtIndex(frameIndex + RuntimeStack.FrameSizeOffset, size)
    return this.makeAddress(frameIndex)
  }

  getFrameSize(frameAddress: number) {
    return this.getWordAtIndex(
      this.getIndexFromAddress(frameAddress) + RuntimeStack.FrameSizeOffset
    )
  }

  getFrameValue(frameAddress: number, valueIndex: number) {
    return this.getWordAtIndex(
      this.getIndexFromAddress(frameAddress) + RuntimeStack.FrameValuesOffset + valueIndex
    )
  }

  setFrameValue(frameAddress: number, valueIndex: number, value: number) {
    this.setWordAtIndex(
      this.getIndexFromAddress(frameAddress) + RuntimeStack.FrameValuesOffset + valueIndex,
      value
    )
  }

  displayFrame(frameAddress: number) {
    console.log('Frame:')
    const size = this.getFrameSize(frameAddress)
    console.log('frame size:', size)
    for (let i = 0; i < size; i++) {
      console.log('value index:', i)
      const value = this.getFrameValue(frameAddress, i)
      console.log('value:', value)
      console.log('value word:', RuntimeStack.wordToString(value))
    }
  }

  // environment

  // environments are memory nodes that contain
  // addresses of frames
  static EnvironmentSizeOffset = 1
  static EnvironmentFramesOffset = 2

  allocateEnvironment(size: number) {
    const env_index = this.free
    this.free += RuntimeStack.EnvironmentFramesOffset + size
    this.setTaggedNaNAtIndex(env_index, RuntimeStack.EnvironmentTag)
    this.setWordAtIndex(env_index + RuntimeStack.EnvironmentSizeOffset, size)
    return this.makeAddress(env_index)
  }

  createGlobalEnvironment() {
    // TODO: add builtin functions here
    // heap_Environment_extend(frame_address, heap_empty_Environment)
    return this.allocateEnvironment(0)
  }

  getEnvironmentSize(envAddress: number) {
    return this.getWordAtIndex(
      this.getIndexFromAddress(envAddress) + RuntimeStack.EnvironmentSizeOffset
    )
  }

  // access environment given by address
  // using a "position", i.e. a pair of
  // frame index and value index
  getEnvironmentValue(envAddress: number, position: number[]) {
    const [frameIndex, valueIndex] = position
    const frameAddress = this.getWordAtIndex(
      this.getIndexFromAddress(envAddress) + RuntimeStack.EnvironmentFramesOffset + frameIndex
    )
    return this.getFrameValue(frameAddress, valueIndex)
  }

  setEnvironmentValue(envAddress: number, position: number[], value: number) {
    const [frameIndex, valueIndex] = position
    const frameAddress = this.getWordAtIndex(
      this.getIndexFromAddress(envAddress) + RuntimeStack.EnvironmentFramesOffset + frameIndex
    )
    this.setFrameValue(frameAddress, valueIndex, value)
  }

  // get the whole frame at given frame index
  getEnvironmentFrame(envAddress: number, frameIndex: number) {
    return this.getWordAtIndex(
      this.getIndexFromAddress(envAddress) + RuntimeStack.EnvironmentFramesOffset + frameIndex
    )
  }
  // set the whole frame at given frame index
  setEnvironmentFrame(envAddress: number, frameIndex: number, frame: number) {
    return this.setWordAtIndex(
      this.getIndexFromAddress(envAddress) + RuntimeStack.EnvironmentFramesOffset + frameIndex,
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
  displayEnvironment(envAddress: number) {
    const size = this.getEnvironmentSize(envAddress)
    console.log('Environment:')
    console.log('environment size:', size)
    for (let i = 0; i < size; i++) {
      console.log('frame index:', i)
      const frame = this.getEnvironmentFrame(envAddress, i)
      this.displayFrame(frame)
    }
  }
}
