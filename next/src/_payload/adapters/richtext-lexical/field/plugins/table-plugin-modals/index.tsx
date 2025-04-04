'use client'
import * as React from 'react'

import { formatDrawerSlug } from '@payloadcms/ui'
import { useEditDepth } from '@payloadcms/ui'
import { useModal } from '@payloadcms/ui'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_NORMAL, createCommand, type LexicalCommand } from 'lexical'

import { InsertTableDialog, InsertNewTableDialog } from './modals'
import { useEditorConfig } from '../../config'

type OpenModalType = 'table' | 'newTable' | string

export const OPEN_TABLE_MODAL_COMMAND: LexicalCommand<OpenModalType> = createCommand(
  'OPEN_TABLE_MODAL_COMMAND'
)

export function TablePluginModals(): React.JSX.Element {
  const [editor] = useLexicalComposerContext()
  const { uuid } = useEditorConfig()
  const editDepth = useEditDepth()
  const {
    toggleModal = () => {
      console.log('Error: useModal() from Payload did not work correctly')
    },
    closeModal
  } = useModal()

  const addTableDrawerSlug = formatDrawerSlug({
    slug: `lexicalRichText-add-table-${uuid}`,
    depth: editDepth
  })

  const addNewTableDrawerSlug = formatDrawerSlug({
    slug: `lexicalRichText-add-newtable-${uuid}`,
    depth: editDepth
  })

  const modalDictionary: Record<OpenModalType, string> = {
    table: addTableDrawerSlug,
    newTable: addNewTableDrawerSlug
  }

  editor.registerCommand<OpenModalType>(
    OPEN_TABLE_MODAL_COMMAND,
    (toOpen: OpenModalType) => {
      const modalSlug = modalDictionary[toOpen]
      if (modalSlug != null) {
        toggleModal(modalSlug)
        return true
      }
      return false
    },
    COMMAND_PRIORITY_NORMAL
  )

  return (
    <>
      <InsertTableDialog drawerSlug={addTableDrawerSlug} />
      <InsertNewTableDialog drawerSlug={addNewTableDrawerSlug} />
    </>
  )
}
