import VCF from '@gmod/vcf'
import { bufferToString, ParseOptions } from './ImportUtils'

const vcfCoreColumns: { name: string; type: string }[] = [
  { name: 'CHROM', type: 'Text' }, // 0
  { name: 'POS', type: 'Number' }, // 1
  { name: 'ID', type: 'Text' }, // 2
  { name: 'REF', type: 'Text' }, // 3
  { name: 'ALT', type: 'Text' }, // 4
  { name: 'QUAL', type: 'Number' }, // 5
  { name: 'FILTER', type: 'Text' }, // 6
  { name: 'INFO', type: 'Text' }, // 7
  { name: 'FORMAT', type: 'Text' }, // 8
]

export function parseVcfBuffer(buffer: Buffer, options: ParseOptions = {}) {
  const { selectedAssemblyName } = options
  const { header, body } = splitVcfFileHeaderAndBody(bufferToString(buffer))
  const vcfParser = new VCF({ header })

  return {
    vcfParser,
    body,
    rows: body.split(/\n|\r\n/).map(row => {
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
        __lineData: row,
      }
    }),
    assemblyName: selectedAssemblyName,
  }
}

export function splitVcfFileHeaderAndBody(wholeFile: string) {
  // split into header and the rest of the file
  let headerEndIndex = 0
  let prevChar
  for (; headerEndIndex < wholeFile.length; headerEndIndex += 1) {
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
