import VCF from '@gmod/vcf'
import { bufferToString, ParseOptions } from './ImportUtils'

export function parseVcfBuffer(buffer: Buffer, options: ParseOptions = {}) {
  const { selectedAssemblyName } = options
  const { header, body } = splitVcfFileHeaderAndBody(bufferToString(buffer))
  const vcfParser = new VCF({ header })
  const lines = body.split(/\n|\r\n/)

  const keys = new Set<string>()
  const rows = lines.map(l => {
    const [CHROM, POS, ID, REF, ALT, QUAL, FILTER, INFO, FORMAT] = l.split('\t')
    const ret = Object.fromEntries(
      INFO?.split(';').map(e => {
        const [key, val = true] = e.split('=')
        keys.add(key)
        return [key, val]
      }) || [],
    )
    return { CHROM, POS, ID, REF, ALT, QUAL, FILTER, INFO, FORMAT, ...ret }
  })

  return {
    vcfParser,
    rows: rows.map((row, idx) => {
      return {
        ...row,
        id: idx,
        __lineData: row,
      }
    }),
    columns: [
      'CHROM',
      'POS',
      'ID',
      'REF',
      'ALT',
      'QUAL',
      'FILTER',
      'FORMAT',
      ...keys,
    ],
    assemblyName: selectedAssemblyName,
  }
}

export function splitVcfFileHeaderAndBody(wholeFile: string) {
  // split into header and the rest of the file
  let headerEndIndex = 0
  let prevChar
  for (; headerEndIndex < wholeFile.length; headerEndIndex++) {
    const c = wholeFile[headerEndIndex]
    if (prevChar === '\n' && c !== '#') {
      break
    }
    prevChar = c
  }

  return {
    header: wholeFile.slice(0, Math.max(0, headerEndIndex)),
    body: wholeFile.slice(headerEndIndex),
  }
}
