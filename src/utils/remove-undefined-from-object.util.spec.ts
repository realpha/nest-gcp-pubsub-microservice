import {removeUndefined} from './remove-undefined-from-object.util'

describe('removeUndefined - A utlity function that removes keys from objects if their respective values are undefined', () => {
  const testObject = {
    a: '1',
    b: 5,
    c: {
      ca: 2,
      cb: undefined,
      cc: undefined
    },
    d: undefined
  }

  const result = removeUndefined(testObject)

  it('1 - operates destructively on the the given object', () => {
    expect(result).toBe(testObject)
  })

  it('2 - removes all keys which had a value of undefined', () => {
    const expectedOuterKeys = ['a', 'b', 'c']
    const expectedInnerKeys = ['ca']

    const outerKeys = Object.keys(result)
    const innerKeys = Object.keys(result.c)

    expect(outerKeys).toEqual(expectedOuterKeys)
    expect(innerKeys).toEqual(expectedInnerKeys)
  })
})
