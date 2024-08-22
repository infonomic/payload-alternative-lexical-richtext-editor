import type { FormState, OptionObject } from 'payload'
import { ClientField } from 'payload'
import { LinkData } from './types'

import type { CollectionSlug } from 'payload'

export const linkOptions: OptionObject[] = [
  {
    label: 'Custom',
    value: 'custom'
  },
  {
    label: 'Internal',
    value: 'internal'
  }
]

export const getFields = (
  formState: FormState | undefined,
  validRelationships: string[]
): ClientField[] => [
  // @ts-expect-error: type error
  {
    name: 'version',
    localized: false,
    type: 'text',
    admin: {
      hidden: true
    }
  },
  {
    name: 'text',
    // cellComponentProps: { name: 'text', schemaPath: 'text' },
    // fieldComponentProps: {
    //   name: 'text',
    //   type: 'text',
    //   label: 'Text',
    //   errorProps: {
    //     showError: formState?.text?.valid === false,
    //     message: 'Please enter text for this link.'
    //   },
    //   required: true
    // },
    // fieldIsPresentational: false,
    // isFieldAffectingData: true,
    required: true,
    localized: false,
    label: 'Text',
    type: 'text'
  },
  {
    name: 'linkType',
    localized: false,
    options: linkOptions,
    required: true,
    label: 'Type',
    type: 'radio'
  },
  {
    name: 'url',
    // cellComponentProps: { name: 'url', schemaPath: 'url' },
    // fieldComponentProps: {
    //   name: 'url',
    //   type: 'text',
    //   errorProps: {
    //     showError: formState?.url?.valid === false,
    //     message: 'Please enter a url for this link.'
    //   }
    // },
    // fieldIsPresentational: false,
    // isFieldAffectingData: true,
    localized: false,
    required: true,
    label: 'URL',
    type: 'text'
  },
  {
    name: 'doc',
    // cellComponentProps: { name: 'doc', schemaPath: 'doc' },
    // fieldComponentProps: {
    //   name: 'doc',
    //   type: 'relationship',
    //   relationTo: validRelationships as CollectionSlug[]
    // },
    // fieldIsPresentational: false,
    // isFieldAffectingData: true,
    localized: false,
    required: true,
    type: 'relationship',
    label: 'Related',
    relationTo: validRelationships as CollectionSlug[],
    admin: {
      allowCreate: false
    }
  },
  {
    name: 'newTab',
    localized: false,
    label: 'Open in new tab',
    type: 'checkbox'
  }
]

export function getInitialState(data: LinkData | undefined): FormState {
  return {
    version: {
      value: '',
      initialValue: '',
      valid: true
    },
    text: {
      value: data?.text,
      initialValue: data?.text,
      valid: true
    },
    linkType: {
      value: data?.fields?.linkType ?? 'custom',
      initialValue: data?.fields?.linkType ?? 'custom',
      valid: true
    },
    url: {
      value: data?.fields?.url,
      initialValue: data?.fields?.url,
      valid: true,
      passesCondition: data?.fields?.linkType === 'custom'
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
      passesCondition: data?.fields?.linkType === 'internal'
    },
    newTab: {
      value: data?.fields?.newTab ?? false,
      initialValue: data?.fields?.newTab ?? false,
      valid: true
    }
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
    fields
  }
}
