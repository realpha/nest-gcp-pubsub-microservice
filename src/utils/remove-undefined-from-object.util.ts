export function removeUndefined<T>(object: any): T {
  Object.keys(object).forEach((key: string) => {
    if (object[key] && typeof object[key] === 'object') removeUndefined(object[key])
    else if (object[key] === undefined) delete object[key]
  });

  return object
}
