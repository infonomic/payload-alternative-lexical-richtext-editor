'use client'
/**
 * Adapted from on https://github.com/payloadcms/payload/blob/main/packages/richtext-lexical/src/field/Field.tsx
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { ErrorBoundary } from 'react-error-boundary'

import { FieldLabel, useEditDepth, useField, withCondition } from '@payloadcms/ui'

import { mergeFieldStyles } from '@payloadcms/ui/shared'

import { richTextValidate } from '../validate/validate-server'
import { EditorContext } from './editor-context'

import type { EditorState, LexicalEditor, SerializedEditorState } from 'lexical'
import type { LexicalRichTextFieldProps } from '../types'

import './field-component.scss'
import './themes/lexical-editor-theme.scss'

const baseClass = 'lexicalRichTextEditor'

const RichTextComponent: React.FC<LexicalRichTextFieldProps> = (props) => {
  const {
    admin,
    editorConfig,
    field,
    field: {
      name,
      admin: { className, readOnly: readOnlyFromAdmin } = {},
      label,
      localized,
      required
    },
    path: pathFromProps,
    readOnly: readOnlyFromTopLevelProps,
    validate = richTextValidate
  } = props

  const readOnlyFromProps = readOnlyFromTopLevelProps || readOnlyFromAdmin
  const path = pathFromProps ?? name

  const [statefulReadonly, setStatefulReadonly] = useState<boolean>(false)

  const editDepth = useEditDepth()

  const memoizedValidate = useCallback(
    (value: any, validationOptions: any) => {
      if (typeof validate === 'function') {
        return validate(value, { ...validationOptions, props, required })
      } else {
        return true
      }
    },
    // Important: do not add props to the dependencies array.
    // This would cause an infinite loop and endless re-rendering.
    // Removing props from the dependencies array fixed this issue: https://github.com/payloadcms/payload/issues/3709
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validate, required]
  )

  const {
    customComponents: { AfterInput, BeforeInput, Description, Error, Label } = {},
    formInitializing,
    formProcessing,
    initialValue,
    setValue,
    showError,
    value
  } = useField<SerializedEditorState>({
    path: pathFromProps ?? name,
    validate: memoizedValidate
  })

  // console.log('readOnlyFromProps:', readOnlyFromProps)
  // console.log('formInitializing:', formInitializing)
  // console.log('formProcessing:', formProcessing)

  useEffect(() => {
    setStatefulReadonly(readOnlyFromProps || formProcessing || formInitializing)
  }, [readOnlyFromProps, formProcessing, formInitializing])
  // const disabled = readOnlyFromProps || formProcessing || formInitializing
  // const disabled = readOnlyFromProps || false // || formProcessing || formInitializing

  const classes = [
    baseClass,
    'field-type',
    className,
    showError && 'error',
    statefulReadonly && `${baseClass}--read-only`,
    admin?.hideGutter !== true ? `${baseClass}--show-gutter` : null
  ]
    .filter(Boolean)
    .join(' ')

  const pathWithEditDepth = `${path}.${editDepth}`

  const styles = useMemo(() => mergeFieldStyles(field), [field])

  return (
    <div className={classes} key={pathWithEditDepth} style={styles}>
      <div className={`${baseClass}__wrap`}>
        {Error}
        {Label || <FieldLabel label={label} localized={localized} required={required} />}
        <ErrorBoundary fallbackRender={fallbackRender} onReset={() => {}}>
          {BeforeInput}
          <EditorContext
            editorConfig={editorConfig}
            fieldProps={props}
            path={name}
            readOnly={statefulReadonly}
            value={value}
            key={JSON.stringify({ initialValue, name })} // makes sure lexical is completely re-rendered when initialValue changes, bypassing the lexical-internal value memoization. That way, external changes to the form will update the editor. More infos in PR description (https://github.com/payloadcms/payload/pull/5010)
            // NOTE: 2023-05-15 disabled the deepEqual since we've set ignoreSelectionChange={true}
            // in our OnChangePlugin instances - and so a call here means that something
            // must have changed - so no need to do the comparison.
            onChange={(editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => {
              if (!statefulReadonly) {
                const serializedEditorState = editorState.toJSON()
                // TODO: 2024-01-30 - re-test this.
                // NOTE: 2023-06-28 fix for setValue below. For some reason when
                // this custom field is used in a block field, setValue on its
                // own won't enable Save Draft or Publish Changes during a first
                // add of a new block (it will after the entire document is saved
                // and reloaded - but not before.) So call setModified(true) here
                // to guarantee that we can always save our changes.
                // setModified(true)
                // NOTE: 2024-05-02: Appears to be fixed - and setModified(true)
                // is no longer required.
                setValue(serializedEditorState)
              }
            }}
          />
          {AfterInput}
        </ErrorBoundary>
        {Description}
        {/* <FieldDescription description={description as string} {...descriptionProps} /> */}
      </div>
    </div>
  )
}

function fallbackRender({ error, resetErrorBoundary }: any): React.JSX.Element {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  return (
    <div className="errorBoundary" role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  )
}

export const RichText: typeof RichTextComponent = withCondition(RichTextComponent)
