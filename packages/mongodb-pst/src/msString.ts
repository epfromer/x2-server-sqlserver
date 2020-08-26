// creates log string with times
export function msString(
  numDocs: number,
  msStart: number,
  msEnd: number
): string {
  const ms = msEnd - msStart
  const msPerDoc = ms / numDocs
  const sec = ms / 1000
  const min = sec / 60
  let s = ` ${numDocs} docs`
  s += `, ${ms} ms (~ ${Math.trunc(sec)} sec)`
  if (min > 1) {
    s += ` (~ ${Math.trunc(min)} min)`
  }
  s += `, ~ ${Math.trunc(msPerDoc)} ms per doc`
  return s
}
