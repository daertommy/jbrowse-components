import VCF from '@gmod/vcf'
import { bufferToString, ParseOptions } from './ImportUtils'

export function parseVcfBuffer(buffer: Buffer, options: ParseOptions = {}) {
  const { selectedAssemblyName } = options
  const { header, body } = splitVcfFileHeaderAndBody(bufferToString(buffer))
  const vcfParser = new VCF({ header })

  return {
    vcfParser,
    rows: body.split(/\n|\r\n/).map((row, idx) => {
      const [CHROM, POS, ID, REF, ALT, QUAL, FILTER, INFO, FORMAT] =
        row.split('\t')
      return {
        CHROM,
        POS,
        ID,
        REF,
        ALT,
        QUAL,
        FILTER,
        INFO,
        FORMAT,
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
      'INFO',
      'FORMAT',
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
