import type { Field } from 'payload'

// @ts-ignore
import { LexicalRichTextAdapter } from '../../adapters/richtext-lexical'
import { populateLexicalMedia } from '../../adapters/richtext-lexical/field/lexical-after-read-populate-media'
import { populateLexicalLinks } from '../../adapters/richtext-lexical/field/lexical-after-read-populate-links'
import deepMerge from '../../utilities/deepMerge'

type Options = Partial<Field> & { editor?: LexicalRichTextAdapter }

type RichTextField = (options?: Options) => Field

export const lexicalRichTextField: RichTextField = (options = {}) =>
  deepMerge<Field, Options>(
    {
      name: 'richText',
      label: 'RichText',
      type: 'richText',
      hooks: {
        afterRead: [populateLexicalLinks, populateLexicalMedia],
      },
    },
    options,
  )
