/**
 * In this afterRead hook we process complete document
 * relationships only for specific node types - in this case the
 * full media / upload / image document for the inline-image plugin
 * so that the frontend serializer has everything it needs to
 * create responsive images via 'sizes' that are defined in
 * our media upload collection.
 */

import type { GeneratedTypes } from 'payload'
import type { FieldHook } from 'payload'

import { loadRelated } from './utils/load-related'

import type { SerializedInlineImageNode } from './nodes/inline-image-node'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import type { Payload } from 'payload'

type LexicalAfterReadPopulateMediaFieldHook = FieldHook<any, SerializedEditorState | null, any>

export const populateLexicalMedia: LexicalAfterReadPopulateMediaFieldHook = async ({
  value,
  req,
}): Promise<SerializedEditorState | null> => {
  const { payload, locale } = req

  if (value == null) {
    return null
  }

  if (value?.root?.children != null) {
    for (const childNode of value.root.children) {
      await traverseLexicalField(payload, childNode, locale ?? '')
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
        ;(node as SerializedInlineImageNode).doc.data = relation as any
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
