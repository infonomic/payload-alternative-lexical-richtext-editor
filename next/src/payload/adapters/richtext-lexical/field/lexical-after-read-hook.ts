/**
 * Note: see the comments in lexical-before-change-hook.tsx
 * Internal links are processed there.
 *
 * In this afterRead hook we process complete document
 * relationships only for specific node types - in this case the
 * full media / upload / image document for the inline-image plugin
 * so that the frontend serializer has everything it needs to
 * create responsive images via 'sizes' that are defined in
 * our media upload collection.
 */

import type { Config as GeneratedTypes } from 'payload/config'
import type { FieldHook } from 'payload/types'

import { loadRelated } from './utils/load-related'

import type { SerializedInlineImageNode } from './nodes/inline-image-node'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import type { Payload } from 'payload'

type LexicalRichTextFieldAfterReadFieldHook = FieldHook<any, SerializedEditorState | null, any>

export const populateLexicalRelationships: LexicalRichTextFieldAfterReadFieldHook = async ({
  value,
  req,
}): Promise<null | SerializedEditorState> => {
  const { payload } = req

  if (value == null) {
    return null
  }

  // console.log(`populateLexicalRelationships called for: ${data?.id} ${data?.title}`)
  // TODO: add locale, although in our case, inline image nodes, and the associated
  // upload collection (usually 'media') does not have any localized fields (yet).
  if (value?.root?.children != null) {
    for (const childNode of value.root.children) {
      await traverseLexicalField(payload, childNode, '')
    }
  }
  return value
}

export async function traverseLexicalField(
  payload: Payload,
  node: SerializedLexicalNode & { children?: SerializedLexicalNode[] },
  locale: string,
): Promise<void> {
  if (node.type === 'inline-image') {
    const { doc } = node as SerializedInlineImageNode
    if (doc?.value != null && doc?.relationTo != null) {
      const relation = await loadRelated(
        payload,
        doc.value,
        doc.relationTo as keyof GeneratedTypes['collections'],
        1,
        locale,
      )
      if (relation != null) {
        ;(node as SerializedInlineImageNode).doc.data = relation
      }
    }
  }

  // Run for its children
  if (node.children != null && node.children.length > 0) {
    for (const childNode of node.children) {
      await traverseLexicalField(payload, childNode, locale)
    }
  }
}
