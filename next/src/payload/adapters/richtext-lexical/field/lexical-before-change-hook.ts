/**
 * Note: The Payload Link Modal via /plugins/link-plugin-payload
 * will only add the collection name (relationTo) and document id (value)
 * to any 'internal' links placed in the editor. If we can add and
 * save the title and slug, then there's no need populate the entire
 * document relationship at any point in advance (like afterRead)
 * since the frontend serializer will have everything it
 * needs to create a link (router link or other). These are 'links'
 * after all, and not requests for full document relationships.
 *
 * And so this hook will 'augment' the internal link - adding the
 * title and slug to the link attributes stored in the parent document.
 *
 * Note that this has implications for 'broken links' - which will
 * appear in the frontend as genuinely broken links, as opposed to
 * links that just disappear if we were to use an afterRead strategy
 * (which is the current strategy in 'populate' for the official
 * lexical adapter).
 *
 *
 * See the lexical-after-read-hook.ts which is still used to retrieve
 * a complete relationship for special cases (and of course NOT stored
 * along with the parent document).
 *
 * TODO: We've hardcoded any node / plugins that have nested editors
 * like the Admonition plugin and the captions in the InlineImage
 * plugin. We should move these to configuration.
 */

import type { Config as GeneratedTypes } from 'payload/config'
import type { FieldHook } from 'payload/types'

import { loadRelated } from './utils/load-related'

import type { SerializedAdmonitionNode } from './nodes/admonition-node'
import type { SerializedInlineImageNode } from './nodes/inline-image-node'
import type { SerializedLinkNode } from './nodes/link-nodes-payload'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import type { Payload } from 'payload'

type LexicalRichTextFieldBeforeChangeFieldHook = FieldHook<any, SerializedEditorState | null, any>

export const updateLexicalRelationships: LexicalRichTextFieldBeforeChangeFieldHook = async ({
  data,
  operation,
  value,
  req,
}): Promise<null | SerializedEditorState> => {
  const { payload } = req

  if (value == null) {
    return null
  }

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
): Promise<SerializedLexicalNode> {
  // We include inline-images here because they might contain captions
  // that have links in them - and as with admonition below
  // we want to save the slug and title to the relationship data attribute
  // in our corresponding lexical node.
  if (node.type === 'inline-image') {
    const { caption } = node as SerializedInlineImageNode
    if (caption?.editorState?.root?.children != null) {
      for (const childNode of caption.editorState.root.children) {
        await traverseLexicalField(payload, childNode, locale)
      }
    }
  } else if (node.type === 'admonition') {
    const { content } = node as SerializedAdmonitionNode
    if (content?.editorState?.root?.children != null) {
      for (const childNode of content.editorState.root.children) {
        await traverseLexicalField(payload, childNode, locale)
      }
    }
  } else if (
    // We've found an internal link, and so go ahead and lookup the
    // relationship, and then add id, title and slug to the node data.
    // We do this because this is all the front-end client needs to
    // to create a link. We don't need to attach, or use an afterRead
    // hook, or any other form of 'populate' to retrieve and attach
    // an entire document to a link in the editor.
    node.type === 'link' &&
    (node as SerializedLinkNode).attributes.linkType != null &&
    (node as SerializedLinkNode).attributes.linkType === 'internal'
  ) {
    const { attributes } = node as SerializedLinkNode
    if (attributes?.doc?.value != null && attributes?.doc?.relationTo != null) {
      const relation = await loadRelated(
        payload,
        attributes.doc.value,
        attributes.doc.relationTo as keyof GeneratedTypes['collections'],
        1,
        locale,
      )
      if (relation != null) {
        // I think these are the only properties we need to build a
        // link on the client - id, title, and slug. The collection slug is
        // already part of attributes?.doc?.relationTo
        // and so this should be everything that's needed whether building
        // a complete URL, or a framework router link.
        const { id, title, slug } = relation
        attributes.doc.data = { id, title, slug }
      }
    }
  }

  // Run for its children
  if (node.children != null && node.children.length > 0) {
    for (const childNode of node.children) {
      await traverseLexicalField(payload, childNode, locale)
    }
  }

  return node
}
