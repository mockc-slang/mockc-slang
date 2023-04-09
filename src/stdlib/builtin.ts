import { derefStashVal, InterpreterContext, popStash } from '../interpreter/interpreterContext'
import { VOID_POINTER_TYPE } from '../typechecker/typechecker'

export const builtinObject = {
  printf: {
    arity: 1,
    func: (interpreterContext: InterpreterContext) => {
      const { context, memory } = interpreterContext
      const val = popStash(interpreterContext, false)
      if (typeof val === 'string') {
        return context.externalBuiltIns.rawDisplay('', val, context)
      } else {
        const derefVal = derefStashVal(val, interpreterContext)
        return context.externalBuiltIns.rawDisplay('', memory.wordToCValue(derefVal), context)
      }
    }
  },
  printMemory: {
    arity: 0,
    func: (interpreterContext: InterpreterContext) => {
      const { memory, context } = interpreterContext
      const str = memory.displayMemoryLayout()
      return context.externalBuiltIns.rawDisplay('', str, context)
    }
  },
  printCurrentEnvironment: {
    arity: 0,
    func: (interpreterContext: InterpreterContext) => {
      const { memory, context, env } = interpreterContext
      const str = memory.displayEnvironment(env)
      return context.externalBuiltIns.rawDisplay('', str, context)
    }
  },
  malloc: {
    arity: 1,
    func: (interpreterContext: InterpreterContext) => {
      const { memory } = interpreterContext
      const size = popStash(interpreterContext)
      return memory.allocateHeapMemory(size)
    },
    type: VOID_POINTER_TYPE
  }
}
