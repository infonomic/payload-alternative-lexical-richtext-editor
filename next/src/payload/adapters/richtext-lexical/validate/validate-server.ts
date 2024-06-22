import type { SerializedEditorState, SerializedParagraphNode } from 'lexical'
import type { RichTextField, Validate } from 'payload'

// https://github.com/payloadcms/payload/pull/6435
export const richTextValidate: Validate<
  SerializedEditorState,
  unknown,
  unknown,
  RichTextField
> = async (value, options) => {
  const {
    req: { t },
    required
  } = options

  if (required) {
    const hasChildren = value?.root?.children?.length

    const hasOnlyEmptyParagraph =
      (value?.root?.children?.length === 1 &&
        value?.root?.children[0]?.type === 'paragraph' &&
        (value?.root?.children[0] as SerializedParagraphNode)?.children?.length === 0) ||
      ((value?.root?.children[0] as SerializedParagraphNode)?.children?.length === 1 &&
        (value?.root?.children[0] as SerializedParagraphNode)?.children[0]?.type === 'text' &&
        (value?.root?.children[0] as SerializedParagraphNode)?.children[0]?.[
          'text' as keyof object
        ] === '')

    if (!hasChildren || hasOnlyEmptyParagraph) {
      return t('validation:required')
    }
  }

  return true
}
