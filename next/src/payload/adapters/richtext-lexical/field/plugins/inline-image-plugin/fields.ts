import { MappedField } from '@payloadcms/ui'
import type { FormState, OptionObject } from 'payload'
import { InlineImageData } from './types'

export const positionOptions: OptionObject[] = [
  {
    label: 'Left',
    value: 'left'
  },
  {
    label: 'Right',
    value: 'right'
  },
  {
    label: 'Full',
    value: 'full'
  },
  {
    label: 'Wide',
    value: 'wide'
  }
]

export const getMappedFields = (
  collection: string,
  formState: FormState | undefined
): MappedField[] => [
  // TODO: Investigate - would love to have used formState and RenderFields / MappedFields
  // for the Image upload field, but for some reason I could not get a return value
  // for the selected image via handleFormOnChange or handleFormOnSubmit :-(
  // {
  //   name: 'image',
  //   cellComponentProps: { name: 'image' },
  //   fieldComponentProps: {
  //     name: 'image',
  //     relationTo: collection,
  //     path: 'inline-image',
  //     required: true,
  //   },
  //   fieldIsPresentational: false,
  //   isFieldAffectingData: false,
  //   localized: false,
  //   type: 'upload',
  // },
  {
    name: 'version',
    cellComponentProps: { name: 'version', schemaPath: 'version' },
    fieldComponentProps: { name: 'version' },
    fieldIsPresentational: false,
    isFieldAffectingData: true,
    localized: false,
    isHidden: true,
    type: 'text'
  },
  {
    name: 'altText',
    cellComponentProps: { name: 'altText', schemaPath: 'altText' },
    fieldComponentProps: {
      name: 'altText',
      label: 'Alt Text',
      errorProps: {
        showError: formState?.altText?.valid === false,
        message: 'Please enter alternative text for this image.'
      },
      required: true
    },
    fieldIsPresentational: false,
    isFieldAffectingData: true,
    localized: false,
    type: 'text'
  },
  {
    name: 'position',
    cellComponentProps: { name: 'position', schemaPath: 'position' },
    fieldComponentProps: {
      name: 'position',
      label: 'Position',
      options: positionOptions
    },
    fieldIsPresentational: false,
    isFieldAffectingData: true,
    localized: false,
    type: 'select'
  },
  {
    name: 'showCaption',
    cellComponentProps: { name: 'showCaption', schemaPath: 'showCaption' },
    fieldComponentProps: { name: 'showCaption', label: 'Show Caption' },
    fieldIsPresentational: false,
    isFieldAffectingData: true,
    localized: false,
    type: 'checkbox'
  }
]

export function getInitialState(data: InlineImageData | undefined): FormState {
  return {
    // TODO: Investigate - would love to have used formState and RenderFields / MappedFields
    // for the Image upload field, but for some reason I could not get a return value
    // for the selected image via handleFormOnChange or handleFormOnSubmit :-(
    // image: {
    //   value: '',
    //   initialValue: null,
    //   valid: true,
    // },
    version: {
      value: '',
      initialValue: '',
      valid: true
    },
    altText: {
      value: data?.altText,
      initialValue: data?.altText,
      valid: true
    },
    position: {
      value: data?.position ?? 'left',
      initialValue: data?.position ?? 'left',
      valid: true
    },
    showCaption: {
      value: data?.showCaption ?? false,
      initialValue: data?.showCaption ?? false,
      valid: true
    }
  }
}

export function isAltTextValid(value: string | undefined): boolean {
  return value != null && value.length > 0
}

export function validateFields(fields: FormState): { valid: boolean; fields: FormState } {
  let valid = true
  // Field validators
  if (isAltTextValid(fields.altText.value as string | undefined) === false) {
    fields.altText.valid = false
    valid = false
  } else {
    fields.altText.valid = true
  }
  // Return
  return {
    valid,
    fields
  }
}
