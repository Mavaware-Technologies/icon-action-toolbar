import assert from 'node:assert/strict'
import test from 'node:test'
import { isVisibleMenuAction } from './visibleMenuAction.js'

const row = { parentFile: 'Dropdowns/InlineActionDropdown.vue', hasResource: true }
const detail = { parentFile: 'Dropdowns/DetailActionDropdown.vue', hasResource: true }
const indexHeading = { parentFile: 'Index.vue', hasResource: false }

const named = { name: 'Import', showOnTableRow: false, standalone: true, authorizedToRun: true, authorizedToSee: true }

test('detail keeps actions Nova sent, including ones that are not inline', () => {
  assert.equal(isVisibleMenuAction({ ...named, standalone: false }, detail), true)
  assert.equal(isVisibleMenuAction(named, detail), true)
  assert.equal(isVisibleMenuAction({ ...named, authorizedToRun: false }, detail), true)
})

test('index row hides non-inline, standalone, and unauthorized actions', () => {
  assert.equal(isVisibleMenuAction({ ...named, showOnTableRow: true, standalone: false }, row), true)
  assert.equal(isVisibleMenuAction({ ...named, showOnTableRow: false, standalone: false }, row), false)
  assert.equal(isVisibleMenuAction({ ...named, showOnTableRow: true, standalone: true }, row), false)
  assert.equal(isVisibleMenuAction({ ...named, showOnTableRow: true, standalone: false, authorizedToRun: false }, row), false)
  assert.equal(isVisibleMenuAction({ ...named, showOnTableRow: true, standalone: false, name: '  ' }, row), false)
})

test('index heading keeps a standalone action and drops an unauthorized one', () => {
  assert.equal(isVisibleMenuAction(named, indexHeading), true)
  assert.equal(isVisibleMenuAction({ ...named, authorizedToSee: false }, indexHeading), false)
  assert.equal(isVisibleMenuAction({ ...named, name: '' }, indexHeading), false)
})

test('a missing action is never a menu entry', () => {
  assert.equal(isVisibleMenuAction(null, detail), false)
})
