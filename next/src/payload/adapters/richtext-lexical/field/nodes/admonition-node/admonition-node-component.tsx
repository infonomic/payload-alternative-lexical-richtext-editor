'use client'
import * as React from 'react'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

import { formatDrawerSlug } from '@payloadcms/ui/elements'
import { useEditDepth } from '@payloadcms/ui/providers/EditDepth'
import { useModal } from '@payloadcms/ui/elements/Modal'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import cx from 'classnames'
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'

import { $isAdmonitionNode } from './admonition-node'
import { NoteIcon, TipIcon, WarningIcon, DangerIcon } from './icons'
import { useEditorConfig } from '../../config'
import { useSharedHistoryContext } from '../../context/shared-history-context'
import { useSharedOnChange } from '../../context/shared-on-change-context'
import { AdmonitionDrawer } from '../../plugins/admonition-plugin/admonition-drawer'
import FloatingTextFormatToolbarPlugin from '../../plugins/floating-text-format-toolbar-plugin/index'
import FloatingLinkEditorPlugin from '../../plugins/link-plugin-payload/floating-link-editor'
import LinkPlugin from '../../plugins/link-plugin-lexical'
import ContentEditable from '../../ui/content-editable'
import Placeholder from '../../ui/placeholder'

import type { AdmonitionNode } from './admonition-node'
import type { AdmonitionType, AdmonitionAttributes } from './types'
import type { AdmonitionData } from '../../plugins/admonition-plugin/types'
import type { LexicalEditor, NodeKey, NodeSelection, RangeSelection, BaseSelection } from 'lexical'

import './admonition-node-component.css'

const icons = {
  note: NoteIcon,
  tip: TipIcon,
  warning: WarningIcon,
  danger: DangerIcon,
}

export default function AdmonitionNodeComponent({
  admonitionType,
  title,
  content,
  nodeKey,
}: {
  admonitionType: AdmonitionType
  title: string
  content: LexicalEditor
  nodeKey: NodeKey
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const editDepth = useEditDepth()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const { historyState } = useSharedHistoryContext()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const [selection, setSelection] = useState<RangeSelection | NodeSelection | BaseSelection | null>(
    null,
  )
  const { uuid } = useEditorConfig()
  const { onChange } = useSharedOnChange()
  const editorState = editor.getEditorState()
  const activeEditorRef = useRef<LexicalEditor | null>(null)
  const node = editorState.read(() => $getNodeByKey(nodeKey) as AdmonitionNode)

  const {
    toggleModal = () => {
      console.error('Error: useModal() from FacelessUI did not work correctly')
    },
    closeModal,
    isModalOpen,
  } = useModal()

  // NOTE: set the slug suffix to the document ID so that
  // each image in the editor gets its own slug and modal
  const admonitionDrawerSlug = formatDrawerSlug({
    slug: `admonition-update-${nodeKey}`,
    depth: editDepth,
  })

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload
        event.preventDefault()
        const node = $getNodeByKey(nodeKey)
        if ($isAdmonitionNode(node)) {
          node?.remove()
        }
        setSelected(false)
      }
      return false
    },
    [isSelected, nodeKey, setSelected],
  )

  const onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection()
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
        $setSelection(null)
        event.preventDefault()
        content.focus()
        return true
      }
      return false
    },
    [content, isSelected],
  )

  const onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (activeEditorRef.current === content || buttonRef.current === event.target) {
        $setSelection(null)
        editor.update(() => {
          setSelected(true)
          const parentRootElement = editor.getRootElement()
          if (parentRootElement !== null) {
            parentRootElement.focus()
          }
        })
        return true
      }
      return false
    },
    [content, editor, setSelected],
  )

  useEffect(() => {
    let isMounted = true
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()))
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, onEscape, COMMAND_PRIORITY_LOW),
    )
    return () => {
      isMounted = false
      unregister()
    }
  }, [clearSelection, editor, isSelected, nodeKey, onDelete, onEnter, onEscape, setSelected])

  const draggable = isSelected && $isNodeSelection(selection)
  const isFocused = isSelected

  const handleToggleModal = (): void => {
    if (uuid != null) {
      toggleModal(admonitionDrawerSlug)
    }
  }

  const handleUpdateAdmonition = ({ admonitionType, title }: AdmonitionData): void => {
    closeModal(admonitionDrawerSlug)
    if (title != null && admonitionType != null) {
      const admonitionPayload: AdmonitionAttributes = {
        admonitionType,
        title,
      }

      editor.update(() => {
        node.update(admonitionPayload)
      })
    } else {
      console.error('Error: unable to find image source from document.')
    }
  }

  const classNames = cx(
    'Admonition__container',
    { focused: isFocused },
    { draggable: $isNodeSelection(selection) },
  )

  const Icon = icons[admonitionType]

  return (
    <Suspense fallback={null}>
      <>
        <div draggable={draggable} className={classNames}>
          <button
            type="button"
            className="admonition-edit-button"
            ref={buttonRef}
            onClick={handleToggleModal}
          >
            Edit
          </button>
          <div className="AdmonitionNode__header">
            <Icon />
            <div>{title}</div>
          </div>
          <div className="AdmonitionNode__content">
            <LexicalNestedComposer initialEditor={content}>
              <OnChangePlugin
                ignoreSelectionChange={true}
                onChange={(nestedEditorState, nestedEditor, nestedTags) => {
                  // Note: Shared 'onChange' context provider so that
                  // caption change events can be registered with the parent
                  // editor - in turn triggering the parent editor onChange
                  // event, and therefore updating editorState and the field
                  // value in Payload (Save Draft and Publish Changes will then
                  // become 'enabled' from the caption as well as the parent
                  // editor content.)

                  // Parent editor state - not the LexicalNestedComposer in this case
                  // although there are other ways that this could be used.
                  const editorState = editor.getEditorState()
                  if (onChange != null) onChange(editorState, editor, nestedTags)
                }}
              />
              <LinkPlugin />
              <FloatingLinkEditorPlugin />
              <FloatingTextFormatToolbarPlugin />
              <HistoryPlugin externalHistoryState={historyState} />
              <RichTextPlugin
                contentEditable={<ContentEditable className="AdmonitionNode__contentEditable" />}
                placeholder={
                  <Placeholder className="Admonition__placeholder">Enter some text...</Placeholder>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </LexicalNestedComposer>
          </div>
        </div>

        {uuid != null && uuid.length > 0 && (
          <AdmonitionDrawer
            isOpen={isModalOpen(admonitionDrawerSlug)}
            drawerSlug={admonitionDrawerSlug}
            onSubmit={handleUpdateAdmonition}
            data={{ title, admonitionType }}
          />
        )}
      </>
    </Suspense>
  )
}
