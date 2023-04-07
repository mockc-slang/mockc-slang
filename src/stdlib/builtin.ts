import { InterpreterContext, derefStashVal, popStash } from '../interpreter/interpreterContext'

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
  }
}
