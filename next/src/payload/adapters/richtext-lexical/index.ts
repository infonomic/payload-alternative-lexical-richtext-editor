/**
 * Portions copyright (c) 2018-2022 Payload CMS, LLC info@payloadcms.com
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Adapted from https://github.com/payloadcms/payload/tree/main/packages/richtext-lexical
 */

import { withNullableJSONSchemaType } from 'payload'

import { defaultEditorConfig, EditorSettings } from './field/config'
// import { populateLexicalLinks } from './field/lexical-after-read-populate-links'
import { populateLexicalLinks } from './field/lexical-before-change-populate-links'
import { populateLexicalMedia } from './field/lexical-after-read-populate-media'

import { cloneDeep } from './field/utils/cloneDeep'
import { richTextValidate } from './validate/validate-server'

// @ts-expect-error: ignore
import type { EditorConfig as LexicalEditorConfig } from 'lexical/LexicalEditor'
import type { EditorConfig } from './field/config/types'
import type { JSONSchema4 } from 'json-schema'
import type { LexicalRichTextAdapter } from './types'
import type { LexicalEditorProps } from './types'

// TODO: sanitize / validate all inputs (okay for now as we control all inputs)
export function lexicalEditor(props?: LexicalEditorProps): LexicalRichTextAdapter {
  let settings: EditorSettings | null
  if (props?.settings != null) {
    settings =
      props.settings != null && typeof props.settings === 'function'
        ? props?.settings(cloneDeep(defaultEditorConfig.settings))
        : null

    if (settings == null) {
      settings = cloneDeep(defaultEditorConfig.settings)
    }
  } else {
    settings = cloneDeep(defaultEditorConfig.settings)
  }

  let lexical: () => Promise<LexicalEditorConfig>
  if (props?.lexical != null) {
    lexical = async () => await Promise.resolve(props.lexical as LexicalEditorConfig)
  } else {
    lexical = defaultEditorConfig.lexical
  }

  const editorConfig: EditorConfig = {
    settings,
    lexical,
  }

  // TODO: Watch for type updates in RichTextAdapter
  return {
    CellComponent: {
      path: '/payload/adapters/richtext-lexical/cell/index#RichTextCell',
      clientProps: {
        // admin: props?.admin,
        editorConfig,
      },
    },
    FieldComponent: {
      path: '/payload/adapters/richtext-lexical/field/index#RichTextField',
      clientProps: {
        // admin: props?.admin,
        editorConfig,
      },
    },
    editorConfig,
    generateImportMap: ({ addToImportMap }: any) => {
      addToImportMap('/payload/adapters/richtext-lexical/cell/index#RichTextCell')
      addToImportMap('/payload/adapters/richtext-lexical/field/index#RichTextField')
    },
    hooks: {
      afterRead: [populateLexicalMedia],
      beforeChange: [populateLexicalLinks],
    },
    // NOTE: Directly from https://github.com/payloadcms/payload/blob/main/packages/richtext-lexical/src/index.ts
    outputSchema: ({
      collectionIDFieldTypes,
      config,
      field,
      interfaceNameDefinitions,
      isRequired,
    }) => {
      let outputSchema: JSONSchema4 = {
        // This schema matches the SerializedEditorState type so far, that it's possible to cast SerializedEditorState to this schema without any errors.
        // In the future, we should
        // 1) allow recursive children
        // 2) Pass in all the different types for every node added to the editorconfig. This can be done with refs in the schema.
        type: withNullableJSONSchemaType('object', isRequired),
        properties: {
          root: {
            type: 'object',
            additionalProperties: false,
            properties: {
              type: {
                type: 'string',
              },
              children: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: true,
                  properties: {
                    type: {
                      type: 'string',
                    },
                    version: {
                      type: 'integer',
                    },
                  },
                  required: ['type', 'version'],
                },
              },
              direction: {
                oneOf: [
                  {
                    enum: ['ltr', 'rtl'],
                  },
                  {
                    type: 'null',
                  },
                ],
              },
              format: {
                type: 'string',
                enum: ['left', 'start', 'center', 'right', 'end', 'justify', ''], // ElementFormatType, since the root node is an element
              },
              indent: {
                type: 'integer',
              },
              version: {
                type: 'integer',
              },
            },
            required: ['children', 'direction', 'format', 'indent', 'type', 'version'],
          },
        },
        required: ['root'],
      }

      return outputSchema
    },
    validate: richTextValidate,
  }
}
