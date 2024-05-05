import type { EditorSettings, EditorConfig } from './types'

import { defaultEditorLexicalConfig } from './default-client'

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  options: {
    disableBeforeInput: false,
    autocomplete: false,
    charLimit: false,
    charLimitUtf8: false,
    collab: false,
    maxLength: false,
    richText: true,
    measureTypingPerf: false,
    showNestedEditorTreeView: false,
    showTableOfContents: false,
    showTreeView: false,
    textAlignment: true,
    tablePlugin: true,
    tableCellBackgroundColor: true,
    tableCellMerge: true,
    tableActionMenuPlugin: true,
    layoutPlugin: true,
    outputHTML: false,
    outputMarkdown: false,
    autoFocusPlugin: false,
    autoLinkPlugin: false,
    inlineImagePlugin: true,
    admonitionPlugin: true,
    checkListPlugin: true,
    listPlugin: true,
    codeHighlightPlugin: true,
    horizontalRulePlugin: true,
    markdownShortcutPlugin: false,
    undoRedo: true,
    textStyle: true,
    inlineCode: true,
    links: true,
    floatingLinkEditorPlugin: true,
    floatingTextFormatToolbarPlugin: false,
    autoEmbedPlugin: true,
    debug: false,
  },
  inlineImageUploadCollection: 'media',
  placeholderText: 'Enter some rich text...',
  // TODO: Temporary solution - see the note in payload/adapters/richtext-lexical/field/plugins/link-plugin-payload/link-drawer.tsx
  enableRichTextLinks: ['full', 'minimal', 'compact', 'debug'],
}

export const defaultEditorConfig: EditorConfig = {
  settings: DEFAULT_EDITOR_SETTINGS,
  lexical: defaultEditorLexicalConfig,
}
