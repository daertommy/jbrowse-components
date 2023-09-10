/**
 * @jest-environment node
 */

import fs from 'fs'
import path from 'path'

import { setup } from '../testUtil'

const base = path.join(__dirname, '..', '..', 'test', 'data')
const simpleBam = path.join(base, 'simple.bam')

describe('add-track', () => {
  setup.command(['add-track']).exit(2).it('fails if no track is specified')
  setup
    .command(['add-track', simpleBam])
    .exit(110)
    .it('fails if load flag isnt passed in for a localFile')
})
