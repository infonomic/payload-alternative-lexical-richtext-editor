import type { FormState, OptionObject } from 'payload/types'
import { MappedField } from '@payloadcms/ui/utilities/buildComponentMap'
import { LinkData } from './types'

export const linkOptions: OptionObject[] = [
  {
    label: 'Custom',
    value: 'custom',
  },
  {
    label: 'Internal',
    value: 'internal',
  },
]

export const getMappedFields = (
  formState: FormState | undefined,
  validRelationships: string[],
): MappedField[] => [
  {
    name: 'version',
    cellComponentProps: { name: 'version' },
    fieldComponentProps: { name: 'version' },
    fieldIsPresentational: false,
    isFieldAffectingData: true,
    localized: false,
    isHidden: true,
    type: 'text',
  },
  {
    name: 'text',
    cellComponentProps: { name: 'text' },
    fieldComponentProps: {
      name: 'text',
      errorProps: {
        showError: formState?.text?.valid === false,
        message: 'Please enter text for this link.',
      },
      labelProps: { label: 'Text' },
      required: true,
    },
    fieldIsPresentational: false,
    isFieldAffectingData: true,
    localized: false,
    type: 'text',
  },
  {
    name: 'linkType',
    cellComponentProps: { name: 'linkType' },
    fieldComponentProps: { name: 'linkType', options: linkOptions },
    fieldIsPresentational: false,
    isFieldAffectingData: true,
    localized: false,
    type: 'radio',
  },
  {
    name: 'url',
    cellComponentProps: { name: 'url' },
    fieldComponentProps: {
      name: 'url',
      errorProps: {
        showError: formState?.url?.valid === false,
        message: 'Please enter a url for this link.',
      },
    },
    fieldIsPresentational: false,
    isFieldAffectingData: true,
    localized: false,
    type: 'text',
  },
  {
    name: 'doc',
    cellComponentProps: { name: 'doc' },
    fieldComponentProps: { name: 'doc', relationTo: validRelationships },
    fieldIsPresentational: false,
    isFieldAffectingData: true,
    localized: false,
    type: 'relationship',
  },
  {
    name: 'newTab',
    cellComponentProps: { name: 'newTab' },
    fieldComponentProps: { name: 'newTab', labelProps: { label: 'Open in new tab' } },
    fieldIsPresentational: false,
    isFieldAffectingData: true,
    localized: false,
    type: 'checkbox',
  },
]

export function getInitialState(data: LinkData | undefined): FormState {
  return {
    version: {
      value: '',
      initialValue: '',
      valid: true,
    },
    text: {
      value: data?.text,
      initialValue: data?.text,
      valid: true,
    },
    linkType: {
      value: data?.fields?.linkType ?? 'custom',
      initialValue: data?.fields?.linkType ?? 'custom',
      valid: true,
    },
    url: {
      value: data?.fields?.url,
      initialValue: data?.fields?.url,
      valid: true,
      passesCondition: data?.fields?.linkType === 'custom',
    },
    doc: {
      value:
        data?.fields.doc != null
          ? { value: data.fields.doc.value, relationTo: data.fields.doc.relationTo }
          : {},
      initialValue:
        data?.fields.doc != null
          ? { value: data.fields.doc.value, relationTo: data.fields.doc.relationTo }
          : {},
      valid: true,
      passesCondition: data?.fields?.linkType === 'internal',
    },
    newTab: {
      value: data?.fields?.newTab ?? false,
      initialValue: data?.fields?.newTab ?? false,
      valid: true,
    },
  }
}

export function isTextValid(value: string | undefined): boolean {
  return value != null && value.length > 0
}

export function validateFields(fields: FormState): { valid: boolean; fields: FormState } {
  let valid = true
  // Field validators
  if (isTextValid(fields.text.value as string | undefined) === false) {
    fields.text.valid = false
    valid = false
  } else {
    fields.text.valid = true
  }

  if (fields.linkType.value === 'custom') {
    fields.url.passesCondition = true
    fields.doc.passesCondition = false
  }

  if (fields.linkType.value === 'internal') {
    fields.url.passesCondition = false
    fields.doc.passesCondition = true
  }

  // Return
  return {
    valid,
    fields,
  }
}
