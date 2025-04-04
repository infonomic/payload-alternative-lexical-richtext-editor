'use client'
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as React from 'react'

import { Button } from '@payloadcms/ui'
import { Drawer } from '@payloadcms/ui'
import { useModal } from '@payloadcms/ui'
import { TextInput } from '@payloadcms/ui'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import {
  $insertNodes,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type EditorThemeClasses,
  type Klass,
  type LexicalCommand,
  type LexicalEditor,
  type LexicalNode
} from 'lexical'

import { $createTableNodeWithDimensions, TableNode } from '../../nodes/table-nodes'
import invariant from '../../shared/invariant'

import './modal.scss'

export type InsertTableCommandPayload = Readonly<{
  columns: string
  rows: string
  includeHeaders?: boolean
}>

export interface CellContextShape {
  cellEditorConfig: null | CellEditorConfig
  cellEditorPlugins: null | React.JSX.Element | React.JSX.Element[]
  set: (
    cellEditorConfig: null | CellEditorConfig,
    cellEditorPlugins: null | React.JSX.Element | React.JSX.Element[]
  ) => void
}

export type CellEditorConfig = Readonly<{
  namespace: string
  nodes?: ReadonlyArray<Klass<LexicalNode>>
  onError: (error: Error, editor: LexicalEditor) => void
  readOnly?: boolean
  theme?: EditorThemeClasses
}>

export const INSERT_NEW_TABLE_COMMAND: LexicalCommand<InsertTableCommandPayload> = createCommand(
  'INSERT_NEW_TABLE_COMMAND'
)

export const CellContext = createContext<CellContextShape>({
  cellEditorConfig: null,
  cellEditorPlugins: null,
  set: () => {
    // Empty
  }
})

export function TableContext({ children }: { children: React.JSX.Element }): React.JSX.Element {
  const [contextValue, setContextValue] = useState<{
    cellEditorConfig: null | CellEditorConfig
    cellEditorPlugins: null | React.JSX.Element | React.JSX.Element[]
  }>({
    cellEditorConfig: null,
    cellEditorPlugins: null
  })
  return (
    <CellContext.Provider
      value={useMemo(
        () => ({
          cellEditorConfig: contextValue.cellEditorConfig,
          cellEditorPlugins: contextValue.cellEditorPlugins,
          set: (cellEditorConfig, cellEditorPlugins) => {
            setContextValue({ cellEditorConfig, cellEditorPlugins })
          }
        }),
        [contextValue.cellEditorConfig, contextValue.cellEditorPlugins]
      )}
    >
      {children}
    </CellContext.Provider>
  )
}

const baseClass = 'rich-text-table-modal'

// eslint-disable-next-line no-empty-pattern
export function InsertTableDialog({ drawerSlug }: { drawerSlug: string }): React.JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [activeEditor] = useState(editor)
  const { closeModal } = useModal()

  const [rows, setRows] = useState('5')
  const [columns, setColumns] = useState('5')
  const [isDisabled, setIsDisabled] = useState(true)

  useEffect(() => {
    const row = Number(rows)
    const column = Number(columns)
    if (row !== 0 && row > 0 && row <= 500 && column !== 0 && column > 0 && column <= 50) {
      setIsDisabled(false)
    } else {
      setIsDisabled(true)
    }
  }, [rows, columns])

  const handleOnSubmit = (): void => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      rows
    })

    closeModal(drawerSlug)
  }

  // TODO - validate
  const handleOnRowsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRows(event.target.value)
  }

  // TODO - validate
  const handleOnColumnsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setColumns(event.target.value)
  }

  return (
    <Drawer slug={drawerSlug} key={drawerSlug} className={baseClass} title="Add table">
      <React.Fragment>
        <TextInput
          path="rows"
          placeholder={'# of rows (1-500)'}
          label="Rows"
          onChange={handleOnRowsChange}
          value={rows}
          data-test-id="table-modal-rows"
        />
        <TextInput
          path="columns"
          placeholder={'# of columns (1-50)'}
          label="Columns"
          onChange={handleOnColumnsChange}
          value={columns}
          data-test-id="table-modal-columns"
        />
        <div
          className="rich-text-table-modal__modal-actions"
          data-test-id="table-model-confirm-insert"
        >
          <Button disabled={isDisabled} onClick={handleOnSubmit}>
            Confirm
          </Button>
        </div>
      </React.Fragment>
    </Drawer>
  )
}

// eslint-disable-next-line no-empty-pattern
export function InsertNewTableDialog({ drawerSlug }: { drawerSlug: string }): React.JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [activeEditor] = useState(editor)
  const { closeModal } = useModal()
  const [rows, setRows] = useState('')
  const [columns, setColumns] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)

  useEffect(() => {
    const row = Number(rows)
    const column = Number(columns)
    if (row !== 0 && row > 0 && row <= 500 && column !== 0 && column > 0 && column <= 50) {
      setIsDisabled(false)
    } else {
      setIsDisabled(true)
    }
  }, [rows, columns])

  const handleOnSubmit = (): void => {
    activeEditor.dispatchCommand(INSERT_NEW_TABLE_COMMAND, { columns, rows })
    closeModal(drawerSlug)
  }

  // TODO - validate
  const handleOnRowsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRows(event.target.value)
  }

  // TODO - validate
  const handleOnColumnsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setColumns(event.target.value)
  }

  return (
    <Drawer
      slug={drawerSlug}
      key={drawerSlug}
      className={baseClass}
      title="Add new table (Experimental)"
    >
      <React.Fragment>
        <TextInput
          path="rows"
          placeholder={'# of rows (1-500)'}
          label="Rows"
          onChange={handleOnRowsChange}
          value={rows}
          data-test-id="table-modal-rows"
        />
        <TextInput
          path="columns"
          placeholder={'# of columns (1-50)'}
          label="Columns"
          onChange={handleOnColumnsChange}
          value={columns}
          data-test-id="table-modal-columns"
        />
        <div
          className="rich-text-table-modal__modal-actions"
          data-test-id="table-modal-confirm-insert"
        >
          <Button disabled={isDisabled} onClick={handleOnSubmit}>
            Confirm
          </Button>
        </div>
      </React.Fragment>
    </Drawer>
  )
}

export function TablePlugin({
  cellEditorConfig,
  children
}: {
  cellEditorConfig: CellEditorConfig
  children: React.JSX.Element | React.JSX.Element[]
}): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const cellContext = useContext(CellContext)

  useEffect(() => {
    if (!editor.hasNodes([TableNode])) {
      invariant(false, 'TablePlugin: TableNode is not registered on editor')
    }

    cellContext.set(cellEditorConfig, children)

    return editor.registerCommand<InsertTableCommandPayload>(
      INSERT_NEW_TABLE_COMMAND,
      ({ columns, rows, includeHeaders }) => {
        const tableNode = $createTableNodeWithDimensions(
          Number(rows),
          Number(columns),
          includeHeaders
        )
        $insertNodes([tableNode])

        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [cellContext, cellEditorConfig, children, editor])

  return null
}
