import { builtinObject } from '../stdlib/builtin'
import { ClosureExpression, Command, Context, Value } from '../types'
import { Memory } from './memory'

export type InterpreterContext = {
  agenda: Command[]
  stash: Value[]
  memory: Memory
  env: number
  variableLookupEnv: string[][]
  closurePool: ClosureExpression[]
  context: Context
  builtinEnv: BuiltinEnv
}

type BuiltinEnv = {
  builtinObject: object
  builtinArray: string[]
}

export const setUpInterpreterContext = (context: Context, node: any): InterpreterContext => {
  const memory = new Memory(10)
  const env = memory.createGlobalEnvironment()

  const builtinArray: string[] = []

  let i = 0
  for (const key in builtinObject) {
    builtinArray[i++] = key
  }

  const builtinEnv = {
    builtinObject,
    builtinArray
  }

  const frameAddress = memory.allocateFrame(builtinArray.length)
  builtinArray.forEach((_, index: number) => {
    memory.setFrameValue(frameAddress, index, memory.makeBuiltin(index))
  })

  const globalEnv = memory.environmentExtend(frameAddress, env)

  const interpreterContext: InterpreterContext = {
    agenda: [node],
    stash: [],
    memory: memory,
    env: globalEnv,
    variableLookupEnv: [builtinArray],
    closurePool: [],
    context,
    builtinEnv
  }

  return interpreterContext
}

export const popStash = (interpreterContext: InterpreterContext, deref: boolean = true) => {
  const { stash } = interpreterContext
  const val = stash.pop()
  if (val == undefined) {
    throw Error('internal error: expected value from stash')
  }
  if (!deref) {
    return val
  }
  return derefStashVal(val, interpreterContext)
}

export const peekStash = (
  interpreterContext: InterpreterContext,
  deref: boolean = true,
  index: number = 0
) => {
  const { stash } = interpreterContext
  if (stash.length == 0) {
    throw Error('internal error: expected value from stash')
  }
  if (index >= stash.length) {
    throw Error('internal error: peek index exceeds stash size')
  }
  const val = stash[stash.length - index - 1]
  if (!deref) {
    return val
  }
  return derefStashVal(val, interpreterContext)
}

export const popAgenda = (agenda: Command[]) => {
  const val = agenda.pop()
  if (val == undefined) {
    throw Error('internal error: expected value from agenda')
  }
  return val
}

export const peekAgenda = (agenda: Command[]) => {
  if (agenda.length == 0) {
    throw Error('internal error: expected value from agenda')
  }
  return agenda[agenda.length - 1]
}

export const derefStashVal = (val: any, interpreterContext: InterpreterContext) => {
  const { memory, closurePool } = interpreterContext
  if (memory.isAddress(val)) {
    const payload = memory.addressDeref(val)
    return memory.isClosure(payload) ? closurePool[memory.getClosurePoolIndex(payload)] : payload
  }
  return val
}
