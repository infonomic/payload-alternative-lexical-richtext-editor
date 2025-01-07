import type { Field } from 'payload'

import { lexicalEditor } from '../../adapters/richtext-lexical'
import { populateLexicalMedia } from '../../adapters/richtext-lexical/field/lexical-after-read-populate-media'
import { populateLexicalLinks } from '../../adapters/richtext-lexical/field/lexical-after-read-populate-links'
import deepMerge from '../../utilities/deepMerge'

import type { LexicalRichTextAdapter } from '../../adapters/richtext-lexical/types'

type Options = Partial<Field> & { editor?: LexicalRichTextAdapter }

type RichTextField = (options?: Options) => Field

export const lexicalRichTextMinimal: RichTextField = (options = {}) =>
  deepMerge<Field, Options>(
    {
      name: 'richText',
      label: 'RichText',
      type: 'richText',
      editor: lexicalEditor({
        settings: (config) => {
          config.options.textAlignment = false
          config.options.tablePlugin = false
          config.options.horizontalRulePlugin = false
          config.options.inlineImagePlugin = false
          config.options.autoEmbedPlugin = false
          config.options.floatingTextFormatToolbarPlugin = false
          config.options.floatingLinkEditorPlugin = true
          config.options.checkListPlugin = false
          config.options.listPlugin = false
          config.options.autoEmbedPlugin = false
          config.options.admonitionPlugin = false
          config.options.layoutPlugin = false
          config.options.codeHighlightPlugin = false
          config.options.layoutPlugin = false
          config.options.debug = false
          return config
        },
      }),
      hooks: {
        afterRead: [populateLexicalMedia, populateLexicalLinks],
      },
    },
    options,
  )
