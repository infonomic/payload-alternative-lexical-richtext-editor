'use client'
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { LinkDrawer } from '../link-drawer'
import { formatDrawerSlug } from '@payloadcms/ui'
import { useConfig } from '@payloadcms/ui'
import { useEditDepth } from '@payloadcms/ui'
import { useModal } from '@payloadcms/ui'
import { useEditorConfig } from '../../../config'

import {
  $isLinkNode,
  $isAutoLinkNode,
  TOGGLE_LINK_COMMAND
} from '../../../nodes/link-nodes-payload'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND
} from 'lexical'

import { getSelectedNode } from '../../../utils/getSelectedNode'
import { setFloatingElemPositionForLinkEditor } from '../../../utils/setFloatingElemPositionForLinkEditor'
import { sanitizeUrl } from '../../../utils/url'

import type { Dispatch } from 'react'
import type { ClientConfig } from 'payload'
import type { LinkData } from '../types'
import type { LexicalEditor, NodeSelection, RangeSelection, BaseSelection } from 'lexical'
import type { LinkAttributes } from '../../../nodes/link-nodes-payload'

import './index.scss'

function createPreviewLink(config: ClientConfig, url: string | undefined): string | undefined {
  if (url?.startsWith('/') ?? false) {
    return `${config.serverURL}${url}`
  } else {
    return url
  }
}

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem
}: {
  editor: LexicalEditor
  isLink: boolean
  setIsLink: Dispatch<boolean>
  anchorElem: HTMLElement
}): React.JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [lastSelection, setLastSelection] = useState<
    RangeSelection | NodeSelection | BaseSelection | null
  >(null)
  const { uuid } = useEditorConfig()
  const { config } = useConfig()
  const [initialData, setInitialData] = useState<LinkData | undefined>(undefined)
  const { toggleModal, isModalOpen, closeModal } = useModal()
  const editDepth = useEditDepth()

  const drawerSlug = formatDrawerSlug({
    slug: `rich-text-link-lexical-${uuid}`,
    depth: editDepth
  })

  const updateLinkEditor = useCallback(async () => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection)
      const linkParent = $findMatchingParent(node, $isLinkNode)

      // Initial state:
      let data: LinkData = {
        text: '',
        fields: {
          url: '',
          linkType: undefined,
          newTab: undefined,
          doc: undefined
        }
      }

      if (linkParent) {
        data = {
          text: linkParent.getTextContent(),
          fields: linkParent.getAttributes()
        }

        if (linkParent.getAttributes()?.linkType === 'custom') {
          setLinkUrl(createPreviewLink(config, linkParent.getAttributes()?.url) ?? '')
          setLinkLabel('')
        } else {
          // internal
          setLinkUrl(
            `${config.serverURL}${config.routes.admin}/collections/${
              linkParent.getAttributes()?.doc?.relationTo
            }/${linkParent.getAttributes()?.doc?.value}`
          )
          setLinkLabel(
            `relation to ${linkParent.getAttributes()?.doc?.relationTo}: ${
              linkParent.getAttributes()?.doc?.value
            }`
          )
        }
      } else if ($isLinkNode(node)) {
        data = {
          text: node.getTextContent(),
          fields: node.getAttributes()
        }

        if (node.getAttributes()?.linkType === 'custom') {
          setLinkUrl(createPreviewLink(config, node.getAttributes()?.url) ?? '')
          setLinkLabel('')
        } else {
          // internal
          setLinkUrl(
            `${config.serverURL}${config.routes.admin}/collections/${
              // @ts-expect-error: TODO
              parent?.getAttributes()?.doc?.relationTo
              // @ts-expect-error: TODO
            }/${parent?.getAttributes()?.doc?.value}`
          )
          setLinkLabel(
            // @ts-expect-error: TODO
            `relation to ${parent?.getAttributes()?.doc?.relationTo}: ${
              // @ts-expect-error: TODO
              parent?.getAttributes()?.doc?.value
            }`
          )
        }
      } else {
        setLinkUrl('')
        setLinkLabel('')
      }

      setInitialData(data)
    }

    const editorElem = editorRef.current
    const nativeSelection = window.getSelection()
    const { activeElement } = document

    if (editorElem === null) {
      return
    }

    const rootElement = editor.getRootElement()

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRect: DOMRect | undefined =
        nativeSelection.focusNode?.parentElement?.getBoundingClientRect()
      if (domRect != null) {
        domRect.y += 40
        setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem)
      }
      setLastSelection(selection)
    } else if (activeElement == null || activeElement.className !== 'link-input') {
      if (rootElement !== null) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem)
      }
      setLastSelection(null)
      setLinkUrl('')
      setLinkLabel('')
    }

    return true
  }, [anchorElem, editor, config])

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement

    const update = (): void => {
      editor.getEditorState().read(() => {
        void updateLinkEditor()
      })
    }

    window.addEventListener('resize', update)

    if (scrollerElem != null) {
      scrollerElem.addEventListener('scroll', update)
    }

    return () => {
      window.removeEventListener('resize', update)

      if (scrollerElem != null) {
        scrollerElem.removeEventListener('scroll', update)
      }
    }
  }, [anchorElem.parentElement, editor, updateLinkEditor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          void updateLinkEditor()
        })
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          void updateLinkEditor()
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  }, [editor, updateLinkEditor, setIsLink, isLink])

  useEffect(() => {
    editor.getEditorState().read(() => {
      void updateLinkEditor()
    })
  }, [editor, updateLinkEditor])

  const handleModalSubmit = (data: LinkData): void => {
    closeModal(drawerSlug)
    const newNode: LinkAttributes & { text: string | null } = {
      newTab: data.fields?.newTab,
      url: data?.fields?.linkType === 'custom' ? data?.fields?.url : undefined,
      linkType: data?.fields?.linkType,
      doc: data?.fields?.linkType === 'internal' ? data?.fields?.doc : undefined,
      text: data?.text
    }

    editor.dispatchCommand(TOGGLE_LINK_COMMAND, newNode)
  }

  return (
    <div ref={editorRef} className="link-editor">
      {isLink && (
        <>
          <div className="link-input">
            <a href={sanitizeUrl(linkUrl)} target="_blank" rel="noopener noreferrer">
              {linkLabel != null && linkLabel.length > 0 ? linkLabel : linkUrl}
            </a>
            <div
              aria-label="Edit link"
              className="link-edit"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => {
                event.preventDefault()
              }}
              onClick={() => {
                toggleModal(drawerSlug)
              }}
            />
            <div
              aria-label="Remove link"
              className="link-trash"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => {
                event.preventDefault()
              }}
              onClick={() => {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
              }}
            />
          </div>
          <LinkDrawer
            isOpen={isModalOpen(drawerSlug)}
            drawerSlug={drawerSlug}
            data={initialData}
            onSubmit={handleModalSubmit}
            onClose={() => {
              closeModal(drawerSlug)
            }}
          />
        </>
      )}
    </div>
  )
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement
): React.JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor)
  const [isLink, setIsLink] = useState(false)

  useEffect(() => {
    const updateToolbar = () => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const focusNode = getSelectedNode(selection)
        const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode)
        const focusAutoLinkNode = $findMatchingParent(focusNode, $isAutoLinkNode)
        if (!(focusLinkNode || focusAutoLinkNode)) {
          setIsLink(false)
          return
        }
        const badNode = selection
          .getNodes()
          .filter((node) => !$isLineBreakNode(node))
          .find((node) => {
            const linkNode = $findMatchingParent(node, $isLinkNode)
            const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode)
            return (
              (focusLinkNode && !focusLinkNode.is(linkNode)) ||
              (linkNode && !linkNode.is(focusLinkNode)) ||
              (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
              (autoLinkNode && !autoLinkNode.is(focusAutoLinkNode))
            )
          })
        if (!badNode) {
          setIsLink(true)
        } else {
          setIsLink(false)
        }
      }
    }

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar()
          setActiveEditor(newEditor)
          return false
        },
        COMMAND_PRIORITY_CRITICAL
      )
    )
  }, [editor])

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      anchorElem={anchorElem}
      isLink={isLink}
      setIsLink={setIsLink}
    />,
    anchorElem
  )
}

export function FloatingLinkEditorPlugin({
  anchorElem = document.body
}: {
  anchorElem?: HTMLElement
}): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  return useFloatingLinkEditorToolbar(editor, anchorElem)
}
